const SavedJob = require('../models/SavedJob');
const User = require('../models/User');

const saveJob = async (req, res) => {
  try {
    const { scanHistoryId, notes } = req.body;

    const existing = await SavedJob.findOne({
      user: req.user.id,
      scanHistory: scanHistoryId
    });

    if (existing) {
      return res.status(400).json({ success: false, message: 'Job already saved' });
    }

    const savedJob = await SavedJob.create({
      user: req.user.id,
      scanHistory: scanHistoryId,
      notes: notes || ''
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { savedJobs: savedJob._id }
    });

    const populatedJob = await SavedJob.findById(savedJob._id)
      .populate('scanHistory');

    res.status(201).json({
      success: true,
      data: populatedJob,
      message: 'Job saved successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getSavedJobs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-savedAt';

    const [savedJobs, total] = await Promise.all([
      SavedJob.find({ user: req.user.id })
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate({
          path: 'scanHistory',
          select: 'jobTitle companyName riskScore trustScore riskLevel location salary createdAt'
        }),
      SavedJob.countDocuments({ user: req.user.id })
    ]);

    res.status(200).json({
      success: true,
      data: savedJobs,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const removeSavedJob = async (req, res) => {
  try {
    const savedJob = await SavedJob.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!savedJob) {
      return res.status(404).json({ success: false, message: 'Saved job not found' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { savedJobs: savedJob._id }
    });

    res.status(200).json({ success: true, message: 'Job removed from saved' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const checkSaved = async (req, res) => {
  try {
    const savedJob = await SavedJob.findOne({
      user: req.user.id,
      scanHistory: req.params.scanId
    });

    res.status(200).json({
      success: true,
      data: {
        isSaved: !!savedJob,
        savedJobId: savedJob ? savedJob._id : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  saveJob,
  getSavedJobs,
  removeSavedJob,
  checkSaved
};
