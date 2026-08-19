import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiArrowRight, FiAlertTriangle, FiXCircle, FiCheckCircle, FiCpu, FiSearch, FiFlag } from 'react-icons/fi';
import { ReactComponent as LogoSvg } from '../../assets/jobshield-logo.svg';

const alerts = [
  { icon: <FiXCircle />, type: 'SCAM', msg: 'Fake Job Posting: "Data Entry" — ₹85K/month', risk: 92, delay: 0 },
  { icon: <FiAlertTriangle />, type: 'WARNING', msg: 'Suspicious recruiter email: hr@xyz.tk', risk: 78, delay: 0.8 },
  { icon: <FiXCircle />, type: 'SCAM', msg: 'Phishing link detected in job description', risk: 88, delay: 1.6 },
  { icon: <FiAlertTriangle />, type: 'WARNING', msg: 'Unrealistic salary: ₹2L/month for fresher', risk: 72, delay: 2.4 },
  { icon: <FiXCircle />, type: 'SCAM', msg: '"Registration fee" requested before interview', risk: 95, delay: 3.2 },
  { icon: <FiFlag />, type: 'REPORT', msg: 'Company "TechSolutions Pvt Ltd" flagged by 12 users', risk: 81, delay: 4.0 },
  { icon: <FiCheckCircle />, type: 'SAFE', msg: 'Verified: "Google" — job posting is legitimate', risk: 12, delay: 4.8 },
  { icon: <FiAlertTriangle />, type: 'WARNING', msg: 'WhatsApp-only communication — untraceable', risk: 76, delay: 5.6 },
];

const scanCards = [
  { title: 'Risk Score', value: '92', label: 'HIGH RISK', color: '#ef5350', delay: 0.2 },
  { title: 'Flags Detected', value: '7', label: 'RED FLAGS', color: '#ffa726', delay: 0.6 },
  { title: 'Confidence', value: '96%', label: 'AI CONFIDENCE', color: '#42a5f5', delay: 1.0 },
  { title: 'Scans Today', value: '1,284', label: 'PROTECTED', color: '#b388ff', delay: 1.4 },
];

const HeroSection = () => {
  return (
    <section className="hero-section">

      {/* Background gradient overlays */}
      <div className="hero-bg-glow" />

      {/* Scanning progress bar */}
      <div className="hero-scan-progress">
        <div className="hero-scan-progress-bar" />
      </div>

      {/* Top-left: Live scan counter */}
      <div className="hero-hud-top-left">
        <div className="hero-hud-dot" />
        LIVE SCANNING
        <span className="hero-hud-blink"> ●</span>
      </div>

      {/* Top-right: timestamp */}
      <div className="hero-hud-top-right">
        <FiCpu size={10} /> AI ENGINE v2.4
      </div>

      {/* Floating scan result cards */}
      <div className="hero-scan-cards">
        {scanCards.map((card, i) => (
          <div key={i} className="hero-scan-card" style={{ animationDelay: `${card.delay}s` }}>
            <div className="hero-scan-card-label">{card.title}</div>
            <div className="hero-scan-card-value" style={{ color: card.color }}>{card.value}</div>
            <div className="hero-scan-card-risk" style={{ color: card.color }}>{card.label}</div>
            <div className="hero-scan-card-bar">
              <div className="hero-scan-card-bar-fill" style={{
                width: parseInt(card.value) + '%',
                background: card.color,
                animationDelay: `${card.delay + 0.3}s`,
              }} />
            </div>
          </div>
        ))}
      </div>

      {/* Floating alert notifications */}
      {alerts.map((alert, i) => (
        <div
          key={i}
          className="hero-alert"
          style={{
            top: `${12 + (i % 4) * 11}%`,
            right: i < 4 ? '5%' : 'auto',
            left: i >= 4 ? '5%' : 'auto',
            animationDelay: `${alert.delay}s`,
            borderColor:
              alert.type === 'SCAM' ? 'rgba(239,83,80,0.4)' :
              alert.type === 'WARNING' ? 'rgba(255,167,38,0.4)' :
              alert.type === 'REPORT' ? 'rgba(66,165,245,0.4)' :
              'rgba(179,136,255,0.4)',
          }}
        >
          <div className="hero-alert-icon" style={{
            color:
              alert.type === 'SCAM' ? '#ef5350' :
              alert.type === 'WARNING' ? '#ffa726' :
              alert.type === 'REPORT' ? '#42a5f5' :
              '#b388ff',
          }}>
            {alert.icon}
          </div>
          <div className="hero-alert-content">
            <div className="hero-alert-type" style={{
              color:
                alert.type === 'SCAM' ? '#ef5350' :
                alert.type === 'WARNING' ? '#ffa726' :
                alert.type === 'REPORT' ? '#42a5f5' :
                '#b388ff',
            }}>
              {alert.type}
            </div>
            <div className="hero-alert-msg">{alert.msg}</div>
          </div>
          <div className="hero-alert-risk" style={{
            color:
              alert.risk > 85 ? '#ef5350' : alert.risk > 60 ? '#ffa726' : '#b388ff',
          }}>
            {alert.risk}
          </div>
        </div>
      ))}

      {/* Center content */}
      <div className="hero-content">
        <div className="hero-shield-wrap">
          <div className="hero-shield-ring" />
          <div className="hero-shield-ring-2" />
          <LogoSvg width="90" height="90" className="hero-shield-icon" />
        </div>
        <h1 className="hero-title">
          <span>JobShield AI</span>
        </h1>
        <p className="hero-tagline">
          AI-Powered Job Scam Detection
        </p>
        <p className="hero-subtitle">
          Real-time AI protection scanning job listings, emails, and recruiters.
          <br />Detect scams before they cost you.
        </p>
        <div className="hero-cta">
          <Link to="/scanner" className="btn btn-primary btn-lg btn-ripple">
            <FiShield /> Scan a Job — Free
          </Link>
          <a href="#features" className="btn btn-outline btn-lg">
            How It Works <FiArrowRight />
          </a>
        </div>
        <div className="hero-stats-bar">
          <span><FiCheckCircle style={{ color: '#b388ff' }} /> 15,420+ scams detected</span>
          <span className="hero-stats-divider" />
          <span><FiShield style={{ color: '#42a5f5' }} /> 87,340+ users protected</span>
        </div>
      </div>

      {/* Bottom scan bar */}
      <div className="hero-bottom-bar">
        <span><FiSearch size={12} /> Scanning job portals...</span>
        <span className="hero-bottom-dot">●</span>
        <span>1,284 listings analyzed today</span>
        <span className="hero-bottom-dot">●</span>
        <span>12 scams blocked in last hour</span>
      </div>
    </section>
  );
};

export default HeroSection;
