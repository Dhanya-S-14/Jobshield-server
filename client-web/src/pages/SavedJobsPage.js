import React, { useState } from 'react';
import SavedJobsList from '../components/saved/SavedJobsList';
import ScanDetailModal from '../components/history/ScanDetailModal';

const SavedJobsPage = () => {
  const [selectedJob, setSelectedJob] = useState(null);

  return (
    <div className="page-container">
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>Saved Jobs</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          View and manage your saved job scan results
        </p>
      </div>
      <SavedJobsList onView={setSelectedJob} />
      <ScanDetailModal scanId={selectedJob?._id || selectedJob?.id} onClose={() => setSelectedJob(null)} onUpdate={() => {}} />
    </div>
  );
};

export default SavedJobsPage;
