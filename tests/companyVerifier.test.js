/**
 * Company Verification tests — cover the requested Test 1-8 scenarios plus
 * registry integrity. Runs offline (no Mongo needed): registry lookup only.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const registry = require('../config/companies');
const { getCompanyVerification } = require('../services/companyVerifier');

test('1. Microsoft + official domain + corporate email = fully verified', async () => {
  const r = await getCompanyVerification({
    companyName: 'Microsoft', website: 'https://www.microsoft.com', applyLink: 'https://careers.microsoft.com/xyz',
    jobTitle: 'Software Engineer', jobDescription: 'Build developer tools used by millions.',
    recruiterEmail: 'recruiter@microsoft.com',
  });
  assert.equal(r.companyIdentity.status, 'Verified');
  assert.equal(r.companyIdentity.verified, true);
  assert.equal(r.domainVerification.status, 'Verified');
  assert.equal(r.emailVerification.status, 'Verified');
  assert.equal(r.recruiterVerification.status, 'Verified');
  assert.equal(r.verificationLevel, 'enterprise-verified');
  assert.equal(r.trustScore, 100, 'trusted-database companies must display 100%');
  assert.equal(r.riskScore, 0);
  assert.equal(r.webInfo, null);
  assert.equal(r.company.officialDomain, 'microsoft.com');
});

test('2. Microsoft + lookalike domain = impersonation, suspicious', async () => {
  const r = await getCompanyVerification({
    companyName: 'Microsoft', website: 'https://microsoft-careers.com',
    jobTitle: 'Software Engineer', jobDescription: 'Work from home, earn fast.',
    recruiterEmail: 'hr@microsoft-careers.com',
  });
  assert.equal(r.impersonationDetected, true);
  assert.equal(r.domainVerification.status, 'Suspicious');
  assert.equal(r.verificationLevel, 'suspicious');
  assert.ok(r.trustScore <= 20, `impersonation trust should be very low, got ${r.trustScore}`);
});

test('3. TCS aliases all resolve to the same trusted identity', async () => {
  for (const alias of ['TCS', 'Tata Consultancy Services', 'Tata Consultancy Services Limited', 'Tata Consultancy Service']) {
    const r = await getCompanyVerification({ companyName: alias });
    assert.equal(r.companyIdentity.verified, true, `alias "${alias}" should resolve as verified`);
    assert.equal(r.company.officialDomain, 'tcs.com');
    assert.equal(r.verificationLevel, 'identity-verified');
    assert.equal(r.trustScore, 100);
  }
});

test('4. Unknown company is NOT auto-verified and NOT auto-flagged as scam', async () => {
  const r = await getCompanyVerification({
    companyName: 'Amasia Softwares', website: 'https://amasia.example.com',
    jobTitle: 'Developer', jobDescription: 'Full stack role in Chennai.',
    recruiterEmail: 'hr@amasia.example.com',
  }, { webInfo: false });
  assert.equal(r.companyIdentity.verified, false);
  assert.equal(r.verificationLevel, 'unknown');
  assert.equal(r.warnings.length, 0, 'unknown company must not generate scam warnings');
  assert.equal(r.trustScore, null, 'unknown company must NOT expose a trust percentage');
  assert.equal(r.webInfo, null);
  assert.match(r.recommendation, /trust score/i);
});

test('5. careers subdomain of official domain counts as Verified domain', async () => {
  const r = await getCompanyVerification({
    companyName: 'Microsoft', website: 'https://careers.microsoft.com',
    jobTitle: 'Program Manager', jobDescription: 'Lead delivery across teams.',
  });
  assert.equal(r.domainVerification.status, 'Verified');
  assert.equal(r.companyIdentity.verified, true);
});

test('6. Google + free-coded email = company verified, recruiter unofficial, NOT a scam verdict', async () => {
  const r = await getCompanyVerification({
    companyName: 'Google', website: 'https://careers.google.com',
    jobTitle: 'Product Manager', jobDescription: 'Manage products at scale.',
    recruiterEmail: 'googlejob.2026@gmail.com',
  });
  assert.equal(r.companyIdentity.verified, true);
  assert.equal(r.emailVerification.isFreeEmail, true);
  assert.equal(r.emailVerification.status, 'Needs verification');
  assert.equal(r.impersonationDetected, false);
  assert.notEqual(r.verificationLevel, 'suspicious');
  assert.ok(r.trustScore >= 40, `google+gmail must not be a scam verdict, got ${r.trustScore}`);
});

test('7. Infosys + typosquat domain = impersonation flagged', async () => {
  for (const bad of ['https://infosysjobs.top', 'https://infosyss.com']) {
    const r = await getCompanyVerification({ companyName: 'Infosys', website: bad, jobTitle: 'Engineer', jobDescription: 'Code.' });
    assert.equal(r.impersonationDetected, true, `${bad} should be flagged`);
    assert.equal(r.verificationLevel, 'suspicious');
  }
});

test('8. Unknown company + scam payment language = company Unknown but posting flagged critical', async () => {
  const r = await getCompanyVerification({
    companyName: 'Swift Freelancer Ltd', website: 'https://swiftfreelancer.example.com',
    jobTitle: 'Data Entry', jobDescription: 'Pay Rs.5000 registration fee to start. Limited seats, urgent joining. WhatsApp only.',
    recruiterEmail: 'contactme@gmail.com',
  }, { webInfo: false });
  assert.equal(r.companyIdentity.verified, false);
  assert.equal(r.verificationLevel, 'unknown');
  assert.equal(r.jobPosting.status, 'Suspicious');
  assert.ok(r.jobPosting.scamPhrases.length > 0, 'scam phrases should be reported');
  assert.equal(r.trustScore, null, 'unknown company must NOT expose a trust percentage');
});

test('Registry: no duplicate trusted company names (dedup active)', () => {
  const keys = new Set();
  for (const c of registry.companies) {
    const k = registry.normalizeName(c.name);
    assert.ok(!keys.has(k), `duplicate company name: ${c.name}`);
    keys.add(k);
    assert.ok(c.domain, `${c.name} is missing a domain`);
    assert.ok(registry.allDomainsFor(c).length >= 1);
  }
  assert.ok(registry.companies.length >= 200, `expected >=200 trusted companies, got ${registry.companies.length}`);
});

test('Registry: alternate domain checker handles subdomains and impersonation', () => {
  assert.equal(registry.isSubdomainOf('careers.microsoft.com', 'microsoft.com'), true);
  assert.equal(registry.isSubdomainOf('microsoft.com', 'microsoft.com'), true);
  assert.equal(registry.isSubdomainOf('microsoft-careers.com', 'microsoft.com'), false);
  const imp = registry.detectImpersonation('microsoft-careers.com', ['microsoft.com']);
  assert.equal(imp.impersonation, true);
});