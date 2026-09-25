const express = require('express');
const router = express.Router();
const {
  scanJob,
  analyzeJob,
  getScanHistory,
  getScanById,
  deleteScan,
  exportHistoryPDF,
  getScanStats
} = require('../controllers/scanController');
const { protect } = require('../middleware/auth');
const { validateScanJob, handleValidationErrors } = require('../middleware/validate');

// Public, non-persisting analysis for trial/guest users
router.post('/analyze', validateScanJob, handleValidationErrors, analyzeJob);

router.post('/scan', protect, validateScanJob, handleValidationErrors, scanJob);
router.get('/history', protect, getScanHistory);
router.get('/stats', protect, getScanStats);
router.get('/history/:id', protect, getScanById);
router.delete('/history/:id', protect, deleteScan);
router.get('/export/pdf', protect, exportHistoryPDF);

module.exports = router;
