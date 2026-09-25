const mongoose = require('mongoose');
const { Schema } = mongoose;

const ScanHistorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobTitle: {
    type: String,
    required: [true, 'Please provide a job title'],
    trim: true
  },
  companyName: {
    type: String,
    required: [true, 'Please provide a company name'],
    trim: true
  },
  jobDescription: {
    type: String,
    required: [true, 'Please provide a job description']
  },
  salary: {
    type: String,
    default: ''
  },
  location: {
    type: String,
    default: ''
  },
  jobType: {
    type: String,
    enum: ['full-time', 'part-time', 'contract', 'freelance', 'internship', 'remote', 'temporary', 'other'],
    default: 'other'
  },
  recruiterName: {
    type: String,
    default: ''
  },
  recruiterEmail: {
    type: String,
    default: ''
  },
  phoneNumber: {
    type: String,
    default: ''
  },
  website: {
    type: String,
    default: ''
  },
  experience: {
    type: String,
    default: ''
  },
  skills: [{
    type: String
  }],
  applyLink: {
    type: String,
    default: ''
  },
  riskScore: {
    type: Number,
    min: 0,
    max: 100,
    required: true
  },
  trustScore: {
    type: Number,
    min: 0,
    max: 100,
    default: null
  },
  riskLevel: {
    type: String,
    enum: ['Highly Trusted', 'Low Risk', 'Moderate Risk', 'High Risk', 'Critical Risk'],
    required: true
  },
  verification: {
    type: Schema.Types.Mixed,
    default: null
  },
  companyVerification: {
    type: Schema.Types.Mixed,
    default: null
  },
  evidence: [{
    factor: { type: String, default: '' },
    type: { type: String, default: '' },
    message: { type: String, default: '' }
  }],
  warnings: [{
    type: String
  }],
  breakdown: [{
    type: Schema.Types.Mixed
  }],
  aiExplanation: {
    type: String,
    required: true
  },
  scanResults: {
    type: Schema.Types.Mixed,
    default: {}
  },
  keywordsFound: [{
    keyword: String,
    category: String,
    severity: Number,
    points: Number
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

ScanHistorySchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('ScanHistory', ScanHistorySchema);
