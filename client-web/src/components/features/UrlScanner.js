import React, { useState } from 'react';
import { FiLink, FiSearch, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

const UrlScanner = () => {
  const [url, setUrl] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const analyze = async () => {
    if (!url) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    const hasHttps = url.startsWith('https://');
    const hasHttp = url.startsWith('http://');
    const suspiciousTerms = ['free', 'bonus', 'earn-money', 'click-here', 'win', 'prize', 'work-from-home', 'get-rich', 'bitly', 'tinyurl', 'shorturl'];
    const containsSuspicious = suspiciousTerms.some((t) => url.toLowerCase().includes(t));
    const isShortened = url.includes('bit.ly') || url.includes('tinyurl.com') || url.includes('shorturl') || url.includes('goo.gl') || url.includes('t.co');
    const hasIp = /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
    const subdomainCount = (url.match(/\./g) || []).length > 3;
    const score = (!hasHttps ? 25 : 0) + (containsSuspicious ? 25 : 0) + (isShortened ? 20 : 0) + (hasIp ? 20 : 0) + (subdomainCount ? 10 : 0);
    const level = score <= 20 ? 'safe' : score <= 45 ? 'suspicious' : 'scam';
    setResult({ hasHttps, hasHttp, containsSuspicious, isShortened, hasIp, subdomainCount, score, level, url });
    setLoading(false);
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16 }}><FiLink /> URL Scanner</h3>
      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Enter job listing URL..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={analyze} disabled={loading}>
          <FiSearch /> {loading ? '...' : 'Scan'}
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
              { label: 'HTTPS Secure', value: result.hasHttps ? 'Yes' : 'No', warn: !result.hasHttps },
              { label: 'Suspicious Keywords', value: result.containsSuspicious ? 'Found' : 'None', warn: result.containsSuspicious },
              { label: 'Shortened URL', value: result.isShortened ? 'Yes' : 'No', warn: result.isShortened },
              { label: 'IP Address Instead of Domain', value: result.hasIp ? 'Yes' : 'No', warn: result.hasIp },
              { label: 'Excessive Subdomains', value: result.subdomainCount ? 'Yes' : 'No', warn: result.subdomainCount },
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

export default UrlScanner;
