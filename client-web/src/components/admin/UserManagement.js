import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import SearchBar from '../common/SearchBar';
import Pagination from '../common/Pagination';
import ConfirmDialog from '../common/ConfirmDialog';
import { toast } from 'react-toastify';
import { FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [confirm, setConfirm] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get(`/api/admin/users?page=${page}&limit=10&search=${search}`);
      const data = res.data;
      setUsers(data.data || data.users || []);
      setTotalPages(data.totalPages || data.pages || 1);
    } catch {
      setUsers([]);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleSearch = useCallback((val) => {
    setSearch(val);
    setPage(1);
  }, []);

  const toggleBan = async (user) => {
    try {
      await api.put(`/api/admin/users/${user._id || user.id}`, { isBanned: !user.isBanned });
      toast.success(`User ${user.isBanned ? 'unbanned' : 'banned'}`);
      fetchUsers();
    } catch {
      toast.error('Failed to update user');
    }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      await api.delete(`/api/admin/users/${confirm._id || confirm.id}`);
      toast.success('User deleted');
      fetchUsers();
    } catch {
      toast.error('Failed to delete user');
    }
    setConfirm(null);
  };

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>User Management</h2>
      <div className="filter-bar">
        <SearchBar onSearch={handleSearch} placeholder="Search users by name or email..." />
      </div>

      {loading ? (
        <div className="loader-container"><div className="loader-spinner lg" /></div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="table-container" style={{ border: 'none' }}>
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 ? (
                  <tr><td colSpan={6} style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted)' }}>No users found</td></tr>
                ) : users.map((u) => (
                  <tr key={u._id || u.id}>
                    <td><strong>{u.name}</strong></td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{u.email}</td>
                    <td><span className={`badge ${u.role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{u.role}</span></td>
                    <td>
                      <span className={`badge ${u.isBanned ? 'badge-scam' : 'badge-safe'}`}>
                        {u.isBanned ? 'Banned' : 'Active'}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '-'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-sm btn-secondary" onClick={() => toggleBan(u)} title={u.isBanned ? 'Unban' : 'Ban'}>
                          {u.isBanned ? <FiToggleRight /> : <FiToggleLeft />} {u.isBanned ? 'Unban' : 'Ban'}
                        </button>
                        <button className="btn btn-sm btn-danger" onClick={() => setConfirm(u)} title="Delete">
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

      <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />

      <ConfirmDialog
        isOpen={!!confirm}
        onClose={() => setConfirm(null)}
        onConfirm={handleDelete}
        title="Delete User"
        message={`Are you sure you want to delete ${confirm?.name}? This action cannot be undone.`}
        confirmText="Delete"
        variant="danger"
      />
    </div>
  );
};

export default UserManagement;
