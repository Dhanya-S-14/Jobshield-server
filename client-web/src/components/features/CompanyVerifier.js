import React, { useState } from 'react';
import { FiBriefcase, FiSearch, FiCheckCircle, FiXCircle, FiAlertTriangle, FiInfo, FiShield, FiGlobe, FiMapPin, FiUsers, FiCalendar } from 'react-icons/fi';
import { verifyCompany } from '../../services/companyService';

const getScoreColor = (score) => {
  if (score >= 70) return 'var(--success)';
  if (score >= 40) return 'var(--warning)';
  return 'var(--danger)';
};

const getScoreLabel = (score) => {
  if (score >= 80) return 'Excellent';
  if (score >= 70) return 'Good';
  if (score >= 50) return 'Fair';
  if (score >= 30) return 'Poor';
  return 'Very Poor';
};

const getSignalIcon = (type) => {
  switch (type) {
    case 'positive': return <FiCheckCircle />;
    case 'danger': return <FiXCircle />;
    case 'warning': return <FiAlertTriangle />;
    case 'info': return <FiInfo />;
    default: return <FiInfo />;
  }
};

const getSignalColor = (type) => {
  switch (type) {
    case 'positive': return 'var(--success)';
    case 'danger': return 'var(--danger)';
    case 'warning': return 'var(--warning)';
    case 'info': return 'var(--info)';
    default: return 'var(--text-muted)';
  }
};

const CompanyVerifier = () => {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await verifyCompany(query.trim());
      if (res.success && res.data) {
        setResult(res.data);
      } else {
        setError(res.message || 'Verification failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to verify company. Is the server running?');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
        <FiBriefcase /> Company Verification
      </h3>
      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: 16 }}>
        Check if a company is legitimate or potentially a scam
      </p>

      <div style={{ display: 'flex', gap: 12 }}>
        <input
          type="text"
          className="form-input"
          placeholder="Enter company name..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          style={{ flex: 1 }}
        />
        <button className="btn btn-primary" onClick={search} disabled={loading}>
          <FiSearch /> {loading ? '...' : 'Verify'}
        </button>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: 40 }}>
          <div className="loader-spinner" />
          <p style={{ color: 'var(--text-muted)', marginTop: 12 }}>Analyzing company...</p>
        </div>
      )}

      {error && (
        <div style={{
          textAlign: 'center', padding: 20, marginTop: 16,
          background: 'rgba(211, 47, 47, 0.08)', borderRadius: 12,
          color: 'var(--danger)'
        }}>
          <FiXCircle style={{ fontSize: '1.5rem', marginBottom: 8 }} />
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div className="company-info" style={{ marginTop: 24 }}>
          {/* Trust Score Circle */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              width: 120, height: 120, borderRadius: '50%',
              border: `4px solid ${getScoreColor(result.trustScore)}`,
              display: 'inline-flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              marginBottom: 12
            }}>
              <span style={{ fontSize: '2rem', fontWeight: 800, color: getScoreColor(result.trustScore), lineHeight: 1 }}>
                {result.trustScore}
              </span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: 1 }}>
                / 100
              </span>
            </div>
            <h3 style={{ margin: '4px 0' }}>{result.company?.name || query}</h3>
            <span style={{
              display: 'inline-block', padding: '4px 14px', borderRadius: 20,
              fontSize: '0.8rem', fontWeight: 700,
              background: getScoreColor(result.trustScore) + '20',
              color: getScoreColor(result.trustScore)
            }}>
              {getScoreLabel(result.trustScore)} Trust Score
            </span>
            <div style={{ marginTop: 8 }}>
              <span style={{
                display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                fontSize: '0.75rem', fontWeight: 700,
                background: result.riskColor === 'green' ? 'rgba(56, 142, 60, 0.12)' :
                            result.riskColor === 'orange' ? 'rgba(245, 124, 0, 0.12)' :
                            'rgba(211, 47, 47, 0.12)',
                color: result.riskColor === 'green' ? 'var(--success)' :
                       result.riskColor === 'orange' ? 'var(--warning)' :
                       'var(--danger)'
              }}>
                {result.riskLevel}
              </span>
              {result.inDatabase && (
                <span style={{
                  display: 'inline-block', padding: '4px 12px', borderRadius: 20,
                  fontSize: '0.75rem', fontWeight: 700, marginLeft: 8,
                  background: result.verified ? 'rgba(56, 142, 60, 0.12)' : 'rgba(245, 124, 0, 0.12)',
                  color: result.verified ? 'var(--success)' : 'var(--warning)'
                }}>
                  {result.verified ? 'Verified Company' : 'Unverified'}
                </span>
              )}
            </div>
          </div>

          {/* Company Details */}
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16, marginBottom: 16 }}>
            <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Company Details</h4>
            {result.company?.website && (
              <div className="company-info-row">
                <span className="label"><FiGlobe style={{ marginRight: 6 }} />Website</span>
                <span className="value">{result.company.website}</span>
              </div>
            )}
            {result.company?.domain && (
              <div className="company-info-row">
                <span className="label"><FiGlobe style={{ marginRight: 6 }} />Domain</span>
                <span className="value">{result.company.domain}</span>
              </div>
            )}
            {result.company?.industry && (
              <div className="company-info-row">
                <span className="label"><FiBriefcase style={{ marginRight: 6 }} />Industry</span>
                <span className="value">{result.company.industry}</span>
              </div>
            )}
            {result.company?.location && (
              <div className="company-info-row">
                <span className="label"><FiMapPin style={{ marginRight: 6 }} />Location</span>
                <span className="value">{result.company.location}</span>
              </div>
            )}
            {result.company?.employeeCount && (
              <div className="company-info-row">
                <span className="label"><FiUsers style={{ marginRight: 6 }} />Size</span>
                <span className="value">{result.company.employeeCount}</span>
              </div>
            )}
            {result.company?.foundedYear && (
              <div className="company-info-row">
                <span className="label"><FiCalendar style={{ marginRight: 6 }} />Founded</span>
                <span className="value">{result.company.foundedYear}</span>
              </div>
            )}
          </div>

          {/* Signals */}
          {result.signals && result.signals.length > 0 && (
            <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: 16 }}>
              <h4 style={{ margin: '0 0 12px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                <FiShield style={{ marginRight: 6 }} />Analysis Signals
              </h4>
              {result.signals.map((signal, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 10,
                  padding: '8px 0',
                  borderBottom: i < result.signals.length - 1 ? '1px solid var(--border-color)' : 'none'
                }}>
                  <span style={{ color: getSignalColor(signal.type), fontSize: '1.1rem', marginTop: 2, flexShrink: 0 }}>
                    {getSignalIcon(signal.type)}
                  </span>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {signal.text}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {!result && !loading && !error && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>
          <FiShield style={{ fontSize: '2.5rem', marginBottom: 12, opacity: 0.4 }} />
          <p>Enter a company name above to verify its legitimacy</p>
        </div>
      )}
    </div>
  );
};

export default CompanyVerifier;
