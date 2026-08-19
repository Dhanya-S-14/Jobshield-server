const express = require('express');
const router = express.Router();
const {
  scanJob,
  getScanHistory,
  getScanById,
  deleteScan,
  exportHistoryPDF,
  getScanStats
} = require('../controllers/scanController');
const { protect } = require('../middleware/auth');
const { validateScanJob } = require('../middleware/validate');

router.post('/scan', protect, validateScanJob, scanJob);
router.get('/history', protect, getScanHistory);
router.get('/stats', protect, getScanStats);
router.get('/history/:id', protect, getScanById);
router.delete('/history/:id', protect, deleteScan);
router.get('/export/pdf', protect, exportHistoryPDF);

module.exports = router;
