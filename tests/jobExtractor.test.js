/**
 * Server-side text extractor tests — used to identify company fields from
 * OCR images and typed messages.
 */
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parseJobText } = require('../services/jobExtractor');

test('extracts Microsoft job from OCR-like text using official email domain', () => {
  const t = [
    'Software Development Engineer',
    'Microsoft',
    'We are hiring a SDE-2 for our Bengaluru office.',
    'Profile: Microsoft',
    'Salary: 30-40 LPA',
    'Location: Bengaluru',
    'Contact: recruit@microsoft.com',
    'Phone: +91 98765 43210',
    'Apply: https://careers.microsoft.com/sde2'
  ].join('\n');
  const p = parseJobText(t);
  assert.equal(p.companyName, 'Microsoft', `expected companyName Microsoft, got ${p.companyName}`);
  assert.equal(p.recruiterEmail, 'recruit@microsoft.com');
  assert.equal(p.phoneNumber, '+91 98765 43210');
  assert.match(p.salary, /30|40/);
  assert.ok(p.jobTitle, 'job title should be extracted');
});

test('identifies company from an unrelated URL that matches the registry official domain', () => {
  const p = parseJobText([
    'Job: Data Entry Operator',
    'We request you to apply at https://www.tcs.com/careers',
    'Email hr@tcs.com'
  ].join('\n'));
  assert.equal(p.companyName, 'Tata Consultancy Services', 'registry canonical name should win');
});

test('does not invent a company when text has only gibberish', () => {
  const p = parseJobText('Apply now for unlimited earning. DM us on telegram @earnmoney_0');
  assert.equal(p.companyName, '', 'should not invent a company from noise');
  assert.equal(p.recruiterEmail, '');
});

test('extracts salary ranges as LPA', () => {
  const p = parseJobText('Hiring freshers. Salary: 4-6 LPA. Location: Chennai.');
  assert.match(p.salary, /4/);
  assert.match(p.salary, /6/);
});