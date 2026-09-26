const Company = require('../models/Company');
const registry = require('../config/companies');
const { getCompanyVerification } = require('../services/companyVerifier');

const escapeRegex = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Map a trust score (0-100) to the legacy risk vocabulary the clients already use.
 */
const scoreToLegacyRisk = (trustScore) => {
  if (trustScore >= 80) return { riskLevel: 'Low Risk', riskColor: 'green' };
  if (trustScore >= 60) return { riskLevel: 'Medium Risk', riskColor: 'orange' };
  return { riskLevel: 'High Risk', riskColor: 'red' };
};

const registryHit = (c) => ({
  _id: null,
  source: 'trusted-registry',
  name: c.name,
  registeredName: c.name,
  aliases: c.aliases || [],
  shortName: c.shortName || c.name,
  website: `https://www.${c.domain}`,
  domain: c.domain,
  officialDomain: c.domain,
  officialWebsite: `https://www.${c.domain}`,
  careersUrl: c.careersUrl || `https://www.${c.domain}/careers`,
  industry: c.industry || '',
  country: c.country || '',
  companyType: c.companyType || 'Enterprise',
  verified: true
});

const searchCompany = async (req, res) => {
  try {
    const { q, industry, location, limit = 20 } = req.query;
    const searchTerm = String(q || req.query.name || req.query.query || '').trim();
    const limitNum = parseInt(limit) || 20;

    const registryResults = searchTerm
      ? registry.companies.filter((c) => {
          const hay = registry.normalizeName(c.name + ' ' + (c.shortName || '') + ' ' + (c.aliases || []).join(' '));
          return hay.includes(registry.normalizeName(searchTerm)) || registry.lookupCompany(searchTerm, { minScore: 0.9 }) === c;
        }).map(registryHit)
      : registry.companies.map(registryHit);

    const query = {};
    if (searchTerm) {
      query.$or = [
        { name: { $regex: escapeRegex(searchTerm), $options: 'i' } },
        { domain: { $regex: escapeRegex(searchTerm), $options: 'i' } },
        { aliases: { $regex: escapeRegex(searchTerm), $options: 'i' } },
      ];
    }
    if (industry) query.industry = { $regex: escapeRegex(industry), $options: 'i' };

    let dbCompanies = [];
    try {
      dbCompanies = await Company.find(query).limit(200);
    } catch { dbCompanies = []; }

    const seen = new Set();
    const merged = [...registryResults, ...dbCompanies.map((c) => ({ ...c.toObject(), source: 'database' }))]
      .filter((c) => {
        const key = registry.normalizeName(c.name || '');
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .slice(0, limitNum);

    res.status(200).json({ success: true, count: merged.length, total: merged.length, data: merged });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
};

/**
 * GET /api/companies/verify/:companyName
 * Backwards-compatible + richer: performs full company verification for a name.
 */
const verifyCompany = async (req, res) => {
  try {
    const companyName = (req.params.companyName || req.query.name || '').trim();
    if (!companyName) {
      return res.status(400).json({ success: false, message: 'Company name is required' });
    }

    const verification = await getCompanyVerification({ companyName });

    const signals = verification.breakdown
      .filter((b) => b.status !== 'neutral')
      .map((b) => ({
        text: b.detail,
        type: b.status === 'good' ? 'positive' : b.status === 'warning' ? 'warning' : 'danger',
        icon: b.status === 'good' ? 'checkmark-circle' : b.status === 'warning' ? 'alert-circle' : 'close-circle',
      }));
    verification.warnings.forEach((w) => signals.unshift({ text: w, type: 'danger', icon: 'warning' }));
    if (!verification.company.found) {
      signals.push({
        text: 'Not being in our database does NOT mean it is a scam — verify through official channels first',
        type: 'info',
        icon: 'information-circle',
      });
    }

    const legacy = verification.company.found
      ? scoreToLegacyRisk(verification.trustScore)
      : { riskLevel: 'Unverified', riskColor: 'gray' };

    res.status(200).json({
      success: true,
      data: {
        exists: verification.company.found,
        verified: verification.company.found && verification.company.verified,
        inDatabase: verification.company.found,
        identityVerified: verification.companyIdentity.verified,
        trustScore: verification.trustScore,
        riskLevel: legacy.riskLevel,
        riskColor: legacy.riskColor,
        verificationLevel: verification.verificationLevel,
        officialDomain: verification.company.officialDomain,
        impersonationDetected: verification.impersonationDetected,
        recommendation: verification.recommendation,
        company: {
          name: verification.company.officialName || companyName,
          website: verification.company.officialWebsite || '',
          domain: verification.company.officialDomain || '',
          industry: verification.company.industry,
          location: verification.company.country,
          verified: verification.company.verified,
          source: verification.company.source,
        },
        companyIdentity: verification.companyIdentity,
        domainVerification: verification.domainVerification,
        emailVerification: verification.emailVerification,
        recruiterVerification: verification.recruiterVerification,
        webInfo: verification.webInfo,
        breakdown: verification.breakdown,
        warnings: verification.warnings,
        signals,
        checkedAt: verification.checkedAt,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
  }
};

/**
 * POST /api/company/verify
 * Full verification with company / job / domain / recruiter / email statuses.
 * Body: { companyName, jobTitle, jobDescription, website, applyLink, recruiterEmail, phoneNumber, communicationChannel }
 */
const verifyCompanyAdvanced = async (req, res) => {
  try {
    const { companyName } = req.body || {};
    if (!companyName || !String(companyName).trim()) {
      return res.status(400).json({ success: false, message: 'companyName is required' });
    }

    const verification = await getCompanyVerification(req.body || {});
    res.status(200).json({ success: true, data: verification });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Verification failed', error: error.message });
  }
};

/**
 * GET /api/companies/:id
 */
const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    const company = await Company.findById(id);
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found in verified database' });
    }
    const verification = await getCompanyVerification({ companyName: company.name }).catch(() => null);
    res.status(200).json({ success: true, data: { ...company.toObject(), verification } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const addCompany = async (req, res) => {
  try {
    const {
      name, website, domain, industry, location, description,
      officialDomain, aliases, shortName, country, companyType,
      employeeCount, foundedYear, logo, socialLinks, careersUrl
    } = req.body;

    const existingCompany = await Company.findOne({ name: { $regex: new RegExp(`^${escapeRegex(name)}$`, 'i') } });
    if (existingCompany) {
      return res.status(400).json({ success: false, message: 'Company already exists' });
    }

    const normalizedStoreDomain = officialDomain || domain || (website ? registry.registrableDomain(website.replace(/^https?:\/\//i, '').split('/')[0]) : '');

    const company = await Company.create({
      name, registeredName: name, aliases: aliases || [], shortName: shortName || name,
      website, domain: normalizedStoreDomain, officialDomain: normalizedStoreDomain,
      officialWebsite: website, careersUrl,
      industry, location, country, companyType,
      employeeCount, foundedYear, description, logo, socialLinks,
      verified: false, knownLegitimateCompany: false, verificationLevel: 'unverified',
    });

    res.status(201).json({ success: true, data: company, message: 'Company added successfully' });
  } catch (error) {
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((e) => e.message);
      return res.status(400).json({ success: false, message: messages.join('. ') });
    }
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

const updateCompany = async (req, res) => {
  try {
    const {
      name, website, domain, industry, location, description,
      verified, employeeCount, foundedYear, logo, socialLinks,
      officialDomain, aliases, shortName, country, companyType, careersUrl
    } = req.body;

    const updateFields = {};
    if (name !== undefined) { updateFields.name = name; updateFields.registeredName = name; }
    if (website !== undefined) updateFields.website = website;
    if (officialDomain !== undefined) updateFields.officialDomain = officialDomain;
    if (domain !== undefined) updateFields.domain = domain;
    if (aliases !== undefined) updateFields.aliases = aliases;
    if (shortName !== undefined) updateFields.shortName = shortName;
    if (country !== undefined) updateFields.country = country;
    if (companyType !== undefined) updateFields.companyType = companyType;
    if (careersUrl !== undefined) updateFields.careersUrl = careersUrl;
    if (industry !== undefined) updateFields.industry = industry;
    if (location !== undefined) updateFields.location = location;
    if (description !== undefined) updateFields.description = description;
    if (verified !== undefined) {
      updateFields.verified = verified;
      updateFields.knownLegitimateCompany = verified;
      updateFields.verificationLevel = verified ? 'verified' : 'unverified';
      if (verified) updateFields.verificationDate = new Date();
    }
    if (employeeCount !== undefined) updateFields.employeeCount = employeeCount;
    if (foundedYear !== undefined) updateFields.foundedYear = foundedYear;
    if (logo !== undefined) updateFields.logo = logo;
    if (socialLinks !== undefined) updateFields.socialLinks = socialLinks;

    const company = await Company.findByIdAndUpdate(req.params.id, updateFields, { new: true, runValidators: true });
    if (!company) {
      return res.status(404).json({ success: false, message: 'Company not found' });
    }
    res.status(200).json({ success: true, data: company, message: 'Company updated successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

module.exports = {
  searchCompany,
  verifyCompany,
  verifyCompanyAdvanced,
  getCompanyById,
  addCompany,
  updateCompany,
};