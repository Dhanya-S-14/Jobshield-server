const express = require('express');
const router = express.Router();
const { createComment, getComments, updateComment, deleteComment, markHelpful, addReply } = require('../controllers/commentController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createComment);
router.get('/', getComments);
router.put('/:id', protect, updateComment);
router.delete('/:id', protect, deleteComment);
router.put('/:id/helpful', markHelpful);
router.post('/:id/reply', protect, addReply);

module.exports = router;
