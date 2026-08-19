const express = require('express');
const router = express.Router();
const {
  getDashboard,
  getUsers,
  banUser,
  deleteUser,
  getReports,
  approveReport,
  rejectReport,
  deleteReport,
  getKeywords,
  addKeyword,
  updateKeyword,
  deleteKeyword,
  getScanStats
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validateKeyword, validateMongoId } = require('../middleware/validate');

router.get('/dashboard', protect, admin, getDashboard);
router.get('/users', protect, admin, getUsers);
router.put('/users/:id/ban', protect, admin, banUser);
router.delete('/users/:id', protect, admin, deleteUser);
router.get('/reports', protect, admin, getReports);
router.put('/reports/:id/approve', protect, admin, approveReport);
router.put('/reports/:id/reject', protect, admin, rejectReport);
router.delete('/reports/:id', protect, admin, deleteReport);
router.get('/keywords', protect, admin, getKeywords);
router.post('/keywords', protect, admin, validateKeyword, addKeyword);
router.put('/keywords/:id', protect, admin, updateKeyword);
router.delete('/keywords/:id', protect, admin, deleteKeyword);
router.get('/stats/scans', protect, admin, getScanStats);

module.exports = router;
