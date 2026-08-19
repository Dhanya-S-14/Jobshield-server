const mongoose = require('mongoose');

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
  riskLevel: {
    type: String,
    enum: ['Safe', 'Suspicious', 'Scam'],
    required: true
  },
  aiExplanation: {
    type: String,
    required: true
  },
  scanResults: {
    keywordAnalysis: {
      score: Number,
      keywordsFound: [String],
      details: String
    },
    salaryAnalysis: {
      score: Number,
      details: String
    },
    emailAnalysis: {
      score: Number,
      details: String
    },
    urlAnalysis: {
      score: Number,
      details: String
    },
    phoneAnalysis: {
      score: Number,
      details: String
    },
    companyAnalysis: {
      score: Number,
      details: String
    },
    textQualityAnalysis: {
      score: Number,
      details: String
    },
    urgencyAnalysis: {
      score: Number,
      details: String
    }
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
