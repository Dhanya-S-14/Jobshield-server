import React from 'react';
import RiskScoreGauge from '../common/RiskScoreGauge';
import RiskBadge from '../common/RiskBadge';
import AnalysisDetail from './AnalysisDetail';
import { FiSave, FiRefreshCw, FiCpu, FiCheckCircle, FiXCircle, FiAlertTriangle } from 'react-icons/fi';

const ScanResults = ({ results, onSave, onRescan }) => {
  if (!results) return null;

  const { riskScore, riskLevel, riskLabel, verdict, explanation, analysis, positiveIndicators, redFlags, recommendation } = results;
  const analysisArray = analysis || [];

  const sectionStyle = (delay) => ({
    animation: `fadeInUp 0.5s ease forwards`,
    animationDelay: `${delay}s`,
    opacity: 0,
  });

  return (
    <div className="results-card">
      <h2>Scan Results</h2>

      <div style={sectionStyle(0)}>
        <RiskScoreGauge score={riskScore || 0} />
      </div>

      <div style={{ ...sectionStyle(0.1), textAlign: 'center', marginBottom: 4 }}>
        <RiskBadge level={riskLevel} />
      </div>

      {verdict && (
        <div style={{ ...sectionStyle(0.15), textAlign: 'center', marginBottom: 16 }}>
          <span className={`verdict-badge verdict-${(riskLevel || '').toLowerCase()}`}>
            {verdict === 'Likely Legitimate' ? <FiCheckCircle style={{ marginRight: 6 }} /> : verdict === 'Suspicious' ? <FiAlertTriangle style={{ marginRight: 6 }} /> : <FiXCircle style={{ marginRight: 6 }} />}
            {verdict}
          </span>
          <span style={{ marginLeft: 8, fontSize: '0.8rem', color: 'var(--text-muted)' }}>({riskLabel})</span>
        </div>
      )}

      {explanation && (
        <div className="ai-explanation" style={sectionStyle(0.2)}>
          <h4><FiCpu /> AI Analysis</h4>
          <p>{explanation}</p>
        </div>
      )}

      {redFlags && redFlags.length > 0 && (
        <div className="results-section results-section-danger" style={sectionStyle(0.25)}>
          <h4 style={{ color: 'var(--danger)', marginBottom: 10, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiXCircle /> Red Flags ({redFlags.length})
          </h4>
          <ul style={{ paddingLeft: 20, listStyle: 'disc' }}>
            {redFlags.map((rf, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 6 }}>{rf}</li>
            ))}
          </ul>
        </div>
      )}

      {positiveIndicators && positiveIndicators.length > 0 && (
        <div className="results-section results-section-success" style={sectionStyle(0.3)}>
          <h4 style={{ color: 'var(--success)', marginBottom: 10, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 6 }}>
            <FiCheckCircle /> Positive Indicators ({positiveIndicators.length})
          </h4>
          <ul style={{ paddingLeft: 20, listStyle: 'disc' }}>
            {positiveIndicators.map((pi, i) => (
              <li key={i} style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 4 }}>{pi}</li>
            ))}
          </ul>
        </div>
      )}

      {analysisArray.length > 0 && (
        <div style={{ ...sectionStyle(0.35), marginTop: 20 }}>
          <h4 style={{ marginBottom: 12, fontSize: '0.95rem', fontWeight: 600 }}>Detailed Breakdown</h4>
          {analysisArray.map((item, i) => (
            <div key={i} className="stagger-item" style={{ animation: `fadeInUp 0.4s ease forwards`, animationDelay: `${0.4 + i * 0.08}s`, opacity: 0 }}>
              <AnalysisDetail item={item} />
            </div>
          ))}
        </div>
      )}

      {recommendation && (
        <div className={`results-section results-section-${(riskLevel || '').toLowerCase()}`} style={sectionStyle(0.4)}>
          <h4 style={{ fontSize: '0.95rem', marginBottom: 6 }}>Recommendation</h4>
          <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>{recommendation}</p>
        </div>
      )}

      <div className="results-actions" style={sectionStyle(0.45)}>
        {onSave && (
          <button className="btn btn-success btn-ripple" onClick={() => onSave(results)}>
            <FiSave /> Save Result
          </button>
        )}
        {onRescan && (
          <button className="btn btn-secondary btn-ripple" onClick={onRescan}>
            <FiRefreshCw /> Scan Again
          </button>
        )}
      </div>
    </div>
  );
};

export default ScanResults;
