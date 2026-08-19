import React, { useState, useEffect, useCallback } from 'react';
import SearchBar from '../common/SearchBar';
import RiskBadge from '../common/RiskBadge';
import Pagination from '../common/Pagination';
import EmptyState from '../common/EmptyState';
import SkeletonCard from '../common/SkeletonCard';
import { getScanHistory, deleteScan } from '../../services/scanService';
import { FiEye, FiTrash2, FiSave, FiGrid, FiList, FiClock, FiAlertTriangle } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ScanHistoryList = ({ onView }) => {
  const [scans, setScans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [sort, setSort] = useState('newest');
  const [viewMode, setViewMode] = useState('table');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchScans = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 10, search, riskLevel: filter !== 'all' ? filter : undefined, sort };
      const data = await getScanHistory(params);
      setScans(data.data || data.scans || []);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch {
      toast.error('Failed to load history');
      setScans([]);
    } finally {
      setLoading(false);
    }
  }, [page, search, filter, sort]);

  useEffect(() => { fetchScans(); }, [fetchScans]);

  const handleDelete = async (s) => {
    if (!window.confirm('Delete this scan?')) return;
    try {
      await deleteScan(s._id || s.id);
      toast.success('Scan deleted');
      fetchScans();
    } catch {
      toast.error('Delete failed');
    }
  };

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  return (
    <div>
      <div className="filter-bar">
        <SearchBar onSearch={handleSearch} placeholder="Search by company or job title..." />
        <select className="filter-select" value={filter} onChange={(e) => { setFilter(e.target.value); setPage(1); }}>
          <option value="all">All Risk Levels</option>
          <option value="safe">Safe</option>
          <option value="suspicious">Suspicious</option>
          <option value="scam">Scam</option>
        </select>
        <select className="filter-select" value={sort} onChange={(e) => { setSort(e.target.value); setPage(1); }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="highest">Highest Risk</option>
          <option value="lowest">Lowest Risk</option>
        </select>
        <div className="view-toggle">
          <button className={viewMode === 'table' ? 'active' : ''} onClick={() => setViewMode('table')}><FiList /></button>
          <button className={viewMode === 'grid' ? 'active' : ''} onClick={() => setViewMode('grid')}><FiGrid /></button>
        </div>
      </div>

      {loading ? (
        <SkeletonCard count={5} />
      ) : scans.length === 0 ? (
        <EmptyState
          icon={<FiClock />}
          title="No scan history"
          message="You haven't scanned any jobs yet. Start scanning to see your history here."
          actionText="Scan a Job"
          actionLink="/scanner"
        />
      ) : viewMode === 'table' ? (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Company</th>
                  <th>Job Title</th>
                  <th>Risk</th>
                  <th>Score</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {scans.map((s) => (
                  <tr key={s._id || s.id}>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td><strong>{s.companyName}</strong></td>
                    <td>{s.jobTitle}</td>
                    <td><RiskBadge level={s.riskLevel} /></td>
                    <td><span style={{ fontWeight: 700 }}>{s.riskScore || '-'}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => onView && onView(s)} title="View"><FiEye /></button>
                        <button className="btn btn-sm btn-success" title="Save"><FiSave /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => handleDelete(s)} title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="features-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
          {scans.map((s) => (
            <div key={s._id || s.id} className="card" style={{ cursor: 'pointer' }} onClick={() => onView && onView(s)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <RiskBadge level={s.riskLevel} />
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : ''}
                </span>
              </div>
              <h4 style={{ marginBottom: 4 }}>{s.jobTitle}</h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>{s.companyName}</p>
              {s.riskScore !== undefined && (
                <div style={{ fontSize: '0.85rem' }}>
                  Risk Score: <strong style={{ color: s.riskScore <= 30 ? 'var(--success)' : s.riskScore <= 60 ? 'var(--warning)' : 'var(--danger)' }}>{s.riskScore}</strong>
                </div>
              )}
              <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
                <button className="btn btn-sm btn-secondary" onClick={(e) => { e.stopPropagation(); onView && onView(s); }}><FiEye /> View</button>
                <button className="btn btn-sm btn-danger" onClick={(e) => { e.stopPropagation(); handleDelete(s); }}><FiTrash2 /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
};

export default ScanHistoryList;
