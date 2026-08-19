const User = require('../models/User');
const ScanHistory = require('../models/ScanHistory');
const ReportedScam = require('../models/ReportedScam');
const SavedJob = require('../models/SavedJob');
const Keyword = require('../models/Keyword');
const Company = require('../models/Company');

const getDashboard = async (req, res) => {
  try {
    const [
      totalUsers,
      totalScans,
      totalReports,
      totalCompanies,
      totalKeywords,
      recentScans,
      scamReports,
      safeScans,
      suspiciousScans,
      scamScans
    ] = await Promise.all([
      User.countDocuments(),
      ScanHistory.countDocuments(),
      ReportedScam.countDocuments(),
      Company.countDocuments(),
      Keyword.countDocuments({ isActive: true }),
      ScanHistory.find().sort('-createdAt').limit(5).populate('user', 'name email'),
      ReportedScam.find({ status: 'approved' }).countDocuments(),
      ScanHistory.countDocuments({ riskLevel: 'Safe' }),
      ScanHistory.countDocuments({ riskLevel: 'Suspicious' }),
      ScanHistory.countDocuments({ riskLevel: 'Scam' })
    ]);

    res.status(200).json({
      success: true,
      data: {
        stats: {
          totalUsers,
          totalScans,
          totalReports,
          totalCompanies,
          totalKeywords,
          scamReports,
          safeScans,
          suspiciousScans,
          scamScans
        },
        recentScans
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const search = req.query.search || '';

    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    const [users, total] = await Promise.all([
      User.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-password -resetPasswordToken -resetPasswordExpire -verificationToken'),
      User.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: users,
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

const banUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot ban an admin' });
    }

    user.isBanned = !user.isBanned;
    await user.save();

    res.status(200).json({
      success: true,
      data: { isBanned: user.isBanned },
      message: user.isBanned ? 'User banned successfully' : 'User unbanned successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    await ScanHistory.deleteMany({ user: user._id });
    await SavedJob.deleteMany({ user: user._id });
    await user.deleteOne();

    res.status(200).json({ success: true, message: 'User and all associated data deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const status = req.query.status || '';
    const sort = req.query.sort || '-createdAt';

    const query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const [reports, total] = await Promise.all([
      ReportedScam.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('user', 'name email'),
      ReportedScam.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: reports,
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

const approveReport = async (req, res) => {
  try {
    const report = await ReportedScam.findByIdAndUpdate(
      req.params.id,
      { status: 'approved', resolvedAt: new Date() },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      data: report,
      message: 'Report approved'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const rejectReport = async (req, res) => {
  try {
    const report = await ReportedScam.findByIdAndUpdate(
      req.params.id,
      { status: 'rejected', resolvedAt: new Date() },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      data: report,
      message: 'Report rejected'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await ReportedScam.findByIdAndDelete(req.params.id);
    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }
    res.status(200).json({ success: true, message: 'Report deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getKeywords = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;
    const category = req.query.category || '';
    const search = req.query.search || '';

    const query = {};
    if (category) query.category = category;
    if (search) query.keyword = { $regex: search, $options: 'i' };

    const [keywords, total] = await Promise.all([
      Keyword.find(query).sort({ category: 1, severity: -1 }).skip(skip).limit(limit),
      Keyword.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: keywords,
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

const addKeyword = async (req, res) => {
  try {
    const { keyword, category, severity, points, isActive } = req.body;

    const existingKeyword = await Keyword.findOne({
      keyword: { $regex: new RegExp(`^${keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });
    if (existingKeyword) {
      return res.status(400).json({ success: false, message: 'Keyword already exists' });
    }

    const newKeyword = await Keyword.create({
      keyword: keyword.toLowerCase(),
      category,
      severity,
      points,
      isActive: isActive !== undefined ? isActive : true
    });

    res.status(201).json({
      success: true,
      data: newKeyword,
      message: 'Keyword added successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateKeyword = async (req, res) => {
  try {
    const { keyword, category, severity, points, isActive } = req.body;
    const updateFields = {};
    if (keyword !== undefined) updateFields.keyword = keyword.toLowerCase();
    if (category !== undefined) updateFields.category = category;
    if (severity !== undefined) updateFields.severity = severity;
    if (points !== undefined) updateFields.points = points;
    if (isActive !== undefined) updateFields.isActive = isActive;

    const updatedKeyword = await Keyword.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!updatedKeyword) {
      return res.status(404).json({ success: false, message: 'Keyword not found' });
    }

    res.status(200).json({
      success: true,
      data: updatedKeyword,
      message: 'Keyword updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteKeyword = async (req, res) => {
  try {
    const keyword = await Keyword.findByIdAndDelete(req.params.id);
    if (!keyword) {
      return res.status(404).json({ success: false, message: 'Keyword not found' });
    }
    res.status(200).json({ success: true, message: 'Keyword deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getScanStats = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [totalScans, scansByDay, riskDistribution, topScannedCompanies, recentActivity] = await Promise.all([
      ScanHistory.countDocuments(),
      ScanHistory.aggregate([
        { $match: { createdAt: { $gte: thirtyDaysAgo } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } }
      ]),
      ScanHistory.aggregate([
        { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
      ]),
      ScanHistory.aggregate([
        { $group: { _id: '$companyName', count: { $sum: 1 }, avgRisk: { $avg: '$riskScore' } } },
        { $sort: { count: -1 } },
        { $limit: 10 }
      ]),
      ScanHistory.find()
        .sort('-createdAt')
        .limit(10)
        .select('jobTitle companyName riskScore riskLevel createdAt')
    ]);

    const riskStats = { Safe: 0, Suspicious: 0, Scam: 0 };
    riskDistribution.forEach(r => { riskStats[r._id] = r.count; });

    res.status(200).json({
      success: true,
      data: {
        totalScans,
        scansByDay,
        riskDistribution: riskStats,
        topScannedCompanies,
        recentActivity
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  getDashboard,
  getUsers,
  banUser,
  deleteUser,
  getReports,
  approveReport,
  rejectReport,
  deleteReport,
  getKeywords,
  addKeyword,
  updateKeyword,
  deleteKeyword,
  getScanStats
};
