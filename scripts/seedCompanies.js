const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Company = require('../models/Company');

dotenv.config();

// ─── 30 REAL COMPANIES (keep existing) ───
const realCompanies = [
  { name: 'Google', website: 'https://www.google.com', domain: 'google.com', industry: 'Technology', location: 'Mountain View, California, USA', description: 'Multinational technology company specializing in Internet-related services and products.', verified: true, employeeCount: '180,000+', foundedYear: 1998, socialLinks: { linkedin: 'linkedin.com/company/google', twitter: 'twitter.com/Google' } },
  { name: 'Microsoft', website: 'https://www.microsoft.com', domain: 'microsoft.com', industry: 'Technology', location: 'Redmond, Washington, USA', description: 'Multinational technology corporation that develops, manufactures, licenses, supports, and sells computer software.', verified: true, employeeCount: '220,000+', foundedYear: 1975, socialLinks: { linkedin: 'linkedin.com/company/microsoft', twitter: 'twitter.com/Microsoft' } },
  { name: 'Amazon', website: 'https://www.amazon.com', domain: 'amazon.com', industry: 'E-commerce / Cloud Computing', location: 'Seattle, Washington, USA', description: 'Multinational technology company focusing on e-commerce, cloud computing, and artificial intelligence.', verified: true, employeeCount: '1,500,000+', foundedYear: 1994, socialLinks: { linkedin: 'linkedin.com/company/amazon', twitter: 'twitter.com/Amazon' } },
  { name: 'Apple', website: 'https://www.apple.com', domain: 'apple.com', industry: 'Technology / Consumer Electronics', location: 'Cupertino, California, USA', description: 'Multinational technology company that designs, develops, and sells consumer electronics and software.', verified: true, employeeCount: '160,000+', foundedYear: 1976, socialLinks: { linkedin: 'linkedin.com/company/apple', twitter: 'twitter.com/Apple' } },
  { name: 'Meta', website: 'https://www.meta.com', domain: 'meta.com', industry: 'Technology / Social Media', location: 'Menlo Park, California, USA', description: 'Technology company that owns Facebook, Instagram, and WhatsApp.', verified: true, employeeCount: '67,000+', foundedYear: 2004, socialLinks: { linkedin: 'linkedin.com/company/meta', twitter: 'twitter.com/Meta' } },
  { name: 'Tesla', website: 'https://www.tesla.com', domain: 'tesla.com', industry: 'Automotive / Clean Energy', location: 'Austin, Texas, USA', description: 'Electric vehicle and clean energy company.', verified: true, employeeCount: '140,000+', foundedYear: 2003, socialLinks: { linkedin: 'linkedin.com/company/tesla-motors', twitter: 'twitter.com/Tesla' } },
  { name: 'Netflix', website: 'https://www.netflix.com', domain: 'netflix.com', industry: 'Entertainment / Streaming', location: 'Los Gatos, California, USA', description: 'Subscription-based streaming service offering films and TV series.', verified: true, employeeCount: '13,000+', foundedYear: 1997, socialLinks: { linkedin: 'linkedin.com/company/netflix', twitter: 'twitter.com/Netflix' } },
  { name: 'Samsung', website: 'https://www.samsung.com', domain: 'samsung.com', industry: 'Technology / Electronics', location: 'Suwon, South Korea', description: 'Multinational electronics corporation manufacturing consumer electronics and semiconductors.', verified: true, employeeCount: '270,000+', foundedYear: 1938, socialLinks: { linkedin: 'linkedin.com/company/samsung-electronics', twitter: 'twitter.com/Samsung' } },
  { name: 'IBM', website: 'https://www.ibm.com', domain: 'ibm.com', industry: 'Technology / Consulting', location: 'Armonk, New York, USA', description: 'Multinational technology corporation providing computer hardware, middleware, and consulting services.', verified: true, employeeCount: '280,000+', foundedYear: 1911, socialLinks: { linkedin: 'linkedin.com/company/ibm', twitter: 'twitter.com/IBM' } },
  { name: 'Oracle', website: 'https://www.oracle.com', domain: 'oracle.com', industry: 'Technology / Enterprise Software', location: 'Austin, Texas, USA', description: 'Multinational computer technology corporation specializing in database software and cloud engineering.', verified: true, employeeCount: '143,000+', foundedYear: 1977, socialLinks: { linkedin: 'linkedin.com/company/oracle', twitter: 'twitter.com/Oracle' } },
  { name: 'Salesforce', website: 'https://www.salesforce.com', domain: 'salesforce.com', industry: 'Technology / CRM', location: 'San Francisco, California, USA', description: 'Cloud-based software company providing customer relationship management services.', verified: true, employeeCount: '79,000+', foundedYear: 1999, socialLinks: { linkedin: 'linkedin.com/company/salesforce', twitter: 'twitter.com/Salesforce' } },
  { name: 'Adobe', website: 'https://www.adobe.com', domain: 'adobe.com', industry: 'Technology / Software', location: 'San Jose, California, USA', description: 'Multinational computer software company known for Photoshop, Illustrator, and creative tools.', verified: true, employeeCount: '30,000+', foundedYear: 1982, socialLinks: { linkedin: 'linkedin.com/company/adobe', twitter: 'twitter.com/Adobe' } },
  { name: 'Uber', website: 'https://www.uber.com', domain: 'uber.com', industry: 'Transportation / Technology', location: 'San Francisco, California, USA', description: 'Technology company offering ride-hailing, food delivery, and freight services.', verified: true, employeeCount: '32,000+', foundedYear: 2009, socialLinks: { linkedin: 'linkedin.com/company/uber', twitter: 'twitter.com/Uber' } },
  { name: 'Spotify', website: 'https://www.spotify.com', domain: 'spotify.com', industry: 'Entertainment / Music Streaming', location: 'Stockholm, Sweden', description: 'Digital music, podcast, and video streaming service.', verified: true, employeeCount: '9,000+', foundedYear: 2006, socialLinks: { linkedin: 'linkedin.com/company/spotify', twitter: 'twitter.com/Spotify' } },
  { name: 'Shopify', website: 'https://www.shopify.com', domain: 'shopify.com', industry: 'E-commerce / Technology', location: 'Ottawa, Ontario, Canada', description: 'Multinational e-commerce company providing platform for online stores.', verified: true, employeeCount: '11,000+', foundedYear: 2006, socialLinks: { linkedin: 'linkedin.com/company/shopify', twitter: 'twitter.com/Shopify' } },
  { name: 'Slack', website: 'https://www.slack.com', domain: 'slack.com', industry: 'Technology / Communication', location: 'San Francisco, California, USA', description: 'Business communication platform owned by Salesforce.', verified: true, employeeCount: '2,000+', foundedYear: 2013, socialLinks: { linkedin: 'linkedin.com/company/slack', twitter: 'twitter.com/SlackHQ' } },
  { name: 'Zoom', website: 'https://www.zoom.us', domain: 'zoom.us', industry: 'Technology / Video Communications', location: 'San Jose, California, USA', description: 'Videotelephony and cloud-based communications platform.', verified: true, employeeCount: '8,000+', foundedYear: 2011, socialLinks: { linkedin: 'linkedin.com/company/zoom-video-communications', twitter: 'twitter.com/Zoom' } },
  { name: 'Atlassian', website: 'https://www.atlassian.com', domain: 'atlassian.com', industry: 'Technology / Collaboration Software', location: 'Sydney, Australia', description: 'Enterprise software company known for Jira, Confluence, and Trello.', verified: true, employeeCount: '11,000+', foundedYear: 2002, socialLinks: { linkedin: 'linkedin.com/company/atlassian', twitter: 'twitter.com/Atlassian' } },
  { name: 'Stripe', website: 'https://www.stripe.com', domain: 'stripe.com', industry: 'Fintech / Payment Processing', location: 'San Francisco, California, USA', description: 'Financial infrastructure platform for internet businesses.', verified: true, employeeCount: '8,000+', foundedYear: 2010, socialLinks: { linkedin: 'linkedin.com/company/stripe', twitter: 'twitter.com/Stripe' } },
  { name: 'Notion', website: 'https://www.notion.so', domain: 'notion.so', industry: 'Technology / Productivity', location: 'San Francisco, California, USA', description: 'All-in-one workspace for notes, tasks, wikis, and databases.', verified: true, employeeCount: '800+', foundedYear: 2013, socialLinks: { linkedin: 'linkedin.com/company/notion', twitter: 'twitter.com/NotionHQ' } },
  { name: 'Figma', website: 'https://www.figma.com', domain: 'figma.com', industry: 'Technology / Design Tools', location: 'San Francisco, California, USA', description: 'Collaborative interface design tool.', verified: true, employeeCount: '1,200+', foundedYear: 2012, socialLinks: { linkedin: 'linkedin.com/company/figma', twitter: 'twitter.com/figma' } },
  { name: 'Vercel', website: 'https://www.vercel.com', domain: 'vercel.com', industry: 'Technology / Cloud Platform', location: 'San Francisco, California, USA', description: 'Platform for frontend developers providing build and deployment tools.', verified: true, employeeCount: '500+', foundedYear: 2015, socialLinks: { linkedin: 'linkedin.com/company/vercel', twitter: 'twitter.com/vercel' } },
  { name: 'Deloitte', website: 'https://www.deloitte.com', domain: 'deloitte.com', industry: 'Consulting / Professional Services', location: 'London, United Kingdom', description: 'Multinational professional services network providing audit, consulting, and advisory services.', verified: true, employeeCount: '450,000+', foundedYear: 1845, socialLinks: { linkedin: 'linkedin.com/company/deloitte', twitter: 'twitter.com/Deloitte' } },
  { name: 'Accenture', website: 'https://www.accenture.com', domain: 'accenture.com', industry: 'Consulting / Technology Services', location: 'Dublin, Ireland', description: 'Multinational professional services company specializing in IT services and consulting.', verified: true, employeeCount: '730,000+', foundedYear: 1989, socialLinks: { linkedin: 'linkedin.com/company/accenture', twitter: 'twitter.com/Accenture' } },
  { name: 'Capgemini', website: 'https://www.capgemini.com', domain: 'capgemini.com', industry: 'Consulting / IT Services', location: 'Paris, France', description: 'Multinational IT services and consulting company.', verified: true, employeeCount: '350,000+', foundedYear: 1967, socialLinks: { linkedin: 'linkedin.com/company/capgemini', twitter: 'twitter.com/Capgemini' } },
  { name: 'Infosys', website: 'https://www.infosys.com', domain: 'infosys.com', industry: 'IT Services / Consulting', location: 'Bangalore, India', description: 'Multinational IT services and consulting company.', verified: true, employeeCount: '315,000+', foundedYear: 1981, socialLinks: { linkedin: 'linkedin.com/company/infosys', twitter: 'twitter.com/Infosys' } },
  { name: 'SAP', website: 'https://www.sap.com', domain: 'sap.com', industry: 'Technology / Enterprise Software', location: 'Walldorf, Germany', description: 'Multinational software corporation providing enterprise application software.', verified: true, employeeCount: '107,000+', foundedYear: 1972, socialLinks: { linkedin: 'linkedin.com/company/sap', twitter: 'twitter.com/SAP' } },
  { name: 'Nvidia', website: 'https://www.nvidia.com', domain: 'nvidia.com', industry: 'Technology / Semiconductors', location: 'Santa Clara, California, USA', description: 'Technology company designing GPUs and AI chips.', verified: true, employeeCount: '32,000+', foundedYear: 1993, socialLinks: { linkedin: 'linkedin.com/company/nvidia', twitter: 'twitter.com/nvidia' } },
  { name: 'Airbnb', website: 'https://www.airbnb.com', domain: 'airbnb.com', industry: 'Hospitality / Technology', location: 'San Francisco, California, USA', description: 'Online marketplace for short-term and long-term homestays and experiences.', verified: true, employeeCount: '6,800+', foundedYear: 2008, socialLinks: { linkedin: 'linkedin.com/company/airbnb', twitter: 'twitter.com/Airbnb' } },
  { name: 'LinkedIn', website: 'https://www.linkedin.com', domain: 'linkedin.com', industry: 'Social Media / Professional Networking', location: 'Sunnyvale, California, USA', description: 'Business and employment-oriented social networking service owned by Microsoft.', verified: true, employeeCount: '20,000+', foundedYear: 2003, socialLinks: { linkedin: 'linkedin.com/company/linkedin', twitter: 'twitter.com/LinkedIn' } },
];

// ─── 100 TRUSTED COMPANIES ───
const trustedIndustries = [
  'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
  'Retail', 'Energy', 'Media', 'Telecommunications', 'Real Estate',
  'Automotive', 'Aerospace', 'Logistics', 'Agriculture', 'Insurance',
  'Legal Services', 'Hospitality', 'Construction', 'Mining', 'Biotechnology',
];
const trustedLocations = [
  'New York, USA', 'San Francisco, USA', 'London, UK', 'Berlin, Germany', 'Tokyo, Japan',
  'Toronto, Canada', 'Sydney, Australia', 'Singapore', 'Dubai, UAE', 'Amsterdam, Netherlands',
  'Seoul, South Korea', 'Bangalore, India', 'Paris, France', 'Zurich, Switzerland', 'Stockholm, Sweden',
];
const trustedSizes = ['50-200', '200-1,000', '1,000-5,000', '5,000-20,000', '20,000-100,000', '100,000+'];
const trustedTlds = ['.com', '.io', '.co', '.tech', '.ai', '.dev', '.app'];

const goodCompanies = [];
for (let i = 1; i <= 100; i++) {
  const name = `Trusted Company ${i}`;
  const tld = trustedTlds[i % trustedTlds.length];
  const slug = `trustedco${i}`;
  goodCompanies.push({
    name,
    website: `https://${slug}${tld}`,
    domain: `${slug}${tld}`,
    industry: trustedIndustries[i % trustedIndustries.length],
    location: trustedLocations[i % trustedLocations.length],
    description: `Trust Score: ${95 + (i % 6)}/100 — Verified and trusted company. ${name} is a legitimate, established business with a proven track record.`,
    verified: true,
    employeeCount: trustedSizes[i % trustedSizes.length],
    foundedYear: 1990 + (i % 30),
  });
}

// ─── 100 FAKE / SCAM COMPANIES ───
const fakeIndustries = [
  'Job Recruitment', 'Employment Agency', 'Career Services', 'HR Consulting',
  'Work From Home', 'Online Employment', 'Global Recruitment', 'Remote Jobs',
  'Quick Hire Staffing', 'Premium Recruitment',
];
const fakeReasons = [
  'Reported for fake recruitment and advance payment scam',
  'Demands upfront training fee before employment',
  'No physical office — only communicates via WhatsApp and Gmail',
  'Checks bounce. Company does not exist in any business registry.',
  'Asked for bank details during "onboarding" — money stolen',
  'Posing as a well-known company to collect personal data',
  'Job offer sent via personal email (gmail/yahoo) — fake HR department',
  'Promises guaranteed high salary for minimal work — classic bait',
  'Website created last month — domain expires in 1 year',
  'Recruiter refuses video call — uses stock photos for profile',
  'Asked for copies of passport and ID before interview — identity theft risk',
  'Multiple complaints on forums about non-payment after "training"',
  'Fake assessment test that charges a "processing fee"',
  'Email domain does not match the claimed company website',
  'Unsolicited job offer received without applying — phishing attempt',
  'Claims to be international but has no verifiable office address',
  'Offers unrealistically high pay for entry-level position',
  'Pressures candidate to accept offer within 24 hours — urgency scam',
  'Requests gift card purchase as part of "equipment setup"',
  'Operating under multiple fake company names — same scam network',
];
const scamTlds = ['.xyz', '.top', '.club', '.online', '.site', '.work', '.click', '.info', '.buzz', '.fun', '.icu', '.tk', '.ml', '.ga', '.cf'];
const scamDomains = [
  'globaljobs', 'quickhire', 'workfromhome', 'dreamjob', 'easyhire',
  'fastcash', 'gethired', 'topcareers', 'remotejob', 'hirenow',
  'jobsnearme', 'careerhub', 'employpro', 'staffingsolutions', 'recruitnow',
  'hirefast', 'jobzone', 'careerboost', 'workpro', 'jobsgo',
];

const fakeCompanies = [];
for (let i = 1; i <= 100; i++) {
  const domainBase = scamDomains[(i - 1) % scamDomains.length];
  const tld = scamTlds[(i - 1) % scamTlds.length];
  const domain = `${domainBase}${i}${tld}`;
  const reason = fakeReasons[(i - 1) % fakeReasons.length];
  const trustScore = Math.floor(Math.random() * 20);
  fakeCompanies.push({
    name: `Fake Job Agency ${i}`,
    website: `https://${domain}`,
    domain,
    industry: fakeIndustries[(i - 1) % fakeIndustries.length],
    location: '',
    description: `Trust Score: ${trustScore}/100 — SCAM WARNING. Status: Fake. Reason: ${reason}`,
    verified: false,
    employeeCount: '',
    foundedYear: undefined,
  });
}

const allCompanies = [...realCompanies, ...goodCompanies, ...fakeCompanies];

const seedCompanies = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected for seeding...');
    console.log(`Total companies to seed: ${allCompanies.length} (30 real + 100 trusted + 100 fake)`);

    const existingCount = await Company.countDocuments();
    console.log(`Existing companies in DB: ${existingCount}`);

    if (existingCount > 0) {
      if (process.argv.includes('--force')) {
        console.log('--force flag detected. Dropping all existing companies...');
        await Company.deleteMany({});
      } else {
        console.log('Companies already exist. Run with --force to replace.');
        await mongoose.disconnect();
        process.exit(0);
      }
    }

    const result = await Company.insertMany(allCompanies, { ordered: false });
    console.log(`Successfully inserted ${result.length} companies`);

    const stats = await Company.aggregate([
      { $group: { _id: '$verified', count: { $sum: 1 } } }
    ]);
    console.log('Breakdown:', stats.map(s => `${s._id ? 'Verified' : 'Unverified'}: ${s.count}`).join(', '));

    await mongoose.disconnect();
    console.log('Done. Database disconnected.');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error.message);
    if (error.writeErrors) {
      console.error(`  ${error.writeErrors.length} documents had errors (duplicates skipped)`);
    }
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedCompanies();
