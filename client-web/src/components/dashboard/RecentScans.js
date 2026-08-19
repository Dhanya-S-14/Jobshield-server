import React from 'react';
import { Link } from 'react-router-dom';
import RiskBadge from '../common/RiskBadge';
import { FiEye, FiTrash2 } from 'react-icons/fi';

const RecentScans = ({ scans = [], onView, onDelete }) => {
  if (!scans.length) {
    return (
      <div className="card">
        <div className="card-header"><h3>Recent Scans</h3></div>
        <div style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
          No scans yet. <Link to="/scanner" style={{ color: 'var(--primary-main)' }}>Scan your first job</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <div className="card-header">
        <h3>Recent Scans</h3>
        <Link to="/history" style={{ fontSize: '0.85rem', color: 'var(--primary-main)', fontWeight: 600 }}>View All</Link>
      </div>
      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Company</th>
              <th>Job Title</th>
              <th>Date</th>
              <th>Risk</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {scans.slice(0, 5).map((s) => (
              <tr key={s._id || s.id}>
                <td><strong>{s.companyName}</strong></td>
                <td>{s.jobTitle}</td>
                <td style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}
                </td>
                <td><RiskBadge level={s.riskLevel} /></td>
                <td>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <button className="btn btn-sm btn-secondary" onClick={() => onView && onView(s)} title="View">
                      <FiEye />
                    </button>
                    <button className="btn btn-sm btn-danger" onClick={() => onDelete && onDelete(s)} title="Delete">
                      <FiTrash2 />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentScans;
