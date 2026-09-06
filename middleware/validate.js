const { body, param, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
];

const validateScanJob = [
  body('jobTitle')
    .trim()
    .notEmpty().withMessage('Job title is required'),
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required'),
  body('jobDescription')
    .trim()
    .notEmpty().withMessage('Job description is required')
    .isLength({ min: 10 }).withMessage('Job description must be at least 10 characters')
];

const validateReportScam = [
  body('companyName')
    .trim()
    .notEmpty().withMessage('Company name is required'),
  body('jobTitle')
    .trim()
    .notEmpty().withMessage('Job title is required'),
  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 20 }).withMessage('Description must be at least 20 characters')
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 }).withMessage('Name must be 2-50 characters'),
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
];

const validateUpdatePassword = [
  body('currentPassword')
    .notEmpty().withMessage('Current password is required'),
  body('newPassword')
    .notEmpty().withMessage('New password is required')
    .isLength({ min: 6 }).withMessage('New password must be at least 6 characters')
];

const validateForgotPassword = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail()
];

const validateResetPassword = [
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
];

const validateCompany = [
  body('name')
    .trim()
    .notEmpty().withMessage('Company name is required'),
  body('website')
    .optional()
    .trim()
    .isURL().withMessage('Please provide a valid URL')
];

const validateKeyword = [
  body('keyword')
    .trim()
    .notEmpty().withMessage('Keyword is required'),
  body('category')
    .trim()
    .notEmpty().withMessage('Category is required'),
  body('severity')
    .notEmpty().withMessage('Severity is required')
    .isInt({ min: 1, max: 10 }).withMessage('Severity must be 1-10'),
  body('points')
    .notEmpty().withMessage('Points is required')
    .isInt({ min: 1, max: 50 }).withMessage('Points must be 1-50')
];

const validateMongoId = [
  param('id')
    .notEmpty().withMessage('ID is required')
    .isMongoId().withMessage('Invalid ID format')
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateScanJob,
  validateReportScam,
  validateUpdateProfile,
  validateUpdatePassword,
  validateForgotPassword,
  validateResetPassword,
  validateCompany,
  validateKeyword,
  validateMongoId
};
