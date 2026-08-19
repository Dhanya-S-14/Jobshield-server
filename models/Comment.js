const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  scanHistory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ScanHistory',
    default: null
  },
  companyName: {
    type: String,
    trim: true,
    default: ''
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: [true, 'Please provide a rating']
  },
  title: {
    type: String,
    trim: true,
    maxlength: 100,
    default: ''
  },
  content: {
    type: String,
    required: [true, 'Please provide a comment'],
    maxlength: 1000
  },
  type: {
    type: String,
    enum: ['review', 'warning', 'tip'],
    default: 'review'
  },
  helpful: {
    type: Number,
    default: 0
  },
  reported: {
    type: Boolean,
    default: false
  },
  replies: [{
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    content: { type: String, maxlength: 500 },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

CommentSchema.index({ scanHistory: 1, createdAt: -1 });
CommentSchema.index({ companyName: 1, createdAt: -1 });
CommentSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', CommentSchema);
