import React from 'react';
import ReportForm from '../components/community/ReportForm';

const NewReportPage = () => {
  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>Report a Scam</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Help protect others by reporting suspicious job listings
        </p>
      </div>
      <ReportForm />
    </div>
  );
};

export default NewReportPage;
