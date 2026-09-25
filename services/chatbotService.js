const scamKeywords = require('../keywords/scamKeywords.json');

const QUICK_RESPONSES = {
  greetings: {
    patterns: [/^(hi|hello|hey|howdy|sup|yo|good\s*(morning|afternoon|evening))/i, /^hi\b/i, /^namaste/i, /^(hola|namaskar|vanakkam)/i],
    responses: [
      "Hello! I'm JobShield AI Assistant. I help you identify job scams and stay safe during your job search. How can I help you today?",
      "Hey there! Welcome to JobShield. I'm here to help you spot job scams and protect yourself. What would you like to know?",
      "Hi! I'm your JobShield AI assistant. Ask me anything about detecting job scams, verifying companies, or staying safe while job hunting!"
    ]
  },
  howToScan: {
    patterns: [/how\s*(do\s*i|to|can\s*i)\s*scan/i, /scan\s*(a\s*)?job/i, /check\s*(a\s*)?job/i, /analyze\s*(a\s*)?job/i, /use\s*(the\s*)?scanner/i, /how.*(detect|identify|spot).*(scam|fraud)/i],
    responses: [
      "To scan a job posting:\n\n1. Go to the **Scanner** page\n2. Paste the full job description\n3. Enter the company name, salary, and other details (or upload a screenshot for OCR)\n4. Click **Analyze**\n\nOur AI will check for scam keywords, suspicious salaries, fake emails, URL red flags, urgency pressure, and more. You'll get a risk score from 0-100 with a detailed explanation!"
    ]
  },
  scamSigns: {
    patterns: [/signs?\s*(of|that)\s*(a\s*)?scam/i, /red\s*flag/i, /warning\s*sign/i, /how\s*(to|do)\s*(i|we)\s*know/i, /is\s*it\s*a\s*scam/i, /what.*(look|recognis|recogniz).*(scam|fake)/i, /scam.*(detect|find|know).*how/i, /fake.*job.*how/i, /fraud.*(sign|indicator)/i, /looks?\s*(like\s*a\s*)?(scam|fake|luring|crook)/i, /this\s*(is|looks)\s*(a\s*)?(scam|fraud)/i],
    responses: [
      "Common signs of a job scam:\n\n🚩 **Asks for money** - Registration fees, training fees, security deposits\n🚩 **Unrealistic salary** - ₹50K+/month for data entry, way above market rate\n🚩 **Free email recruiter** - Using Gmail/Yahoo instead of a company email\n🚩 **Urgency pressure** - 'Apply NOW!', 'Limited seats!', 'Last chance!'\n🚩 **No interview** - Instant hiring without a proper process\n🚩 **Vague company info** - Generic name, no website, no office address\n🚩 **WhatsApp/Telegram only** - Legitimate companies use professional channels\n🚩 **Too good to be true** - 'Guaranteed job!', 'Earn daily!', '100% selection!'\n\nUse our Scanner tool to automatically detect these red flags!"
    ]
  },
  phishing: {
    patterns: [/phish/i, /fake\s*(link|website|url|page)/i, /malicious\s*link/i, /doubtful\s*link/i, /url\s*(safe|check|suspect)/i, /clicking.*link/i, /suspicious\s*link/i],
    responses: [
      "Phishing is when scammers send fake links or websites that look real to steal your data. To stay safe:\n\n🔗 **Check the URL** - Look for typos: 'amaz0n.com', 'g00gle.com', 'jobss.com'\n🔒 **Check for HTTPS** - But remember, a padlock alone doesn't mean it's safe\n📧 **Verify the sender** - Official emails come from the company domain\n🚫 **Don't click blindly** - Hover/scan the link before opening\n\nOur app has a **URL Scanner** that checks links for phishing patterns. You can also paste a link here and I can check it!"
    ]
  },
  freeEmail: {
    patterns: [/free\s*email/i, /gmail\s*recruiter/i, /yahoo\s*mail/i, /personal\s*email/i, /email\s*(suspicious|legit|safe|check)/i, /recruiter\s*email/i, /email.*(red.?flag|scam)/i],
    responses: [
      "Using a free email (Gmail, Yahoo, Outlook) for recruitment is a **medium-risk red flag**. Legitimate companies use corporate emails (e.g., hr@company.com).\n\nHowever, some startups or small companies may use Gmail initially. Consider:\n- Is the company well-known and verified?\n- Does the email domain match their website?\n- Are they asking for fees or sensitive info?\n\nOur Email Analyzer can help you check suspicious recruiter emails!"
    ]
  },
  salaryScam: {
    patterns: [/salary\s*scam/i, /high\s*salary/i, /unrealistic\s*pay/i, /too\s*good\s*(pay|salary|offer)/i, /earn.*month/i, /(salary|pay|wage).*(scam|suspicious|fake)/i, /is\s*.*salary.*(real|good|normal)/i, /salary.*(check|verify)/i],
    responses: [
      "Unrealistically high salaries are a major scam indicator. Red flags include:\n\n- ₹50,000+/month for data entry or unskilled work\n- ₹1-2 Lakh+/month for fresher positions\n- 'Unlimited earning potential'\n- Salary way above industry average for the role\n\nLegitimate salaries are based on experience, skills, and market rates. If it sounds too good to be true, it probably is!\n\nUse our **Salary Analyzer** tool to check if a salary is suspicious for the given role."
    ]
  },
  companyVerification: {
    patterns: [/verify\s*(a\s*)?company/i, /is\s*(this\s*)?company\s*(legit|real|scam|safe|fake|genuine)/i, /company\s*(verification|check|legit|registered)/i, /how\s*to\s*check\s*company/i, /check\s*(if\s*)?company/i, /company.*(genuine|authentic)/i, /verify.*(employer|recruiter|firm)/i],
    responses: [
      "To verify a company:\n\n1. Go to **Company Verification** page\n2. Enter the company name\n3. Check if they're in our verified database\n\nYou can also:\n- Search on LinkedIn, Glassdoor, Google\n- Check their official website (not just a landing page)\n- Look for a physical office address\n- Verify registration on government business portals\n- Read employee reviews on job sites\n\nIf the company isn't in our database, it doesn't mean it's a scam, but exercise extra caution!"
    ]
  },
  interview: {
    patterns: [/interview/i, /video.?call\s*fee/i, /interview.*(fee|payment|charge|cost|money)/i, /skype.?interview/i, /telegram.?interview/i, /no\s*interview/i],
    responses: [
      "A few interview-related scam red flags:\n\n❌ **Paid interviews** - Real companies NEVER charge you to attend an interview\n❌ **Interviews only on Telegram/WhatsApp** - Legit firms use proper video tools (Zoom, Teams, Meets)\n❌ **'Skip interview, pay processing fee'** - A classic scam → you'll never be hired\n✅ A legitimate company first screens you on official channels and never asks for money\n\nIf anyone asks for payment for an interview, walk away - it's a scam."
    ]
  },
  workFromHome: {
    patterns: [/work.?from.?home/i, /remote\s*job/i, /online\s*job/i, /data.?entry.*(home|online)/i, /part.?time.*home/i, /home.?based/i, /earn.*online/i, /online.*earning/i],
    responses: [
      "Work-From-Home / online job offers are often used for scams. Watch for:\n\n💻 **'Earn ₹50K/month from home'** for simple typing - unrealistic\n💸 **Deposit/security money** for 'kits' or 'materials' - scam\n🎯 **Task-based scams** - 'Do 50 tasks, then withdraw' leads nowhere\n📱 **Join a Telegram group first** - scammers lure you there\n\nA genuine remote job has a normal process: application, interview, offer letter. Never pay to 'get started'."
    ]
  },
  registrationFee: {
    patterns: [/registration\s*fee/i, /fee.*(processing|registration|registration)/i, /pay.*(before|first|advance|confirm)/i, /money.*(deposit|advance|token)/i, /(charge|cost).*for.*(job|work|joining)/i, /(pay|send|transfer).*money/i, /ask.*(money|fee|payment|rs|rupees)/i, /security.*(deposit|amount)/i, /training.*fee/i],
    responses: [
      "⚠️ **Never pay for a job. EVER.**\n\nLegitimate employers NEVER ask for:\n- Registration fees\n- Training/processing fees\n- Security deposits\n- 'Documentation' charges\n- Advance for 'kits'\n\nIf a \"recruiter\" asks you to pay money (UPI, bank transfer, gift cards) before you join, it is a **scam** - you will lose the money and get no job.\n\nReport such postings in JobShield so others are protected!"
    ]
  },
  whoCalled: {
    patterns: [/got\s*(a\s*)?call/i, /call.*(number|suspicious|unknown|spam)/i, /unknown\s*(call|number)/i, /hr\s*called/i, /someone\s*called/i, /whatsapp.*(message|call|chat)?/i, /telegram.*(group|message)/i],
    responses: [
      "Got a call or WhatsApp message about a job? Stay sharp:\n\n📵 **No official company number** (private/personal number) → caution\n📞 Ask for their **official email and website** live\n🚫 If they bring up **fees or deposits** on the call → hang up, it's a scam\n🧾 Note exact details and **run a scan** on any 'offer' they describe\n\nScammers often recruit via WhatsApp, Telegram, and personal numbers because they're anonymous. Verify through official channels before doing anything."
    ]
  },
  whatsNext: {
    patterns: [/what\s*can\s*i\s*do/i, /what\s*should\s*i\s*do/i, /help\s*me/i, /what\s*now/i, /i\s*(found|got|received)\s*a\s*scam/i, /i\s*was\s*(scammed|cheated|lured|trapped)/i, /i\s*paid/i, /report.*scam/i, /report.*job/i, /file.*report/i, /community.*report/i, /how.*report/i],
    responses: [
      "If you've encountered a suspicious job posting:\n\n1. **Don't pay any money** - Never pay registration, training, or processing fees\n2. **Don't share personal info** - Avoid sharing bank details, Aadhaar, PAN before joining\n3. **Report it** - Use our Community Reports to warn others (settings → Reports)\n4. **Save the evidence** - Screenshot the posting, save emails\n5. **Verify independently** - Check the company through official channels\n6. **Spread awareness** - Tell friends and family about the scam\n\nIf you already sent money, contact your bank immediately and file a cyber-crime complaint. Would you like to file a community report?"
    ]
  },
  requestMoneyScam: {
    patterns: [/\b(send\s*money)\b/i, /\bmoney\s*before\b/i, /\b(upi|gpay|phonepe|paytm)\b.*\b(job|salary|deposit)\b/i, /\b(registration|activation|bond)\b/i],
    responses: [
      "🚨 **STOP - this is a serious scam warning.**\n\nReal employers NEVER ask you to send money, activate a 'joining card', deposit a 'refundable amount', or pay a 'bond' before you start work. Once you send money there is no legitimate job - you will be blocked.\n\nAction: don't pay, save all screenshots, and report it inside JobShield to warn others."
    ]
  },
  keyboardShortcuts: {
    patterns: [/feature/i, /what\s*(can|do)\s*(you|this)\s*do/i, /help\s*menu/i, /capabilities/i, /menu/i, /options/i],
    responses: [
      "Here's what JobShield can do:\n\n🔍 **Job Scanner** - Analyze job descriptions for scam patterns\n📧 **Email Analyzer** - Check if a recruiter email is suspicious\n💰 **Salary Analyzer** - Verify if a salary is realistic\n🔗 **URL Scanner** - Check job posting links for phishing\n🏢 **Company Verifier** - Look up company legitimacy\n📱 **Screenshot OCR** - Extract text from job posting screenshots\n⚠️ **Real-time Warnings** - Get alerts about new scam patterns\n💬 **AI Chatbot** - Ask me anything about job scams (that's me!)\n📝 **Reviews & Comments** - Share your experiences\n📊 **Dashboard** - Track your scan history and statistics\n\nTry asking: 'How to scan a job?', 'Signs of a scam', 'Check a company', 'Report a scam'."
    ]
  }
};

const KEYWORD_RESPONSES = {};

for (const entry of scamKeywords) {
  KEYWORD_RESPONSES[entry.keyword.toLowerCase()] = entry;
}

function getKeywordInfo(keyword) {
  const entry = KEYWORD_RESPONSES[keyword.toLowerCase()];
  if (!entry) return null;

  const severityLabel = entry.severity >= 4 ? 'Critical' : entry.severity >= 3 ? 'High' : entry.severity >= 2 ? 'Medium' : 'Low';

  return {
    keyword: entry.keyword,
    category: entry.category,
    severity: severityLabel,
    points: entry.points,
    description: entry.description || `The keyword "${entry.keyword}" is commonly found in job scam postings (${entry.category} category).`
  };
}

function looksLikeJobText(msg) {
  const sentenceCount = (msg.match(/\./g) || []).length;
  const wordCount = msg.trim().split(/\s+/).length;
  return wordCount >= 8 && sentenceCount >= 1;
}

function buildRiskSummary(foundKeywords) {
  let totalPoints = 0;
  const seen = new Set();
  for (const entry of foundKeywords) {
    if (!seen.has(entry.keyword.toLowerCase())) {
      totalPoints += entry.points || 0;
      seen.add(entry.keyword.toLowerCase());
    }
  }
  let level = 'Safe';
  if (totalPoints >= 50) level = 'Scam';
  else if (totalPoints >= 20) level = 'Suspicious';
  return { totalPoints, level, count: seen.size };
}

function generateResponse(userMessage) {
  const msg = userMessage.toLowerCase().trim();

  for (const [key, config] of Object.entries(QUICK_RESPONSES)) {
    for (const pattern of config.patterns) {
      if (pattern.test(msg)) {
        return config.responses[Math.floor(Math.random() * config.responses.length)];
      }
    }
  }

  const foundKeywords = [];
  for (const entry of scamKeywords) {
    if (msg.includes(entry.keyword.toLowerCase())) {
      foundKeywords.push(entry);
    }
  }

  if (looksLikeJobText(msg) && foundKeywords.length > 0) {
    const summary = buildRiskSummary(foundKeywords);
    const topKws = foundKeywords.slice(0, 5).map((e) => `- **"${e.keyword}"** (${e.category}, ${e.points} pts)`).join('\n');
    const vibe = summary.level === 'Scam' ? '🚨 **This posting looks like a SCAM.**' : summary.level === 'Suspicious' ? '⚠️ **This posting is SUSPICIOUS.**' : '✅ This posting appears relatively safe.';
    return `I checked the text you pasted. ${vibe}\n\nEstimated risk: **${summary.totalPoints}/100** (${summary.level})\n\nSignals found (${summary.count}):\n${topKws}\n\nFor a complete analysis, run it through the **Scanner** for a detailed report.`
  }

  if (foundKeywords.length > 0) {
    const kw = foundKeywords[0];
    const info = getKeywordInfo(kw.keyword);
    if (info) {
      return `**"${kw.keyword}"** is a known scam indicator.\n\n📊 Category: ${info.category}\n⚠️ Severity: ${info.severity}\n🎯 Risk Points: ${info.points}\n\n💡 ${info.description}\n\nThis keyword is commonly used in fraudulent job postings to deceive job seekers. Always verify the company independently before proceeding.`;
    }
  }

  if (/\b(thank|thanks|thx|ty)\b/i.test(msg)) {
    return "You're welcome! Stay safe in your job search. Remember: never pay money for a job, always verify companies, and trust your instincts. If something feels off, scan it with JobShield! 🛡️";
  }

  if (/\b(bye|goodbye|see you|later|cya)\b/i.test(msg)) {
    return "Goodbye! Stay safe and remember to always verify job postings before applying. Come back anytime you need help! 🛡️";
  }

  if (/\b(safe|security|protect|privacy)\b.*\b(tips?|advice|how)\b/i.test(msg) || /\bhow\b.*\b(protect|stay safe|safe)\b/i.test(msg)) {
    return "Here are key safety tips for job seekers:\n\n1. **Never pay upfront** - Legitimate employers don't charge fees\n2. **Verify the company** - Search LinkedIn, Google, Glassdoor\n3. **Check email domains** - Corporate emails > Gmail/Yahoo\n4. **Don't rush** - Urgency is a scam tactic\n5. **Research salary** - Know market rates for your role\n6. **Protect personal data** - Don't share bank/Aadhaar/PAN early\n7. **Trust your gut** - If it seems too good to be true, it is\n8. **Use JobShield** - Scan every job before applying!\n\nWould you like more details on any of these?";
  }

  if (/\b(salary|pay|compensation|earning|income|salary)\b/i.test(msg)) {
    return "I can help with salary-related questions!\n\nUse our **Salary Analyzer** tool to check if a salary is realistic for the role. Common salary scam signs:\n- ₹50K+/month for data entry\n- 'Unlimited earning potential'\n- Salary significantly above market rate\n- Vague 'performance-based' pay\n\nWant me to analyze a specific salary offer? Just paste the details!";
  }

  if (/\b(company|employer|organization|firm|startup|agency)\b/i.test(msg)) {
    return "For company verification, I recommend:\n\n1. Use our **Company Verifier** tool in the app\n2. Search on LinkedIn for employee profiles\n3. Check Glassdoor/Indeed for reviews\n4. Verify on government business registration portals\n5. Look for a proper website (not just a landing page)\n6. Check for a physical office address on Google Maps\n\nWould you like to verify a specific company?";
  }

  return "I'm here to help with job-scam safety! I can:\n\n- 🔍 **How to scan a job** - Learn to use our scanner\n- 🚩 **Scam signs** - Common red flags in job postings\n- 📧 **Email safety** - Checking recruiter emails\n- 💰 **Salary checks** - Verifying pay offers\n- 🏢 **Company verification** - Researching employers\n- 🛡️ **Safety tips** - Protecting yourself while job hunting\n- 📝 **Reporting scams** - How to report suspicious postings\n\nOr you can **paste a full job description** here and I'll spot the red flags instantly! Which would you like?"
}

module.exports = { generateResponse, getKeywordInfo };