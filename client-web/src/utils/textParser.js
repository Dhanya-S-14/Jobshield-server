const COMMON_TITLE_KEYWORDS = [
  'engineer', 'developer', 'manager', 'analyst', 'associate', 'consultant',
  'specialist', 'coordinator', 'executive', 'assistant', 'representative',
  'officer', 'technician', 'supervisor', 'director', 'lead', 'architect',
  'designer', 'trainee', 'intern', 'fresher', 'hr', 'accountant', 'clerk',
  'operator', 'agent', 'advisor', 'trainer', 'instructor', 'professor',
  'scientist', 'researcher', 'auditor', 'broker', 'cashier',
  'chef', 'copywriter', 'data entry', 'driver', 'editor', 'guard',
  'helper', 'housekeeper', 'nurse', 'peon', 'plumber',
  'receptionist', 'sales', 'security', 'staff', 'steward', 'sweeper',
  'teacher', 'telecaller', 'waiter', 'watchman', 'worker', 'writer',
  'recruiter', 'graphic', 'video', 'animation', 'marketing',
  'business', 'project', 'product', 'quality', 'testing',
  'full stack', 'frontend', 'backend', 'devops', 'cloud', 'ml', 'ai',
  'java', 'python', 'react', 'node', 'angular', 'vue', '.net',
];

const SALARY_PATTERNS = [
  /(?:₹|rs\.?\s*)?(\d[\d,]+)\s*(?:[-–to]+\s*(?:₹|rs\.?\s*)?(\d[\d,]+))?\s*(?:\/|per)\s*(month|year|annum|monthly|yearly|pa|p\.?a\.?)/gi,
  /salary[:\s]*(?:₹|rs\.?\s*)?(\d[\d,]+)/gi,
  /(?:₹|rs\.?\s*)(\d[\d,]+)\s*(?:[-–to]+\s*(?:₹|rs\.?\s*)?(\d[\d,]+))?\s*(?:k|k\s*per\s*month|k\s*pa|lpa|lakh|ctc)/gi,
  /(\d+)\s*lpa/gi,
  /(?:salary|stipend|pay|compensation|ctc|package)[:\s]*([\d, ₹₹\-–to/\.]+(?:lakh|lpa|k|per\s*(?:month|year|annum))?)/gi,
];

const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
const PHONE_REGEX = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/g;
const URL_REGEX = /https?:\/\/[^\s,\u200b]+/gi;
const SHORT_URL_REGEX = /(?:www\.|bit\.ly|tinyurl\.com|t\.co|is\.gd|cutt\.ly)[^\s,\u200b]+/gi;

const COMPANY_SUFFIXES = [
  'pvt ltd', 'pvt. ltd', 'ltd', 'limited', 'inc', 'corp', 'corporation',
  'llc', 'llp', 'technologies', 'solutions', 'services', 'group', 'industries',
  'enterprises', 'consulting', 'software', 'systems', 'digital', 'tech',
  'global', 'international', 'ventures', 'labs', 'studio', 'agency', 'co'
];

const LOCATION_KEYWORDS = [
  'location', 'place', 'address', 'city', 'area', 'region', 'office',
  'based in', 'located at', 'work from', 'work location', 'job location'
];

const skipWords = [
  'job', 'description', 'responsibilities', 'qualifications', 'requirements',
  'about', 'role', 'position', 'hiring', 'urgent', 'opening', 'vacancy',
  'apply', 'interested', 'send', 'email', 'contact', 'note', 'important'
];

function extractJobTitle(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 20)) {
    const lower = line.toLowerCase();
    if (lower.includes('job title') || lower.includes('position') || lower.includes('designation')) {
      const colonMatch = line.split(/[:=]/i);
      if (colonMatch.length > 1) return colonMatch[1].trim().slice(0, 80);
    }
  }
  for (const line of lines.slice(0, 15)) {
    const lower = line.toLowerCase();
    const match = COMMON_TITLE_KEYWORDS.find(kw => lower.includes(kw));
    if (match) {
      const words = line.split(/[-–|•·,:\t]/)[0].trim();
      if (words.length > 2 && words.length < 80) return words;
    }
  }
  for (const line of lines.slice(0, 3)) {
    const cleaned = line.replace(/^(we are hiring|job opening|vacancy|position)[\s:]*/i, '').trim();
    if (cleaned.length > 3 && cleaned.length < 60 && /\b(engineer|developer|manager|analyst|assistant|clerk|officer|staff|executive)\b/i.test(cleaned)) {
      return cleaned;
    }
  }
  return '';
}

function extractCompanyName(text) {
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  for (const line of lines.slice(0, 15)) {
    const lower = line.toLowerCase();
    if (lower.includes('company name') || lower.includes('company:') || lower.includes('organization')) {
      const colonMatch = line.split(/[:=]/i);
      if (colonMatch.length > 1) {
        const name = colonMatch.slice(1).join(':').trim().replace(/^(at|with|for)\s+/i, '').trim();
        if (name.length > 1 && name.length < 80) return name;
      }
    }
  }
  for (const line of lines.slice(0, 15)) {
    const lower = line.toLowerCase();
    if (skipWords.some(w => lower.startsWith(w) || lower.includes('company'))) continue;
    if (COMPANY_SUFFIXES.some(s => lower.includes(s))) return line.replace(/^(at|with|for)\s+/i, '').trim();
  }
  for (const line of lines.slice(0, 8)) {
    const cleaned = line.replace(/^(at |with |for |company[: ]*)/i, '').trim();
    if (cleaned.length > 2 && cleaned.length < 60 && !COMMON_TITLE_KEYWORDS.some(k => cleaned.toLowerCase().includes(k))) {
      if (!skipWords.some(w => cleaned.toLowerCase().startsWith(w))) {
        return cleaned;
      }
    }
  }
  return '';
}

function extractSalary(text) {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('not disclosed') || lowerText.includes('undisclosed') || lowerText.includes('as per industry')) {
    return 'Not disclosed';
  }
  for (const pattern of SALARY_PATTERNS) {
    pattern.lastIndex = 0;
    const match = pattern.exec(text);
    if (match) {
      const val = (match[0] || '').replace(/^[^₹rs\d]*/i, '').trim();
      if (val && /\d/.test(val)) return val.slice(0, 80);
    }
  }
  const parts = text.split(/\n/);
  for (const line of parts) {
    const lower = line.toLowerCase();
    if (lower.includes('salary') || lower.includes('stipend') || lower.includes('compensation') ||
        lower.includes('pay') || lower.includes('ctc') || lower.includes('lpa') || lower.includes('lakh') ||
        lower.includes('package') || lower.includes('earn') || lower.includes('income') ||
        lower.includes('payment') || lower.includes('wage')) {
      const cleaned = line.replace(/[^0-9,₹.\-–\/a-zA-Z\s]/g, '').trim();
      if (/\d/.test(cleaned)) return cleaned.slice(0, 100);
    }
  }
  return '';
}

function extractEmail(text) {
  const matches = text.match(EMAIL_REGEX);
  if (matches) {
    const real = matches.find(e => !e.includes('example.com') && !e.includes('domain.com') && !e.includes('email@') && !e.includes('gmail.org'));
    return real || matches[0];
  }
  return '';
}

function extractPhone(text) {
  const matches = text.match(PHONE_REGEX);
  if (matches) {
    const cleaned = matches.filter(m => {
      const digits = m.replace(/\D/g, '');
      return digits.length >= 7 && digits.length <= 15;
    });
    return cleaned[0] || '';
  }
  return '';
}

function extractWebsite(text) {
  const urlMatches = text.match(URL_REGEX);
  if (urlMatches) {
    const real = urlMatches.find(u =>
      !u.includes('example') && !u.includes('sample') && !u.includes('linkedin.com') &&
      !u.includes('facebook.com') && !u.includes('twitter.com') && !u.includes('instagram.com') &&
      !u.includes('youtube.com') && !u.includes('whatsapp') && !u.includes('telegram') &&
      !u.includes('google.com') && !u.includes('maps.google')
    );
    return real || '';
  }
  const shortMatches = text.match(SHORT_URL_REGEX);
  if (shortMatches) return shortMatches[0];
  return '';
}

function extractLocation(text) {
  const lower = text.toLowerCase();
  for (const kw of LOCATION_KEYWORDS) {
    const idx = lower.indexOf(kw);
    if (idx !== -1) {
      const after = text.slice(idx + kw.length).split(/[\n,;|]/)[0].replace(/^[:\s=-]+/, '').trim();
      if (after.length > 1 && after.length < 80) return after;
    }
  }
  const indianCities = [
    'bangalore', 'bengaluru', 'mumbai', 'delhi', 'pune', 'hyderabad', 'chennai',
    'kolkata', 'ahmedabad', 'gurgaon', 'gurugram', 'noida', 'jaipur', 'lucknow',
    'chandigarh', 'indore', 'bhopal', 'kochi', 'coimbatore', 'goa', 'nagpur',
    'visakhapatnam', 'mysore', 'surat', 'vadodara', 'bhubaneswar', 'guwahati',
    'ranchi', 'patna', 'agra', 'varanasi', 'amritsar', 'jodhpur', 'dehradun',
    'nashik', 'aurangabad', 'vijayawada', 'rajkot', 'thiruvananthapuram',
  ];
  const globalCities = [
    'new york', 'san francisco', 'los angeles', 'chicago', 'london', 'sydney',
    'toronto', 'dubai', 'singapore', 'berlin', 'paris', 'tokyo', 'seoul',
    'bangkok', 'amsterdam', 'dublin', 'zurich',
  ];
  const allCities = [...indianCities, ...globalCities];
  for (const city of allCities) {
    if (lower.includes(city)) {
      const idx = lower.indexOf(city);
      const lineEnd = text.indexOf('\n', idx);
      const segment = lineEnd > -1 ? text.slice(idx, lineEnd) : text.slice(idx, idx + 60);
      return segment.trim();
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
  if (lower.includes('senior') || lower.includes('lead') || lower.includes('head') || lower.includes('principal') || lower.includes('sr.')) return 'Senior';
  if (lower.includes('junior') || lower.includes('jr') || lower.includes('fresher') || lower.includes('entry') ||
      lower.includes('no experience') || lower.includes('0-1') || lower.includes('0 - 1') || lower.includes('0+')) return 'Entry';
  if (lower.includes('manager') || lower.includes('mid level') || lower.includes('mid-level')) return 'Mid';
  if (/\d+\s*[-–to]+\s*\d+\s*(years?|yrs?)/i.test(lower)) {
    const match = lower.match(/(\d+)\s*[-–to]+\s*(\d+)/);
    if (match) {
      const max = parseInt(match[2]);
      if (max >= 8) return 'Senior';
      if (max >= 3) return 'Mid';
      return 'Entry';
    }
  }
  return '';
}

function extractRecruiterName(text) {
  const patterns = [
    /(?:contact|recruiter|hr| hiring manager|point of contact)[:\s]+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/,
    /(?:regards|sincerely|best|thanks|thank you|warm regards),?\s*[-–]?\s*([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/m,
    /(?:from|by)\s+([A-Z][a-zA-Z]+(?:\s+[A-Z][a-zA-Z]+)+)/,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1].length > 3) return match[1].trim();
  }
  return '';
}

function extractSkills(text) {
  const patterns = [
    /(?:skills|key skills|required skills|technical skills|technology|tech stack)[:\s]*([\s\S]*?)(?:\n\n|\n(?=\w+:)|$)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      const raw = match[1].split('\n').slice(0, 3).join(', ');
      const cleaned = raw.replace(/[•·\-\*]/g, ',').replace(/,\s*,/g, ',').trim();
      if (cleaned.length > 2) return cleaned.slice(0, 200);
    }
  }
  return '';
}

function extractApplyLink(text) {
  const patterns = [
    /(?:apply|apply now|click here|to apply|submit|application link)[:\s]*(https?:\/\/[^\s,\u200b]+)/gi,
    /(?:career|careers|job|apply)\s*(?:link|url|page)[:\s]*(https?:\/\/[^\s,\u200b]+)/gi,
  ];
  for (const pattern of patterns) {
    const match = pattern.exec(text);
    if (match) return match[1].trim();
  }
  return '';
}

export function parseJobText(text) {
  if (!text || !text.trim()) return {};
  return {
    jobTitle: extractJobTitle(text),
    companyName: extractCompanyName(text),
    salary: extractSalary(text),
    location: extractLocation(text),
    jobType: extractJobType(text),
    experienceLevel: extractExperienceLevel(text),
    recruiterName: extractRecruiterName(text),
    recruiterEmail: extractEmail(text),
    phoneNumber: extractPhone(text),
    website: extractWebsite(text),
    skills: extractSkills(text),
    applyLink: extractApplyLink(text),
    jobDescription: text,
  };
}
