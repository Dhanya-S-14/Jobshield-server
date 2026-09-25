/**
 * JobShield Detection Engine
 *
 * Evidence-based TRUST SCORING (0–100).
 *
 *   Trust Score  : how trustworthy the posting is (0 = trustworthy, evidence only)
 *   Risk Score   : 100 – Trust Score
 *
 * Classification thresholds:
 *   90–100  Highly Trusted
 *   75–89   Low Risk
 *   50–74   Moderate Risk
 *   25–49   High Risk
 *   0–24    Critical Risk
 *
 * Nine weighted, explainable factors. Each factor may add or subtract up to its
 * `weight` from the neutral midpoint (50). Missing information is treated as
 * NEUTRAL (no penalty, no credit) — we never penalize data the user did not give.
 *
 * CRITICAL PRINCIPLES
 *   - A real company name is NOT proof the job is real (REAL COMPANY != REAL JOB).
 *   - Gmail / free email is a warning, never an automatic scam verdict.
 *   - We never fake verification results or inflate scores for famous brands.
 *   - When verification is impossible we say "Official source could not be
 *     independently verified."
 */

const scamKeywords = require('../keywords/scamKeywords.json');
const {
  lookupCompany,
  allDomainsFor,
  levenshtein,
  normalizeName
} = require('../config/companies');
const Company = require('../models/Company');

/* -------------------------------------------------------------------------- */
/* Small utilities                                                            */
/* -------------------------------------------------------------------------- */

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

const toText = (v) => {
  if (v === undefined || v === null) return '';
  return typeof v === 'string' ? v : String(v);
};

const clean = (v) => toText(v).toLowerCase().replace(/\s+/g, ' ').trim();

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'aol.com',
  'mail.com', 'protonmail.com', 'proton.me', 'yandex.com', 'zoho.com',
  'rediffmail.com', 'gmx.com', 'icloud.com', 'msn.com', 'inbox.com', 'fastmail.com'
]);

const DISPOSABLE_DOMAINS = ['tempmail', 'temp-mail', 'guerrillamail', 'mailinator', 'throwaway', 'disposable', 'yopmail', '10minutemail', 'sharklasers', 'maildrop'];

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'club', 'online', 'site', 'work', 'click', 'link', 'download',
  'review', 'buzz', 'fun', 'icu', 'gq', 'ml', 'cf', 'tk', 'cam', 'stream',
  'trade', 'webcam', 'science', 'party', 'racing', 'date', 'faith', 'men',
  'loan', 'win', 'bid', 'accountant', 'country', 'mom', 'pro', 'live', 'info', 'cc'
]);

const SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'cutt.ly', 'rb.gy', 'is.gd',
  't.co', 'tiny.cc', 'bit.do', 'shorturl.at', 'buff.ly', 'rebrand.ly', 'lnkd.in'
]);

const FREE_HOSTING = ['blogspot', 'wordpress', 'wix', 'weebly', 'squarespace', 'shopify', 'blogger', 'godaddysites'];

const parseHostname = (url) => {
  if (!url || !url.trim()) return null;
  let u = url.trim();
  if (!/^https?:\/\//i.test(u)) {
    if (u.indexOf('://') !== -1) return null; // other protocol — reject
    u = 'https://' + u;
  }
  let hostname;
  try {
    hostname = new URL(u).hostname.toLowerCase().replace(/\.$/, '');
  } catch {
    return null;
  }
  if (!hostname) return null;
  const withoutWww = hostname.startsWith('www.') ? hostname.slice(4) : hostname;
  const labels = withoutWww.split('.');
  const tld = labels.length > 1 ? labels[labels.length - 1] : '';
  const base = labels.length > 1 ? labels[labels.length - 2] : labels[0];
  return { hostname: withoutWww, tld, base, originalUrl: u, isHttps: /^https:\/\//i.test(u) };
};

const hasSuspiciousTLD = (host) => {
  const tld = host.split('.').pop();
  return SUSPICIOUS_TLDS.has(tld);
};

const isShortener = (host) => SHORTENERS.has(host) || Array.from(SHORTENERS).some((s) => host.includes(s));

const isFreeHosting = (host) => FREE_HOSTING.some((f) => host.includes(f));

const isOfficialMatch = (hostname, company) => {
  if (!company) return false;
  if (!hostname) return false;
  return allDomainsFor(company).some((d) => hostname === d || hostname.endsWith('.' + d));
};

/**
 * Detect domain impersonation (typosquatting) of a known company domain.
 * true  = "tcscom.xyz", "tcs-jobs.top", "tcs.com-careers.xyz", "mytcsjobs.com"
 * false = official match or completely unrelated
 */
const detectTyposquat = (hostname, company) => {
  if (!company || !hostname) return null;
  if (isOfficialMatch(hostname, company)) return null;

  const domains = allDomainsFor(company);
  for (const d of domains) {
    const dBase = d.split('.')[0];
    const hBase = hostname.split('.')[0];
    const hHost = hostname;

    // "tcs.com-careers.xyz" : hostname starts with official domain + extra
    if (hHost.startsWith(d + '-') || hHost.startsWith(d + '.') || hHost.endsWith('-' + d)) {
      return d;
    }
    // "tcsjobs.top" / "mytcs.com" / "tcs-careers.xyz"
    const contains = hBase.includes(dBase) && hBase !== dBase;
    const similar = levenshtein(dBase, hBase) <= 2 && hBase !== dBase;
    const suspiciousTld = hasSuspiciousTLD(hHost);
    if ((contains || similar) || (suspiciousTld && (hHost.includes(dBase)))) {
      return d;
    }
  }
  return null;
};

const mapStatusToRiskScore = (status) => {
  switch (status) {
    case 'danger': return 85;
    case 'warning': return 50;
    case 'positive': return 8;
    default: return 15; // neutral
  }
};

/* -------------------------------------------------------------------------- */
/* Company verification (weight 25)                                           */
/* -------------------------------------------------------------------------- */

const analyzeCompanyVerification = (companyName, website, applyLink) => {
  const name = toText(companyName).trim();
  const urlHosts = [website, applyLink]
    .map(parseHostname)
    .filter(Boolean);

  const result = {
    key: 'companyVerification',
    label: 'Company Verification',
    weight: 25,
    earned: 0,
    status: 'neutral',
    summary: '',
    details: [],
    verification: {
      companyVerified: false,
      identityMatched: false,
      domainMatched: false,
      typosquatDetected: false,
      typosquatOf: null,
      officialDomain: '',
      providedHostname: urlHosts[0] ? urlHosts[0].hostname : '',
      claimedCompany: name,
      message: '',
      notes: []
    }
  };

  if (!name) {
    result.summary = 'No company name provided.';
    result.details.push('Not provided — treated as neutral, no penalty.');
    return result;
  }

  const company = lookupCompany(name);

  if (company) {
    result.verification.companyVerified = true;
    result.verification.identityMatched = true;
    result.verification.officialDomain = company.domain;
    result.verification.claimedCompany = company.name;
    result.earned = 12;
    result.status = 'positive';
    result.summary = `Company "${company.name}" is a recognized employer in JobShield's verified registry.`;
    result.details.push(`Company name "${name}" matches verified employer "${company.name}".`);

    if (urlHosts.length === 0) {
      result.verification.domainMatched = false;
      result.details.push('No website or apply link was provided, so the posting could not be linked to an official domain.');
      result.details.push('Official source could not be independently verified.');
      result.verification.notes.push('Official source could not be independently verified.');
      result.earned = 8;
      result.status = 'neutral';
      return result;
    }

    const official = urlHosts.find((h) => isOfficialMatch(h.hostname, company));
    if (official) {
      result.verification.domainMatched = true;
      result.earned = 25;
      result.status = 'positive';
      result.summary += ' The posting URL matches the official domain.';
      result.details.push(`URL hostname "${official.hostname}" matches official domain "${official.hostname}".`);
      return result;
    }

    const typo = urlHosts.map((h) => detectTyposquat(h.hostname, company)).find(Boolean);
    if (typo) {
      result.verification.typosquatDetected = true;
      result.verification.typosquatOf = typo;
      result.earned = -20;
      result.status = 'danger';
      result.summary = `A URL in this posting impersonates "${company.name}".`;
      result.details.push(`Typosquatting detected: the provided domain resembles the official domain "${typo}".`);
      result.details.push(`Official domain is "${company.domain}". Real job postings link to the official careers site.`);
      return result;
    }

    result.verification.domainMatched = false;
    result.earned = -7;
    result.status = 'warning';
    result.summary = 'Company name matches a real employer, but the posting URL does not use its official domain.';
    result.details.push('A real company name combined with an unrelated website is a classic impersonation pattern.');
    result.details.push(`Official domain is "${company.domain}".`);
    return result;
  }

  result.summary = `Company "${name}" was not found in JobShield's verified company registry.`;
  result.details.push('Not being in our registry does not prove it is a scam, but it cannot be independently verified.');
  result.details.push('Official source could not be independently verified.');
  result.verification.message = 'Not independently verifiable';
  result.verification.notes.push('Official source could not be independently verified.');

  if (urlHosts.some((h) => hasSuspiciousTLD(h.hostname))) {
    result.earned = -6;
    result.status = 'warning';
    result.details.push('The provided website uses a cheap, commonly-abused top-level domain.');
  }
  return result;
};

/* -------------------------------------------------------------------------- */
/* Job source / URL legitimacy (weight 20)                                    */
/* -------------------------------------------------------------------------- */

const analyzeJobSource = (website, applyLink, company) => {
  const urlHosts = [website, applyLink].map(parseHostname).filter(Boolean);
  const result = {
    key: 'jobSource',
    label: 'Job Source / URL',
    weight: 20,
    earned: 0,
    status: 'neutral',
    summary: '',
    details: []
  };

  if (urlHosts.length === 0) {
    result.summary = 'No website or apply link provided.';
    result.details.push('Not provided — treated as neutral, no penalty.');
    return result;
  }

  let worst = 0; // most negative earned
  let officialFound = false;

  for (const h of urlHosts) {
    if (isShortener(h.hostname)) {
      worst = Math.min(worst, -20);
      result.details.push(`URL "${h.hostname}" is a link shortener — scammers use these to hide the real destination.`);
    } else if (hasSuspiciousTLD(h.hostname)) {
      worst = Math.min(worst, -15);
      result.details.push(`URL "${h.hostname}" uses a suspicious top-level domain (".${h.tld}") commonly abused by scammers.`);
    } else if (isFreeHosting(h.hostname)) {
      worst = Math.min(worst, -8);
      result.details.push(`URL "${h.hostname}" is hosted on a free platform; legitimate employers use custom domains.`);
    } else if (isOfficialMatch(h.hostname, company)) {
      officialFound = true;
      result.details.push(`URL "${h.hostname}" is an official domain for the claimed company.`);
    } else if (!h.isHttps) {
      worst = Math.min(worst, -6);
      result.details.push(`URL "${h.hostname}" does not use HTTPS encryption.`);
    } else {
      result.details.push(`URL "${h.hostname}" is a normal custom domain (neutral signal by itself).`);
    }
    if (!h.isHttps && worst > -6 && !isShortener(h.hostname) && !hasSuspiciousTLD(h.hostname)) {
      worst = Math.min(worst, -6);
    }
  }

  if (officialFound) {
    result.earned = 20;
    result.status = 'positive';
    result.summary = 'The job links to an official company domain.';
  } else if (worst < 0) {
    result.earned = worst;
    result.status = worst <= -15 ? 'danger' : 'warning';
    result.summary = worst <= -15 ? 'The job source looks fraudulent.' : 'The job source raises concerns.';
  } else {
    result.earned = 0;
    result.status = 'neutral';
    result.summary = 'The provided URLs are not clearly fraudulent.';
  }
  return result;
};

/* -------------------------------------------------------------------------- */
/* Recruiter email (weight 10)                                                */
/* -------------------------------------------------------------------------- */

const analyzeEmail = (recruiterEmail, company) => {
  const email = clean(recruiterEmail);
  const result = {
    key: 'email',
    label: 'Recruiter Email',
    weight: 10,
    earned: 0,
    status: 'neutral',
    summary: '',
    details: []
  };

  if (!email) {
    result.summary = 'No recruiter email provided.';
    result.details.push('Not provided — treated as neutral, no penalty.');
    return result;
  }

  const parts = email.split('@');
  if (parts.length !== 2 || !parts[1].includes('.')) {
    result.earned = -6;
    result.status = 'warning';
    result.summary = 'The recruiter email address looks invalid.';
    result.details.push(`"${recruiterEmail}" is not a well-formed email address.`);
    return result;
  }

  const domain = parts[1].toLowerCase();

  if (isOfficialMatch(domain, company)) {
    result.earned = 10;
    result.status = 'positive';
    result.summary = `Recruiter email uses the company's official domain (@${domain}).`;
    result.details.push(`Email suffix "@${domain}" matches an official domain of the claimed company.`);
    return result;
  }

  if (DISPOSABLE_DOMAINS.some((d) => domain.includes(d))) {
    result.earned = -10;
    result.status = 'danger';
    result.summary = `Recruiter email uses a disposable/temporary mail provider (@${domain}).`;
    result.details.push('Disposable email addresses are common in scams because they are anonymous and short-lived.');
    return result;
  }

  if (FREE_EMAIL_DOMAINS.has(domain)) {
    result.earned = -7;
    result.status = 'warning';
    result.summary = `Recruiter uses a free personal email (@${domain}) instead of a corporate domain.`;
    result.details.push('A free email alone does not prove a scam, but legitimate employers normally recruit from official corporate addresses.');
    return result;
  }

  if (email.includes('+')) {
    result.earned = Math.min(result.earned, -2);
    result.details.push('Email uses "+" addressing, unusual for corporate recruiters.');
  }

  if (result.earned === 0) {
    result.earned = 3;
    result.status = 'positive';
    result.summary = `Recruiter email uses a non-free custom domain (@${domain}).`;
    result.details.push('A private/corporate-style email domain is a mild positive signal.');
  }
  return result;
};

/* -------------------------------------------------------------------------- */
/* Salary analysis (weight 10)                                                */
/* -------------------------------------------------------------------------- */

const analyzeSalary = (salary, company, jobDescription) => {
  const value = toText(salary).trim();
  const result = {
    key: 'salary',
    label: 'Salary Analysis',
    weight: 10,
    earned: 0,
    status: 'neutral',
    summary: '',
    details: []
  };

  if (!value) {
    result.summary = 'No salary information provided.';
    result.details.push('Not provided — treated as neutral, no penalty.');
    return result;
  }

  const lower = value.toLowerCase();
  const vagueBoilerplate = ['unlimited', 'no bar', 'no limit', 'no salary limit', 'best in industry', 'highest in market', 'not a constraint'];
  const vagueHit = vagueBoilerplate.find((w) => lower.includes(w));

  if (vagueHit) {
    result.earned = -6;
    result.status = 'warning';
    result.summary = `Salary is vague ("${vagueHit}") instead of a concrete range.`;
    result.details.push('Legitimate employers normally publish a clear salary range.');
    return result;
  }

  // Parse "X crore / X lakh" style values (Indian market)
  let annualEstimate = null;
  let how = '';
  const crore = lower.match(/(\d+(?:\.\d+)?)\s*(?:crore|crores|cr)\b/i);
  const lakh = lower.match(/(\d+(?:\.\d+)?)\s*(?:lakh|lac|lacs|lakhs|lpa)\b/i);
  const perMonth = /\bper\s*month\b|\/month\b|\bmonthly\b/i.test(lower);

  if (crore) {
    annualEstimate = parseFloat(crore[1]) * 1e7;
    how = 'crore';
  } else if (lakh) {
    const lakhValue = parseFloat(lakh[1]) * 1e5;
    annualEstimate = perMonth ? lakhValue * 12 : lakhValue;
    how = perMonth ? 'lakh per month' : 'lakh per annum';
  }

  const descLower = toText(jobDescription).toLowerCase();
  const easyWorkClaim = /no\s+experience|no\s+skills|no\s+qualification|fresher|data\s+entry|1\s*[- ]?hour|easy\s+work|anyone\s+can/i.test(descLower);

  if (annualEstimate !== null) {
    if (annualEstimate >= 2e7) {
      result.earned = -8;
      result.status = 'danger';
      result.summary = `Salary of ${value} (≈₹${annualEstimate.toLocaleString('en-IN')}/year) is extraordinarily high.`;
      result.details.push('Extreme salary promises with minimal effort are a hallmark of scam postings. Verify independently.');
    } else if (annualEstimate >= 5e6 && easyWorkClaim) {
      result.earned = -8;
      result.status = 'danger';
      result.summary = `Salary of ${value} is unrealistic for a role that requires no experience or minimal work.`;
      result.details.push('High pay for low-skill/fresher roles is a classic scam lure.');
    } else if (annualEstimate >= 5e6) {
      result.earned = -3;
      result.status = 'warning';
      result.summary = `Salary of ${value} is high but plausible only for senior/experienced roles.`;
      result.details.push('Confirm the role seniority matches the stated pay before proceeding.');
    } else {
      result.earned = 6;
      result.status = 'positive';
      result.summary = `Salary of ${value} (≈₹${annualEstimate.toLocaleString('en-IN')}/year) appears reasonable.`;
      result.details.push('A concrete, realistic salary range is a positive signal.');
    }
    return result;
  }

  const hasNumber = /\d/.test(value);
  if (hasNumber) {
    result.earned = 4;
    result.status = 'positive';
    result.summary = 'Salary includes a specific figure.';
    result.details.push('A specific number is provided, which is more trustworthy than vague wording.');
  } else {
    result.earned = 0;
    result.status = 'neutral';
    result.summary = 'Salary is described but without a clear figure.';
    result.details.push('No concrete range given — neutral, but verify the offer independently.');
  }
  return result;
};

/* -------------------------------------------------------------------------- */
/* Job description quality (weight 10)                                        */
/* -------------------------------------------------------------------------- */

const analyzeJobDescription = (jobDescription) => {
  const text = toText(jobDescription);
  const result = {
    key: 'jobDescription',
    label: 'Job Description',
    weight: 10,
    earned: 0,
    status: 'neutral',
    summary: '',
    details: []
  };

  if (!text.trim()) {
    result.summary = 'No job description provided.';
    result.details.push('Not provided — treated as neutral, no penalty.');
    return result;
  }

  const len = text.length;
  const professionalMarkers = ['responsibilities', 'qualifications', 'requirements', 'about the role', 'key skills', 'what we offer', 'role description', 'skills required'];
  const markers = professionalMarkers.filter((m) => text.toLowerCase().includes(m));

  if (len < 80) {
    result.earned = -5;
    result.status = 'warning';
    result.summary = `Job description is very short (${len} characters).`;
    result.details.push('Legitimate postings normally include responsibilities and requirements in detail.');
  } else {
    result.earned = markers.length >= 2 ? 6 : 3;
    result.status = 'positive';
    result.summary = markers.length >= 2
      ? `Job description is detailed and professionally structured (${len} characters).`
      : `Job description is reasonably detailed (${len} characters).`;
    result.details.push('A substantive posting with clear sections is a positive signal.');
  }

  const words = text.split(/\s+/);
  const capsWords = words.filter((w) => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  if (words.length > 0 && capsWords / words.length > 0.3) {
    result.earned = Math.max(result.earned - 3, -8);
    result.details.push('Heavy use of ALL CAPS (unprofessional and typical of spam postings).');
  }
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 4) {
    result.earned = Math.max(result.earned - 2, -8);
    result.details.push(`Excessive exclamation marks (${exclamations} found).`);
  }

  if (result.status === 'positive' && result.earned < 0) result.status = 'warning';
  return result;
};

/* -------------------------------------------------------------------------- */
/* Application safety (weight 10) — fees & sensitive credentials             */
/* -------------------------------------------------------------------------- */

const FEE_KEYWORDS = [
  'registration fee', 'processing fee', 'training fee', 'security deposit',
  'joining fee', 'application fee', 'advance payment', 'advance fee', 'refundable deposit',
  'activation fee', 'setup fee', 'membership fee', 'verification fee', 'booking fee',
  'certification fee', 'stamping fee', 'clearance fee', 'documentation fee',
  'background check fee', 'caution money', 'earnest money', 'pay to apply',
  'pay upfront', 'money upfront', 'payment required', 'deposit fee', 'cash bond',
  'pay to', 'payment before', 'pay before', 'call this number to register'
];

const CREDENTIAL_KEYWORDS = [
  'otp', 'upi pin', 'upi id', 'gpay', 'phonepe', 'paytm', 'bank pin', 'atm pin',
  'card number', 'cvv', 'netbanking', 'internet banking password', 'online banking detail',
  'gift card', 'google play card', 'itunes card', 'aadhaar', 'pan card', 'pan details',
  'passport copy', 'passport details', 'bank account number before joining',
  'bank details before', 'send your pan', 'send otp'
];

const EQUIPMENT_KEYWORDS = [
  'laptop fee', 'laptop deposit', 'uniform fee', 'equipment purchase', 'buy your own equipment',
  'hardware fee', 'software purchase', 'license fee'
];

const analyzeApplicationSafety = (jobDescription, applyLink) => {
  const text = clean(jobDescription);
  const result = {
    key: 'applicationSafety',
    label: 'Application Safety',
    weight: 10,
    earned: 0,
    status: 'neutral',
    summary: '',
    details: [],
    hardRisk: false
  };

  if (!text) {
    result.summary = 'No job description provided to check application safety.';
    result.details.push('Not provided — treated as neutral, no penalty.');
    return result;
  }

  const feeHits = FEE_KEYWORDS.filter((k) => text.includes(k));
  const credentialHits = CREDENTIAL_KEYWORDS.filter((k) => text.includes(k));
  const equipmentHits = EQUIPMENT_KEYWORDS.filter((k) => text.includes(k));

  if (feeHits.length > 0) {
    result.hardRisk = true;
    result.earned = -10;
    result.status = 'danger';
    result.summary = `The posting asks applicants for money ("${feeHits[0]}").`;
    result.details.push(`Detected fee/payment request: ${feeHits.join(', ')}.`);
    result.details.push('Legitimate employers NEVER ask candidates to pay for applications, registration, training, or jobs.');
    return result;
  }

  if (credentialHits.length > 0) {
    result.hardRisk = true;
    result.earned = -10;
    result.status = 'danger';
    result.summary = `The posting requests sensitive credentials ("${credentialHits[0]}").`;
    result.details.push(`Detected sensitive-data request: ${credentialHits.join(', ')}.`);
    result.details.push('Never share OTPs, UPI/bank PINs, passwords, or card details with any employer.');
    return result;
  }

  if (equipmentHits.length > 0) {
    result.hardRisk = true;
    result.earned = -10;
    result.status = 'danger';
    result.summary = `The posting asks candidates to buy equipment ("${equipmentHits[0]}").`;
    result.details.push('Scammers make victims pay for "mandatory" equipment before disappearing.');
    return result;
  }

  const sensitivePersonal = /passport|aadhaar|pan\b|bank details|bank account|id card copy/i.test(jobDescription || '');
  if (sensitivePersonal) {
    result.earned = -5;
    result.status = 'warning';
    result.summary = 'The posting requests sensitive personal/ID documents during application.';
    result.details.push('Only share identity documents during legitimate post-offer onboarding, never before an interview.');
    return result;
  }

  const applyHost = parseHostname(applyLink);
  if (applyHost && isShortener(applyHost.hostname)) {
    result.earned = -6;
    result.status = 'warning';
    result.summary = 'The apply button links to a URL shortener.';
    result.details.push('Scammers hide real destinations behind short links.');
    return result;
  }

  result.earned = 6;
  result.status = 'positive';
  result.summary = 'No payment or sensitive-data requests detected.';
  result.details.push('The posting does not ask for money, OTPs, or bank/card details — standard for legitimate employers.');
  return result;
};

/* -------------------------------------------------------------------------- */
/* Phone / contact (weight 5)                                                 */
/* -------------------------------------------------------------------------- */

const analyzePhone = (phoneNumber) => {
  const raw = toText(phoneNumber).trim();
  const result = {
    key: 'phone',
    label: 'Phone / Contact',
    weight: 5,
    earned: 0,
    status: 'neutral',
    summary: '',
    details: []
  };

  if (!raw) {
    result.summary = 'No phone number provided.';
    result.details.push('Not provided — treated as neutral, no penalty.');
    return result;
  }

  const digits = raw.replace(/[^\d]/g, '');
  if (digits.length < 7 || digits.length > 15) {
    result.earned = -5;
    result.status = 'danger';
    result.summary = 'The phone number looks invalid.';
    result.details.push(`"${raw}" does not look like a valid international phone number.`);
    return result;
  }

  const repeated = /(\d)\1{5,}/.test(digits) || /123456|654321|111111|222222|333333|444444|555555|666666|777777|888888|999999/.test(digits);
  if (repeated) {
    result.earned = -5;
    result.status = 'danger';
    result.summary = 'The phone number uses a repeated/fake pattern.';
    result.details.push(`"${raw}" looks like a placeholder or fabricated number.`);
    return result;
  }

  const nonDigitChars = raw.replace(/[\d\s+\-()]/g, '');
  if (nonDigitChars.length > 0) {
    result.earned = -2;
    result.status = 'warning';
    result.details.push('The phone number contains unusual characters.');
    return result;
  }

  result.earned = 3;
  result.status = 'positive';
  result.summary = 'A valid-looking contact number is provided.';
  result.details.push('A real contact number is a mild positive signal.');
  return result;
};

/* -------------------------------------------------------------------------- */
/* Scam language (weight 5)                                                   */
/* -------------------------------------------------------------------------- */

const analyzeScamLanguage = (jobTitle, jobDescription, salary) => {
  const text = clean([jobTitle, jobDescription, salary].join(' '));
  const result = {
    key: 'scamLanguage',
    label: 'Scam Language',
    weight: 5,
    earned: 0,
    status: 'neutral',
    summary: '',
    details: [],
    keywordsFound: []
  };

  if (!text) {
    result.summary = 'No text to analyze.';
    return result;
  }

  const found = [];
  for (const entry of scamKeywords) {
    if (entry.isActive !== undefined && !entry.isActive) continue;
    const pattern = entry.keyword.toLowerCase();
    if (/[\s-]/.test(pattern)) {
      if (text.includes(pattern)) found.push(entry);
    } else {
      const re = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (re.test(text)) found.push(entry);
    }
  }

  result.keywordsFound = found;
  if (found.length === 0) {
    result.summary = 'No scam-related language detected.';
    result.details.push('No scam keywords found in the posting.');
    return result;
  }

  const dangerous = found.filter((k) => k.category === 'money' || k.category === 'investment');
  const strong = found.filter((k) => (k.points || 0) >= 25 && !dangerous.includes(k));
  const medium = found.filter((k) => (k.points || 0) >= 12 && !dangerous.includes(k) && !strong.includes(k));

  const names = (arr) => arr.slice(0, 6).map((k) => k.keyword).join(', ');
  if (dangerous.length > 0) {
    result.earned = -5;
    result.status = 'danger';
    result.summary = 'Money/investment scam language detected.';
    result.details.push(`Found: ${names(dangerous)}.`);
    result.details.push(dangerous.some((k) => k.category === 'money')
      ? 'Asking candidates for fees/deposits is the strongest scam signal.'
      : 'Investment/pyramid language indicates a potential MLM or Ponzi scheme.');
  } else if (strong.length > 0) {
    result.earned = -4;
    result.status = 'warning';
    result.summary = 'High-confidence scam phrases detected.';
    result.details.push(`Found: ${names(strong)}.`);
  } else if (medium.length >= 2) {
    result.earned = -3;
    result.status = 'warning';
    result.summary = 'Several scam-pattern phrases detected.';
    result.details.push(`Found: ${names(medium)}.`);
  } else if (found.length >= 3) {
    result.earned = -2;
    result.status = 'warning';
    result.summary = 'Minor scam-pattern phrases detected.';
    result.details.push(`Found: ${names(found)}.`);
  }
  return result;
};

/* -------------------------------------------------------------------------- */
/* Urgency pressure (weight 5)                                                */
/* -------------------------------------------------------------------------- */

const URGENCY_PATTERNS = [
  /\bact\s*now\b/gi, /\bhurr+y\b/gi, /\bimmediate\s+(start|joining|hire)/gi,
  /\burgen?t(ly)?\b/gi, /\blimited\s+(positions?|seats?|slots?|time|offer)/gi,
  /\blast\s+chance\b/gi, /\bdon'?t\s+(miss|delay|wait)\b/gi, /\bapply\s+(today|now|immediately)/gi,
  /\bfew\s+(days?|hours?|seats?|slots?)\s+(left|remain)/gi, /\bonly\s+\d+\s+(days?|hours?|seats?)/gi,
  /\bfirst\s+(come|serve|basis)/gi, /\bopportunity\s+of\s+a\s+lifetime\b/gi,
  /\bonce\s+in\s+a\s+lifetime\b/gi, /\bquick\s+hire\b/gi, /\binstant\s+(selection|joining|approval)/gi
];

const analyzeUrgency = (jobDescription) => {
  const text = toText(jobDescription);
  const result = {
    key: 'urgency',
    label: 'Urgency / Pressure',
    weight: 5,
    earned: 0,
    status: 'neutral',
    summary: '',
    details: []
  };
  if (!text.trim()) {
    result.summary = 'No text to analyze.';
    return result;
  }
  const hits = [];
  for (const p of URGENCY_PATTERNS) {
    const m = text.match(p);
    if (m) hits.push(...m);
  }
  if (hits.length === 0) {
    result.earned = 2;
    result.status = 'positive';
    result.summary = 'No urgency pressure tactics detected.';
    result.details.push('The posting does not pressure applicants to act immediately.');
  } else if (hits.length >= 6) {
    result.earned = -5;
    result.status = 'danger';
    result.summary = 'Intense urgency pressure detected.';
    result.details.push(`Found ${hits.length} urgency cues (${hits.slice(0, 5).join(', ')}).`);
  } else if (hits.length >= 3) {
    result.earned = -4;
    result.status = 'warning';
    result.summary = 'High urgency pressure detected.';
    result.details.push(`Found ${hits.length} urgency cues (${hits.slice(0, 5).join(', ')}).`);
  } else {
    result.earned = -2;
    result.status = 'warning';
    result.summary = 'Some urgency language detected.';
    result.details.push(`Found: ${hits.join(', ')}.`);
  }
  return result;
};

/* -------------------------------------------------------------------------- */
/* Optional DB cross-check (non-blocking, deterministic when DB is down)      */
/* -------------------------------------------------------------------------- */

async function dbCompanyNote(company, verification) {
  try {
    const mongoose = require('mongoose');
    if (!mongoose || mongoose.connection.readyState !== 1) return;
    const doc = await Company.findOne({
      name: { $regex: new RegExp(company.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').split(' ')[0], 'i') }
    });
    if (doc && doc.verified) {
      verification.notes.push(`Cross-checked "${company.name}" against the JobShield company database (${doc.domain || doc.website || 'verified'}).`);
    }
  } catch {
    // DB offline — cross-check is optional, do not fail the scan
  }
}

/* -------------------------------------------------------------------------- */
/* Risk level & explanation                                                   */
/* -------------------------------------------------------------------------- */

const getRiskLevel = (trustScore) => {
  const t = clamp(trustScore, 0, 100);
  if (t >= 90) return 'Highly Trusted';
  if (t >= 75) return 'Low Risk';
  if (t >= 50) return 'Moderate Risk';
  if (t >= 25) return 'High Risk';
  return 'Critical Risk';
};

const getVerdict = (trustScore) => getRiskLevel(trustScore);

const generateExplanation = (data) => {
  const { verification, breakdown, hardRisk, companyName, riskLevel, trustScore } = data;
  const parts = [];

  const v = verification;
  if (v.identityMatched && v.domainMatched) {
    parts.push(`Company identity verified: "${v.claimedCompany}" is a recognized employer and the posting links to its official domain (${v.providedHostname || 'official'}).`);
  } else if (v.identityMatched && v.typosquatDetected) {
    parts.push(`WARNING — the company name "${v.claimedCompany}" is real, but a provided URL appears to impersonate the official domain "${v.typosquatOf}". This is a typosquatting pattern.`);
  } else if (v.identityMatched) {
    parts.push(`The company name "${v.claimedCompany}" matches a recognized employer, but the posting could not be linked to an official domain.`);
  } else {
    parts.push(`Company "${companyName || 'provided'}" was not found in JobShield's verified company registry.`);
  }
  if (v.notes.length && !v.domainMatched) {
    parts.push('Official source could not be independently verified.');
  }

  const danger = breakdown.filter((b) => b.status === 'danger');
  const warning = breakdown.filter((b) => b.status === 'warning');
  const positive = breakdown.filter((b) => b.status === 'positive');

  if (danger.length > 0) {
    parts.push('Strong risk indicators: ' + danger.map((b) => b.summary).join(' '));
  }
  if (warning.length > 0) {
    parts.push('Caution indicators: ' + warning.map((b) => b.summary).join(' '));
  }
  if (positive.length > 0) {
    parts.push('Positive signals (evidence-based only): ' + positive.map((b) => b.label).join(', ') + '.');
  }

  if (hardRisk) {
    parts.push('This posting asks for money or sensitive credentials — legitimate employers never do this. We strongly advise against proceeding.');
  } else if (riskLevel === 'Highly Trusted' || riskLevel === 'Low Risk') {
    parts.push('You may proceed with reasonable confidence, though normal caution is always advised.');
  } else if (riskLevel === 'Moderate Risk') {
    parts.push('Proceed with caution: verify the company on its official website before sharing any details, and never pay any employer.');
  } else if (riskLevel === 'High Risk') {
    parts.push('High caution advised: independently verify this employer, do not share sensitive data, and do not pay anything.');
  } else {
    parts.push('This posting shows critical fraud indicators. Do not proceed and consider reporting it.');
  }

  return parts.join(' ');
};

/* -------------------------------------------------------------------------- */
/* Main entry                                                                 */
/* -------------------------------------------------------------------------- */

const calculateRiskScore = (allResults) => {
  const total = allResults.reduce((sum, r) => sum + (r.earned || 0), 0);
  return 100 - clamp(50 + total, 0, 100);
};

const buildBreakdown = (factors) => factors.map((f) => ({
  key: f.key,
  label: f.label,
  weight: f.weight,
  earned: f.earned,
  status: f.status,
  summary: f.summary,
  details: f.details,
  riskScore: mapStatusToRiskScore(f.status)
}));

const analyzeJobPosting = async (data = {}) => {
  const {
    jobTitle = '',
    companyName = '',
    jobDescription = '',
    salary = '',
    recruiterEmail = '',
    phoneNumber = '',
    website = '',
    applyLink = ''
  } = data;

  const company = lookupCompany(companyName);

  const companyResult = analyzeCompanyVerification(companyName, website, applyLink);
  await dbCompanyNote(company, companyResult.verification);

  const sourceResult = analyzeJobSource(website, applyLink, company);
  const emailResult = analyzeEmail(recruiterEmail, company);
  const salaryResult = analyzeSalary(salary, company, jobDescription);
  const descResult = analyzeJobDescription(jobDescription);
  const safetyResult = analyzeApplicationSafety(jobDescription, applyLink);
  const phoneResult = analyzePhone(phoneNumber);
  const langResult = analyzeScamLanguage(jobTitle, jobDescription, salary);
  const urgencyResult = analyzeUrgency(jobDescription);

  const factors = [
    companyResult,
    sourceResult,
    emailResult,
    salaryResult,
    descResult,
    safetyResult,
    phoneResult,
    langResult,
    urgencyResult
  ];

  const hardRisk = factors.some((f) => f.hardRisk === true);

  let trustScore = Math.round(clamp(50 + factors.reduce((s, f) => s + f.earned, 0), 0, 100));
  if (hardRisk) trustScore = Math.min(trustScore, 20);

  const riskScore = 100 - trustScore;
  const riskLevel = getRiskLevel(trustScore);

  const verification = companyResult.verification;

  const evidence = [];
  const warnings = [];

  for (const f of factors) {
    for (const msg of f.details || []) {
      evidence.push({ factor: f.label, type: f.status, message: msg });
    }
    if (f.status === 'danger' || f.status === 'warning') {
      warnings.push(`${f.label}: ${f.summary}`);
    }
  }

  const keywordsFound = langResult.keywordsFound.map((k) => ({
    keyword: k.keyword,
    category: k.category,
    severity: k.severity,
    points: k.points
  }));

  const breakdown = buildBreakdown(factors);

  const aiExplanation = generateExplanation({
    verification,
    breakdown,
    hardRisk,
    companyName: toText(companyName),
    riskLevel,
    trustScore
  });

  const details = {};
  for (const f of factors) {
    details[f.key] = {
      score: mapStatusToRiskScore(f.status),
      status: f.status,
      summary: f.summary,
      details: f.details
    };
  }

  return {
    trustScore,
    riskScore,
    riskLevel,
    verdict: getVerdict(trustScore),
    aiExplanation,
    verification,
    evidence,
    warnings,
    breakdown,
    keywordsFound,
    hardRisk,
    details
  };
};

/* -------------------------------------------------------------------------- */

module.exports = {
  analyzeJobPosting,
  getRiskLevel,
  calculateRiskScore,
  generateExplanation,
  // keep legacy analyzer exports available
  analyzeKeywords: (title, desc, skills) => analyzeScamLanguage(title, desc, ''),
  analyzeSalary,
  analyzeEmail,
  analyzeURL: (website, applyLink) => analyzeJobSource(website, applyLink, null),
  analyzePhone,
  analyzeUrgency,
  lookupCompany,
  parseHostname,
  detectTyposquat,
  isOfficialMatch,
  hasSuspiciousTLD,
  isShortener,
  mapStatusToRiskScore
};