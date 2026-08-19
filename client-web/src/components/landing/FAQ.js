import React, { useState } from 'react';
import { FiChevronDown } from 'react-icons/fi';

const faqs = [
  {
    q: 'What is JobShield?',
    a: 'JobShield is an AI-powered platform that analyzes job listings to detect potential scams. It scans job descriptions, company information, recruiter details, and URLs to provide a comprehensive risk assessment.',
  },
  {
    q: 'How does the AI detection work?',
    a: 'Our AI model analyzes hundreds of data points including language patterns, salary ranges, company information, and known scam indicators. It compares job postings against a database of verified scams to identify suspicious content.',
  },
  {
    q: 'Is my data secure?',
    a: 'Absolutely. Your data is encrypted in transit and at rest. We never share your personal information with third parties. All scans are anonymized and stored securely.',
  },
  {
    q: 'How accurate is the risk score?',
    a: 'Our AI achieves over 95% accuracy in detecting job scams. We continuously train our model with new data from community reports and verified scam databases to improve accuracy.',
  },
  {
    q: 'Is JobShield free to use?',
    a: 'Yes, JobShield offers a free tier with basic scanning features. Premium plans are available for advanced analytics, unlimited scans, and priority support.',
  },
  {
    q: 'Can I report a scam I found?',
    a: 'Yes! You can submit scam reports through our platform. Your report helps protect other job seekers and improves our AI detection system.',
  },
  {
    q: 'What types of scams can you detect?',
    a: 'We detect various scam types including fake job offers, phishing attempts, pyramid schemes, identity theft setups, overpayment scams, and fraudulent recruiter communications.',
  },
  {
    q: 'How do I get started?',
    a: 'Simply create a free account and start scanning job listings. You can paste job descriptions, enter company names, or submit URLs for instant analysis.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  return (
    <section className="faq-section" id="faq">
      <h2 className="section-title reveal">Frequently Asked Questions</h2>
      <p className="section-subtitle reveal" style={{ transitionDelay: '0.1s' }}>Everything you need to know about JobShield</p>
      <div className="faq-container stagger-group reveal">
        {faqs.map((faq, i) => (
          <div key={i} className="faq-item stagger-item">
            <div className={`faq-question ${openIndex === i ? 'active' : ''}`} onClick={() => toggle(i)}>
              {faq.q}
              <FiChevronDown />
            </div>
            <div className={`faq-answer ${openIndex === i ? 'open' : ''}`}>
              {faq.a}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQ;
