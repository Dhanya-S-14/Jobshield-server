const COMMON_TITLE_KEYWORDS = [
  'engineer', 'developer', 'manager', 'analyst', 'associate', 'consultant',
  'specialist', 'coordinator', 'executive', 'assistant', 'representative',
  'officer', 'technician', 'supervisor', 'director', 'lead', 'architect',
  'designer', 'trainee', 'intern', 'fresher', 'hr', 'accountant', 'clerk',
  'operator', 'agent', 'advisor', 'trainer', 'instructor', 'professor',
  'scientist', 'researcher', 'auditor', 'broker', 'cashier',
  'chef', 'copywriter', 'data entry', 'driver', 'editor', 'guard',
  'helper', 'housekeeper', 'nurse', 'peon', 'plumber',
  'receptionist', 'sales', 'security', 'staff', 'steward',
  'teacher', 'telecaller', 'waiter', 'watchman', 'worker', 'writer',
];

const SALARY_PATTERNS = [
  /(?:₹|rs\.?\s*)?(\d[\d,]+)\s*(?:-\s*(?:₹|rs\.?\s*)?(\d[\d,]+))?\s*(?:\/|per)\s*(month|year|annum|monthly|yearly|pa|p\.?a\.?|per month|per year|per annum)/gi,
  /salary[:\s]*(?:₹|rs\.?\s*)?(\d[\d,]+)/gi,
  /(?:₹|rs\.?\s*)(\d[\d,]+)\s*(?:-\s*(?:₹|rs\.?\s*)?(\d[\d,]+))?\s*(?:k|k\s*per\s*month|k\s*pa|lpa|lakh|ctc)/gi,
  /(\d+)\s*lpa/gi,
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g;
const URL_REGEX = /https?:\/\/[^\s,]+/gi;
const COMPANY_SUFFIXES = ['pvt ltd', 'ltd', 'limited', 'inc', 'corp', 'corporation', 'llc', 'technologies', 'solutions', 'services', 'group', 'industries', 'enterprises', 'consulting', 'software', 'systems', 'digital', 'tech', 'global', 'international', 'ventures'];

export function parseJobText(text) {
  if (!text || !text.trim()) return {};
  return {
    jobTitle: extractJobTitle(text),
    companyName: extractCompanyName(text),
    salary: extractSalary(text),
    location: extractLocation(text),
    jobType: extractJobType(text),
    experienceLevel: extractExperienceLevel(text),
    recruiterEmail: extractEmail(text),
    phoneNumber: extractPhone(text),
    website: extractWebsite(text),
    applyLink: extractApplyLink(text),
    jobDescription: text,
  };
}

function extractJobTitle(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 15)) {
    const lower = line.toLowerCase();
    const match = COMMON_TITLE_KEYWORDS.find(kw => lower.includes(kw));
    if (match) {
      const words = line.split(/[-\u2013|*\u00b7,:\t]/)[0].trim();
      if (words.length < 60) return words;
    }
  }
  return '';
}

function extractCompanyName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const skipWords = ['job', 'description', 'responsibilities', 'qualifications', 'requirements', 'about', 'role', 'position', 'hiring', 'urgent', 'opening', 'vacancy'];
  for (const line of lines.slice(0, 10)) {
    const lower = line.toLowerCase();
    if (skipWords.some(w => lower.startsWith(w) || lower.includes('company'))) continue;
    if (COMPANY_SUFFIXES.some(s => lower.includes(s))) return line.replace(/^(at|with|for)\s+/i, '').trim();
  }
  for (const line of lines.slice(0, 5)) {
    const cleaned = line.replace(/^(at |with |for |company[: ]*)/i, '').trim();
    if (cleaned.length > 2 && cleaned.length < 50 && !COMMON_TITLE_KEYWORDS.some(k => cleaned.toLowerCase().includes(k))) {
      return cleaned;
    }
  }
  return '';
}

function extractSalary(text) {
  for (const pattern of SALARY_PATTERNS) {
    const match = pattern.exec(text);
    if (match) {
      const val = match[1] || match[0];
      const cleaned = val.replace(/[^0-9,k]/g, '').trim();
      if (cleaned) return `\u20B9${cleaned}/month`;
    }
  }
  const parts = text.split(/\n/);
  for (const line of parts) {
    const lower = line.toLowerCase();
    if (lower.includes('salary') || lower.includes('stipend') || lower.includes('compensation') || lower.includes('pay') || lower.includes('ctc') || lower.includes('lpa') || lower.includes('lakh')) {
      const cleaned = line.replace(/[^0-9,.\u20B9\u2013\/a-zA-Z\s]/g, '').trim();
      if (/\d/.test(cleaned)) return cleaned.slice(0, 80);
    }
  }
  return '';
}

function extractEmail(text) {
  const matches = text.match(EMAIL_REGEX);
  if (matches) {
    const real = matches.find(e => !e.includes('example.com') && !e.includes('domain.com') && !e.includes('email@'));
    return real || matches[0];
  }
  return '';
}

function extractPhone(text) {
  const matches = text.match(PHONE_REGEX);
  return matches ? matches[0] : '';
}

function extractWebsite(text) {
  const matches = text.match(URL_REGEX);
  if (matches) {
    const real = matches.find(u =>
      !u.includes('example') && !u.includes('sample') && !u.includes('linkedin.com') &&
      !u.includes('facebook.com') && !u.includes('twitter.com') && !u.includes('instagram.com') &&
      !u.includes('youtube.com') && !u.includes('whatsapp') && !u.includes('telegram')
    );
    return real || '';
  }
  return '';
}

function extractLocation(text) {
  const patterns = [
    /location[:\s]+(.+)/i,
    /(?:based in|located at|location|place of work|work location|job location)[:\s]+(.+)/i,
    /(?:bangalore|mumbai|delhi|pune|hyderabad|chennai|kolkata|ahmedabad|gurgaon|noida|jaipur|lucknow|chandigarh|indore|bhopal|kochi|coimbatore|goa|nagpur|new york|san francisco|los angeles|chicago|london|sydney|toronto|dubai|singapore)/gi,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (pattern === patterns[2]) return match[0];
      return match[1].trim().split('\n')[0].trim();
    }
  }
  return '';
}

function extractJobType(text) {
  const lower = text.toLowerCase();
  if (lower.includes('part time') || lower.includes('part-time') || lower.includes('parttime')) return 'Part-time';
  if (lower.includes('contract') || lower.includes('temporary') || lower.includes('temp ')) return 'Contract';
  if (lower.includes('remote') || lower.includes('work from home') || lower.includes('wfh') || lower.includes('online')) return 'Remote';
  if (lower.includes('internship') || lower.includes('intern')) return 'Internship';
  if (lower.includes('freelance') || lower.includes('freelancer')) return 'Freelance';
  return 'Full-time';
}

function extractExperienceLevel(text) {
  const lower = text.toLowerCase();
  if (lower.includes('senior') || lower.includes('lead') || lower.includes('head') || lower.includes('principal')) return 'Senior';
  if (lower.includes('junior') || lower.includes('jr') || lower.includes('fresher') || lower.includes('entry') || lower.includes('no experience') || lower.includes('0-1') || lower.includes('0 - 1')) return 'Entry';
  if (lower.includes('manager') || lower.includes('mid')) return 'Mid';
  if (/\d+\s*[-\u2013to]+\s*\d+\s*(years?|yrs?)/i.test(lower)) return 'Mid';
  return '';
}

function extractApplyLink(text) {
  const patterns = [
    /(?:apply|apply now|click here|to apply|submit)[:\s]*(https?:\/\/[^\s,]+)/gi,
    /(?:career|careers|job|apply)\s*(?:link|url|page)[:\s]*(https?:\/\/[^\s,]+)/gi,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) return match[1].trim();
  }
  return '';
}
