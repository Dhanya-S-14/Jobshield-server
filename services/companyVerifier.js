/**
 * JobShield Company Verification Service
 *
 * Built on top of the trusted-company registry (config/companies.js) and the
 * MongoDB Company collection (for admin-added / DB-only companies).
 *
 * POLICY
 *  - A real company name only confirms COMPANY IDENTITY (REAL COMPANY != REAL JOB).
 *  - Unknown companies are "Unknown" — never automatically flagged as scam.
 *  - Free email (gmail etc.) is a warning, never an automatic scam verdict.
 *  - Weak fuzzy name matches are NOT treated as verified identity.
 *  - verificationLevel / trustScore are computed HERE (server), never on the client.
 *
 * Transparent trust breakdown (weights sum to 100):
 *   companyIdentity      20   company is in the trusted registry
 *   jobPosting           20   posting quality + scam-language check
 *   domainVerification   20   official domain / careers subdomain / impersonation
 *   emailVerification    15   recruiter email domain is official / free / disposable
 *   recruiterVerification 10   recruiter email is verifiable against company
 *   websiteContent       10   HTTPS, custom domain, free-host detection
 *   scamPatterns          5   small cross-signals (shorteners, premium phone, WhatsApp)
 * Missing data is NEUTRAL (excluded from the denominator) — never penalized.
 */

const registry = require('../config/companies');
const Company = require('../models/Company');
const scamKeywords = require('../keywords/scamKeywords.json');

const FREE_EMAIL_DOMAINS = new Set([
  'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'live.com', 'aol.com',
  'mail.com', 'protonmail.com', 'proton.me', 'yandex.com', 'zoho.com',
  'rediffmail.com', 'gmx.com', 'icloud.com', 'msn.com', 'inbox.com',
  'fastmail.com', 'qq.com', '163.com'
]);

const DISPOSABLE_MARKERS = ['tempmail', 'temp-mail', 'guerrillamail', 'mailinator', 'throwaway', 'disposable', 'yopmail', '10minutemail', 'sharklasers', 'maildrop', 'trashmail'];

const LINK_SHORTENERS = ['bit.ly', 'tinyurl.com', 'goo.gl', 'ow.ly', 'rb.gy', 'cutt.ly', 'is.gd', 't.co', 'shorturl.at', 'tiny.cc', 'bit.do'];

const FREE_HOSTS = ['blogspot', 'wordpress', 'wix', 'weebly', 'squarespace', 'shopify', 'godaddysites'];

const WEIGHTS = {
  companyIdentity: 20,
  jobPosting: 20,
  domainVerification: 20,
  emailVerification: 15,
  recruiterVerification: 10,
  websiteContent: 10,
  scamPatterns: 5,
};

// Flat list of scam-language phrases/paths used by the quick text scan.
const SCAM_PHRASES = [
  'registration fee', 'register fee', 'joining fee', 'processing fee', 'security deposit',
  'training fee', 'certification fee', 'visa processing fee', 'administrative fee',
  'deposit amount', 'refundable deposit', 'advance payment', 'send money', 'pay for',
  'investment', 'invest now', 'guaranteed returns', 'earn from home', 'work from home',
  'instant income', 'weekly income', 'part time easy', 'money in advance', 'paytm transfer',
  'upi transfer', 'bank account details', 'atm pin', 'otp', 'credit card details',
  'limited seats', 'last chance', 'urgent joining', 'today only', 'immediate joining',
  'whatsapp number', 'telegram group', 'personal whatsapp', 'contact me personally'
];

const extractHostname = (value) => {
  if (!value || typeof value !== 'string') return null;
  let u = value.trim();
  if (!u) return null;
  if (!/^https?:\/\//i.test(u)) {
    if (u.indexOf('://') !== -1) return null;
    u = 'https://' + u;
  }
  try {
    const hostname = new URL(u).hostname.toLowerCase().replace(/^www\./, '').replace(/\.$/, '');
    return hostname || null;
  } catch {
    return null;
  }
};

const parseEmailDomain = (email) => {
  if (!email || typeof email !== 'string') return null;
  const m = String(email).trim().match(/@([^\s@]+)$/i);
  return m ? m[1].toLowerCase() : null;
};

const isFreeEmailDomain = (domain) => !!domain && FREE_EMAIL_DOMAINS.has(domain);
const isDisposableEmail = (domain) => {
  if (!domain) return false;
  return DISPOSABLE_MARKERS.some((m) => domain.includes(m));
};

const neutral = (key, label, max) => ({
  key, label, earned: 0, max, status: 'neutral',
  detail: 'Not enough data — treated as neutral, no penalty or credit',
});

const online = (key, label, max, earned, detail, status = 'good') => ({
  key, label, earned, max, status, detail,
});

/**
 * Check the posting text for scam language. Returns matched phrases.
 */
const findScamPhrases = (text) => {
  if (!text) return [];
  const hay = String(text).toLowerCase();
  return SCAM_PHRASES.filter((p) => hay.includes(p));
};

const findRecruiterEmail = (recruiterEmail) => {
  if (!recruiterEmail) return null;
  // allow comma-separated list; pick first corporate-looking one
  const parts = String(recruiterEmail).split(/[\s,;]+/).filter(Boolean);
  return parts[0];
};

const fetchJson = async (url, timeoutMs = 8000) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'User-Agent': 'JobShield/1.0 (company verifier)' },
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  } finally {
    clearTimeout(timer);
  }
};

/**
 * Best-effort basic company info from public sources (Wikipedia REST, then
 * DuckDuckGo instant answers). Never blocks or fails the verification — on any
 * error this returns null and the response simply has no webInfo.
 */
const fetchWebInfo = async (companyName) => {
  if (!companyName) return null;
  const q = String(companyName).trim();
  if (!q) return null;

  try {
    const os = await fetchJson(
      `https://en.wikipedia.org/w/api.php?action=opensearch&format=json&limit=1&namespace=0&origin=*&search=${encodeURIComponent(q)}`
    );
    const title = os && Array.isArray(os[1]) && os[1][0] ? String(os[1][0]) : null;
    if (title) {
      const summary = await fetchJson(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title.replace(/ /g, '_'))}`
      );
      if (summary && summary.extract) {
        return {
          name: summary.title || title,
          description: String(summary.extract),
          source: 'Wikipedia',
          url: summary.content_urls && summary.content_urls.desktop
            ? summary.content_urls.desktop.page
            : `https://en.wikipedia.org/wiki/${encodeURIComponent((summary.title || title).replace(/ /g, '_'))}`,
          thumbnail: summary.thumbnail && summary.thumbnail.source ? summary.thumbnail.source : null,
        };
      }
    }
  } catch (e) { /* fall through */ }

  try {
    const ddg = await fetchJson(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(q)}&format=json&no_html=1&skip_disambig=1`
    );
    if (ddg && ddg.AbstractText) {
      return {
        name: q,
        description: String(ddg.AbstractText),
        source: 'DuckDuckGo',
        url: ddg.AbstractURL || `https://duckduckgo.com/?q=${encodeURIComponent(q)}`,
        thumbnail: null,
      };
    }
  } catch (e) { /* fall through */ }

  return null;
};

/**
 * Main entry point. Returns full company verification object.
 * options.webInfo = false disables the web lookup (used by offline tests).
 */
async function getCompanyVerification(input, options = {}) {
  const opts = input || {};
  const companyName = String(opts.companyName || '').trim();
  const recruiterEmailRaw = String(opts.recruiterEmail || '').trim();
  const recruiterEmail = findRecruiterEmail(recruiterEmailRaw);
  const text = String(
    [opts.jobTitle, opts.jobDescription, opts.jobPostingDesc || '', opts.jobDescriptionText || '']
      .filter(Boolean)
      .join(' ')
  ).trim();

  const urls = [opts.website, opts.applyLink, opts.applyUrl || opts.applicationLink].filter(Boolean);
  const hosts = urls.map(extractHostname).filter(Boolean);

  /* ---------------- 0. Build context ---------------- */
  const breakdown = [];
  const warnings = [];
  const impersonation = { detected: false, nearTo: null, reason: null };

  /* ---------------- 1. Company identity (20) ---------------- */
  const identity = {
    key: 'companyIdentity',
    label: 'Company Identity',
    max: WEIGHTS.companyIdentity,
    status: 'unknown',
  };

  let resolvedCompany = null;   // registry entry (trusted)
  let dbCompany = null;         // MongoDB entry
  let matchType = 'none';       // exact | alias | fuzzy | db | none

  if (companyName) {
    const res = registry.lookupCompany(companyName, { minScore: 0.85 });
    if (res) {
      resolvedCompany = res;
      matchType = res.matchType || 'fuzzy';
    } else {
      matchType = 'db-lookup';
    }
  }

  if (!resolvedCompany && companyName && matchType === 'db-lookup') {
    try {
      dbCompany = await Company.findOne({ name: registry.normalizeName(companyName) ? { $regex: new RegExp('^' + companyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '$', 'i') } : null });
    } catch (e) {
      dbCompany = null;
    }
  }

  if (resolvedCompany) {
    identity.status = 'good';
    identity.earned = WEIGHTS.companyIdentity;
    identity.detail = `"${resolvedCompany.name}" is verified in the JobShield Trusted Company Database (${resolvedCompany.industry || 'various'})`;
  } else if (dbCompany && dbCompany.verified) {
    identity.status = 'good';
    identity.earned = WEIGHTS.companyIdentity;
    identity.detail = `"${dbCompany.registeredName || dbCompany.name}" is in our verified database`;
  } else if (dbCompany) {
    identity.status = 'warning';
    identity.earned = 5;
    identity.detail = `"${dbCompany.registeredName || dbCompany.name}" found but not enterprise-verified — treat as unknown`;
  } else {
    identity.status = 'neutral';
    identity.earned = 0;
    identity.detail = `"${companyName || 'Not provided'}" is not in the Trusted Company Database. This does NOT mean it is a scam — many legitimate employers are unknown to us. Check the domain and contact channels directly.`;
  }
  breakdown.push({ ...identity });

  /* ---------------- 2. Job posting legitimacy (20) ---------------- */
  const posting = {
    key: 'jobPosting',
    label: 'Job Posting Legitimacy',
    max: WEIGHTS.jobPosting,
  };
  const title = String(opts.jobTitle || '').trim();
  const hurtsText = findScamPhrases(text);
  const hasContent = text.trim().length > 40;

  if (!title) {
    posting.status = 'neutral';
    posting.earned = 0;
    posting.detail = 'No job title provided — no evaluation possible';
  } else if (hurtsText.length > 0) {
    posting.status = 'critical';
    posting.earned = 0;
    posting.detail = `Posting language contains scam patterns: ${hurtsText.slice(0, 4).join(', ')}`;
    warnings.push('The posting text contains language commonly used by job scams (fees, payments, urgency, personal WhatsApp).');
  } else if (hasContent) {
    posting.status = 'good';
    posting.earned = WEIGHTS.jobPosting;
    posting.detail = 'Job title provided and posting text shows no scam language patterns';
  } else {
    posting.status = 'neutral';
    posting.earned = 0;
    posting.detail = 'Job title present but detailed description not provided — no further analysis possible';
  }
  breakdown.push(posting);

  /* ---------------- 3. Domain verification (20) ---------------- */
  const domain = {
    key: 'domainVerification',
    label: 'Domain Verification',
    max: WEIGHTS.domainVerification,
  };
  if (!hosts.length) {
    domain.status = 'neutral';
    domain.earned = 0;
    domain.detail = 'No website / apply link provided';
  } else {
    const officialDomains = resolvedCompany ? registry.allDomainsFor(resolvedCompany) : (dbCompany ? [dbCompany.officialDomain || dbCompany.domain].filter(Boolean) : []);
    let anyOfficial = false;
    let anyImpersonation = null;
    let anyMismatch = null;

    for (const host of hosts) {
      if (officialDomains.length && officialDomains.some((d) => host === d || host.endsWith('.' + d))) {
        anyOfficial = true;
        continue;
      }
      if (officialDomains.length) {
        const imp = registry.detectImpersonation(host, officialDomains);
        if (imp.impersonation) {
          anyImpersonation = imp;
          break;
        }
        anyMismatch = host;
      }
    }

    if (anyImpersonation) {
      domain.status = 'critical';
      domain.earned = 0;
      domain.detail = `Domain impersonation detected: "${anyImpersonation.nearTo}" is spoofed by "${hosts[0]}". This is a classic impersonation tactic.`;
      impersonation.detected = true;
      impersonation.nearTo = anyImpersonation.nearTo;
      impersonation.reason = anyImpersonation.reason;
      warnings.push(`Fake/copycat domain detected: ${hosts.join(', ')} impersonates ${anyImpersonation.nearTo}.`);
    } else if (anyOfficial) {
      domain.status = 'good';
      domain.earned = WEIGHTS.domainVerification;
      domain.detail = `Domain ${hosts.join(', ')} matches the official domain${resolvedCompany ? ` of "${resolvedCompany.name}"` : ' in our registry'}`;
    } else {
      const suspected = hosts.some((h) => registry.registrableDomain(h) === null);
      domain.status = suspected ? 'warning' : 'warning';
      domain.earned = 8;
      domain.detail = `Website "${hosts.join(', ')}" is NOT an official domain${resolvedCompany ? ` of "${resolvedCompany.name}" (official: ${resolvedCompany.domain})` : ''} — verify before trusting`;
    }
  }
  breakdown.push(domain);

  /* ---------------- 4. Email verification (15) ---------------- */
  const email = {
    key: 'emailVerification',
    label: 'Email Verification',
    max: WEIGHTS.emailVerification,
  };
  const emailDomain = parseEmailDomain(recruiterEmail);
  const officialEmailDomains = resolvedCompany ? registry.allDomainsFor(resolvedCompany) : (dbCompany ? [dbCompany.officialDomain || dbCompany.domain].filter(Boolean) : []);

  if (!recruiterEmail || !emailDomain) {
    email.status = 'neutral';
    email.earned = 0;
    email.detail = 'No recruiter email provided';
  } else if (officialEmailDomains.length && officialEmailDomains.some((d) => emailDomain === d || emailDomain.endsWith('.' + d))) {
    email.status = 'good';
    email.earned = WEIGHTS.emailVerification;
    email.detail = `Recruiter email domain (${emailDomain}) matches the official domain`;
  } else if (isDisposableEmail(emailDomain)) {
    email.status = 'critical';
    email.earned = 0;
    email.detail = `Email uses disposable provider (${emailDomain}) — frequently used by scammers`;
    warnings.push(`Recruiter email ${recruiterEmail} uses a disposable mail domain (${emailDomain}).`);
  } else if (isFreeEmailDomain(emailDomain)) {
    email.status = 'warning';
    email.earned = 5;
    email.detail = `Recruiter uses a free email (${emailDomain}). This is a warning, not proof of a scam — but a real company usually emails from its own domain.`;
  } else {
    email.status = 'warning';
    email.earned = 7;
    email.detail = `Recruiter email domain (${emailDomain}) is not the official domain${resolvedCompany ? ` of "${resolvedCompany.name}"` : ''}; it could be a legitimate staffing agency — verify directly`;
  }
  breakdown.push(email);

  /* ---------------- 5. Recruiter verification (10) ---------------- */
  const recruiter = {
    key: 'recruiterVerification',
    label: 'Recruiter Verification',
    max: WEIGHTS.recruiterVerification,
  };
  if (!recruiterEmail) {
    recruiter.status = 'neutral';
    recruiter.earned = 0;
    recruiter.detail = 'No recruiter contact details provided';
  } else if (resolvedCompany && officialEmailDomains.length && officialEmailDomains.some((d) => emailDomain === d || emailDomain.endsWith('.' + d))) {
    recruiter.status = 'good';
    recruiter.earned = WEIGHTS.recruiterVerification;
    recruiter.detail = `Recruiter (${recruiterEmail}) is verifiable through the official company domain`;
  } else {
    recruiter.status = 'warning';
    recruiter.earned = 3;
    recruiter.detail = 'Recruiter identity cannot be independently verified — contact the company on its official website to confirm';
  }
  breakdown.push(recruiter);

  /* ---------------- 6. Website content signals (10) ---------------- */
  const website = {
    key: 'websiteContent',
    label: 'Website Trust Signals',
    max: WEIGHTS.websiteContent,
  };
  const primaryHost = hosts[0] || extractHostname(opts.website);
  if (!primaryHost) {
    website.status = 'neutral';
    website.earned = 0;
    website.detail = 'No website to evaluate';
  } else {
    const freeHost = FREE_HOSTS.some((f) => primaryHost.includes(f));
    const shortener = LINK_SHORTENERS.some((s) => primaryHost.includes(s));
    const bad = freeHost || shortener;
    website.status = bad ? 'warning' : 'good';
    website.earned = bad ? 4 : WEIGHTS.websiteContent;
    website.detail = bad
      ? (freeHost ? `Website hosted on a free platform (${primaryHost})` : `Website uses a link shortener (${primaryHost})`)
      : `Website has a custom domain (${primaryHost}) — typical of a company site`;
  }
  breakdown.push(website);

  /* ---------------- 7. Cross-signals (5) ---------------- */
  const signals = {
    key: 'scamPatterns',
    label: 'Cross-Check Signals',
    max: WEIGHTS.scamPatterns,
  };
  const phoneDigits = String(opts.phoneNumber || '').replace(/\D/g, '');
  const commChannel = String(opts.communicationChannel || '').toLowerCase();
  const whatsappOnly = commChannel.includes('whatsapp') || commChannel.includes('telegram');
  const cross = [];
  if (whatsappOnly) cross.push(`Job contact only via ${commChannel}`);
  if (phoneDigits && (phoneDigits.startsWith('1900') || phoneDigits.length > 13)) cross.push('Premium/odd phone number detected');
  if (emailDomain && isDisposableEmail(emailDomain)) cross.push(`Disposable email domain ${emailDomain}`);
  if (hosts.some((h) => LINK_SHORTENERS.some((s) => h.includes(s)))) cross.push('Link shortener in job URLs');

  if (cross.length) {
    signals.status = 'warning';
    signals.earned = 1;
    signals.detail = cross.join('; ');
  } else {
    signals.status = 'good';
    signals.earned = WEIGHTS.scamPatterns;
    signals.detail = 'No cross-channel scam signals detected';
  }
  breakdown.push(signals);

  /* ---------------- Trust score (neutral factors excluded) ---------------- */
  const active = breakdown.filter((b) => b.status !== 'neutral');
  const activeMax = active.reduce((s, b) => s + b.max, 0);
  const activeEarned = active.reduce((s, b) => s + b.earned, 0);
  let trustScore = activeMax > 0 ? Math.round((activeEarned / activeMax) * 100) : 50;

  if (impersonation.detected) trustScore = Math.min(trustScore, 15);
  if (posting.status === 'critical') trustScore = Math.min(trustScore, 25);
  if (email.status === 'critical') trustScore = Math.min(trustScore, 30);

  /* ---------------- Verification level ---------------- */
  let level = 'unknown';
  let recommendation = 'No company data — treat as unknown, then look at the posting signals';
  if (impersonation.detected) {
    level = 'suspicious';
    recommendation = 'CAUTION: A domain impersonating a known company was found. Treat this as a likely scam.';
  } else if (resolvedCompany || (dbCompany && dbCompany.verified)) {
    const domainOk = domain.status === 'good';
    const emailOk = email.status === 'good';
    if (domainOk && emailOk) level = 'enterprise-verified';
    else if (domainOk) level = 'domain-verified';
    else level = 'identity-verified';
    recommendation = level === 'enterprise-verified'
      ? 'Company identity, domain and recruiter email all verify. Still confirm the job on the official careers page.'
      : 'Company identity is real, but not every detail verifies — confirm the job position on the company\u2019s official website before sharing anything.';
  } else {
    level = 'unknown';
    recommendation = 'Company is not in our Trusted Company Database, so no trust score is shown. See the online info above and verify through official channels before applying.';
  }

  const found = !!resolvedCompany || !!dbCompany;

  // For companies NOT in the trusted database do not expose a trust % —
  // instead attach basic info found via a public web search.
  let webInfo = null;
  if (!found && options.webInfo !== false && opts.webInfo !== false) {
    webInfo = await fetchWebInfo(companyName).catch(() => null);
  }

  /* ---------------- Compact statuses for the UI ---------------- */
  const statusOf = (b) => (b.status === 'good' ? 'Verified' : b.status === 'warning' ? 'Needs verification' : b.status === 'critical' ? 'Suspicious' : 'Unknown');

  return {
    companyName,
    company: resolvedCompany || dbCompany
      ? {
          found: true,
          verified: !!resolvedCompany || !!dbCompany.verified,
          officialName: resolvedCompany ? resolvedCompany.name : (dbCompany.registeredName || dbCompany.name),
          officialDomain: resolvedCompany ? resolvedCompany.domain : (dbCompany.officialDomain || dbCompany.domain),
          officialWebsite: resolvedCompany && resolvedCompany.domain ? `https://www.${resolvedCompany.domain}` : (dbCompany && dbCompany.website) || '',
          industry: (resolvedCompany && resolvedCompany.industry) || (dbCompany && dbCompany.industry) || '',
          country: (resolvedCompany && resolvedCompany.country) || (dbCompany && dbCompany.country) || '',
          companyType: (resolvedCompany && resolvedCompany.companyType) || (dbCompany && dbCompany.companyType) || '',
          source: resolvedCompany ? 'Trusted Company Database' : 'Verified Company Database',
          careersUrl: resolvedCompany && resolvedCompany.careersUrl ? resolvedCompany.careersUrl : `https://www.${(resolvedCompany || dbCompany).domain}/careers`,
        }
      : { found: false, verified: false, officialName: companyName || '', officialDomain: null, industry: '', country: '', companyType: '', source: null },
    companyIdentity: { status: statusOf(identity), verified: identity.status === 'good', detail: identity.detail },
    jobPosting: { status: statusOf(posting), detail: posting.detail, scamPhrases: hurtsText.slice(0, 5) },
    domainVerification: {
      status: statusOf(domain),
      detail: domain.detail,
      providedHostnames: hosts,
      officialDomain: (resolvedCompany && resolvedCompany.domain) || (dbCompany && (dbCompany.officialDomain || dbCompany.domain)) || null,
      match: domain.status === 'good' ? (hosts.length && hosts.every((h) => (resolvedCompany ? registry.allDomainsFor(resolvedCompany) : (dbCompany ? [dbCompany.officialDomain || dbCompany.domain] : [])).some((d) => h === d || h.endsWith('.' + d))) ? 'official' : 'careers-subdomain') : domain.status === 'critical' ? 'impersonation' : 'different',
    },
    emailVerification: {
      status: statusOf(email),
      detail: email.detail,
      email: recruiterEmail,
      emailDomain,
      officialDomain: (resolvedCompany && resolvedCompany.domain) || (dbCompany && (dbCompany.officialDomain || dbCompany.domain)) || null,
      isFreeEmail: isFreeEmailDomain(emailDomain),
      isDisposable: isDisposableEmail(emailDomain),
      isOfficial: email.status === 'good',
    },
    recruiterVerification: { status: statusOf(recruiter), detail: recruiter.detail, email: recruiterEmail },
    websiteContent: { status: statusOf(website), detail: website.detail },
    scamPatterns: { status: statusOf(signals), detail: signals.detail },
    impersonationDetected: impersonation.detected,
    impersonationOf: impersonation.nearTo,
    impersonationReason: impersonation.reason,
    verificationLevel: level,
    trustScore: found ? trustScore : null,
    riskScore: 100 - trustScore,
    webInfo,
    breakdown,
    warnings,
    recommendation,
    checkedAt: new Date().toISOString(),
  };
}

module.exports = {
  getCompanyVerification,
  WEIGHTS,
  findScamPhrases,
  extractHostname,
  parseEmailDomain,
  isFreeEmailDomain,
  isDisposableEmail,
};