const express = require('express');
const router = express.Router();
const {
  searchCompany,
  verifyCompany,
  addCompany,
  updateCompany
} = require('../controllers/companyController');
const { protect } = require('../middleware/auth');
const { admin } = require('../middleware/admin');
const { validateCompany } = require('../middleware/validate');

router.get('/search', searchCompany);
router.get('/verify/:companyName', verifyCompany);
router.post('/', protect, admin, validateCompany, addCompany);
router.put('/:id', protect, admin, updateCompany);

module.exports = router;
