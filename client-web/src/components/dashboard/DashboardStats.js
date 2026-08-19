import React from 'react';
import { FiShield, FiCheckCircle, FiAlertTriangle, FiAlertOctagon } from 'react-icons/fi';

const statsConfig = [
  { icon: <FiShield />, label: 'Total Scans', color: 'blue', key: 'total' },
  { icon: <FiCheckCircle />, label: 'Safe Jobs', color: 'green', key: 'safe' },
  { icon: <FiAlertOctagon />, label: 'Scam Jobs', color: 'red', key: 'scam' },
  { icon: <FiAlertTriangle />, label: 'Suspicious', color: 'orange', key: 'suspicious' },
];

const DashboardStats = ({ stats = {} }) => {
  const items = statsConfig.map((s) => ({
    ...s,
    value: stats[s.key] !== undefined ? stats[s.key] : 0,
  }));

  return (
    <div className="dashboard-stats">
      {items.map((item, i) => (
        <div key={i} className="stat-card-dashboard animate-fadeInUp" style={{ animationDelay: `${i * 0.1}s` }}>
          <div className={`stat-card-icon ${item.color}`}>{item.icon}</div>
          <div className="stat-card-info">
            <h3>{item.value.toLocaleString()}</h3>
            <p>{item.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardStats;
