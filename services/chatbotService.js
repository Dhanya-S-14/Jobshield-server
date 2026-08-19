const scamKeywords = require('../keywords/scamKeywords.json');

const QUICK_RESPONSES = {
  greetings: {
    patterns: [/^(hi|hello|hey|howdy|sup|yo|good\s*(morning|afternoon|evening))/i, /^hi\b/i],
    responses: [
      "Hello! I'm JobShield AI Assistant. I help you identify job scams and stay safe during your job search. How can I help you today?",
      "Hey there! Welcome to JobShield. I'm here to help you spot job scams and protect yourself. What would you like to know?",
      "Hi! I'm your JobShield AI assistant. Ask me anything about detecting job scams, verifying companies, or staying safe while job hunting!"
    ]
  },
  howToScan: {
    patterns: [/how\s*(do\s*i|to|can\s*i)\s*scan/i, /scan\s*(a\s*)?job/i, /check\s*(a\s*)?job/i, /analyze\s*(a\s*)?job/i],
    responses: [
      "To scan a job posting:\n\n1. Go to the **Scanner** page\n2. Paste the full job description\n3. Enter the company name, salary, and other details (or upload a screenshot for OCR)\n4. Click **Analyze**\n\nOur AI will check for scam keywords, suspicious salaries, fake emails, URL red flags, urgency pressure, and more. You'll get a risk score from 0-100 with a detailed explanation!"
    ]
  },
  scamSigns: {
    patterns: [/signs?\s*(of|that)\s*(a\s*)?scam/i, /red\s*flag/i, /warning\s*sign/i, /how\s*(to|do)\s*(i|we)\s*know/i, /is\s*it\s*a\s*scam/i],
    responses: [
      "Common signs of a job scam:\n\n🚩 **Asks for money** - Registration fees, training fees, security deposits\n🚩 **Unrealistic salary** - ₹50K+/month for data entry, way above market rate\n🚩 **Free email recruiter** - Using Gmail/Yahoo instead of company email\n🚩 **Urgency pressure** - 'Apply NOW!', 'Limited seats!', 'Last chance!'\n🚩 **No interview** - Instant hiring without proper process\n🚩 **Vague company info** - Generic name, no website, no office address\n🚩 **WhatsApp/Telegram only** - Legitimate companies use professional channels\n🚩 **Too good to be true** - 'Guaranteed job!', 'Earn daily!', '100% selection!'\n\nUse our Scanner tool to automatically detect these red flags!"
    ]
  },
  freeEmail: {
    patterns: [/free\s*email/i, /gmail\s*recruiter/i, /yahoo\s*mail/i, /personal\s*email/i, /email\s*(suspicious|legit)/i],
    responses: [
      "Using a free email (Gmail, Yahoo, Outlook) for recruitment is a **medium-risk red flag**. Legitimate companies use corporate emails (e.g., hr@company.com).\n\nHowever, some startups or small companies may use Gmail initially. Consider:\n- Is the company well-known and verified?\n- Does the email domain match their website?\n- Are they asking for fees or sensitive info?\n\nOur Email Analyzer can help you check suspicious recruiter emails!"
    ]
  },
  salaryScam: {
    patterns: [/salary\s*scam/i, /high\s*salary/i, /unrealistic\s*pay/i, /too\s*good\s*(pay|salary|offer)/i, /earn.*month/i],
    responses: [
      "Unrealistically high salaries are a major scam indicator. Red flags include:\n\n- ₹50,000+/month for data entry or unskilled work\n- ₹1-2 Lakh+/month for fresher positions\n- 'Unlimited earning potential'\n- Salary way above industry average for the role\n\nLegitimate salaries are based on experience, skills, and market rates. If it sounds too good to be true, it probably is!\n\nUse our **Salary Analyzer** tool to check if a salary is suspicious for the given role."
    ]
  },
  companyVerification: {
    patterns: [/verify\s*(a\s*)?company/i, /is\s*(this\s*)?company\s*(legit|real|scam|safe)/i, /company\s*(verification|check|legit)/i, /how\s*to\s*check\s*company/i],
    responses: [
      "To verify a company:\n\n1. Go to **Company Verification** page\n2. Enter the company name\n3. Check if they're in our verified database\n\nYou can also:\n- Search for the company on LinkedIn, Glassdoor, Google\n- Check their official website (not just a landing page)\n- Look for a physical office address\n- Verify their registration on government business portals\n- Read employee reviews on job sites\n\nIf the company isn't in our database, it doesn't mean it's a scam, but exercise extra caution!"
    ]
  },
  whatsNext: {
    patterns: [/what\s*can\s*i\s*do/i, /what\s*should\s*i\s*do/i, /help\s*me/i, /what\s*now/i, /i\s*(found|got)\s*a\s*scam/i],
    responses: [
      "If you've encountered a suspicious job posting:\n\n1. **Don't pay any money** - Never pay registration, training, or processing fees\n2. **Don't share personal info** - Avoid sharing bank details, Aadhaar, PAN before joining\n3. **Report it** - Use our Community Reports to warn others\n4. **Save the evidence** - Screenshot the posting, save emails\n5. **Verify independently** - Check the company through official channels\n6. **Spread awareness** - Tell friends and family about the scam\n\nWould you like to file a community report?"
    ]
  },
  keyboardShortcuts: {
    patterns: [/feature/i, /what\s*(can|do)\s*(you|this)\s*do/i, /help\s*menu/i, /capabilities/i],
    responses: [
      "Here's what JobShield can do:\n\n🔍 **Job Scanner** - Analyze job descriptions for scam patterns\n📧 **Email Analyzer** - Check if a recruiter email is suspicious\n💰 **Salary Analyzer** - Verify if a salary is realistic\n🔗 **URL Scanner** - Check job posting links for phishing\n🏢 **Company Verifier** - Look up company legitimacy\n📱 **Screenshot OCR** - Extract text from job posting screenshots\n⚠️ **Real-time Warnings** - Get alerts about new scam patterns\n💬 **AI Chatbot** - Ask me anything about job scams (that's me!)\n📝 **Reviews & Comments** - Share your experiences with companies\n📊 **Dashboard** - Track your scan history and statistics\n\nAll features are available in both web and mobile apps!"
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

  if (foundKeywords.length > 0) {
    const kw = foundKeywords[0];
    const info = getKeywordInfo(kw.keyword);
    if (info) {
      return `**"${kw.keyword}"** is a known scam indicator.\n\n📊 Category: ${info.category}\n⚠️ Severity: ${info.severity}\n🎯 Risk Points: ${info.points}\n\n💡 ${info.description}\n\nThis keyword is commonly used in fraudulent job postings to deceive job seekers. Always verify the company independently before proceeding.`;
    }
  }

  if (/\b(thank|thanks|thx)\b/i.test(msg)) {
    return "You're welcome! Stay safe in your job search. Remember: never pay money for a job, always verify companies, and trust your instincts. If something feels off, scan it with JobShield! 🛡️";
  }

  if (/\b(bye|goodbye|see you|later|cya)\b/i.test(msg)) {
    return "Goodbye! Stay safe and remember to always verify job postings before applying. Come back anytime you need help! 🛡️";
  }

  if (/\b(safe|security|protect|privacy)\b.*\b(tips?|advice|how)\b/i.test(msg) || /\bhow\b.*\b(protect|stay safe|safe)\b/i.test(msg)) {
    return "Here are key safety tips for job seekers:\n\n1. **Never pay upfront** - Legitimate employers don't charge fees\n2. **Verify the company** - Search LinkedIn, Google, Glassdoor\n3. **Check email domains** - Corporate emails > Gmail/Yahoo\n4. **Don't rush** - Urgency is a scam tactic\n5. **Research salary** - Know market rates for your role\n6. **Protect personal data** - Don't share bank/Aadhaar/PAN early\n7. **Trust your gut** - If it seems too good to be true, it is\n8. **Use JobShield** - Scan every job before applying!\n\nWould you like more details on any of these?";
  }

  if (/\b(salary|pay|compensation|earning|income)\b/i.test(msg)) {
    return "I can help with salary-related questions!\n\nUse our **Salary Analyzer** tool to check if a salary is realistic for the role. Common salary scam signs:\n- ₹50K+/month for data entry\n- 'Unlimited earning potential'\n- Salary significantly above market rate\n- Vague 'performance-based' pay\n\nWant me to analyze a specific salary offer? Just paste the details!";
  }

  if (/\b(company|employer|organization|firm)\b/i.test(msg)) {
    return "For company verification, I recommend:\n\n1. Use our **Company Verifier** tool in the app\n2. Search on LinkedIn for employee profiles\n3. Check Glassdoor/Indeed for reviews\n4. Verify on government business registration portals\n5. Look for a proper website (not just a landing page)\n6. Check for a physical office address on Google Maps\n\nWould you like to verify a specific company?";
  }

  return "I'm not sure I understand that question. Here are some things I can help with:\n\n- 🔍 **How to scan a job** - Learn to use our scanner\n- 🚩 **Scam signs** - Common red flags in job postings\n- 📧 **Email safety** - Checking recruiter emails\n- 💰 **Salary checks** - Verifying pay offers\n- 🏢 **Company verification** - Researching employers\n- 🛡️ **Safety tips** - Protecting yourself while job hunting\n- 📝 **Reporting scams** - How to report suspicious postings\n\nTry asking about any of these topics!";
}

module.exports = { generateResponse, getKeywordInfo };
