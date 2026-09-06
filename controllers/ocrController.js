const path = require('path');
const { createWorker } = require('tesseract.js');

const TESSDATA_PATH = path.join(__dirname, '..', 'tessdata');

let ocrChain = Promise.resolve();

const runExclusive = (fn) => {
  const run = ocrChain.then(fn, fn);
  ocrChain = run.catch(() => {});
  return run;
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

const terminateWorker = async (worker) => {
  if (!worker) return;
  try {
    await worker.terminate();
  } catch (err) {
    console.warn('Failed to terminate OCR worker:', err && err.message ? err.message : err);
  }
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
    let pipeline = sharp(buffer).resize({ withoutEnlargement: false });

    const metadata = await sharp(buffer).metadata();
    const minDim = Math.min(metadata.width || 800, metadata.height || 600);
    if (minDim < 1000) {
      const scale = Math.min(2000 / minDim, 3);
      pipeline = pipeline.resize({
        width: Math.round((metadata.width || 800) * scale),
        height: Math.round((metadata.height || 600) * scale),
        kernel: sharp.kernel.lanczos3,
      });
    }

    pipeline = pipeline.grayscale().sharpen({ sigma: 1.5 });

    if (strong) {
      pipeline = pipeline.normalize().linear(1.3, -20).threshold(140).toColourspace('b-w');
    } else {
      pipeline = pipeline.normalize().linear(1.15, -10);
    }

    return await pipeline.png().toBuffer();
  } catch (e) {
    console.warn('Image preprocessing failed, using original:', e.message);
    return buffer;
  }
};

const extractText = async (req, res) => {
  let worker;
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    console.log(`OCR started: ${req.file.originalname} (${(req.file.size / 1024).toFixed(0)} KB)`);

    const preprocessed = await preprocessImage(req.file.buffer, false);
    console.log('Image preprocessed, running OCR...');

    const result = await runExclusive(async () => {
      worker = await createOcrWorker();
      const { data } = await worker.recognize(preprocessed);

      let text = data.text || '';
      let confidence = data.confidence || 0;
      console.log(`OCR result: pass 1 -> ${Math.round(confidence)}% confidence, ${(text || '').trim().length} chars`);

      if (confidence < 60 && text.trim().length < 30) {
        console.log('Low confidence, retrying with strong preprocessing...');
        const strongPreprocessed = await preprocessImage(req.file.buffer, true);
        const { data: retry } = await worker.recognize(strongPreprocessed);
        console.log(`OCR result: pass 2 -> ${Math.round(retry.confidence)}% confidence, ${(retry.text || '').trim().length} chars`);
        if (retry.confidence > confidence || (retry.text || '').trim().length > text.trim().length) {
          text = retry.text || '';
          confidence = retry.confidence || 0;
        }
      }

      return { text, confidence };
    });

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
    res.status(500).json({
      success: false,
      message: 'OCR processing failed',
      error: error && error.message ? error.message : String(error),
    });
  } finally {
    await terminateWorker(worker);
  }
};

const cleanup = async () => {
  console.log('OCR cleanup: no persistent workers to terminate');
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

module.exports = { extractText, cleanup };