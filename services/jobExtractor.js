/**
 * JobShield text extractor for uploaded images (OCR text) and typed messages.
 *
 * Fills gaps in structured job fields so company verification and detection
 * can run on real values instead of "company not provided". It NEVER invents
 * data — only what can be matched from the text or the trusted registry.
 */

const registry = require('../config/companies');

const TITLE_KEYWORDS = [
  'software engineer', 'developer', 'engineer', 'manager', 'analyst',
  'associate', 'consultant', 'specialist', 'coordinator', 'executive',
  'assistant', 'representative', 'officer', 'technician', 'supervisor',
  'director', 'lead', 'architect', 'designer', 'trainee', 'intern', 'fresher',
  'hr ', 'accountant', 'clerk', 'operator', 'agent', 'advisor', 'trainer',
  'instructor', 'professor', 'scientist', 'researcher', 'auditor', 'cashier',
  'chef', 'copywriter', 'data entry', 'driver', 'editor', 'nurse', 'teacher',
  'telecaller', 'data analyst', 'recruiter', 'customer support',
  'sales executive', 'business development', 'marketing', 'content writer'
];

const SALARY_PATTERNS = [
  /(\d[\d,\.]*)\s*[-\u2013]\s*(\d[\d,\.]*)\s*lpa\b/gi,
  /(\d[\d,\.]*)\s*lpa\b/gi,
  /(\d[\d,\.]*)\s*[-\u2013]\s*(\d[\d,\.]*)\s*lakh\b/gi,
  /(\d[\d,\.]*)\s*lakh\b/gi,
  /(\d[\d,\.]*)\s*[-\u2013]\s*(\d[\d,\.]*)\s*(?:k|k\s*per\s*month)\b/gi,
  /(\d[\d,\.]*)\s*(?:k|k\s*per\s*month)\b/gi,
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const IN_PHONE = /(?:\+?91[-.\s]?)?[6-9]\d{4}[-.\s]?\d{5}/;
const US_PHONE = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/;
const URL_REGEX = /https?:\/\/[^\s,)\]]+/gi;

const COMPANY_SUFFIXES = [
  'pvt ltd', 'private limited', 'ltd', 'limited', 'inc', 'corp', 'corporation',
  'llc', 'technologies', 'solutions', 'services', 'group', 'industries',
  'enterprises', 'consulting', 'software', 'systems', 'digital', 'tech',
  'global', 'international', 'ventures', 'associates', 'labs', 'labs pvt',
  'solutions pvt'
];

const SKIP_LINE_WORDS = [
  'job', 'description', 'responsibilities', 'qualifications', 'requirements',
  'about', 'role', 'position', 'hiring', 'urgent', 'opening', 'vacancy',
  'apply', 'share', 'refer', 'contact', 'call', 'email us', 'location',
  'salary', 'experience', 'skills', 'key skills', 'benefits', 'company profile'
];

const PLATFORM_NAMES = [
  'linkedin', 'naukri', 'indeed', 'glassdoor', 'internshala', 'shine',
  'timesjobs', 'monster', 'apna', 'facebook', 'instagram', 'twitter'
];

/* -------------------------------------------------------------------------- */

const lines = (text) =>
  String(text || '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

const uniq = (a) => Array.from(new Set(a));

const firstHost = (url) => {
  try {
    const u = /^https?:\/\//i.test(url) ? url : 'https://' + url;
    return new URL(u).hostname.toLowerCase().replace(/^www\./, '');
  } catch {
    return null;
  }
};

const cleanName = (name) => {
  if (!name) return '';
  return name
    .replace(/^(at|with|for|company|company name)([:\s]*)/i, '')
    .replace(/[|*\u2013\u2014:]+.*$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .replace(/[.\s]+$/, '');
};

const isPlatformLine = (line) => {
  const lower = line.toLowerCase();
  return PLATFORM_NAMES.some((p) => lower.includes(p)) && lower.length < 40;
};

function findCompanyViaEmailDomains(text) {
  const emails = text.match(EMAIL_REGEX) || [];
  for (const email of emails) {
    const domain = email.split('@')[1] || '';
    const host = firstHost(domain);
    if (!host) continue;
    const hit = registry.companies.find((c) =>
      registry.allDomainsFor(c).some((d) => host === d || host.endsWith('.' + d))
    );
    if (hit) return hit.name;
  }
  return null;
}

function findCompanyViaUrls(text) {
  const urls = text.match(URL_REGEX) || [];
  for (const url of urls) {
    const host = firstHost(url);
    if (!host) continue;
    const hit = registry.companies.find((c) =>
      registry.allDomainsFor(c).some((d) => host === d || host.endsWith('.' + d))
    );
    if (hit) return hit.name;
  }
  return null;
}

function findCompanyBestLine(text) {
  const ls = lines(text);
  // suffix-based lines first
  for (const line of ls.slice(0, 20)) {
    const lower = line.toLowerCase();
    if (isPlatformLine(line)) continue;
    if (SKIP_LINE_WORDS.some((w) => lower.startsWith(w))) continue;
    if (/^([a-z]\.?\s*){2,}$/i.test(lower)) continue; // "M S" author-like
    if (COMPANY_SUFFIXES.some((s) => lower.includes(s))) {
      return cleanName(line);
    }
  }
  // short heading lines
  for (const line of ls.slice(0, 12)) {
    const lower = line.toLowerCase();
    if (isPlatformLine(line)) continue;
    if (SKIP_LINE_WORDS.some((w) => lower.startsWith(w) || lower.includes(w + ':'))) continue;
    if (TITLE_KEYWORDS.some((k) => lower.includes(k))) continue;
    if (/https?:\/\//i.test(line) || line.includes('@')) continue;
    if (line.length < 2 || line.length > 50) continue;
    if (/^\d+(\.|\)|\s|$)/.test(line)) continue;
    const cand = cleanName(line);
    if (cand.length >= 3) return cand;
  }
  return '';
}

function extractEmail(text) {
  const matches = text.match(EMAIL_REGEX) || [];
  const real = matches.find((e) => !isPlaceholderEmail(e));
  return real || matches[0] || '';
}

function isPlaceholderEmail(email) {
  const domain = (email.split('@')[1] || '').toLowerCase();
  return (
    domain.includes('example') ||
    domain.includes('domain.com') ||
    domain === 'email.com' ||
    domain.startsWith('your') ||
    domain.startsWith('name@')
  );
}

/* -------------------------------------------------------------------------- */

function parseJobText(text) {
  const out = {
    jobDescription: text || '',
    jobTitle: '',
    companyName: '',
    salary: '',
    location: '',
    jobType: '',
    experienceLevel: '',
    recruiterEmail: '',
    phoneNumber: '',
    website: '',
    applyLink: '',
    detectedCompany: null,
  };

  if (!text || !text.trim()) return out;

  const urlList = uniq(text.match(URL_REGEX) || []);
  const emailList = uniq(text.match(EMAIL_REGEX) || []);
  const phone = (text.match(IN_PHONE) || text.match(US_PHONE) || [])[0];

  // Email
  out.recruiterEmail = extractEmail(text);

  // Website: prefer a company-ish URL, exclude job platforms and social
  const website = urlList.find(
    (u) => {
      const host = firstHost(u) || '';
      return (
        !host.includes('linkedin.com') && !host.includes('facebook.com') &&
        !host.includes('instagram.com') && !host.includes('twitter.com') &&
        !host.includes('whatsapp') && !host.includes('telegram') &&
        !host.includes('naukri.com') && !host.includes('indeed.com') && !host.includes('glassdoor.com')
      );
    }
  );
  out.website = website || '';

  // Apply link: platform or careers-ish URL
  const applyCandidate = urlList.find((u) => {
    const host = firstHost(u) || '';
    return host.includes('linkedin.com') || host.includes('naukri.com') || host.includes('indeed.com') ||
      host.includes('glassdoor.com') || host.includes('internshala.com') || /career/i.test(u) || /apply/i.test(u);
  });
  out.applyLink = applyCandidate && applyCandidate !== out.website ? applyCandidate : '';

  // Salary
  for (const pattern of SALARY_PATTERNS) {
    const m = pattern.exec(text);
    if (m) {
      const a = (m[1] || '').replace(/,/g, '');
      const b = (m[2] || '').replace(/,/g, '');
      if (/lpa/i.test(m[0])) {
        out.salary = b ? `₹${a} - ₹${b} LPA` : `₹${a} LPA`;
      } else if (/lakh/i.test(m[0])) {
        out.salary = b ? `${a} - ${b} Lakh` : `${a} Lakh`;
      } else {
        out.salary = b ? `₹${a}k - ₹${b}k` : `₹${a}k`;
      }
      break;
    }
  }
  if (!out.salary) {
    for (const line of lines(text)) {
      const lower = line.toLowerCase();
      if (/(salary|stipend|compensation|pay|ctc|lpa|lakh|per month)/.test(lower) && /\d/.test(line)) {
        out.salary = line.replace(/[^0-9,.\u20B9\u2013\/a-zA-Z\s]/g, '').trim().slice(0, 80);
        if (out.salary) break;
      }
    }
  }

  // Location
  const locPattern = /(?:location|based in|located at|place of work|job location|work location)[:\s]+([^\n|]+)/i;
  const loc = text.match(locPattern);
  if (loc) out.location = loc[1].trim();
  if (!out.location) {
    const city = /(?:bangalore|bengaluru|mumbai|delhi|pune|hyderabad|chennai|kolkata|ahmedabad|gurgaon|gurugram|noida|jaipur|lucknow|chandigarh|indore|bhopal|kochi|coimbatore|nagpur|remote|work from home|wfh)/i.exec(text);
    if (city) out.location = city[0].toLowerCase().replace(/(^|\s)\w/g, (s) => s.toUpperCase());
  }

  // Job type
  const lowerText = text.toLowerCase();
  out.jobType =
    /part[- ]?time/i.test(lowerText) ? 'Part-time' :
    /internship|intern\b/i.test(lowerText) ? 'Internship' :
    /freelance/i.test(lowerText) ? 'Freelance' :
    /contract|temporary/i.test(lowerText) ? 'Contract' :
    /remote|work from home|wfh/i.test(lowerText) ? 'Remote' :
    '';

  // Experience
  out.experienceLevel =
    /senior|lead|head|principal/i.test(lowerText) ? 'Senior' :
    /junior|fresher|entry|no experience|0-1|0 - 1/i.test(lowerText) ? 'Entry' :
    /\d+\s*[-\u2013to]+\s*\d+\s*(years?|yrs?)/i.test(lowerText) ? 'Mid' : '';

  // Job title
  for (const line of lines(text).slice(0, 20)) {
    const lower = line.toLowerCase();
    const hit = TITLE_KEYWORDS.find((k) => lower.includes(k));
    if (hit) {
      const words = line.split(/[|*\u2013\u2014:\t]/)[0].trim();
      out.jobTitle = words.slice(0, 60);
      break;
    }
  }

  // Company name — trust the trusted-database match above all.
  const viaEmail = findCompanyViaEmailDomains(text);
  const viaUrl = findCompanyViaUrls(text);
  const viaLine = findCompanyBestLine(text);

  for (const cand of [viaEmail, viaUrl, viaLine].filter(Boolean)) {
    const resolved = registry.lookupCompany(cand);
    if (resolved && resolved.verified) {
      out.companyName = resolved.officialName || resolved.name;
      out.detectedCompany = cand;
      break;
    }
  }
  if (!out.companyName) {
    const best = viaLine || viaEmail || viaUrl;
    if (best) {
      out.companyName = cleanName(best);
      out.detectedCompany = best;
    }
  }

  if (phone) out.phoneNumber = phone;

  return out;
}

module.exports = { parseJobText, findCompanyViaEmailDomains, findCompanyViaUrls, PLATFORM_NAMES };