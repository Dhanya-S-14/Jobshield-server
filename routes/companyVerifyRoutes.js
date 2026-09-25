const express = require('express');
const router = express.Router();
const { verifyCompanyAdvanced, searchCompany } = require('../controllers/companyController');

// Singular "company" API surface (e.g. POST /api/company/verify)
// Keeps the classic plural routes at /api/companies/* untouched.
router.post('/verify', verifyCompanyAdvanced);
router.get('/verify/:companyName', verifyCompanyAdvanced);
router.get('/search', searchCompany);

module.exports = router;