const mongoose = require('mongoose');

const KeywordSchema = new mongoose.Schema({
  keyword: {
    type: String,
    required: [true, 'Please provide a keyword'],
    unique: true,
    trim: true,
    lowercase: true
  },
  category: {
    type: String,
    enum: [
      'money', 'urgency', 'fake_benefits', 'investment',
      'fake_interviews', 'suspicious_urls', 'emails', 'salary',
      'grammar', 'pressure', 'personal_info', 'fake_credentials',
      'too_good_true', 'vague', 'unprofessional'
    ],
    required: [true, 'Please provide a category']
  },
  severity: {
    type: Number,
    required: [true, 'Please provide severity'],
    min: 1,
    max: 10
  },
  points: {
    type: Number,
    required: [true, 'Please provide points'],
    min: 1,
    max: 50
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Keyword', KeywordSchema);
