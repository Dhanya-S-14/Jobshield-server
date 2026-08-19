import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import ConfirmDialog from '../common/ConfirmDialog';
import { toast } from 'react-toastify';
import { FiCheck, FiX, FiTrash2, FiEye } from 'react-icons/fi';

const ReportManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedReport, setSelectedReport] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 10, search });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/api/admin/reports?${params}`);
      const data = res.data;
      setReports(data.data || data.reports || []);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch {
      setReports([]);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter]);

  useEffect(() => { fetchReports(); }, [fetchReports]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const updateStatus = async (report, status) => {
    try {
      await api.put(`/api/admin/reports/${report._id || report.id}`, { status });
      toast.success(`Report ${status}`);
      fetchReports();
    } catch {
      toast.error('Failed to update report');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/api/admin/reports/${confirmDelete._id || confirmDelete.id}`);
      toast.success('Report deleted');
      fetchReports();
    } catch {
      toast.error('Failed to delete report');
    }
    setConfirmDelete(null);
  };

  const getStatusBadge = (s) => {
    const cls = s === 'approved' ? 'badge-approved' : s === 'rejected' ? 'badge-rejected' : 'badge-pending';
    return <span className={`badge ${cls}`}>{s || 'pending'}</span>;
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Report Management</h2>
      <div className="filter-bar">
        <SearchBar onSearch={handleSearch} placeholder="Search reports..." />
        <select className="filter-select" value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All Status</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>

      {loading ? (
        <div className="loader-container"><div className="loader-spinner lg" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Company</th>
                  <th>Job Title</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reports.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No reports found</td></tr>
                ) : reports.map((r) => (
                  <tr key={r._id || r.id}>
                    <td><strong>{r.companyName}</strong></td>
                    <td>{r.jobTitle}</td>
                    <td>{getStatusBadge(r.status)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => setSelectedReport(selectedReport?._id === r._id ? null : r)} title="View">
                          <FiEye />
                        </button>
                        {r.status !== 'approved' && (
                          <button className="btn btn-sm btn-success" onClick={() => updateStatus(r, 'approved')} title="Approve">
                            <FiCheck />
                          </button>
                        )}
                        {r.status !== 'rejected' && (
                          <button className="btn btn-sm btn-secondary" style={{ color: 'var(--warning)' }} onClick={() => updateStatus(r, 'rejected')} title="Reject">
                            <FiX />
                          </button>
                        )}
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(r)} title="Delete">
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
      )}

      {selectedReport && (
        <div className="card" style={{ marginTop: 20 }}>
          <h4 style={{ marginBottom: 12 }}>Report Details - {selectedReport.companyName}</h4>
          <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16 }}>
            <div className="company-info-row"><span className="label">Company</span><span>{selectedReport.companyName}</span></div>
            <div className="company-info-row"><span className="label">Job Title</span><span>{selectedReport.jobTitle}</span></div>
            <div className="company-info-row"><span className="label">Website</span><span>{selectedReport.websiteUrl || 'N/A'}</span></div>
            <div className="company-info-row"><span className="label">Status</span><span>{getStatusBadge(selectedReport.status)}</span></div>
          </div>
          <div style={{ marginTop: 12 }}>
            <strong>Description:</strong>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>{selectedReport.description}</p>
          </div>
          {selectedReport.evidence && (
            <div style={{ marginTop: 12 }}>
              <strong>Evidence:</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: 4 }}>{selectedReport.evidence}</p>
            </div>
          )}
          <button className="btn btn-sm btn-secondary" style={{ marginTop: 12 }} onClick={() => setSelectedReport(null)}>Close</button>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Report"
        message="Are you sure you want to delete this report? This action cannot be undone."
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default ReportManagement;
