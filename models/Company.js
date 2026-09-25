const mongoose = require('mongoose');

const CompanySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Company name is required'],
    unique: true,
    trim: true,
    maxlength: [100, 'Company name cannot exceed 100 characters']
  },
  registeredName: {
    type: String,
    trim: true
  },
  aliases: {
    type: [String],
    default: [],
    index: true
  },
  shortName: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  domain: String,
  officialDomain: {
    type: String,
    trim: true,
    index: true
  },
  officialWebsite: {
    type: String,
    trim: true
  },
  careersUrl: {
    type: String,
    trim: true
  },
  industry: String,
  location: String,
  country: String,
  companyType: {
    type: String,
    enum: ['MNC', 'Startup', 'Bank', 'Govt', 'Enterprise', 'Other'],
    default: 'Enterprise'
  },
  description: String,
  logo: String,
  verified: {
    type: Boolean,
    default: false
  },
  knownLegitimateCompany: {
    type: Boolean,
    default: false
  },
  verificationLevel: {
    type: String,
    enum: ['enterprise-verified', 'domain-verified', 'identity-verified', 'unverified', 'unknown'],
    default: 'unverified'
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  officialDatabaseMatch: {
    type: Boolean,
    default: false
  },
  source: {
    type: String,
    default: 'database'
  },
  verificationDate: Date,
  employees: Number,
  founded: Number,
  employeeCount: Number,
  foundedYear: Number,
  socialLinks: {
    linkedin: String,
    twitter: String,
    facebook: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// prevent duplicate trusted records: one slug of the normalized name
module.exports = mongoose.model('Company', CompanySchema);