import React from 'react';
import { Link } from 'react-router-dom';
import ReportList from '../components/community/ReportList';
import { FiPlus } from 'react-icons/fi';

const CommunityReportsPage = () => {
  return (
    <div className="page-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>Community Reports</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Browse reported job scams and help protect the community
          </p>
        </div>
        <Link to="/new-report" className="btn btn-primary">
          <FiPlus /> Report a Scam
        </Link>
      </div>
      <ReportList />
      <div style={{ textAlign: 'center', marginTop: 32 }}>
        <Link to="/new-report" className="fab-button" title="Report a Scam">
          <FiPlus />
        </Link>
      </div>
    </div>
  );
};

export default CommunityReportsPage;
