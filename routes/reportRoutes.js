const express = require('express');
const router = express.Router();
const {
  createReport,
  getReports,
  getUserReports,
  updateReport,
  deleteReport
} = require('../controllers/reportController');
const { protect } = require('../middleware/auth');
const { validateReportScam } = require('../middleware/validate');
const { upload } = require('../middleware/upload');

router.post('/', protect, upload.single('screenshot'), validateReportScam, createReport);
router.get('/', getReports);
router.get('/my', protect, getUserReports);
router.put('/:id', protect, upload.single('screenshot'), updateReport);
router.delete('/:id', protect, deleteReport);

module.exports = router;
