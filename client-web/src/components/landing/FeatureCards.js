import React from 'react';
import { FiCpu, FiLink, FiBriefcase, FiMail, FiPieChart, FiUsers } from 'react-icons/fi';

const features = [
  {
    icon: <FiCpu />,
    title: 'AI Detection',
    desc: 'Advanced machine learning analyzes job descriptions for scam patterns and red flags.',
    color: 'blue',
  },
  {
    icon: <FiLink />,
    title: 'URL Scanner',
    desc: 'Scan job listing URLs for malicious links, phishing attempts, and suspicious domains.',
    color: 'green',
  },
  {
    icon: <FiBriefcase />,
    title: 'Company Verification',
    desc: 'Verify if a company is legitimate with our database of registered businesses.',
    color: 'purple',
  },
  {
    icon: <FiMail />,
    title: 'Email Verification',
    desc: 'Analyze recruiter emails for spoofing, typos, and known scam patterns.',
    color: 'orange',
  },
  {
    icon: <FiPieChart />,
    title: 'Risk Score Analysis',
    desc: 'Get a comprehensive 0-100 risk score with detailed breakdown of findings.',
    color: 'red',
  },
  {
    icon: <FiUsers />,
    title: 'Community Reports',
    desc: 'Browse and contribute to a community-driven database of reported job scams.',
    color: 'blue',
  },
];

const FeatureCards = () => {
  return (
    <section className="features-section" id="features">
      <h2 className="section-title reveal">Powerful Protection Features</h2>
      <p className="section-subtitle reveal" style={{ transitionDelay: '0.1s' }}>Everything you need to stay safe from job scams</p>
      <div className="features-grid stagger-group reveal">
        {features.map((f, i) => (
          <div key={i} className="feature-card stagger-item card-hover-effect">
            <div className={`feature-icon card-icon ${f.color}`}>{f.icon}</div>
            <h3>{f.title}</h3>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureCards;
