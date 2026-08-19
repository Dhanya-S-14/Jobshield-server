import React from 'react';
import CompanyVerifier from '../components/features/CompanyVerifier';
import { FiBriefcase } from 'react-icons/fi';

const CompanyVerifyPage = () => {
  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 12 }}>
          <FiBriefcase /> Company Verification
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Verify if a company is legitimate before applying
        </p>
      </div>
      <CompanyVerifier />
    </div>
  );
};

export default CompanyVerifyPage;
