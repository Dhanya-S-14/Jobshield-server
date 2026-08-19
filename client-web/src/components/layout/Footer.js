import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiMail, FiMapPin, FiGithub, FiTwitter, FiLinkedin, FiGlobe } from 'react-icons/fi';

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer" id="contact">
      <div className="footer-grid">
        <div className="footer-brand">
          <h3><FiShield /> JobShield</h3>
          <p>
            AI-powered platform dedicated to protecting job seekers from employment scams
            and fraudulent job listings. Stay safe, job smarter.
          </p>
          <div className="footer-social">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub"><FiGithub /></a>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter"><FiTwitter /></a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn"><FiLinkedin /></a>
            <a href="https://jobshield.io" target="_blank" rel="noreferrer" aria-label="Website"><FiGlobe /></a>
          </div>
        </div>

        <div>
          <h4>Quick Links</h4>
          <div className="footer-links">
            <Link to="/">Home</Link>
            <Link to="/scanner">Scan a Job</Link>
            <Link to="/community-reports">Community Reports</Link>
            <Link to="/company-verify">Company Verification</Link>
            <Link to="/register">Get Started</Link>
          </div>
        </div>

        <div>
          <h4>Features</h4>
          <div className="footer-links">
            <Link to="/scanner">AI Job Scanner</Link>
            <Link to="/company-verify">Company Check</Link>
            <span>Email Analysis</span>
            <span>Salary Analysis</span>
            <span>URL Scanner</span>
          </div>
        </div>

        <div>
          <h4>Contact Us</h4>
          <div className="footer-contact">
            <div className="footer-contact-item">
              <FiMail />
              <span>support@jobshield.io</span>
            </div>
            <div className="footer-contact-item">
              <FiMapPin />
              <span>San Francisco, CA 94105</span>
            </div>
            <div className="footer-contact-item">
              <FiGlobe />
              <span>www.jobshield.io</span>
            </div>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        &copy; {year} JobShield. All rights reserved. | Protecting job seekers worldwide.
      </div>
    </footer>
  );
};

export default Footer;
