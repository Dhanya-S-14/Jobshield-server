import React, { useState } from 'react';
import { FiChevronDown, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';

const statusIcons = {
  safe: <FiCheckCircle />,
  suspicious: <FiAlertTriangle />,
  scam: <FiXCircle />,
};

const AnalysisDetail = ({ item }) => {
  const [open, setOpen] = useState(false);
  const { category, status, details, summary } = item;
  const icon = statusIcons[status] || null;

  return (
    <div className="analysis-detail animate-fadeIn">
      <div className="analysis-header" onClick={() => setOpen(!open)}>
        <div className={`analysis-icon ${status}`}>{icon}</div>
        <div className="analysis-info">
          <h4>{category || 'Category'}</h4>
          <p>{summary || `${details?.length || 0} findings`}</p>
        </div>
        <FiChevronDown className={`analysis-chevron ${open ? 'open' : ''}`} />
      </div>
      <div className={`analysis-body ${open ? 'open' : ''}`}>
        {details && details.length > 0 ? (
          <ul>
            {details.map((d, i) => (
              <li key={i}>{d}</li>
            ))}
          </ul>
        ) : (
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No details available</p>
        )}
      </div>
    </div>
  );
};

export default AnalysisDetail;
