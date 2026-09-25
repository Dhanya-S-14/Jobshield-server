const path = require('path');
const { createWorker } = require('tesseract.js');

const TESSDATA_PATH = path.join(__dirname, '..', 'tessdata');

const MAX_TOTAL_MS = 95 * 1000; // per-request hard budget (~95s); client timeout is ~120s
const PASS_TIMEOUT_MS = 40 * 1000; // each recognize pass <= 40s

let ocrChain = Promise.resolve();
let persistentWorker = null;
let workerReady = false;
let requestsSinceRecycle = 0;
const RECYCLE_EVERY = 5;

const runExclusive = (fn) => {
  const run = ocrChain.then(fn, fn);
  ocrChain = run.catch(() => {});
  return run;
};

const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(
        () => reject(Object.assign(new Error(`OCR operation timed out after ${Math.round(ms / 1000)}s`), { timedOut: true })),
        ms
      )
    ),
  ]);

const resetWorker = async (terminate = true) => {
  if (persistentWorker) {
    if (terminate) {
      try { await persistentWorker.terminate(); } catch (e) { /* ignore */ }
    }
    persistentWorker = null;
  }
  workerReady = false;
};

const createOcrWorker = async () => {
  console.log('Creating Tesseract worker (local langPath)...');
  const worker = await createWorker('eng', 1, {
    logger: (m) => {
      if (m.status === 'recognizing text' && typeof m.progress === 'number') {
        console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
      }
    },
    langPath: TESSDATA_PATH,
    gzip: false,
  });
  await worker.setParameters({
    preserve_interword_spaces: '1',
    user_defined_dpi: '300',
    tessedit_pageseg_mode: '6',
  });
  console.log(`Tesseract worker created with langPath=${TESSDATA_PATH}`);
  return worker;
};

const getWorker = async () => {
  if (persistentWorker && workerReady) return persistentWorker;
  persistentWorker = await createOcrWorker();
  workerReady = true;
  return persistentWorker;
};

const recognizeWithTimeout = async (worker, buffer, options) => {
  const { data } = await withTimeout(worker.recognize(buffer, options || {}), PASS_TIMEOUT_MS);
  return { text: data.text || '', confidence: data.confidence || 0 };
};

const preprocessImage = async (buffer, strong = false) => {
  let sharp;
  try {
    sharp = require('sharp');
  } catch (e) {
    console.warn('sharp not available, skipping preprocessing');
    return buffer;
  }

  try {
    const pipeline = sharp(buffer);
    const metadata = await sharp(buffer).metadata();
    const width = metadata.width || 800;
    const height = metadata.height || 600;
    const minDim = Math.min(width, height);

    let nextWidth = width;
    let nextHeight = height;

    if (minDim < 1000) {
      const scale = Math.min(2000 / minDim, 3);
      nextWidth = Math.round(width * scale);
      nextHeight = Math.round(height * scale);
    }

    const MAX_DIM = 1400;
    const maxDim = Math.max(nextWidth, nextHeight);
    if (maxDim > MAX_DIM) {
      const dn = MAX_DIM / maxDim;
      nextWidth = Math.round(nextWidth * dn);
      nextHeight = Math.round(nextHeight * dn);
    }

    let normalized = nextWidth === width && nextHeight === height
      ? pipeline
      : pipeline.resize({ width: nextWidth, height: nextHeight, kernel: sharp.kernel.lanczos3 });

    normalized = normalized.grayscale().sharpen({ sigma: 1.5 });

    if (strong) {
      normalized = normalized.normalize().linear(1.3, -20).threshold(140).toColourspace('b-w');
    } else {
      normalized = normalized.normalize().linear(1.15, -10);
    }

    return await normalized.png().toBuffer();
  } catch (e) {
    console.warn('Image preprocessing failed, using original:', e.message);
    return buffer;
  }
};

const extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    console.log(`OCR started: ${req.file.originalname} (${(req.file.size / 1024).toFixed(0)} KB)`);

    const preprocessed = await preprocessImage(req.file.buffer, false);
    console.log('Image preprocessed, running OCR...');

    const result = await withTimeout(
      runExclusive(async () => {
        let worker = await getWorker();
        let text = '';
        let confidence = 0;
        let appliesTo = null;

        try {
          const pass1 = await recognizeWithTimeout(worker, preprocessed);
          ({ text, confidence } = pass1);
          console.log(`OCR result: pass 1 -> ${Math.round(confidence)}% confidence, ${(text || '').trim().length} chars`);

          if (confidence < 60 && text.trim().length < 30) {
            console.log('Low confidence, retrying with strong preprocessing...');
            const strongPreprocessed = await preprocessImage(req.file.buffer, true);
            appliesTo = strongPreprocessed;
            worker = await getWorker();
            const retry = await recognizeWithTimeout(worker, strongPreprocessed);
            console.log(`OCR result: pass 2 -> ${Math.round(retry.confidence)}% confidence, ${(retry.text || '').trim().length} chars`);
            if (retry.confidence > confidence || (retry.text || '').trim().length > text.trim().length) {
              text = retry.text || '';
              confidence = retry.confidence || 0;
            }
          }
        } catch (err) {
          if (err && err.timedOut) {
            console.error('OCR pass timed out — worker will be recycled');
            await resetWorker(true);
            throw err;
          }
          console.error('OCR recognize failed, recreating worker:', err && err.message ? err.message : err);
          await resetWorker(true);
          worker = await getWorker();
          const { data } = await withTimeout(worker.recognize(appliesTo || preprocessed), PASS_TIMEOUT_MS);
          text = data.text || '';
          confidence = data.confidence || 0;
        }

        requestsSinceRecycle += 1;
        if (requestsSinceRecycle >= RECYCLE_EVERY) {
          console.log(`Recycling OCR worker (periodic, after ${requestsSinceRecycle} requests)`);
          requestsSinceRecycle = 0;
          await resetWorker(true);
        }

        return { text, confidence };
      }),
      MAX_TOTAL_MS
    );

    text = result.text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    console.log(`OCR complete: ${wordCount} words, ${Math.round(result.confidence)}% confidence`);

    res.status(200).json({
      success: true,
      data: {
        text,
        confidence: Math.round(result.confidence),
        wordCount,
        charCount: text.length,
      },
    });
  } catch (error) {
    console.error('OCR Error:', error);
    if (error && error.stack) console.error(error.stack);
    if (error && error.timedOut) {
      return res.status(503).json({
        success: false,
        message: 'OCR is still processing (server timed out). Please try again in a moment.',
        error: 'OCR_TIMEOUT',
      });
    }
    res.status(500).json({
      success: false,
      message: 'OCR processing failed',
      error: error && error.message ? error.message : String(error),
    });
  } finally {
    // Persistent worker is kept alive between requests for speed; nothing to clean per-request.
  }
};

const cleanup = async () => {
  console.log('OCR cleanup: terminating persistent worker');
  await resetWorker(true);
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

module.exports = { extractText, cleanup };