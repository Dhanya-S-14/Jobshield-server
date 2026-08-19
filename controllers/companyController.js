const Company = require('../models/Company');
const axios = require('axios');

const searchCompany = async (req, res) => {
  try {
    const { q, industry, location, page, limit } = req.query;
    const query = {};

    if (q) {
      query.$or = [
        { name: { $regex: q, $options: 'i' } },
        { domain: { $regex: q, $options: 'i' } }
      ];
    }
    if (industry) query.industry = { $regex: industry, $options: 'i' };
    if (location) query.location = { $regex: location, $options: 'i' };

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    const [companies, total] = await Promise.all([
      Company.find(query).skip(skip).limit(limitNum).sort({ name: 1 }),
      Company.countDocuments(query)
    ]);

    res.status(200).json({
      success: true,
      data: companies,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const analyzeDomain = (website, companyName) => {
  const signals = [];
  let trustScore = 50;
  const suspiciousTLDs = ['.xyz', '.top', '.club', '.online', '.site', '.work', '.click', '.link', '.download', '.review', '.info', '.buzz', '.fun', '.icu'];
  const freeEmailDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
  const shorteners = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'rb.gy', 'cutt.ly'];

  if (!website) {
    signals.push({ text: 'No website provided', type: 'warning', icon: 'alert-circle' });
    trustScore -= 15;
    return { trustScore: Math.max(0, trustScore), signals };
  }

  const url = website.toLowerCase().startsWith('http') ? website : `https://${website}`;
  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    signals.push({ text: 'Invalid website URL', type: 'danger', icon: 'close-circle' });
    return { trustScore: 10, signals };
  }

  if (parsed.protocol === 'https:') {
    signals.push({ text: 'Website uses HTTPS encryption', type: 'positive', icon: 'checkmark-circle' });
    trustScore += 10;
  } else {
    signals.push({ text: 'Website does not use HTTPS — security risk', type: 'danger', icon: 'close-circle' });
    trustScore -= 20;
  }

  const hostname = parsed.hostname.replace('www.', '');
  const tld = '.' + hostname.split('.').pop();
  const suspicious = suspiciousTLDs.some(t => hostname.endsWith(t));
  if (suspicious) {
    signals.push({ text: `Suspicious top-level domain (${tld}) — commonly used by scam sites`, type: 'danger', icon: 'close-circle' });
    trustScore -= 25;
  }

  const isShortener = shorteners.some(s => hostname.includes(s));
  if (isShortener) {
    signals.push({ text: 'URL uses a link shortener — scammers hide real destinations', type: 'danger', icon: 'close-circle' });
    trustScore -= 30;
  }

  const nameInDomain = companyName.split(/\s+/).some(w => w.length > 3 && hostname.includes(w.toLowerCase()));
  if (nameInDomain) {
    signals.push({ text: 'Company name matches the website domain', type: 'positive', icon: 'checkmark-circle' });
    trustScore += 10;
  } else {
    signals.push({ text: 'Company name does not appear in the domain', type: 'warning', icon: 'alert-circle' });
    trustScore -= 5;
  }

  const domainParts = hostname.split('.');
  if (domainParts.length === 2 && domainParts[0].length > 3) {
    signals.push({ text: 'Standard domain structure (e.g. company.com)', type: 'positive', icon: 'checkmark-circle' });
    trustScore += 5;
  }

  const freeIndicators = ['blogspot', 'wordpress', 'wix', 'weebly', 'squarespace', 'shopify'];
  if (freeIndicators.some(f => hostname.includes(f))) {
    signals.push({ text: 'Website hosted on a free platform — legitimate companies usually have custom domains', type: 'warning', icon: 'alert-circle' });
    trustScore -= 10;
  }

  const scamPatterns = ['earn', 'money', 'cash', 'free', 'win', 'prize', 'bonus', 'getrich'];
  if (scamPatterns.some(p => hostname.includes(p))) {
    signals.push({ text: 'Domain contains scam-related keywords', type: 'danger', icon: 'close-circle' });
    trustScore -= 20;
  }

  return { trustScore: Math.max(0, Math.min(100, trustScore)), signals, domain: hostname };
};

const verifyCompany = async (req, res) => {
  try {
    const companyName = req.params.companyName || req.query.name;
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    let company = await Company.findOne({
      name: { $regex: new RegExp(`^${companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (!company) {
      company = await Company.findOne({
        name: { $regex: companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' }
      });
    }

    if (!company) {
      const words = companyName.trim().split(/\s+/);
      if (words.length >= 2) {
        const pattern = words.map(w => `(?=.*${w})`).join('');
        company = await Company.findOne({ name: { $regex: new RegExp(pattern, 'i') } });
      }
    }

    const domainAnalysis = analyzeDomain(company?.website, companyName);

    const scamScore = domainAnalysis.trustScore;
    let riskLevel = 'Low Risk';
    let riskColor = 'green';
    if (scamScore < 30) { riskLevel = 'High Risk'; riskColor = 'red'; }
    else if (scamScore < 60) { riskLevel = 'Medium Risk'; riskColor = 'orange'; }

    if (company) {
      const allSignals = [
        { text: `Company "${company.name}" found in our verified database`, type: company.verified ? 'positive' : 'warning', icon: company.verified ? 'checkmark-circle' : 'alert-circle' },
        ...(company.verified
          ? [{ text: 'Verified and trusted by JobShield', type: 'positive', icon: 'shield-checkmark' }]
          : [{ text: 'Found but not yet verified — exercise caution', type: 'warning', icon: 'alert-circle' }]
        ),
        ...(company.industry ? [{ text: `Industry: ${company.industry}`, type: 'info', icon: 'briefcase' }] : []),
        ...(company.location ? [{ text: `Location: ${company.location}`, type: 'info', icon: 'location' }] : []),
        ...(company.employeeCount ? [{ text: `Size: ${company.employeeCount} employees`, type: 'info', icon: 'people' }] : []),
        ...(company.foundedYear ? [{ text: `Founded: ${company.foundedYear}`, type: 'info', icon: 'calendar' }] : []),
        ...domainAnalysis.signals,
      ];

      const finalScore = company.verified ? Math.max(scamScore, 80) : scamScore;

      return res.status(200).json({
        success: true,
        data: {
          exists: true,
          verified: company.verified,
          inDatabase: true,
          trustScore: finalScore,
          riskLevel: finalScore >= 70 ? 'Low Risk' : finalScore >= 40 ? 'Medium Risk' : 'High Risk',
          riskColor: finalScore >= 70 ? 'green' : finalScore >= 40 ? 'orange' : 'red',
          company: {
            name: company.name,
            website: company.website,
            domain: domainAnalysis.domain || company.domain,
            industry: company.industry,
            location: company.location,
            employeeCount: company.employeeCount,
            foundedYear: company.foundedYear,
            description: company.description,
            socialLinks: company.socialLinks,
            verified: company.verified
          },
          signals: allSignals
        }
      });
    }

    const notInDbSignals = [
      { text: `Company "${companyName}" not found in our verified database`, type: 'warning', icon: 'alert-circle' },
      { text: 'Not being in our database does not guarantee it is a scam, but exercise extra caution', type: 'info', icon: 'information-circle' },
      ...domainAnalysis.signals,
    ];

    if (domainAnalysis.trustScore < 40) {
      notInDbSignals.push({ text: 'Multiple risk signals detected — verify through additional sources', type: 'danger', icon: 'warning' });
    }

    return res.status(200).json({
      success: true,
      data: {
        exists: false,
        verified: false,
        inDatabase: false,
        trustScore: domainAnalysis.trustScore,
        riskLevel,
        riskColor,
        company: {
          name: companyName,
          website: domainAnalysis.domain || '',
          domain: domainAnalysis.domain || '',
          industry: '',
          location: '',
          description: '',
          verified: false
        },
        signals: notInDbSignals
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const addCompany = async (req, res) => {
  try {
    const {
      name, website, domain, industry, location, description,
      employeeCount, foundedYear, logo, socialLinks
    } = req.body;

    const existingCompany = await Company.findOne({
      name: { $regex: new RegExp(`^${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') }
    });

    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'Company already exists' });
    }

    const company = await Company.create({
      name, website, domain, industry, location, description,
      employeeCount, foundedYear, logo, socialLinks
    });

    res.status(201).json({
      success: true,
      data: company,
      message: 'Company added successfully'
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const {
      name, website, domain, industry, location, description,
      verified, employeeCount, foundedYear, logo, socialLinks
    } = req.body;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (website !== undefined) updateFields.website = website;
    if (domain !== undefined) updateFields.domain = domain;
    if (industry !== undefined) updateFields.industry = industry;
    if (location !== undefined) updateFields.location = location;
    if (description !== undefined) updateFields.description = description;
    if (verified !== undefined) {
      updateFields.verified = verified;
      if (verified) updateFields.verificationDate = new Date();
    }
    if (employeeCount !== undefined) updateFields.employeeCount = employeeCount;
    if (foundedYear !== undefined) updateFields.foundedYear = foundedYear;
    if (logo !== undefined) updateFields.logo = logo;
    if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;

    const company = await Company.findByIdAndUpdate(
      req.params.id,
      updateFields,
      { new: true, runValidators: true }
    );

    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }

    res.status(200).json({
      success: true,
      data: company,
      message: 'Company updated successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  searchCompany,
  verifyCompany,
  addCompany,
  updateCompany
};
