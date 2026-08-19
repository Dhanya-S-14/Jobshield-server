const { createWorker } = require('tesseract.js');

let worker = null;

const getWorker = async () => {
  if (!worker) {
    console.log('Initializing Tesseract worker...');
    worker = await createWorker('eng', 1, {
      logger: (m) => {
        if (m.status === 'recognizing text') {
          console.log(`OCR progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });
    await worker.setParameters({
      preserve_interword_spaces: '1',
      user_defined_dpi: '300',
      tessedit_pageseg_mode: '6',
    });
    console.log('Tesseract worker ready');
  }
  return worker;
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
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No image file provided' });
    }

    console.log(`OCR request: ${req.file.originalname} (${(req.file.size / 1024).toFixed(0)} KB)`);

    const preprocessed = await preprocessImage(req.file.buffer, false);
    console.log('Image preprocessed, running OCR...');

    const w = await getWorker();
    const { data } = await w.recognize(preprocessed);

    let text = data.text || '';
    let confidence = data.confidence || 0;
    console.log(`OCR pass 1: ${confidence}% confidence, ${(text || '').trim().length} chars`);

    if (confidence < 60 && text.trim().length < 30) {
      console.log('Low confidence, retrying with strong preprocessing...');
      const strongPreprocessed = await preprocessImage(req.file.buffer, true);
      const { data: retry } = await w.recognize(strongPreprocessed);
      console.log(`OCR pass 2: ${retry.confidence}% confidence, ${(retry.text || '').trim().length} chars`);
      if (retry.confidence > confidence || (retry.text || '').trim().length > text.trim().length) {
        text = retry.text || '';
        confidence = retry.confidence || 0;
      }
    }

    text = text
      .replace(/\r\n/g, '\n')
      .replace(/[ \t]+/g, ' ')
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const wordCount = text.split(/\s+/).filter(Boolean).length;

    console.log(`OCR complete: ${wordCount} words, ${confidence}% confidence`);

    res.status(200).json({
      success: true,
      data: {
        text,
        confidence: Math.round(confidence),
        wordCount,
        charCount: text.length,
      },
    });
  } catch (error) {
    console.error('OCR Error:', error.message, error.stack);
    res.status(500).json({ success: false, message: 'OCR processing failed', error: error.message });
  }
};

const cleanup = async () => {
  if (worker) {
    await worker.terminate();
    worker = null;
  }
};

process.on('SIGINT', cleanup);
process.on('SIGTERM', cleanup);

module.exports = { extractText, cleanup };
