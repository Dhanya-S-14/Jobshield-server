const express = require('express');
const router = express.Router();
const { chat, getQuickActions } = require('../controllers/chatbotController');

router.post('/chat', chat);
router.get('/quick-actions', getQuickActions);

module.exports = router;
