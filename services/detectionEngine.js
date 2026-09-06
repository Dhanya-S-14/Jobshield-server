const scamKeywords = require('../keywords/scamKeywords.json');
const Company = require('../models/Company');

const analyzeKeywords = (jobTitle, jobDescription, skills) => {
  const skillsStr = Array.isArray(skills) ? skills.join(' ') : (typeof skills === 'string' ? skills : '');
  const text = [jobTitle, jobDescription, skillsStr].filter(v => typeof v === 'string' && v.trim()).join(' ').trim().toLowerCase();
  const foundKeywords = [];

  for (const entry of scamKeywords) {
    if (entry.isActive !== undefined && !entry.isActive) continue;
    const pattern = entry.keyword.toLowerCase();
    let matched = false;
    if (/[\s-]/.test(pattern)) {
      matched = text.includes(pattern);
    } else {
      matched = new RegExp(`\\b${pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(text);
    }
    if (matched) {
      foundKeywords.push(entry);
    }
  }

  const strong = foundKeywords.filter(k => (k.points || 0) >= 30);
  const medium = foundKeywords.filter(k => (k.points || 0) >= 15 && (k.points || 0) < 30);
  const soft = foundKeywords.filter(k => (k.points || 0) < 15);

  let score = 0;
  if (strong.length > 0) {
    score = 90;
  } else if (medium.length >= 3) {
    score = 65;
  } else if (medium.length === 2) {
    score = 40;
  } else if (medium.length === 1) {
    score = 15;
  } else if (soft.length >= 6) {
    score = 15;
  } else if (soft.length >= 4) {
    score = 10;
  }

  const moneyKeywords = foundKeywords.filter(k => k.category === 'money').length;
  const investmentKeywords = foundKeywords.filter(k => k.category === 'investment').length;
  const fakeBenefits = foundKeywords.filter(k => k.category === 'fake_benefits').length;

  let details = '';
  if (foundKeywords.length === 0) {
    details = 'No scam-related keywords detected in the job posting.';
  } else {
    details = `Found ${foundKeywords.length} keyword signal${foundKeywords.length > 1 ? 's' : ''}. `;
    if (moneyKeywords > 0) details += `${moneyKeywords} fee/ payment-related keyword${moneyKeywords > 1 ? 's' : ''} detected. `;
    if (investmentKeywords > 0) details += `${investmentKeywords} investment-related keyword${investmentKeywords > 1 ? 's' : ''} detected. `;
    if (fakeBenefits > 0) details += `${fakeBenefits} benefit claim${fakeBenefits > 1 ? 's' : ''} detected. `;
    const strongKeywords = foundKeywords.filter(k => (k.points || 0) >= 15).map(k => k.keyword);
    if (strongKeywords.length > 0) details += `Notable signals: ${strongKeywords.join(', ')}.`;
  }

  return {
    score,
    keywordsFound: foundKeywords.map(k => k.keyword),
    details
  };
};

const analyzeSalary = (salary) => {
  let score = 0;
  let details = '';
  if (!salary || salary.trim() === '') {
    return { score: 0, details: 'No salary information provided.' };
  }

  const salaryLower = salary.toLowerCase();

  const suspiciousPatterns = [
    'no bar', 'unlimited', 'no limit', 'not a constraint',
    'best in industry', 'highest in market', 'no salary limit'
  ];
  for (const pattern of suspiciousPatterns) {
    if (salaryLower.includes(pattern)) {
      score = Math.max(score, 40);
      details = `Suspicious salary pattern detected: "${pattern}". Legitimate employers typically specify salary ranges.`;
      break;
    }
  }

  const highValuePatterns = [
    { regex: /(\d+)\s*(crore|crores|cr)\s*(per\s*)?(year|annum|yr|month)?/i, threshold: 1, pts: 50 },
    { regex: /(\d+)\s*(lakh|lacs|lakhs)\s*per\s*month/i, threshold: 1, pts: 60 },
    { regex: /(\d+)\s*(lakh|lacs|lakhs)\s*(per\s*)?(year|annum|yr)?/i, threshold: 20, pts: 30 },
    { regex: /(\d+[kK])\s*(per\s*)?(month)?/i, threshold: 500, pts: 35 },
    { regex: /(\d+)\s*-\s*(\d+)\s*(lakh|lacs|lakhs)/i, threshold: 50, pts: 40 }
  ];

  for (const { regex, threshold, pts } of highValuePatterns) {
    const match = salaryLower.match(regex);
    if (match) {
      const value = parseFloat(match[1]);
      if (value >= threshold) {
        score = Math.max(score, pts);
        if (!details) {
          details = `Unrealistically high salary detected: "${salary}". This is a common scam tactic to attract applicants. Legitimate companies offer market-competitive salaries.`;
        }
        break;
      }
    }
  }

  if (score === 0) {
    const hasNumbers = /\d/.test(salary);
    if (hasNumbers) {
      score = 5;
      details = 'Salary information provided appears reasonable.';
    } else {
      details = 'Salary information is vague.';
    }
  }

  return { score, details };
};

const analyzeEmail = (recruiterEmail) => {
  let score = 0;
  let details = '';

  if (!recruiterEmail || recruiterEmail.trim() === '') {
    return { score: 0, details: 'No recruiter email provided.' };
  }

  const email = recruiterEmail.toLowerCase().trim();

  const freeEmailProviders = [
    'gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com',
    'live.com', 'aol.com', 'mail.com', 'protonmail.com',
    'yandex.com', 'zoho.com', 'rediffmail.com', 'msn.com',
    'icloud.com', 'gmx.com', 'inbox.com', 'fastmail.com'
  ];

  const domain = email.split('@')[1];
  if (!domain) {
    return { score: 30, details: 'Invalid email format.' };
  }

  if (freeEmailProviders.includes(domain)) {
    score = 25;
    details = `Recruiter is using a free email provider (${domain}). Legitimate companies typically use corporate email addresses (e.g., name@company.com). `;
  }

  const suspiciousDomains = ['temp', 'tempmail', 'disposable', 'throwaway', 'guerrilla', 'mailinator'];
  for (const susDomain of suspiciousDomains) {
    if (domain.includes(susDomain)) {
      score = Math.max(score, 70);
      details = `Disposable/temporary email domain detected: ${domain}. This is highly suspicious as legitimate recruiters use permanent email addresses.`;
      break;
    }
  }

  if (email.includes('+')) {
    score = Math.max(score, 20);
    details += 'Email contains plus addressing which is unusual for corporate communications.';
  }

  const namePatterns = email.split('@')[0];
  const suspiciousNames = ['hr', 'recruiter', 'admin', 'info', 'contact', 'support', 'careers', 'job', 'hello'];
  for (const sn of suspiciousNames) {
    if (namePatterns === sn || namePatterns.startsWith(sn) || namePatterns.includes(sn)) {
      score = Math.max(score, 15);
      if (!details.includes('generic')) {
        details += 'Generic email prefix used (hr@, info@, etc.) which is often used by scammers.';
      }
      break;
    }
  }

  if (score === 0) {
    score = 5;
    details = 'Email appears to be a legitimate corporate email address.';
  }

  return { score, details };
};

const analyzeURL = (website, applyLink) => {
  let score = 0;
  const details = [];
  const urls = [website, applyLink].filter(Boolean);

  if (urls.length === 0) {
    return { score: 0, details: 'No URLs provided.' };
  }

  const shorteners = [
    'tinyurl.com', 'bit.ly', 'goo.gl', 'ow.ly', 'shorturl',
    'tiny.cc', 'bit.do', 'rb.gy', 'shorturl.at', 'cutt.ly',
    'is.gd', 'buff.ly', 'rebrand.ly', 't.co', 'lnkd.in'
  ];

  for (const url of urls) {
    const urlLower = url.toLowerCase();

    for (const shortener of shorteners) {
      if (urlLower.includes(shortener)) {
        score = Math.max(score, 40);
        details.push(`URL shortener detected: "${shortener}". Scammers often use shortened URLs to hide malicious destinations.`);
        break;
      }
    }

    if (!urlLower.startsWith('https://') && urlLower.startsWith('http://')) {
      score = Math.max(score, 20);
      details.push('URL does not use HTTPS encryption. Legitimate company websites always use HTTPS.');
    }

    if (!urlLower.startsWith('http://') && !urlLower.startsWith('https://')) {
      score = Math.max(score, 15);
      details.push('URL is missing protocol (http/https). This is unusual for legitimate companies.');
    }

    const suspiciousTLDs = ['.xyz', '.top', '.club', '.online', '.site', '.work', '.click', '.link', '.download', '.review'];
    for (const tld of suspiciousTLDs) {
      if (urlLower.includes(tld)) {
        score = Math.max(score, 25);
        details.push(`Suspicious top-level domain detected: "${tld}". Scammers often use cheap TLDs.`);
        break;
      }
    }

    const suspiciousPatterns = ['free', 'money', 'earn', 'win', 'prize', 'cash', 'bonus', 'salary', 'job', 'career', 'apply'];
    for (const sp of suspiciousPatterns) {
      if (new RegExp(`(^|\\.)${sp}\\.`).test(urlLower) || new RegExp(`/${sp}`).test(urlLower)) {
        score = Math.max(score, 15);
        details.push(`URL contains suspicious keyword: "${sp}".`);
        break;
      }
    }
  }

  if (score === 0) {
    score = 5;
    details.push('URLs appear legitimate.');
  }

  return { score, details: details.join(' ') };
};

const analyzePhone = (phoneNumber) => {
  let score = 0;
  let details = '';

  if (!phoneNumber || phoneNumber.trim() === '') {
    return { score: 0, details: 'No phone number provided.' };
  }

  const phone = phoneNumber.replace(/[\s\-\(\)\+]/g, '');

  if (phone.length < 7 || phone.length > 15) {
    score = 30;
    details = `Phone number appears invalid (${phoneNumber}). Legitimate recruiters provide valid contact numbers.`;
    return { score, details };
  }

  if (!/^\d+$/.test(phone)) {
    score = 20;
    details = 'Phone number contains non-numeric characters, which is suspicious.';
    return { score, details };
  }

  const repeatedPatterns = [
    /(\d)\1{5,}/, /123456/, /654321/, /000000/, /111111/,
    /222222/, /333333/, /444444/, /555555/, /666666/,
    /777777/, /888888/, /999999/
  ];
  for (const pattern of repeatedPatterns) {
    if (pattern.test(phone)) {
      score = Math.max(score, 40);
      details = `Suspicious phone number pattern detected: "${phoneNumber}". Scammers often use fake or repeated-digit numbers.`;
      break;
    }
  }

  const highRiskCountries = ['+92', '+234', '+880', '+63', '+91'];
  for (const code of highRiskCountries) {
    if (phoneNumber.replace(/\s/g, '').startsWith(code)) {
      score = Math.max(score, 10);
      details = `Phone number from country code ${code}. Exercise caution if not expecting international contact.`;
      break;
    }
  }

  if (score === 0) {
    score = 5;
    details = 'Phone number appears valid.';
  }

  return { score, details };
};

const analyzeCompanyInfo = async (companyName, location) => {
  let score = 0;
  let details = '';

  if (!companyName || companyName.trim() === '') {
    return { score: 10, details: 'No company name provided for verification.' };
  }

  const name = companyName.trim();

  const genericNames = [
    'company', 'corporation', 'inc', 'llc', 'ltd', 'limited',
    'group', 'services', 'solutions', 'technologies', 'consulting',
    'enterprises', 'ventures', 'global', 'world', 'international'
  ];

  const nameLower = name.toLowerCase();
  let isGeneric = true;
  let wordCount = name.split(/\s+/).length;

  if (wordCount < 2) {
    score = Math.max(score, 30);
    details = 'Company name is too short or generic. Legitimate companies have distinctive names. ';
  }

  let genericCount = 0;
  for (const gn of genericNames) {
    if (nameLower === gn || nameLower.endsWith(` ${gn}`)) {
      genericCount++;
    }
  }
  if (genericCount >= 2 || (wordCount <= 2 && genericCount >= 1)) {
    score = Math.max(score, 25);
    details += 'Company name appears generic. Scammers often use vague company names. ';
  }

  try {
    const companyExists = await Company.findOne({
      name: { $regex: new RegExp(name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
    });

    if (companyExists) {
      if (companyExists.verified) {
        score = 0;
        details = `Company "${companyExists.name}" found in our database and is verified. This is a positive sign.`;
        if (location && companyExists.location && !companyExists.location.toLowerCase().includes(location.toLowerCase())) {
          score = Math.max(score, 15);
          details += ` However, the job posting location (${location}) does not match the company's known location (${companyExists.location}).`;
        }
      } else {
        score = Math.max(score, 20);
        details = `Company "${companyExists.name}" found in our database but is not yet verified. Exercise caution.`;
      }
    } else {
      score = Math.max(score, 15);
      details = `Company "${name}" was not found in our verified company database. This does not necessarily mean it's a scam, but exercise caution with unknown companies.`;
    }
  } catch (error) {
    score = Math.max(score, 10);
    details = 'Unable to verify company information due to a system error.';
  }

  return { score, details };
};

const analyzeTextQuality = (jobDescription) => {
  let score = 0;
  let details = [];

  if (!jobDescription || jobDescription.trim() === '') {
    return { score: 20, details: 'No job description provided. Legitimate job postings always include a description.' };
  }

  const text = jobDescription;

  const capsWords = text.split(/\s+/).filter(w => w.length > 2 && w === w.toUpperCase() && /[A-Z]/.test(w)).length;
  const totalWords = text.split(/\s+/).length;
  if (totalWords > 0 && capsWords / totalWords > 0.3) {
    score = Math.max(score, 30);
    details.push('Excessive use of ALL CAPS (over 30% of text). Legitimate job postings use standard capitalization.');
  }

  const exclamationCount = (text.match(/!/g) || []).length;
  if (exclamationCount > 3) {
    score = Math.max(score, 20);
    details.push(`Excessive exclamation marks (${exclamationCount} found). This is unprofessional and typical of scam postings.`);
  }

  const questionMarks = (text.match(/\?\s*\?/g) || []).length;
  if (questionMarks > 0) {
    score = Math.max(score, 15);
    details.push('Multiple consecutive question marks detected, indicating unprofessional writing.');
  }

  const dollarEarnings = (text.match(/\$\d+[kK]?\s*-\s*\$\d+[kK]?/g) || []).length;
  if (dollarEarnings > 0) {
    score = Math.max(score, 15);
    details.push('Salary range mentioned in dollars may indicate a scam if the job is in a non-dollar region.');
  }

  const spellingErrors = [
    'opertunity', 'oportunity', 'oppertunity', 'guaranted', 'guarenteed',
    'comission', 'comision', 'recieve', 'recive', 'acheive', 'acheve',
    'succes', 'sucess', 'busness', 'bussiness', 'privledge', 'priveledge',
    'definately', 'definitley', 'responsability', 'responsiblity',
    'accomodate', 'accomodation', 'seperate', 'seprate', 'becuase',
    'begining', 'begining', 'belive', 'beleive', 'calender', 'calandar',
    'carreer', 'carear', 'catagory', 'catagory', 'commitee', 'comittee',
    'conceed', 'concede', 'congradulate', 'congrads', 'deceit', 'deceitful',
    'definate', 'definate', 'desparate', 'desparately', 'deteriorate',
    'deteriate', 'embarass', 'embarassed', 'enviroment', 'environment',
    'exagerate', 'exagerated', 'exellent', 'exelent', 'extremly',
    'extremeley', 'finaly', 'finaly', 'flexable', 'flexiable', 'foriegn',
    'foriegn', 'fourty', 'foward', 'freind', 'freindly', 'goverment',
    'goverment', 'gratitude', 'gratitude', 'greatful', 'gratefull',
    'guidence', 'guidence', 'happiness', 'happiness', 'harrass',
    'harrassment', 'hemorrhage', 'hemorage', 'hiearchy', 'hiracy',
    'humor', 'humour', 'imaginary', 'imagin', 'immediatly', 'immediatly',
    'independant', 'independance', 'initiative', 'inititive', 'innoculate',
    'inoculate', 'insistance', 'insistance', 'interupt', 'interuption',
    'irrelevent', 'irrelevent', 'irresistable', 'irresistable', 'knowlege',
    'knowlege', 'liason', 'liason', 'libary', 'libary', 'lisence',
    'lisence', 'maintainance', 'maintainence', 'milage', 'millage',
    'millenium', 'millenium', 'mischevious', 'mischievious', 'misile',
    'missile', 'mispell', 'misspell', 'misspelled', 'misspelt',
    'neccessary', 'necesary', 'negotiate', 'negociate', 'neutural',
    'neutral', 'noticable', 'noticeable', 'occassion', 'occassionally',
    'occurance', 'occurrence', 'ocurrence', 'offical', 'official',
    'opionion', 'opinion', 'opponent', 'oponent', 'opportinity',
    'opportunity', 'oppositt', 'oppossum', 'opthamology', 'ophthalmology',
    'orignal', 'original', 'outragous', 'outrageous', 'paralel',
    'parallel', 'parliment', 'parliament', 'pasttime', 'pastime',
    'peice', 'piece', 'perseverence', 'perseverance', 'persuade',
    'persuade', 'phenomenon', 'phenomenon', 'pitfall', 'pitfall',
    'potatoe', 'potato', 'practically', 'practically', 'precede',
    'preceed', 'presense', 'presence', 'prevelant', 'prevalent',
    'priviledge', 'privelege', 'professor', 'professor', 'programing',
    'programming', 'promise', 'promise', 'proffessor', 'professor',
    'pronoounce', 'pronounce', 'pronounciation', 'pronunciation',
    'propostion', 'proposition', 'pubically', 'pubically', 'publicly',
    'publicly', 'pumkin', 'pumpkin', 'purpose', 'purpose', 'pursuade',
    'persuade', 'puting', 'putting', 'quizes', 'quizzes', 'receed',
    'recede', 'reccomend', 'reccommend', 'reccuring', 'recurring',
    'rediculous', 'ridiculous', 'relevent', 'relevant', 'religous',
    'religious', 'repetition', 'repetition', 'restaraunt', 'restaurant',
    'restauranteur', 'restaurateur', 'rigour', 'rigor', 'sacreligious',
    'sacrilegious', 'sandwhich', 'sandwich', 'sargent', 'sergeant',
    'seige', 'siege', 'senseable', 'sensible', 'sentance', 'sentence',
    'seperate', 'separate', 'sieze', 'seize', 'similiar', 'similar',
    'sincerly', 'sincerely', 'skilful', 'skilful', 'skilfully', 'skillfully',
    'sneek', 'sneak', 'solider', 'soldier', 'soveign', 'sovereign',
    'speach', 'speech', 'stoped', 'stopped', 'strenght', 'strength',
    'strenous', 'strenuous', 'stubborness', 'stubbornness', 'substancial',
    'substantial', 'substract', 'subtract', 'succesful', 'successful',
    'succesfully', 'successfully', 'suceed', 'succeed', 'sucess',
    'success', 'sufficient', 'sufficient', 'supercede', 'supersede',
    'supose', 'suppose', 'supposably', 'supposedly', 'sureity',
    'surety', 'suround', 'surround', 'surveillance', 'surveillance',
    'suseptable', 'susceptible', 'suspention', 'suspension', 'tatoo',
    'tattoo', 'temperment', 'temperament', 'temporary', 'temporary',
    'tendancy', 'tendency', 'therfore', 'therefore', 'thier', 'their',
    'threshold', 'threshold', 'tolerence', 'tolerance', 'tommorow',
    'tomorrow', 'tounge', 'tongue', 'truely', 'truly', 'unforetunate',
    'unfortunate', 'untill', 'until', 'unusual', 'unusual', 'upholstry',
    'upholstery', 'usally', 'usually', 'vacume', 'vacuum', 'vegetable',
    'vegetable', 'vegitarian', 'vegetarian', 'vehical', 'vehicle',
    'vigilence', 'vigilance', 'villain', 'villain', 'violence',
    'violence', 'virual', 'virtual', 'visious', 'vicious', 'visiter',
    'visitor', 'volcanoe', 'volcano', 'volume', 'volume', 'writting',
    'writing'
  ];

  let foundErrors = [];
  for (const error of spellingErrors) {
    const regex = new RegExp(`\\b${error}\\b`, 'gi');
    if (regex.test(text)) {
      foundErrors.push(error);
    }
  }

  if (foundErrors.length > 3) {
    score = Math.max(score, 25);
    details.push(`Multiple spelling errors detected (${foundErrors.length}). Professional job postings are proofread.`);
  } else if (foundErrors.length > 0) {
    score = Math.max(score, 10);
    details.push(`Minor spelling issues detected (${foundErrors.length}).`);
  }

  const sentenceLengths = text.split(/[.!?]+/).filter(s => s.trim().length > 0).map(s => s.split(/\s+/).length);
  if (sentenceLengths.length > 0) {
    const avgSentenceLength = sentenceLengths.reduce((a, b) => a + b, 0) / sentenceLengths.length;
    if (avgSentenceLength > 40) {
      score = Math.max(score, 10);
      details.push('Sentences are unusually long, which may indicate poorly written content.');
    }
  }

  if (details.length === 0) {
    details.push('Text quality appears professional with proper grammar and formatting.');
  }

  return { score, details: details.join(' ') };
};

const analyzeUrgency = (jobDescription) => {
  let score = 0;
  let details = '';

  if (!jobDescription || jobDescription.trim() === '') {
    return { score: 0, details: 'No job description to analyze for urgency.' };
  }

  const text = jobDescription.toLowerCase();

  const urgencyPhrases = [
    { pattern: /\burgen?t\b/gi, weight: 20 },
    { pattern: /\bimmediate(ly)?\b/gi, weight: 15 },
    { pattern: /\bhurry\b/gi, weight: 20 },
    { pattern: /\blimited\s+(time|position|seat|slot|spot)/gi, weight: 25 },
    { pattern: /\blast\s+chance\b/gi, weight: 25 },
    { pattern: /\bact\s+now\b/gi, weight: 20 },
    { pattern: /\bdon'?t\s+(miss|delay|wait)\b/gi, weight: 20 },
    { pattern: /\bapply\s+(today|now|immediately|soon)\b/gi, weight: 15 },
    { pattern: /\bfirst\s+(come|serve|basis)/gi, weight: 20 },
    { pattern: /\bonly\s+\d+\s+(day|hour|position|seat|slot)/gi, weight: 25 },
    { pattern: /\bfew\s+(day|hour|position|seat|slot)\s+(left|remain)/gi, weight: 25 },
    { pattern: /\brush\b/gi, weight: 15 },
    { pattern: /\bquick\b/gi, weight: 10 },
    { pattern: /\bfast\b/gi, weight: 10 },
    { pattern: /\bexpress\b/gi, weight: 10 },
    { pattern: /\binstant\b/gi, weight: 15 },
    { pattern: /\bdeadline\b/gi, weight: 10 },
    { pattern: /\bASAP\b/g, weight: 20 },
    { pattern: /\bnow\b/gi, weight: 3 },
    { pattern: /\btoday\b/gi, weight: 3 },
    { pattern: /\bopportunity\s+of\s+a\s+lifetime\b/gi, weight: 25 },
    { pattern: /\bonce\s+in\s+a\s+lifetime\b/gi, weight: 25 }
  ];

  let foundCount = 0;
  let totalUrgencyScore = 0;
  let foundPhrases = [];

  for (const { pattern, weight } of urgencyPhrases) {
    const matches = text.match(pattern);
    if (matches) {
      foundCount += matches.length;
      totalUrgencyScore += weight * matches.length;
      foundPhrases.push(matches[0]);
    }
  }

  if (totalUrgencyScore >= 120) {
    score = 80;
    details = `Extreme urgency pressure detected. Found ${foundCount} urgency indicators (${foundPhrases.slice(0, 5).join(', ')}...). Scammers create false urgency to bypass your critical thinking.`;
  } else if (totalUrgencyScore >= 60) {
    score = 50;
    details = `High urgency pressure detected. Found ${foundCount} urgency indicators. While some urgency is normal, excessive pressure is a scam tactic.`;
  } else if (totalUrgencyScore >= 30) {
    score = 25;
    details = `Moderate urgency detected with ${foundCount} urgency-related phrases. Some legitimate positions may be urgent, but stay cautious.`;
  } else if (foundCount > 0) {
    score = 10;
    details = `Low urgency detected with ${foundCount} urgency-related phrases. This appears normal.`;
  } else {
    details = 'No urgency pressure detected in the job posting.';
  }

  return { score, details };
};

const calculateRiskScore = (allResults) => {
  const weights = {
    keywordAnalysis: 0.40,
    salaryAnalysis: 0.10,
    emailAnalysis: 0.10,
    urlAnalysis: 0.10,
    phoneAnalysis: 0.05,
    companyAnalysis: 0.05,
    textQualityAnalysis: 0.05,
    urgencyAnalysis: 0.15
  };

  let weightedScore = 0;
  let totalWeight = 0;

  for (const [key, weight] of Object.entries(weights)) {
    if (allResults[key] && (allResults[key].score || 0) > 10) {
      weightedScore += (allResults[key].score || 0) * weight;
      totalWeight += weight;
    }
  }

  if (totalWeight === 0) return 0;

  const finalScore = Math.round(weightedScore / totalWeight);

  return Math.min(100, Math.max(0, finalScore));
};

const getRiskLevel = (riskScore) => {
  if (riskScore <= 20) return 'Safe';
  if (riskScore <= 50) return 'Suspicious';
  return 'Scam';
};

const generateExplanation = (allResults, riskLevel, keywordsFound) => {
  const highScoreAreas = [];
  const mediumScoreAreas = [];

  const areaNames = {
    keywordAnalysis: 'Keyword analysis',
    salaryAnalysis: 'Salary analysis',
    emailAnalysis: 'Email analysis',
    urlAnalysis: 'URL analysis',
    phoneAnalysis: 'Phone analysis',
    companyAnalysis: 'Company check',
    textQualityAnalysis: 'Text quality',
    urgencyAnalysis: 'Urgency analysis'
  };

  for (const [key, result] of Object.entries(allResults)) {
    if (result && result.score !== undefined) {
      const name = areaNames[key] || key;
      if (result.score >= 50) {
        highScoreAreas.push(name);
      } else if (result.score >= 20) {
        mediumScoreAreas.push(name);
      }
    }
  }

  let explanation = '';

  if (riskLevel === 'Safe') {
    explanation = 'This job posting appears Safe. Our analysis found no significant scam indicators. ';
    if (highScoreAreas.length === 0 && mediumScoreAreas.length === 0) {
      explanation += 'All checks passed with minimal risk flags. ';
    } else {
      explanation += 'Minor flags were noted but overall risk is low. ';
    }
  } else if (riskLevel === 'Suspicious') {
    explanation = 'This job posting appears Suspicious. We found several concerning indicators that warrant caution. ';
    if (highScoreAreas.length > 0) {
      explanation += `High-risk areas: ${highScoreAreas.join(', ')}. `;
    }
    if (mediumScoreAreas.length > 0) {
      explanation += `Moderate concerns in: ${mediumScoreAreas.join(', ')}. `;
    }
  } else {
    explanation = 'This job posting appears to be a Scam. Multiple strong scam indicators were detected. ';
    explanation += 'We strongly advise against engaging with this posting. ';
    if (highScoreAreas.length > 0) {
      explanation += `Critical risk areas detected: ${highScoreAreas.join(', ')}. `;
    }
    if (mediumScoreAreas.length > 0) {
      explanation += `Additional concerns in: ${mediumScoreAreas.join(', ')}. `;
    }
  }

  const moneyKeywords = keywordsFound.filter(k => k.category === 'money');
  const urgentKeywords = keywordsFound.filter(k => k.category === 'urgency' || k.category === 'pressure');
  const benefitKeywords = keywordsFound.filter(k => k.category === 'fake_benefits' || k.category === 'too_good_true');
  const investKeywords = keywordsFound.filter(k => k.category === 'investment');

  if (moneyKeywords.length > 0) {
    explanation += `This posting asks for money (${moneyKeywords.map(k => k.keyword).join(', ')}), which is a major red flag. Legitimate employers never ask for payments. `;
  }
  if (investKeywords.length > 0) {
    explanation += `Investment/pyramid scheme language detected. This may be an MLM or Ponzi scheme. `;
  }
  if (benefitKeywords.length > 0) {
    explanation += `Unrealistic promises detected (${benefitKeywords.map(k => k.keyword).join(', ')}). If it sounds too good to be true, it probably is. `;
  }
  if (urgentKeywords.length > 0) {
    explanation += `High-pressure urgency tactics detected. Scammers rush you to prevent careful consideration. `;
  }

  const detailSummaries = [];
  for (const [key, result] of Object.entries(allResults)) {
    if (result && result.details && result.score >= 15) {
      detailSummaries.push(result.details);
    }
  }
  if (detailSummaries.length > 0) {
    explanation += detailSummaries.join(' ');
  }

  return explanation;
};

const analyzeJobPosting = async (data) => {
  const toText = (v) => {
    if (v === undefined || v === null) return '';
    return typeof v === 'string' ? v : String(v);
  };

  const {
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
  } = data;

  const keywordResult = analyzeKeywords(toText(jobTitle), toText(jobDescription), skills);
  const salaryResult = analyzeSalary(toText(salary));
  const emailResult = analyzeEmail(toText(recruiterEmail));
  const urlResult = analyzeURL(toText(website), toText(applyLink));
  const phoneResult = analyzePhone(toText(phoneNumber));
  const companyResult = await analyzeCompanyInfo(toText(companyName), toText(location));
  const textQualityResult = analyzeTextQuality(toText(jobDescription));
  const urgencyResult = analyzeUrgency(toText(jobDescription));

  const allResults = {
    keywordAnalysis: keywordResult,
    salaryAnalysis: salaryResult,
    emailAnalysis: emailResult,
    urlAnalysis: urlResult,
    phoneAnalysis: phoneResult,
    companyAnalysis: companyResult,
    textQualityAnalysis: textQualityResult,
    urgencyAnalysis: urgencyResult
  };

  const riskScore = calculateRiskScore(allResults);
  const riskLevel = getRiskLevel(riskScore);

  const keywordsFound = keywordResult.keywordsFound.map(kw => {
    const entry = scamKeywords.find(e => e.keyword === kw);
    if (entry) {
      return { keyword: kw, category: entry.category, severity: entry.severity, points: entry.points };
    }
    return { keyword: kw, category: 'unknown', severity: 1, points: 5 };
  });

  const aiExplanation = generateExplanation(allResults, riskLevel, keywordsFound);

  return {
    riskScore,
    riskLevel,
    aiExplanation,
    keywordsFound,
    details: allResults
  };
};

module.exports = {
  analyzeJobPosting,
  analyzeKeywords,
  analyzeSalary,
  analyzeEmail,
  analyzeURL,
  analyzePhone,
  analyzeCompanyInfo,
  analyzeTextQuality,
  analyzeUrgency,
  calculateRiskScore,
  getRiskLevel,
  generateExplanation
};
