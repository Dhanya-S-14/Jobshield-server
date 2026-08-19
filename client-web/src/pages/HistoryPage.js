import React, { useState } from 'react';
import ScanHistoryList from '../components/history/ScanHistoryList';
import ScanDetailModal from '../components/history/ScanDetailModal';

const HistoryPage = () => {
  const [selectedScan, setSelectedScan] = useState(null);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>Scan History</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Browse all your past job scans and risk assessments
        </p>
      </div>
      <ScanHistoryList onView={setSelectedScan} />
      <ScanDetailModal scanId={selectedScan?._id || selectedScan?.id} onClose={() => setSelectedScan(null)} onUpdate={() => {}} />
    </div>
  );
};

export default HistoryPage;
