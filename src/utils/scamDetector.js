const SUSPICIOUS_DOMAINS = ['.xyz', '.top', '.gq', '.ml', '.cf', '.tk', '.cam', '.work', '.click', '.link', '.download', '.review', '.stream', '.trade', '.webcam', '.science', '.party', '.racing', '.date', '.faith', '.men', '.loan', '.win', '.bid', '.accountant', '.country', '.mom', '.pro', '.icu', '.live', '.online', '.site', '.club', '.shop', '.info'];
const FREE_EMAIL_DOMAINS = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com', 'mail.com', 'protonmail.com', 'proton.me', 'yandex.com', 'zoho.com', 'gmx.com', 'icloud.com', 'rediffmail.com', 'live.com'];
const URGENCY_WORDS = ['urgent', 'immediate', 'limited seats', 'limited positions', 'hurry', 'apply today', 'last chance', 'only today', 'instant joining', 'join today', 'start today', 'act now', 'hiring immediately'];
const PAYMENT_WORDS = ['registration fee', 'processing fee', 'refundable deposit', 'training fee', 'setup fee', 'activation fee', 'joining fee', 'security deposit', 'application fee', 'laptop fee', 'background verification payment', 'visa processing', 'uniform payment', 'id card payment', 'pay to', 'payment required', 'bank transfer', 'upi payment', 'paytm', 'google pay', 'phone pe', 'gift card', 'crypto payment'];
const RED_FLAG_KEYWORDS = ['registration fee', 'security deposit', 'processing fee', 'investment', 'limited seats', 'guaranteed job', '100% selection', 'earn daily', 'earn instantly', 'crypto payment', 'upi payment', 'gift card', 'telegram', 'whatsapp only', 'urgent hiring', 'instant joining', 'click here now', 'no interview', 'direct joining', 'guaranteed income', 'passive income', 'no experience needed'];
const GREEN_FLAG_KEYWORDS = ['technical interview', 'hr interview', 'career portal', 'equal opportunity employer', 'health insurance', 'paid leave', 'retirement plan', 'official careers page', 'employee referral', 'background check', 'probation period', 'performance review', 'benefits', 'pf', 'esi', 'gratuity', 'bonus', 'stock options'];
const SALARY_SUSPICIOUS_PATTERNS = [
  { min: 100000, role: 'unskilled', label: '₹1,00,000+/month for unskilled role' },
  { min: 70000, role: 'entry', label: '₹70,000+/month for entry-level' },
  { min: 50000, role: 'data_entry', label: '₹50,000+/month for data entry' },
  { min: 200000, role: 'fresher', label: '₹2,00,000+/month for fresher' },
];

function cleanText(text) {
  return (text || '').toLowerCase().replace(/\s+/g, ' ').trim();
}

function extractNumber(value) {
  const match = String(value || '').replace(/,/g, '').match(/(\d+)/);
  return match ? parseInt(match[1], 10) : 0;
}

function hasKeyword(text, keywords) {
  const cleaned = cleanText(text);
  return keywords.filter(kw => cleaned.includes(kw.toLowerCase()));
}

function countMatches(text, patterns) {
  const cleaned = cleanText(text);
  return patterns.filter(p => cleaned.includes(p.toLowerCase())).length;
}

function getDomain(url) {
  try {
    return new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
  } catch {
    return url || '';
  }
}

export function detectScam(formData) {
  const {
    jobTitle, companyName, jobDescription, salary, location,
    jobType, recruiterName, recruiterEmail, phoneNumber,
    website, experienceLevel, applyLink,
  } = formData;

  const desc = cleanText(jobDescription);
  const title = cleanText(jobTitle);
  const company = cleanText(companyName);
  const salaryNum = extractNumber(salary);

  let score = 0;
  let minScore = 0;
  let maxScore = 100;
  const redFlags = [];
  const positiveIndicators = [];
  const findings = [];

  // ========== FACTOR 1: PAYMENT REQUESTS (highest weight) ==========
  const paymentHits = hasKeyword(jobDescription, PAYMENT_WORDS);
  if (paymentHits.length > 0) {
    const basePenalty = Math.min(paymentHits.length * 15, 40);
    score += basePenalty;
    redFlags.push(`Job requires payment: "${paymentHits[0]}" — legitimate employers NEVER ask candidates for money`);
    findings.push({
      category: '💳 Payment Red Flags',
      status: 'scam',
      summary: `Job asks for money: ${paymentHits.join(', ')}`,
      details: [
        `Found payment request keywords: ${paymentHits.join(', ')}`,
        'Legitimate employers NEVER ask candidates to pay for anything',
        'This is the strongest indicator of a job scam',
        'Common scam fees: registration, training, security deposit, visa processing',
      ],
    });
  } else {
    minScore += 5;
    positiveIndicators.push('No payment requested from candidates');
  }

  // ========== FACTOR 2: COMPANY VERIFICATION ==========
  const hasWebsite = !!(website || applyLink);
  const url = website || applyLink || '';

  if (hasWebsite) {
    const domain = getDomain(url);
    const isSuspiciousDomain = SUSPICIOUS_DOMAINS.some(d => domain.includes(d));
    if (isSuspiciousDomain) {
      score += 18;
      redFlags.push(`Suspicious website domain: "${domain}" — scammers commonly use cheap domains like .xyz, .top, .gq`);
      findings.push({
        category: '🌐 Suspicious Website',
        status: 'scam',
        summary: `Suspicious domain "${domain}" detected`,
        details: [
          `Domain: ${domain}`,
          'Cheap/untrusted domain extensions are commonly used by scammers',
          'Legitimate companies use professional domains (.com, .in, .org, .co.in)',
          'Always verify the website looks professional with contact pages',
        ],
      });
    } else {
      minScore += 10;
      positiveIndicators.push(`Professional website domain: ${domain}`);
    }

    if (!website && applyLink) {
      score += 5;
      redFlags.push('Only an apply link provided, no official company website');
    }
  } else {
    score += 12;
    redFlags.push('No company website provided — legitimate companies always have a verifiable web presence');
    findings.push({
      category: '🔗 No Company Website',
      status: 'suspicious',
      summary: 'No company website or apply link provided',
      details: [
        'Legitimate companies ALWAYS have an official website',
        'Scammers avoid providing websites to stay anonymous',
        'Try searching for the company name online to verify',
      ],
    });
  }

  // ========== FACTOR 3: RECRUITER EMAIL ==========
  if (recruiterEmail) {
    const domain = recruiterEmail.split('@')[1]?.toLowerCase();
    if (domain && FREE_EMAIL_DOMAINS.includes(domain)) {
      score += 15;
      redFlags.push(`Recruiter uses free email (${domain}) instead of company domain — major red flag for hiring`);
      findings.push({
        category: '📧 Suspicious Recruiter Email',
        status: 'scam',
        summary: `Using free email (${domain}) instead of company domain`,
        details: [
          `Email: ${recruiterEmail}`,
          'Legitimate companies use their own domain (e.g., hr@company.com) for recruitment',
          'Free email for hiring is one of the most common scam indicators',
          `If the company is real, they would use @${companyName.replace(/\s/g, '')}.com`,
        ],
      });
    } else if (domain) {
      minScore += 8;
      positiveIndicators.push(`Official company email domain: ${domain}`);
    }
  } else {
    score += 4;
    redFlags.push('No recruiter email provided — legitimate recruiters always provide contact email');
  }

  // ========== FACTOR 4: SALARY ANALYSIS ==========
  if (salaryNum > 0) {
    let salaryFlagged = false;
    for (const pattern of SALARY_SUSPICIOUS_PATTERNS) {
      if (salaryNum >= pattern.min) {
        if (pattern.role === 'data_entry' && (title.includes('data entry') || desc.includes('data entry'))) {
          score += 20;
          salaryFlagged = true;
          redFlags.push(`₹${salaryNum.toLocaleString('en-IN')}/month for data entry is unrealistic — real range is ₹10K-₹25K/month`);
          findings.push({
            category: '💰 Unrealistic Salary',
            status: 'scam',
            summary: `₹${salaryNum.toLocaleString('en-IN')}/month for data entry is unrealistic`,
            details: [
              `Offered: ₹${salaryNum.toLocaleString('en-IN')}/month`,
              'Real data entry salary range: ₹10,000 - ₹25,000/month',
              'Extremely high pay for minimal skill work is a classic scam tactic',
            ],
          });
          break;
        }
        if (pattern.role === 'entry' && (experienceLevel === 'Entry' || experienceLevel === 'Fresher' || desc.includes('no experience') || desc.includes('fresher'))) {
          score += 18;
          salaryFlagged = true;
          redFlags.push(`₹${salaryNum.toLocaleString('en-IN')}/month for entry-level is unrealistic`);
          findings.push({
            category: '💰 Unrealistic Salary',
            status: 'scam',
            summary: `₹${salaryNum.toLocaleString('en-IN')}/month for entry-level is unrealistic`,
            details: [
              `Offered: ₹${salaryNum.toLocaleString('en-IN')}/month`,
              'Entry-level positions rarely pay this much',
              'Scammers use unrealistically high salaries to lure job seekers',
            ],
          });
          break;
        }
      }
    }
    if (!salaryFlagged) {
      if (salaryNum > 0 && salaryNum < 50000) {
        minScore += 8;
        positiveIndicators.push('Salary range appears reasonable for the role');
      }
    }
  }

  // ========== FACTOR 5: JOB DESCRIPTION QUALITY ==========
  const descLength = (jobDescription || '').length;
  if (descLength < 100) {
    score += 8;
    redFlags.push('Job description is very short (' + descLength + ' chars) — legitimate postings include detailed responsibilities');
    findings.push({
      category: '📝 Vague Job Description',
      status: 'suspicious',
      summary: 'Job description is too short or lacks detail',
      details: [
        'Legitimate job postings include detailed responsibilities and requirements',
        'Short/vague descriptions are common in mass-scale scam postings',
        'Scammers avoid detail to keep postings generic and reusable',
      ],
    });
  } else {
    minScore += 5;
    positiveIndicators.push('Job description provides adequate detail');
  }

  // Check for professional language markers
  const professionalMarkers = hasKeyword(jobDescription, ['responsibilities', 'qualifications', 'requirements', 'skills required', 'role description', 'about the role', 'key skills', 'what we offer']);
  if (professionalMarkers.length >= 2) {
    minScore += 5;
    positiveIndicators.push('Professional job posting structure with clear sections');
  }

  // ========== FACTOR 6: INTERVIEW PROCESS ==========
  const interviewKeywords = hasKeyword(jobDescription, ['technical interview', 'hr interview', 'online assessment', 'interview round', 'coding test', 'aptitude test', 'telephonic interview', 'video interview', 'face to face interview']);
  const noInterviewKeywords = hasKeyword(jobDescription, ['no interview', 'direct joining', 'no interview required', 'immediate joining without interview', 'guaranteed selection', '100% selection', 'offer before interview']);

  if (noInterviewKeywords.length > 0) {
    score += 14;
    redFlags.push(`No interview required ("${noInterviewKeywords[0]}") — legitimate companies always interview candidates`);
    findings.push({
      category: '🎯 No Interview Required',
      status: 'scam',
      summary: 'Job claims no interview is needed',
      details: [
        'Legitimate companies ALWAYS interview candidates before hiring',
        'Skipping interviews is a major red flag',
        'Scammers avoid interviews to stay anonymous and rush you into payment',
      ],
    });
  }

  if (interviewKeywords.length > 0) {
    minScore += 8;
    positiveIndicators.push(`Structured interview process mentioned (${interviewKeywords[0]})`);
  }

  // ========== FACTOR 7: COMMUNICATION CHANNELS ==========
  const commKeywords = hasKeyword(jobDescription, ['whatsapp only', 'telegram only', 'signal', 'whatsapp group', 'telegram group', 'contact on whatsapp', 'contact on telegram']);
  if (commKeywords.length > 0) {
    score += 12;
    redFlags.push('Communication only through WhatsApp/Telegram — unprofessional and untraceable');
    findings.push({
      category: '📱 Suspicious Communication',
      status: 'scam',
      summary: 'Uses WhatsApp/Telegram as primary communication',
      details: [
        `Found: ${commKeywords.join(', ')}`,
        'Professional recruiters use email and official channels',
        'WhatsApp/Telegram-only communication is common in scams',
        'These platforms are used because they are hard to trace',
      ],
    });
  }

  // ========== FACTOR 8: URGENCY TACTICS ==========
  const urgencyHits = hasKeyword(jobDescription, URGENCY_WORDS);
  if (urgencyHits.length > 0) {
    const penalty = Math.min(urgencyHits.length * 4, 12);
    score += penalty;
    redFlags.push(`Urgency tactics used: "${urgencyHits.join(', ')}" — scammers rush you to skip careful thinking`);
    findings.push({
      category: '⏳ Urgency & Pressure Tactics',
      status: 'suspicious',
      summary: `Uses pressure tactics: ${urgencyHits.join(', ')}`,
      details: [
        `Urgency keywords found: ${urgencyHits.join(', ')}`,
        'Scammers create false urgency to prevent critical thinking',
        'Phrases like "limited seats" and "hurry" are designed to rush you',
        'Legitimate companies give you time to evaluate the opportunity',
      ],
    });
  }

  // ========== FACTOR 9: WORK CONDITIONS ==========
  const easyWorkKeywords = hasKeyword(jobDescription, ['1 hour', '2-3 hours', 'work only', 'few hours', 'no work', 'earn while sleeping', 'passive income', 'work from home easy', 'no skills needed', 'anyone can do', 'work from mobile']);
  if (easyWorkKeywords.length > 0) {
    if (salaryNum > 30000) {
      score += 12;
      redFlags.push(`Claims "${easyWorkKeywords[0]}" but pays ₹${salaryNum.toLocaleString('en-IN')}+ — unrealistic work-to-pay ratio`);
      findings.push({
        category: '⏰ Suspicious Work Conditions',
        status: 'suspicious',
        summary: `Claims minimal work (${easyWorkKeywords[0]}) for high salary`,
        details: [
          `${easyWorkKeywords[0]} with ₹${salaryNum.toLocaleString('en-IN')}/month is not realistic`,
          'Legitimate jobs require standard working hours',
          'Scammers use "easy money" promises to lure victims',
        ],
      });
    } else {
      score += 6;
      findings.push({
        category: '⏰ Suspicious Work Conditions',
        status: 'suspicious',
        summary: `Claims "${easyWorkKeywords[0]}"`,
        details: ['Be cautious of jobs promising very easy work for good pay'],
      });
    }
  }

  // ========== FACTOR 10: NO EXPERIENCE REQUIRED ==========
  const noExpKeywords = hasKeyword(jobDescription, ['no experience', 'fresher', 'any graduate', 'any qualification', 'no qualification', 'no skills', 'anyone can apply', 'education not required']);
  if (noExpKeywords.length > 1 && salaryNum > 30000) {
    score += 8;
    redFlags.push('No experience/skills required but high salary offered — scammers target freshers');
    if (!findings.find(f => f.category.includes('Suspicious Work Conditions'))) {
      findings.push({
        category: '📋 No Experience Required',
        status: 'suspicious',
        summary: 'No experience required combined with high salary',
        details: [
          'Jobs requiring no experience typically pay entry-level wages',
          'High salary with no experience required is a common scam tactic',
          'Scammers specifically target freshers and unemployed individuals',
        ],
      });
    }
  } else if (noExpKeywords.length > 0) {
    findings.push({
      category: '📋 Entry Level Position',
      status: 'safe',
      summary: 'Job accepts candidates with no experience',
      details: ['Entry-level positions exist — but verify the salary is realistic for the role'],
    });
  }

  // ========== FACTOR 11: GUARANTEED PAYMENTS ==========
  const guaranteedPayKeywords = hasKeyword(jobDescription, ['weekly salary', 'weekly payment', 'weekly payout', 'guaranteed salary', 'guaranteed income', 'daily payment', 'instant payment', 'earn daily', 'earn instantly', 'daily payout', 'same day payment']);
  if (guaranteedPayKeywords.length > 0) {
    score += 7;
    redFlags.push(`Promises "${guaranteedPayKeywords[0]}" — guaranteed payments are uncommon in legitimate employment`);
    findings.push({
      category: '💵 Guaranteed/Instant Payment Promises',
      status: 'suspicious',
      summary: `Promises ${guaranteedPayKeywords[0]}`,
      details: [
        'Most legitimate companies pay monthly salaries',
        'Weekly/daily payment promises are used to build false trust',
        'Scammers use this to make the offer seem more attractive',
      ],
    });
  }

  // ========== FACTOR 12: GRAMMAR & LANGUAGE ==========
  const exclaimCount = (jobDescription.match(/!/g) || []).length;
  const capsWords = (jobDescription.match(/\b[A-Z]{4,}\b/g) || []).length;
  const emojiCount = (jobDescription.match(/[\u{1F600}-\u{1F6FF}\u{2600}-\u{26FF}]/gu) || []).length;
  const spellingIssues = countMatches(jobDescription, ['guranteed', 'salery', 'opertunity', 'immediate', 'comission', 'recieve', 'benifits', 'wokring', 'experiance']);

  let langIssues = 0;
  if (exclaimCount > 3) langIssues++;
  if (capsWords > 8) langIssues++;
  if (emojiCount > 3) langIssues++;
  if (spellingIssues > 0) langIssues++;

  if (langIssues >= 2) {
    score += 6;
    redFlags.push('Poor grammar/spelling or excessive CAPS/emojis — unprofessional posting');
    findings.push({
      category: '📢 Unprofessional Language',
      status: 'suspicious',
      summary: 'Poor grammar, excessive CAPS, or too many emojis',
      details: [
        'Professional job postings maintain professional language',
        'Scammers often use poor grammar to evade spam filters',
        'Excessive CAPS and emojis are unprofessional',
      ],
    });
  }

  // ========== FACTOR 13: RED FLAG & GREEN FLAG KEYWORDS ==========
  const redFlagHits = hasKeyword(jobDescription, RED_FLAG_KEYWORDS);
  if (redFlagHits.length > 0) {
    const rfScore = Math.min(redFlagHits.length * 3, 10);
    score += rfScore;
    redFlags.push(`Red flag keywords found: "${redFlagHits.slice(0, 3).join(', ')}"`);
  }

  const greenFlagHits = hasKeyword(jobDescription, GREEN_FLAG_KEYWORDS);
  if (greenFlagHits.length > 0) {
    const gfScore = Math.min(greenFlagHits.length * 3, 15);
    minScore += gfScore;
    positiveIndicators.push(`Green flags found: ${greenFlagHits.slice(0, 3).join(', ')}`);
  }

  // ========== FINAL SCORE CALCULATION ==========
  let finalScore = Math.min(Math.max(score - minScore, 0), 100);
  if (finalScore === 0 && positiveIndicators.length > 3) finalScore = 5;
  if (paymentHits.length > 0) finalScore = Math.max(finalScore, 70);

  let riskLevel, verdict;
  if (finalScore <= 20) {
    riskLevel = 'Safe';
    verdict = 'Likely Legitimate';
  } else if (finalScore <= 40) {
    riskLevel = 'Suspicious';
    verdict = 'Suspicious';
  } else if (finalScore <= 60) {
    riskLevel = 'Suspicious';
    verdict = 'Suspicious';
  } else if (finalScore <= 80) {
    riskLevel = 'Scam';
    verdict = 'Likely Scam';
  } else {
    riskLevel = 'Scam';
    verdict = 'Likely Scam';
  }

  let riskLabel;
  if (finalScore <= 20) riskLabel = 'Safe';
  else if (finalScore <= 40) riskLabel = 'Low Risk';
  else if (finalScore <= 60) riskLabel = 'Medium Risk';
  else if (finalScore <= 80) riskLabel = 'High Risk';
  else riskLabel = 'Very High Risk';

  const flagCount = redFlags.length;

  let summary;
  if (finalScore >= 70) {
    summary = `This job posting shows ${flagCount} strong scam indicators. The combination of ${paymentHits.length > 0 ? 'payment requests, ' : ''}${recruiterEmail && FREE_EMAIL_DOMAINS.includes(recruiterEmail.split('@')[1]) ? 'free email, ' : ''}${salaryNum > 50000 ? 'unrealistic salary, ' : ''}and other red flags strongly suggests this is a scam.`;
  } else if (finalScore >= 40) {
    summary = `This job has ${flagCount} suspicious indicators. While not definitively a scam, there are enough concerns to warrant caution.`;
  } else {
    summary = `This job posting appears legitimate with ${positiveIndicators.length} positive indicators and only ${flagCount} minor concerns.`;
  }

  const recommendation = finalScore >= 60
    ? '🚨 AVOID. We strongly recommend NOT applying to this job. The risk indicators are too numerous and severe. Report this posting to help protect others.'
    : finalScore >= 40
    ? '⚠️ PROCEED WITH CAUTION. Verify the company independently. Search for reviews, check their official website, and never send money. If anything feels off, trust your instinct.'
    : '✅ SAFE TO PROCEED. The job posting appears legitimate. However, always stay vigilant — never share sensitive personal information or send money to any employer.';

  const analysis = findings.length > 0 ? findings : [{ category: '✅ All Clear', status: 'safe', summary: 'No major red flags detected', details: ['This job posting appears legitimate based on our analysis'] }];

  return {
    riskScore: finalScore,
    riskLevel,
    riskLabel,
    verdict,
    summary,
    explanation: summary,
    analysis,
    positiveIndicators,
    redFlags,
    recommendation,
    confidence: Math.min(70 + flagCount * 3, 98),
    flagsDetected: flagCount,
    totalChecks: 13,
    companyName,
    jobTitle,
  };
}
