import React from 'react';

const RiskBadge = ({ level, size }) => {
  const normalized = (level || '').toLowerCase();
  const cls = normalized === 'safe' ? 'badge-safe' :
             normalized === 'suspicious' ? 'badge-suspicious' :
             normalized === 'scam' ? 'badge-scam' : 'badge-pending';
  const label = normalized.charAt(0).toUpperCase() + normalized.slice(1) || 'Unknown';
  return <span className={`badge ${cls}`} style={size === 'sm' ? { fontSize: '0.7rem', padding: '2px 8px' } : {}}>{label}</span>;
};

export default RiskBadge;
