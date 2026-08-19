const Warning = require('../models/Warning');

const getActiveWarnings = async (req, res) => {
  try {
    const warnings = await Warning.find({
      isActive: true,
      expiresAt: { $gt: new Date() }
    })
      .sort({ severity: -1, createdAt: -1 })
      .limit(50)
      .populate('createdBy', 'name');

    res.status(200).json({ success: true, data: warnings });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const createWarning = async (req, res) => {
  try {
    const { type, title, message, severity, companies, keywords, expiresAt } = req.body;

    const warning = await Warning.create({
      type,
      title,
      message,
      severity: severity || 'medium',
      companies: companies || [],
      keywords: keywords || [],
      createdBy: req.user.id,
      expiresAt: expiresAt || undefined
    });

    if (req.app.get('io')) {
      req.app.get('io').emit('new_warning', warning);
    }

    res.status(201).json({ success: true, data: warning });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const dismissWarning = async (req, res) => {
  try {
    const warning = await Warning.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    );
    if (!warning) return res.status(404).json({ success: false, message: 'Warning not found' });
    res.status(200).json({ success: true, message: 'Warning dismissed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = { getActiveWarnings, createWarning, dismissWarning };
