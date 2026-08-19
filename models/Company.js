const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a company name'],
    unique: true,
    trim: true
  },
  website: {
    type: String,
    default: ''
  },
  domain: {
    type: String,
    default: ''
  },
  industry: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    default: ''
  },
  verified: {
    type: Boolean,
    default: false
  },
  verificationDate: {
    type: Date
  },
  employeeCount: {
    type: String,
    default: ''
  },
  foundedYear: {
    type: Number
  },
  logo: {
    type: String,
    default: ''
  },
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String,
    glassdoor: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

CompanySchema.index({ name: 'text', domain: 'text' });

module.exports = mongoose.model('Company', CompanySchema);
