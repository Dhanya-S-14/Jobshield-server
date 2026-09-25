const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const scanRoutes = require('./scanRoutes');
const savedJobRoutes = require('./savedJobRoutes');
const companyRoutes = require('./companyRoutes');
const companyVerifyRoutes = require('./companyVerifyRoutes');
const reportRoutes = require('./reportRoutes');
const adminRoutes = require('./adminRoutes');
const notificationRoutes = require('./notificationRoutes');
const commentRoutes = require('./commentRoutes');
const chatbotRoutes = require('./chatbotRoutes');
const warningRoutes = require('./warningRoutes');
const ocrRoutes = require('./ocrRoutes');

router.use('/auth', authRoutes);
router.use('/scans', scanRoutes);
router.use('/saved-jobs', savedJobRoutes);
router.use('/companies', companyRoutes);
router.use('/company', companyVerifyRoutes);
router.use('/reports', reportRoutes);
router.use('/admin', adminRoutes);
router.use('/notifications', notificationRoutes);
router.use('/comments', commentRoutes);
router.use('/chatbot', chatbotRoutes);
router.use('/warnings', warningRoutes);
router.use('/ocr', ocrRoutes);

router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'JobShield API is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

module.exports = router;
