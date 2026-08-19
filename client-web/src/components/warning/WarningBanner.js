import React, { useState, useEffect, useCallback } from 'react';
import { FiAlertTriangle, FiX, FiAlertCircle, FiShield, FiInfo, FiRefreshCw } from 'react-icons/fi';
import api from '../../services/api';

const WarningBanner = () => {
  const [warnings, setWarnings] = useState([]);
  const [dismissed, setDismissed] = useState(new Set());
  const [currentIdx, setCurrentIdx] = useState(0);

  const fetchWarnings = useCallback(async () => {
    try {
      const res = await api.get('/api/warnings');
      if (res.data.success) {
        setWarnings(res.data.data);
      }
    } catch (err) {}
  }, []);

  useEffect(() => {
    fetchWarnings();
    const interval = setInterval(fetchWarnings, 60000);
    return () => clearInterval(interval);
  }, [fetchWarnings]);

  const severityConfig = {
    critical: { bg: '#dc2626', color: '#fff', icon: <FiAlertTriangle />, label: 'CRITICAL' },
    high: { bg: '#ea580c', color: '#fff', icon: <FiAlertCircle />, label: 'HIGH' },
    medium: { bg: '#d97706', color: '#fff', icon: <FiInfo />, label: 'ALERT' },
    low: { bg: '#2563eb', color: '#fff', icon: <FiShield />, label: 'INFO' }
  };

  const typeLabels = {
    scam_alert: 'Scam Alert',
    new_pattern: 'New Pattern Detected',
    community_report: 'Community Report',
    system: 'System Notice'
  };

  const activeWarnings = warnings.filter(w => !dismissed.has(w._id));

  useEffect(() => {
    if (activeWarnings.length > 1) {
      const timer = setInterval(() => {
        setCurrentIdx(prev => (prev + 1) % activeWarnings.length);
      }, 6000);
      return () => clearInterval(timer);
    }
  }, [activeWarnings.length]);

  const dismissWarning = async (id) => {
    setDismissed(prev => new Set([...prev, id]));
    try {
      await api.put(`/api/warnings/${id}/dismiss`);
    } catch (err) {}
  };

  if (activeWarnings.length === 0) return null;

  const currentWarning = activeWarnings[currentIdx % activeWarnings.length];
  const sev = severityConfig[currentWarning.severity] || severityConfig.medium;

  return (
    <div className="warning-banner" style={{ backgroundColor: sev.bg, color: sev.color }}>
      <div className="warning-banner-content">
        <div className="warning-banner-icon">{sev.icon}</div>
        <div className="warning-banner-text">
          <span className="warning-banner-label">{sev.label}: {typeLabels[currentWarning.type] || 'Notice'}</span>
          <span className="warning-banner-message">{currentWarning.message}</span>
        </div>
        {activeWarnings.length > 1 && (
          <div className="warning-banner-dots">
            {activeWarnings.map((_, i) => (
              <span key={i} className={`warning-dot ${i === (currentIdx % activeWarnings.length) ? 'active' : ''}`}
                onClick={() => setCurrentIdx(i)} />
            ))}
          </div>
        )}
      </div>
      <div className="warning-banner-actions">
        <button onClick={() => dismissWarning(currentWarning._id)} className="warning-banner-close" title="Dismiss">
          <FiX size={16} />
        </button>
      </div>
    </div>
  );
};

const ScanWarnings = ({ companyName, jobDescription }) => {
  const [matchedWarnings, setMatchedWarnings] = useState([]);

  const checkWarnings = useCallback(async () => {
    try {
      const res = await api.get('/api/warnings');
      if (res.data.success) {
        const allWarnings = res.data.data;
        const matches = allWarnings.filter(w => {
          if (w.companies?.length) {
            const nameLower = companyName?.toLowerCase() || '';
            if (w.companies.some(c => nameLower.includes(c.toLowerCase()))) return true;
          }
          if (w.keywords?.length) {
            const descLower = jobDescription?.toLowerCase() || '';
            if (w.keywords.some(k => descLower.includes(k.toLowerCase()))) return true;
          }
          return false;
        });
        setMatchedWarnings(matches);
      }
    } catch (err) {}
  }, [companyName, jobDescription]);

  useEffect(() => { checkWarnings(); }, [checkWarnings]);

  if (matchedWarnings.length === 0) return null;

  return (
    <div className="scan-warnings">
      {matchedWarnings.map(w => (
        <div key={w._id} className={`scan-warning-item severity-${w.severity}`}>
          <FiAlertTriangle size={16} />
          <div>
            <strong>{w.title}</strong>
            <p>{w.message}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export { WarningBanner, ScanWarnings };
