const ReportedScam = require('../models/ReportedScam');
const Notification = require('../models/Notification');

const createReport = async (req, res) => {
  try {
    const { companyName, jobTitle, description, website, evidenceUrls } = req.body;

    let screenshot = '';
    if (req.file) {
      screenshot = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const report = await ReportedScam.create({
      user: req.user.id,
      companyName,
      jobTitle,
      description,
      website,
      evidenceUrls: evidenceUrls || [],
      screenshot
    });

    await Notification.create({
      user: req.user.id,
      title: 'Report Submitted',
      message: `Your scam report against "${companyName}" has been submitted and is pending review.`,
      type: 'info'
    });

    res.status(201).json({
      success: true,
      data: report,
      message: 'Scam report submitted successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const getReports = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const query = { status: 'approved' };

    const [reports, total] = await Promise.all([
      ReportedScam.find(query)
        .sort('-createdAt')
        .skip(skip)
        .limit(limit)
        .select('-evidenceUrls -screenshot'),
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

const getUserReports = async (req, res) => {
  try {
    const reports = await ReportedScam.find({ user: req.user.id })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      data: reports
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateReport = async (req, res) => {
  try {
    const { companyName, jobTitle, description, website, evidenceUrls } = req.body;

    const updateFields = {};
    if (companyName !== undefined) updateFields.companyName = companyName;
    if (jobTitle !== undefined) updateFields.jobTitle = jobTitle;
    if (description !== undefined) updateFields.description = description;
    if (website !== undefined) updateFields.website = website;
    if (evidenceUrls !== undefined) updateFields.evidenceUrls = evidenceUrls;

    if (req.file) {
      updateFields.screenshot = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    }

    const report = await ReportedScam.findOneAndUpdate(
      { _id: req.params.id, user: req.user.id },
      updateFields,
      { new: true, runValidators: true }
    );

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({
      success: true,
      data: report,
      message: 'Report updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteReport = async (req, res) => {
  try {
    const report = await ReportedScam.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!report) {
      return res.status(404).json({ success: false, message: 'Report not found' });
    }

    res.status(200).json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  createReport,
  getReports,
  getUserReports,
  updateReport,
  deleteReport
};
