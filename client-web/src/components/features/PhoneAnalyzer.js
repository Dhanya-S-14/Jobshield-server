import React, { useState } from 'react';
import { FiPhone, FiSearch, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

const PhoneAnalyzer = () => {
  const [phone, setPhone] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!phone) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const digits = phone.replace(/[^0-9]/g, '');
    const hasCountryCode = phone.startsWith('+');
    const validLength = digits.length >= 10 && digits.length <= 15;
    const knownScamPrefixes = ['900', '876', '809', '284', '473'];
    const startsWithScam = knownScamPrefixes.some((p) => digits.startsWith(p));
    const repeated = /(\d)\1{5,}/.test(digits);
    const consecutive = /012345|123456|234567|345678|456789|567890/.test(digits);

    let score = 0;
    if (!hasCountryCode) score += 10;
    if (!validLength) score += 30;
    if (startsWithScam) score += 40;
    if (repeated) score += 20;
    if (consecutive) score += 15;

    const level = score <= 15 ? 'safe' : score <= 40 ? 'suspicious' : 'scam';
    setResult({ score, level, validLength, hasCountryCode, startsWithScam, repeated, consecutive, digits });
    setLoading(false);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}><FiPhone /> Phone Analyzer</h3>
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          className="form-input"
          placeholder="+1 (555) 123-4567"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={analyze} disabled={loading}>
          <FiSearch /> {loading ? '...' : 'Check'}
        </button>
      </div>
      {result && (
        <div style={{ marginTop: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            {result.level === 'safe' ? <FiCheckCircle style={{ color: 'var(--success)', fontSize: '2rem' }} /> :
             result.level === 'suspicious' ? <FiAlertTriangle style={{ color: 'var(--warning)', fontSize: '2rem' }} /> :
             <FiXCircle style={{ color: 'var(--danger)', fontSize: '2rem' }} />}
            <div>
              <strong>Risk Score: {result.score}/100</strong>
              <div className="risk-gauge-label" style={{ textTransform: 'capitalize' }}>{result.level}</div>
            </div>
          </div>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16 }}>
            {[
              { label: 'Valid Format', value: result.validLength ? 'Yes' : 'No', warn: !result.validLength },
              { label: 'Country Code', value: result.hasCountryCode ? 'Present' : 'Missing', warn: !result.hasCountryCode },
              { label: 'Known Scam Prefix', value: result.startsWithScam ? 'Yes' : 'No', warn: result.startsWithScam },
              { label: 'Repeated Digits', value: result.repeated ? 'Yes' : 'No', warn: result.repeated },
              { label: 'Consecutive Pattern', value: result.consecutive ? 'Yes' : 'No', warn: result.consecutive },
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

export default PhoneAnalyzer;
