const express = require('express');
const router = express.Router();
const {
  searchCompany,
  verifyCompany,
  verifyCompanyAdvanced,
  getCompanyById,
  addCompany,
  updateCompany
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validateCompany, handleValidationErrors } = require('../middleware/validate');

router.get('/search', searchCompany);
router.get('/verify/:companyName', verifyCompany);
router.post('/verify', verifyCompanyAdvanced);
router.get('/:id', getCompanyById);
router.post('/', protect, admin, validateCompany, handleValidationErrors, addCompany);
router.put('/:id', protect, admin, updateCompany);

module.exports = router;