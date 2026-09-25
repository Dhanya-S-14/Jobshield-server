const mongoose = require('mongoose');
const ScanHistory = require('../models/ScanHistory');
const User = require('../models/User');
const { analyzeJobPosting } = require('../services/detectionEngine');
const { getCompanyVerification } = require('../services/companyVerifier');
const PDFDocument = require('pdfkit');

const normalizeScanBody = (body) => {
  const {
    jobTitle, companyName, jobDescription, salary, location, jobType,
    recruiterName, recruiterEmail, phoneNumber, website, experienceLevel,
    experience, skills, applyLink
  } = body;

  let exp = experience || experienceLevel || undefined;
  let type = undefined;
  if (jobType) type = String(jobType).toLowerCase();

  return {
    jobTitle, companyName, jobDescription, salary: salary || '',
    location: location || '', jobType: type, recruiterName,
    recruiterEmail: recruiterEmail || '', phoneNumber: phoneNumber || '',
    website: website || '', applyLink: applyLink || '', experience: exp,
    skills
  };
};

const detect = async (normalized) => {
  const { jobTitle, companyName, jobDescription, salary, location, recruiterEmail, phoneNumber, website, applyLink, skills } = normalized;
  return analyzeJobPosting({
    jobTitle, companyName, jobDescription, salary, location,
    recruiterEmail, phoneNumber, website, applyLink, skills
  });
};

const scanJob = async (req, res) => {
  try {
    if (mongoose.connection.readyState !== 1) {
      return res.status(503).json({ success: false, message: 'Database not ready. Please try again in a few seconds.' });
    }

    const normalized = normalizeScanBody(req.body);
    const {
      jobTitle, companyName, jobDescription, salary, location, jobType,
      recruiterName, recruiterEmail, phoneNumber, website, applyLink, experience, skills
    } = normalized;

    console.log('Scoring started:', { jobTitle, companyName, hasDescription: Boolean(jobDescription) });

    const detectionResult = await detect(normalized);

    console.log(`Scoring result: trust=${detectionResult.trustScore} risk=${detectionResult.riskScore} level=${detectionResult.riskLevel}`);

    const companyVerification = await getCompanyVerification(normalized).catch((e) => {
      console.error('Company verification failed:', e && e.message);
      return null;
    });

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
      trustScore: detectionResult.trustScore,
      riskLevel: detectionResult.riskLevel,
      verification: detectionResult.verification,
      companyVerification,
      evidence: detectionResult.evidence,
      warnings: detectionResult.warnings,
      breakdown: detectionResult.breakdown,
      aiExplanation: detectionResult.aiExplanation,
      scanResults: {
        trustScore: detectionResult.trustScore,
        riskScore: detectionResult.riskScore,
        riskLevel: detectionResult.riskLevel,
        verdict: detectionResult.verdict,
        aiExplanation: detectionResult.aiExplanation,
        verification: detectionResult.verification,
        companyVerification,
        evidence: detectionResult.evidence,
        warnings: detectionResult.warnings,
        breakdown: detectionResult.breakdown,
        details: detectionResult.details
      },
      keywordsFound: detectionResult.keywordsFound
    });

    await User.findByIdAndUpdate(req.user.id, {
      $push: { scanHistory: scanRecord._id }
    });

    res.status(201).json({
      success: true,
      data: {
        _id: scanRecord._id,
        id: scanRecord._id,
        jobTitle: scanRecord.jobTitle,
        companyName: scanRecord.companyName,
        riskScore: detectionResult.riskScore,
        trustScore: detectionResult.trustScore,
        riskLevel: detectionResult.riskLevel,
        verdict: detectionResult.verdict,
        aiExplanation: detectionResult.aiExplanation,
        verification: detectionResult.verification,
        companyVerification,
        evidence: detectionResult.evidence,
        warnings: detectionResult.warnings,
        breakdown: detectionResult.breakdown,
        keywordsFound: detectionResult.keywordsFound,
        details: detectionResult.details,
        createdAt: scanRecord.createdAt
      }
    });
  } catch (error) {
    console.error('Scan failed:', error);
    if (error && error.stack) console.error(error.stack);
    const message = error && error.message ? error.message : String(error);
    res.status(500).json({ success: false, message: 'Scan failed', error: message });
  }
};

/**
 * Public (no-auth) analysis endpoint — used by trial users and the web client
 * so the machine-learning-free, deterministic engine always runs server-side.
 * Nothing is persisted here.
 */
const analyzeJob = async (req, res) => {
  try {
    const normalized = normalizeScanBody(req.body || {});
    const result = await detect(normalized);
    const companyVerification = await getCompanyVerification(normalized).catch(() => null);
    result.companyVerification = companyVerification;
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Analyze failed:', error);
    const message = error && error.message ? error.message : String(error);
    res.status(500).json({ success: false, message: 'Analysis failed', error: message });
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
    const LEVELS = ['Highly Trusted', 'Low Risk', 'Moderate Risk', 'High Risk', 'Critical Risk'];
    if (riskLevel && LEVELS.includes(riskLevel)) {
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
      doc.fontSize(12).font('Helvetica-Bold').text('Summary');
      doc.fontSize(10).font('Helvetica');
      doc.text(`Total Scans: ${scans.length}`);
      const countBy = {};
      for (const s of scans) countBy[s.riskLevel] = (countBy[s.riskLevel] || 0) + 1;
      doc.text('Breakdown: ' + Object.keys(countBy).map((k) => `${k}: ${countBy[k]}`).join(' | '));
      doc.moveDown();

      doc.fontSize(12).font('Helvetica-Bold').text('Scan Details');
      doc.moveDown();

      for (const scan of scans) {
        if (doc.y > 700) {
          doc.addPage();
        }

        const riskColor = scan.riskLevel === 'Highly Trusted' ? '#059669' :
          scan.riskLevel === 'Low Risk' ? '#10b981' :
          scan.riskLevel === 'Moderate Risk' ? '#D97706' :
          scan.riskLevel === 'High Risk' ? '#DC6803' : '#DC2626';

        doc.fontSize(11).font('Helvetica-Bold').fillColor('#1F2937')
          .text(`Job: ${scan.jobTitle}`);
        doc.fontSize(10).font('Helvetica').fillColor('#4B5563')
          .text(`Company: ${scan.companyName}`);
        doc.fillColor(riskColor)
          .text(`Level: ${scan.riskLevel} (Risk ${scan.riskScore}/100 | Trust ${scan.trustScore !== null && scan.trustScore !== undefined ? scan.trustScore : 100 - scan.riskScore}/100)`);
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
    const LEVELS = ['Highly Trusted', 'Low Risk', 'Moderate Risk', 'High Risk', 'Critical Risk'];

    const agg = await ScanHistory.aggregate([
      { $match: { user: userId } },
      { $group: { _id: '$riskLevel', count: { $sum: 1 } } }
    ]);

    const levelCounts = {};
    let total = 0;
    for (const row of agg) {
      levelCounts[row._id] = row.count;
      total += row.count;
    }

    const data = {
      total,
      // detailed breakdown per new tier
      levels: LEVELS.map((l) => ({ level: l, count: levelCounts[l] || 0 })),
      // legacy buckets for dashboards that still expect safe/suspicious/scam
      highlyTrusted: levelCounts['Highly Trusted'] || 0,
      lowRisk: levelCounts['Low Risk'] || 0,
      moderateRisk: levelCounts['Moderate Risk'] || 0,
      highRisk: levelCounts['High Risk'] || 0,
      criticalRisk: levelCounts['Critical Risk'] || 0,
      safe: (levelCounts['Highly Trusted'] || 0) + (levelCounts['Low Risk'] || 0),
      suspicious: (levelCounts['Moderate Risk'] || 0) + (levelCounts['High Risk'] || 0),
      scam: levelCounts['Critical Risk'] || 0
    };

    res.status(200).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to get stats', error: error.message });
  }
};

module.exports = {
  scanJob,
  analyzeJob,
  getScanHistory,
  getScanById,
  deleteScan,
  exportHistoryPDF,
  getScanStats
};
