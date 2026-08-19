const express = require('express');
const router = express.Router();
const { getActiveWarnings, createWarning, dismissWarning } = require('../controllers/warningController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');

router.get('/', getActiveWarnings);
router.post('/', protect, admin, createWarning);
router.put('/:id/dismiss', protect, admin, dismissWarning);

module.exports = router;
