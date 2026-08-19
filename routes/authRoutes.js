const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
  getProfile,
  updateProfile,
  updatePassword,
  forgotPassword,
  resetPassword,
  deleteAccount
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateUpdatePassword,
  validateForgotPassword,
  validateResetPassword
} = require('../middleware/validate');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/logout', logout);
router.get('/me', protect, getProfile);
router.get('/profile', protect, getProfile);
router.put('/profile', protect, validateUpdateProfile, updateProfile);
router.put('/updatepassword', protect, validateUpdatePassword, updatePassword);
router.post('/forgotpassword', validateForgotPassword, forgotPassword);
router.put('/resetpassword/:token', validateResetPassword, resetPassword);
router.delete('/account', protect, deleteAccount);

module.exports = router;
