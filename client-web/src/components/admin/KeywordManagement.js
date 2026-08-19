import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import { toast } from 'react-toastify';
import { FiPlus, FiEdit2, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const CATEGORIES = ['salary', 'requirement', 'company', 'communication', 'url', 'email', 'other'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];

const emptyKeyword = { keyword: '', category: '', severity: 'medium', points: 5, active: true };

const KeywordManagement = () => {
  const [keywords, setKeywords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyKeyword);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const fetchKeywords = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 15, search });
      if (categoryFilter) params.set('category', categoryFilter);
      const res = await api.get(`/api/admin/keywords?${params}`);
      const data = res.data;
      setKeywords(data.data || data.keywords || []);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch {
      setKeywords([]);
      toast.error('Failed to load keywords');
    } finally {
      setLoading(false);
    }
  }, [page, search, categoryFilter]);

  useEffect(() => { fetchKeywords(); }, [fetchKeywords]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyKeyword);
    setShowModal(true);
  };

  const openEdit = (kw) => {
    setEditing(kw);
    setForm({
      keyword: kw.keyword || '',
      category: kw.category || '',
      severity: kw.severity || 'medium',
      points: kw.points || 5,
      active: kw.active !== undefined ? kw.active : true,
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.keyword.trim()) { toast.error('Keyword is required'); return; }
    if (!form.category) { toast.error('Category is required'); return; }
    setSaving(true);
    try {
      if (editing) {
        await api.put(`/api/admin/keywords/${editing._id || editing.id}`, form);
        toast.success('Keyword updated');
      } else {
        await api.post('/api/admin/keywords', form);
        toast.success('Keyword created');
      }
      setShowModal(false);
      fetchKeywords();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save keyword');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (kw) => {
    try {
      await api.put(`/api/admin/keywords/${kw._id || kw.id}`, { active: !kw.active });
      toast.success(`Keyword ${kw.active ? 'deactivated' : 'activated'}`);
      fetchKeywords();
    } catch {
      toast.error('Failed to toggle keyword');
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.delete(`/api/admin/keywords/${confirmDelete._id || confirmDelete.id}`);
      toast.success('Keyword deleted');
      fetchKeywords();
    } catch {
      toast.error('Failed to delete keyword');
    }
    setConfirmDelete(null);
  };

  const getSeverityBadge = (severity) => {
    const cls = severity === 'critical' ? 'badge-scam' : severity === 'high' ? 'badge-suspicious' : severity === 'medium' ? 'badge-pending' : 'badge-safe';
    return <span className={`badge ${cls}`}>{severity || 'low'}</span>;
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <h2 style={{ margin: 0 }}>Keyword Management</h2>
        <button className="btn btn-primary" onClick={openCreate}><FiPlus /> Add Keyword</button>
      </div>

      <div className="filter-bar">
        <SearchBar onSearch={handleSearch} placeholder="Search keywords..." />
        <select className="filter-select" value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
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
                  <th>Keyword</th>
                  <th>Category</th>
                  <th>Severity</th>
                  <th>Points</th>
                  <th>Active</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {keywords.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No keywords found</td></tr>
                ) : keywords.map((kw) => (
                  <tr key={kw._id || kw.id}>
                    <td><strong style={{ fontFamily: 'monospace' }}>{kw.keyword}</strong></td>
                    <td><span className="badge badge-pending">{kw.category}</span></td>
                    <td>{getSeverityBadge(kw.severity)}</td>
                    <td><strong>{kw.points}</strong></td>
                    <td>
                      <button
                        onClick={() => toggleActive(kw)}
                        style={{ background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: kw.active ? 'var(--success)' : 'var(--text-muted)' }}
                        title={kw.active ? 'Deactivate' : 'Activate'}
                      >
                        {kw.active ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => openEdit(kw)} title="Edit"><FiEdit2 /></button>
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirmDelete(kw)} title="Delete"><FiTrash2 /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editing ? 'Edit Keyword' : 'Add Keyword'}>
        <div className="form-group">
          <label>Keyword *</label>
          <input
            type="text"
            className="form-input"
            placeholder="e.g., 'urgent hire'"
            value={form.keyword}
            onChange={(e) => setForm({ ...form, keyword: e.target.value })}
          />
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Category *</label>
            <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              <option value="">Select category</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Severity</label>
            <select className="form-select" value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value })}>
              {SEVERITIES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div className="form-row">
          <div className="form-group">
            <label>Risk Points</label>
            <input
              type="number"
              className="form-input"
              min={1}
              max={100}
              value={form.points}
              onChange={(e) => setForm({ ...form, points: parseInt(e.target.value) || 0 })}
            />
          </div>
          <div className="form-group">
            <label>Active</label>
            <div style={{ paddingTop: 8 }}>
              <label className="form-checkbox">
                <input
                  type="checkbox"
                  checked={form.active}
                  onChange={(e) => setForm({ ...form, active: e.target.checked })}
                />
                {form.active ? 'Active' : 'Inactive'}
              </label>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : editing ? 'Update Keyword' : 'Add Keyword'}
          </button>
          <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!confirmDelete}
        onClose={() => setConfirmDelete(null)}
        onConfirm={handleDelete}
        title="Delete Keyword"
        message={`Are you sure you want to delete "${confirmDelete?.keyword}"? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default KeywordManagement;
