/**
 * Detection engine tests — the 6 required scenarios.
 *
 * Run:  node --test tests/detectionEngine.test.js   (from server/)
 *       npm test
 *
 * The engine is fully deterministic and does NOT require MongoDB (DB checks
 * are skipped automatically when mongoose is not connected).
 */

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { analyzeJobPosting, getRiskLevel } = require('../services/detectionEngine');

const LEGIT_DESC = [
  'We are hiring a Senior Software Engineer for our Bangalore office.',
  'Responsibilities: design, build and maintain scalable services, write clean tests, and mentor juniors.',
  'Qualifications: 5+ years of experience, strong CS fundamentals, experience with Java/Spring.',
  'Key skills: Java, Spring Boot, SQL, REST APIs.',
  'What we offer: competitive salary, health insurance, paid leave, PF & ESI as per policy, and an employee referral program.',
  'The interview process includes a technical interview and an HR interview. We are an equal opportunity employer.'
].join(' ');

const LEGIT_PAY = '15-20 LPA';

test('1. TCS + official URL + corporate email + normal job = Highly Trusted', async () => {
  const r = await analyzeJobPosting({
    jobTitle: 'Senior Software Engineer',
    companyName: 'TCS',
    jobDescription: LEGIT_DESC,
    salary: LEGIT_PAY,
    location: 'Bangalore',
    recruiterEmail: 'careers@tcs.com',
    website: 'https://www.tcs.com',
    applyLink: 'https://www.tcs.com/careers'
  });

  assert.equal(typeof r.trustScore, 'number');
  assert.equal(typeof r.riskScore, 'number');
  assert.equal(r.trustScore + r.riskScore, 100);
  assert.ok(r.trustScore >= 90, `trustScore should be >= 90, got ${r.trustScore}`);
  assert.equal(r.riskLevel, 'Highly Trusted');
  assert.equal(r.verification.identityMatched, true);
  assert.equal(r.verification.domainMatched, true);
  assert.equal(r.verification.typosquatDetected, false);
});

test('2. TCS + Gmail + random unrelated URL = lower trust with warnings, NOT a scam', async () => {
  const r = await analyzeJobPosting({
    jobTitle: 'HR Executive',
    companyName: 'TCS',
    jobDescription: 'We are hiring an HR executive for our team. Responsibilities: coordinate interviews and onboarding. Qualifications: 2 years HR experience, good communication.',
    salary: '12 LPA',
    location: 'Pune',
    recruiterEmail: 'hr.tcs.jobs@gmail.com',
    website: 'https://random-recruiting-hub.in',
    applyLink: 'https://random-recruiting-hub.in/apply'
  });

  assert.ok(r.warnings.length > 0, 'should contain warnings');
  assert.ok(r.trustScore < 90, `trust should drop below Highly Trusted, got ${r.trustScore}`);
  assert.ok(r.riskLevel !== 'Highly Trusted', 'should not be Highly Trusted');
  assert.ok(r.riskLevel !== 'Critical Risk', 'a real brand + free email + random URL must not be labelled a scam');
  assert.equal(r.verification.identityMatched, true);
  assert.equal(r.verification.domainMatched, false);
  assert.ok(r.breakdown.find((b) => b.key === 'email').status === 'warning');
});

test('3. HCLTech + official domain = Highly Trusted', async () => {
  const r = await analyzeJobPosting({
    jobTitle: 'Frontend Developer',
    companyName: 'HCLTech',
    jobDescription: LEGIT_DESC,
    salary: '10-14 LPA',
    location: 'Noida',
    recruiterEmail: 'careers@hcltech.com',
    website: 'https://www.hcltech.com',
    applyLink: 'https://www.hcltech.com/careers'
  });

  assert.ok(r.trustScore >= 90, `trustScore should be >= 90, got ${r.trustScore}`);
  assert.equal(r.riskLevel, 'Highly Trusted');
  assert.equal(r.verification.identityMatched, true);
  assert.equal(r.verification.domainMatched, true);
});

test('4. TCS + typosquat domain = mismatch, reduced trust', async () => {
  const r = await analyzeJobPosting({
    jobTitle: 'Software Engineer',
    companyName: 'TCS',
    jobDescription: LEGIT_DESC,
    salary: '12 LPA',
    location: 'Mumbai',
    recruiterEmail: 'hiring@tcs-careers.xyz',
    website: 'https://tcs-careers.xyz',
    applyLink: 'https://tcs-careers.xyz/apply'
  });

  assert.equal(r.verification.typosquatDetected, true, 'typosquatting must be detected');
  assert.ok(r.verification.typosquatOf.includes('tcs'), `typosquat target should reference tcs, got ${r.verification.typosquatOf}`);
  assert.ok(r.trustScore < 90, `trust should be reduced below case 1, got ${r.trustScore}`);
  assert.ok(r.riskLevel !== 'Highly Trusted');
  assert.ok(r.warnings.length > 0, 'should carry warnings');
});

test('5. Payment request = strong risk (Critical area)', async () => {
  const r = await analyzeJobPosting({
    jobTitle: 'Work From Home Data Entry',
    companyName: 'Quick Earn India',
    jobDescription: 'Registration fee Rs 500 required to reserve your seat. Hurry, limited seats! Guaranteed job. Work from home with unlimited income.',
    salary: '',
    recruiterEmail: 'quick.earn.jobs@gmail.com',
    phoneNumber: '8888888888',
    website: 'https://get-rich-fast.xyz',
    applyLink: ''
  });

  assert.equal(r.hardRisk, true, 'payment request must set the hard risk flag');
  assert.ok(r.warnings.some((w) => /registration fee|pay|money|advertisem/i.test(w)), 'warnings should mention the payment/fee');
  assert.ok(r.trustScore <= 20, `trust must stay at/below 20 (Critical), got ${r.trustScore}`);
  assert.ok(r.riskScore >= 80, `risk score must be high, got ${r.riskScore}`);
  assert.equal(getRiskLevel(r.trustScore), 'Critical Risk');
});

test('6. Missing phone + salary = neutral, no penalty', async () => {
  const base = {
    jobTitle: 'Account Manager',
    companyName: 'Zoho',
    jobDescription: LEGIT_DESC,
    location: 'Chennai',
    recruiterEmail: 'careers@zoho.com',
    website: 'https://www.zoho.com',
    applyLink: 'https://www.zoho.com/careers'
  };

  const withFields = await analyzeJobPosting({ ...base, salary: '8-12 LPA', phoneNumber: '9876543210' });
  const withoutFields = await analyzeJobPosting({ ...base, salary: '', phoneNumber: '' });

  const salaryFactor = withoutFields.breakdown.find((b) => b.key === 'salary');
  const phoneFactor = withoutFields.breakdown.find((b) => b.key === 'phone');

  assert.equal(salaryFactor.earned, 0, 'missing salary must be neutral');
  assert.equal(salaryFactor.status, 'neutral');
  assert.equal(phoneFactor.earned, 0, 'missing phone must be neutral');
  assert.equal(phoneFactor.status, 'neutral');

  assert.ok(withoutFields.riskLevel !== 'Critical Risk', 'missing optional data must not alone be Critical');

  const diff = withFields.trustScore - withoutFields.trustScore;
  assert.ok(diff >= 0 && diff <= 12, `missing fields must not be penalised harshly (diff=${diff})`);
});

test('Threshold boundaries for getRiskLevel', () => {
  assert.equal(getRiskLevel(100), 'Highly Trusted');
  assert.equal(getRiskLevel(90), 'Highly Trusted');
  assert.equal(getRiskLevel(89), 'Low Risk');
  assert.equal(getRiskLevel(75), 'Low Risk');
  assert.equal(getRiskLevel(74), 'Moderate Risk');
  assert.equal(getRiskLevel(50), 'Moderate Risk');
  assert.equal(getRiskLevel(49), 'High Risk');
  assert.equal(getRiskLevel(25), 'High Risk');
  assert.equal(getRiskLevel(24), 'Critical Risk');
  assert.equal(getRiskLevel(0), 'Critical Risk');
});

test('Deterministic: same input => identical output', async () => {
  const input = {
    jobTitle: 'Data Analyst',
    companyName: 'Infosys',
    jobDescription: LEGIT_DESC,
    salary: '9 LPA',
    recruiterEmail: 'careers@infosys.com',
    website: 'https://www.infosys.com'
  };
  const a = await analyzeJobPosting(input);
  const b = await analyzeJobPosting(input);
  assert.deepEqual(a.trustScore, b.trustScore);
  assert.deepEqual(a.riskLevel, b.riskLevel);
  assert.deepEqual(a.aiExplanation, b.aiExplanation);
});