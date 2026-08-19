import React, { useState } from 'react';
import { FiMail, FiSearch, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

const EmailAnalyzer = () => {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!email || !/\S+@\S+\.\S+/.test(email)) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const domain = email.split('@')[1] || '';
    const freeDomains = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com', 'mail.com'];
    const isFree = freeDomains.includes(domain.toLowerCase());
    const typos = ['gmial.com', 'yaho.com', 'hotmai.com', 'outlok.com', 'gmal.com'];
    const isTypo = typos.some((t) => domain.toLowerCase().includes(t));
    const suspicious = domain.split('.').length > 3 || domain.length > 30;
    const hasSpaces = email.includes(' ');
    const score = (isFree ? 15 : 0) + (isTypo ? 40 : 0) + (suspicious ? 30 : 0) + (hasSpaces ? 15 : 0);
    const level = score <= 15 ? 'safe' : score <= 45 ? 'suspicious' : 'scam';
    setResult({ domain, isFree, isTypo, suspicious, hasSpaces, score, level, email });
    setLoading(false);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}><FiMail /> Email Analyzer</h3>
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="email"
          className="form-input"
          placeholder="Enter recruiter email..."
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={analyze} disabled={loading}>
          <FiSearch /> {loading ? '...' : 'Analyze'}
        </button>
      </div>
      {result && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {result.level === 'safe' ? <FiCheckCircle style={{ color: 'var(--success)', fontSize: '2rem' }} /> :
             result.level === 'suspicious' ? <FiAlertTriangle style={{ color: 'var(--warning)', fontSize: '2rem' }} /> :
             <FiXCircle style={{ color: 'var(--danger)', fontSize: '2rem' }} />}
            <div>
              <strong style={{ fontSize: '1.1rem' }}>Risk Score: {result.score}/100</strong>
              <div className="risk-gauge-label" style={{ textTransform: 'capitalize' }}>{result.level}</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16 }}>
            {[
              { label: 'Domain', value: result.domain },
              { label: 'Free Email Provider', value: result.isFree ? 'Yes' : 'No', warn: result.isFree },
              { label: 'Typo Detected', value: result.isTypo ? 'Yes' : 'No', warn: result.isTypo },
              { label: 'Suspicious Format', value: result.suspicious ? 'Yes' : 'No', warn: result.suspicious },
              { label: 'Contains Spaces', value: result.hasSpaces ? 'Yes' : 'No', warn: result.hasSpaces },
            ].map((r, i) => (
              <div key={i} className="company-info-row">
                <span className="label">{r.label}</span>
                <span className="value" style={{ color: r.warn ? 'var(--danger)' : 'var(--success)', fontWeight: 600 }}>{r.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default EmailAnalyzer;
