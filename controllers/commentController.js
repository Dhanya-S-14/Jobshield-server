const Comment = require('../models/Comment');

const createComment = async (req, res) => {
  try {
    const { scanHistory, companyName, rating, title, content, type } = req.body;

    const comment = await Comment.create({
      user: req.user.id,
      scanHistory: scanHistory || null,
      companyName: companyName || '',
      rating,
      title: title || '',
      content,
      type: type || 'review'
    });

    const populated = await Comment.findById(comment._id).populate('user', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to create comment', error: error.message });
  }
};

const getComments = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { scanHistory, companyName, type, sort } = req.query;

    const query = {};
    if (scanHistory) query.scanHistory = scanHistory;
    if (companyName) query.companyName = { $regex: companyName, $options: 'i' };
    if (type) query.type = type;

    const sortOption = sort === 'rating' ? { rating: -1 } :
                       sort === 'helpful' ? { helpful: -1 } :
                       { createdAt: -1 };

    const [comments, total] = await Promise.all([
      Comment.find(query)
        .sort(sortOption)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name avatar')
        .populate('replies.user', 'name avatar'),
      Comment.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: comments,
      pagination: { page, limit, total, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const updated = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
      .populate('user', 'name avatar');

    res.status(200).json({ success: true, data: updated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    await Comment.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const markHelpful = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(
      req.params.id,
      { $inc: { helpful: 1 } },
      { new: true }
    ).populate('user', 'name avatar');

    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    res.status(200).json({ success: true, data: comment });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const addReply = async (req, res) => {
  try {
    const { content } = req.body;
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    comment.replies.push({ user: req.user.id, content });
    await comment.save();

    const populated = await Comment.findById(comment._id)
      .populate('user', 'name avatar')
      .populate('replies.user', 'name avatar');

    res.status(201).json({ success: true, data: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { createComment, getComments, updateComment, deleteComment, markHelpful, addReply };
