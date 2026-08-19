import React, { useState, useEffect } from 'react';
import { getSavedScans, deleteScan } from '../../services/scanService';
import RiskBadge from '../common/RiskBadge';
import EmptyState from '../common/EmptyState';
import SkeletonCard from '../common/SkeletonCard';
import { FiBookmark, FiTrash2, FiEye, FiCalendar } from 'react-icons/fi';
import { toast } from 'react-toastify';

const SavedJobsList = ({ onView }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getSavedScans()
      .then((data) => setJobs(data.data || data.scans || []))
      .catch(() => toast.error('Failed to load saved jobs'))
      .finally(() => setLoading(false));
  }, []);

  const removeSaved = async (job) => {
    try {
      await deleteScan(job._id || job.id);
      setJobs((prev) => prev.filter((j) => (j._id || j.id) !== (job._id || job.id)));
      toast.success('Removed from saved');
    } catch {
      toast.error('Failed to remove');
    }
  };

  if (loading) return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}><SkeletonCard count={6} /></div>;

  if (!jobs.length) {
    return (
      <EmptyState
        icon={<FiBookmark />}
        title="No saved jobs"
        message="Save job scans to quickly access them later."
        actionText="Go to Scanner"
        actionLink="/scanner"
      />
    );
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
      {jobs.map((job) => (
        <div key={job._id || job.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onView && onView(job)}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
            <RiskBadge level={job.riskLevel} />
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); onView && onView(job); }} title="View">
                <FiEye />
              </button>
              <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); removeSaved(job); }} title="Remove">
                <FiTrash2 />
              </button>
            </div>
          </div>
          <h4 style={{ marginBottom: 4 }}>{job.jobTitle}</h4>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{job.companyName}</p>
          {job.salary && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>💰 {job.salary}</p>}
          {job.location && <p style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginBottom: 4 }}>📍 {job.location}</p>}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: 12 }}>
            <FiCalendar /> Saved on {job.savedAt || job.createdAt ? new Date(job.savedAt || job.createdAt).toLocaleDateString() : 'N/A'}
          </div>
        </div>
      ))}
    </div>
  );
};

export default SavedJobsList;
