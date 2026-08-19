import React, { useState, useEffect, useCallback } from 'react';
import { getReports } from '../../services/reportService';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import SkeletonCard from '../common/SkeletonCard';
import { FiFlag, FiClock, FiEye } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ReportList = ({ onView }) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('approved');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getReports({ page, limit: 12, search, status });
      setReports(data.data || data.reports || []);
      setTotalPages(data.pagination?.pages || data.totalPages || data.pages || 1);
    } catch {
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page, search, status]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const getStatusBadge = (s) => {
    const cls = s === 'approved' ? 'badge-approved' : s === 'rejected' ? 'badge-rejected' : 'badge-pending';
    return <span className={`badge ${cls}`}>{s || 'pending'}</span>;
  };

  return (
    <div>
      <div className="filter-bar">
        <SearchBar onSearch={handleSearch} placeholder="Search reports..." />
        <select className="filter-select" value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}>
          <option value="approved">Approved</option>
          <option value="pending">Pending</option>
          <option value="">All</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
          <SkeletonCard count={6} />
        </div>
      ) : reports.length === 0 ? (
        <EmptyState
          icon={<FiFlag />}
          title="No reports yet"
          message="Be the first to report a job scam and help protect others."
          actionText="Report a Scam"
          actionLink="/new-report"
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {reports.map((r) => (
            <div key={r._id || r.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onView && onView(r)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <h4 style={{ marginBottom: 2 }}>{r.companyName}</h4>
                  <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{r.jobTitle}</p>
                </div>
                {getStatusBadge(r.status)}
              </div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {r.description}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                <span><FiClock /> {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : 'N/A'}</span>
                <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); onView && onView(r); }}>
                  <FiEye /> Details
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default ReportList;
