const mongoose = require('mongoose');

const SavedJobSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scanHistory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScanHistory',
    required: true
  },
  notes: {
    type: String,
    default: ''
  },
  savedAt: {
    type: Date,
    default: Date.now
  }
});

SavedJobSchema.index({ user: 1, scanHistory: 1 }, { unique: true });

module.exports = mongoose.model('SavedJob', SavedJobSchema);
