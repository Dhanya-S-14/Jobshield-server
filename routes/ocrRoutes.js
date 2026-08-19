const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');
const { extractText } = require('../controllers/ocrController');
const { upload } = require('../middleware/upload');

const ocrLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many OCR requests. Please try again later.' },
});

router.post('/extract', ocrLimiter, (req, res, next) => {
  upload.single('image')(req, res, (err) => {
    if (err) {
      console.error('Upload error:', err.message);
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ success: false, message: 'File too large. Maximum size is 5MB.' });
      }
      return res.status(400).json({ success: false, message: err.message || 'Upload failed' });
    }
    next();
  });
}, extractText);

module.exports = router;
