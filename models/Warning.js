const mongoose = require('mongoose');

const WarningSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['scam_alert', 'new_pattern', 'community_report', 'system'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  severity: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  companies: [{
    type: String,
    trim: true
  }],
  keywords: [{
    type: String,
    trim: true
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

WarningSchema.index({ isActive: 1, createdAt: -1 });
WarningSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('Warning', WarningSchema);
