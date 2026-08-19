const ScanHistory = require('../models/ScanHistory');
const User = require('../models/User');
const { analyzeJobPosting } = require('../services/detectionEngine');
const PDFDocument = require('pdfkit');

const scanJob = async (req, res) => {
  try {
    let {
      jobTitle,
      companyName,
      jobDescription,
      salary,
      location,
      jobType,
      recruiterName,
      recruiterEmail,
      phoneNumber,
      website,
      experienceLevel,
      experience,
      skills,
      applyLink
    } = req.body;

    experience = experience || experienceLevel;
    if (jobType) {
      jobType = jobType.toLowerCase();
    } else {
      jobType = undefined;
    }

    const scanData = {
      jobTitle,
      companyName,
      jobDescription,
      salary,
      location,
      recruiterEmail,
      phoneNumber,
      website,
      applyLink,
      skills
    };

    const detectionResult = await analyzeJobPosting(scanData);

    const scanRecord = await ScanHistory.create({
      user: req.user.id,
      jobTitle,
      companyName,
      jobDescription,
      salary,
      location,
      ...(jobType !== undefined && { jobType }),
      recruiterName,
      recruiterEmail,
      phoneNumber,
      website,
      experience,
      skills,
      applyLink,
      riskScore: detectionResult.riskScore,
      riskLevel: detectionResult.riskLevel,
      aiExplanation: detectionResult.aiExplanation,
      scanResults: detectionResult.details,
      keywordsFound: detectionResult.keywordsFound
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { scanHistory: scanRecord._id }
    });

    res.status(201).json({
      success: true,
      data: {
        id: scanRecord._id,
        riskScore: detectionResult.riskScore,
        riskLevel: detectionResult.riskLevel,
        aiExplanation: detectionResult.aiExplanation,
        keywordsFound: detectionResult.keywordsFound,
        details: detectionResult.details,
        createdAt: scanRecord.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Scan failed', error: error.message });
  }
};

const getScanHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const sort = req.query.sort || '-createdAt';
    const riskLevel = req.query.riskLevel;

    const query = { user: req.user.id };
    if (riskLevel && ['Safe', 'Suspicious', 'Scam'].includes(riskLevel)) {
      query.riskLevel = riskLevel;
    }

    const [scans, total] = await Promise.all([
      ScanHistory.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select('-scanResults'),
      ScanHistory.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: scans,
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

const getScanById = async (req, res) => {
  try {
    const scan = await ScanHistory.findOne({
      _id: req.params.id,
      user: req.user.id
    });

    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    res.status(200).json({
      success: true,
      data: scan
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const deleteScan = async (req, res) => {
  try {
    const scan = await ScanHistory.findOneAndDelete({
      _id: req.params.id,
      user: req.user.id
    });

    if (!scan) {
      return res.status(404).json({ success: false, message: 'Scan not found' });
    }

    await User.findByIdAndUpdate(req.user.id, {
      $pull: { scanHistory: scan._id }
    });

    res.status(200).json({ success: true, message: 'Scan deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const exportHistoryPDF = async (req, res) => {
  try {
    const scans = await ScanHistory.find({ user: req.user.id })
      .sort('-createdAt')
      .limit(100);

    const doc = new PDFDocument({
      size: 'A4',
      margin: 50
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=jobshield-scan-history.pdf');

    doc.pipe(res);

    doc.fontSize(24).font('Helvetica-Bold').text('JobShield - Scan History', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).font('Helvetica').text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown();

    if (scans.length === 0) {
      doc.fontSize(14).text('No scan history available.', { align: 'center' });
    } else {
      const safeCount = scans.filter(s => s.riskLevel === 'Safe').length;
      const suspiciousCount = scans.filter(s => s.riskLevel === 'Suspicious').length;
      const scamCount = scans.filter(s => s.riskLevel === 'Scam').length;

      doc.fontSize(12).font('Helvetica-Bold').text('Summary');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total Scans: ${scans.length}`);
      doc.text(`Safe: ${safeCount} | Suspicious: ${suspiciousCount} | Scam: ${scamCount}`);
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Scan Details');
      doc.moveDown();

      for (const scan of scans) {
        if (doc.y > 700) {
          doc.addPage();
        }

        const riskColor = scan.riskLevel === 'Safe' ? '#059669' :
          scan.riskLevel === 'Suspicious' ? '#D97706' : '#DC2626';

        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1F2937')
          .text(`Job: ${scan.jobTitle}`);
        doc.fontSize(10).font('Helvetica').fillColor('#4B5563')
          .text(`Company: ${scan.companyName}`);
        doc.fillColor(riskColor)
          .text(`Risk: ${scan.riskLevel} (${scan.riskScore}/100)`);
        doc.fillColor('#4B5563')
          .text(`Date: ${new Date(scan.createdAt).toLocaleDateString()}`)
          .text(`Location: ${scan.location || 'N/A'}`)
          .text(`Salary: ${scan.salary || 'N/A'}`);
        doc.moveDown(0.5);

        if (doc.y > 720) {
          doc.addPage();
        }
      }
    }

    doc.end();
  } catch (error) {
    res.status(500).json({ success: false, message: 'PDF generation failed', error: error.message });
  }
};

const getScanStats = async (req, res) => {
  try {
    const userId = req.user.id;
    const [total, safe, suspicious, scam] = await Promise.all([
      ScanHistory.countDocuments({ user: userId }),
      ScanHistory.countDocuments({ user: userId, riskLevel: 'Safe' }),
      ScanHistory.countDocuments({ user: userId, riskLevel: 'Suspicious' }),
      ScanHistory.countDocuments({ user: userId, riskLevel: 'Scam' }),
    ]);

    res.status(200).json({
      success: true,
      data: { total, safe, suspicious, scam }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get stats', error: error.message });
  }
};

module.exports = {
  scanJob,
  getScanHistory,
  getScanById,
  deleteScan,
  exportHistoryPDF,
  getScanStats
};
