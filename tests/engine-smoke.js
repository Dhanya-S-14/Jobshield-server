const { analyzeJobPosting } = require('../services/detectionEngine');

const run = async () => {
  const legit = { jobTitle: 'Senior Software Engineer', companyName: 'TCS', jobDescription: 'We are hiring a senior software engineer for our Bangalore office. 5 years experience required. Salary 15 LPA. Apply with resume.', salary: '15 LPA', location: 'Bangalore', recruiterEmail: 'careers@tcs.com', applyLink: 'https://www.tcs.com/careers' };

  const scam = { jobTitle: 'Work From Home Data Entry', companyName: 'Quick Money Ltd', jobDescription: 'No interview needed. Instant hiring. Deposit 5000 rupees registration fee now. Hurry limited seats. Unlimited income today.', salary: 'Unlimited income no bar', recruiterEmail: 'hr.quickpay37@gmail.com', phoneNumber: '9999999999', applyLink: 'http://bit.ly/quickcash' };

  const medium = { jobTitle: 'Fresher Marketing Executive', companyName: 'GrowthHub Solutions', jobDescription: 'No interview, direct hiring. Excellent communication required. Apply today. Fast selection.', salary: '12 LPA', recruiterEmail: 'hello@growthhub.co', phoneNumber: '9876543210', applyLink: 'https://growthhub.example/careers' };

  const numericEdge = { jobTitle: 'Developer', companyName: 'Acme Corp', jobDescription: 'Hiring backend developer with experience. Good package.', salary: 50000, recruiterEmail: 'hr@acme-corp.com', phoneNumber: 9876543210 };

  const missingFields = { jobTitle: undefined, companyName: null, jobDescription: undefined };

  for (const [name, data] of Object.entries({ legit, scam, medium, numericEdge, missingFields })) {
    try {
      const r = await analyzeJobPosting(data);
      console.log(`${name}: score=${r.riskScore} level=${r.riskLevel} keywords=${r.keywordsFound.length}`);
    } catch (e) {
      console.log(`${name}: THREW ${e.stack.split('\n')[0]}`);
    }
  }
};

run().then(() => {
  console.log('engine test done');
  process.exit(0);
}).catch((e) => {
  console.error(e);
  process.exit(1);
});