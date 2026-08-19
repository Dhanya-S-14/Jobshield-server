const express = require('express');
const router = express.Router();
const {
  saveJob,
  getSavedJobs,
  removeSavedJob,
  checkSaved
} = require('../controllers/savedJobController');
const { protect } = require('../middleware/auth');

router.post('/save', protect, saveJob);
router.get('/saved', protect, getSavedJobs);
router.delete('/saved/:id', protect, removeSavedJob);
router.get('/check/:scanId', protect, checkSaved);

module.exports = router;
