import React, { useState, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiCamera, FiSave } from 'react-icons/fi';
import { toast } from 'react-toastify';

const ProfileCard = () => {
  const { user, updateProfile, updatePassword } = useAuth();
  const fileInputRef = useRef();
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [passwords, setPasswords] = useState({ current: '', newPass: '', confirm: '' });
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSaveProfile = async () => {
    if (!name.trim()) { toast.error('Name is required'); return; }
    setSaving(true);
    await updateProfile({ name, email });
    setSaving(false);
    setEditing(false);
  };

  const handlePasswordChange = async () => {
    if (!passwords.current || !passwords.newPass) { toast.error('Fill all fields'); return; }
    if (passwords.newPass.length < 6) { toast.error('Minimum 6 characters'); return; }
    if (passwords.newPass !== passwords.confirm) { toast.error('Passwords do not match'); return; }
    setSaving(true);
    const ok = await updatePassword(passwords.current, passwords.newPass);
    if (ok) {
      setPasswords({ current: '', newPass: '', confirm: '' });
      setShowPasswordSection(false);
    }
    setSaving(false);
  };

  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div className="navbar-avatar" style={{ width: 80, height: 80, fontSize: 32, cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
            {user?.avatar ? <img src={user.avatar} alt="" /> : (user?.name?.charAt(0) || 'U')}
          </div>
          <button
            style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--primary-main)', color: '#fff', border: '2px solid var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
            onClick={() => fileInputRef.current?.click()}
          >
            <FiCamera size={14} />
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} />
        </div>
        <h3 style={{ marginTop: 12 }}>{user?.name}</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>{user?.email}</p>
        <span className={`badge ${user?.role === 'admin' ? 'badge-admin' : 'badge-user'}`} style={{ marginTop: 8 }}>
          {user?.role || 'user'}
        </span>
      </div>

      {!editing ? (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16, marginBottom: 16 }}>
          <div className="company-info-row"><span className="label">Name</span><span className="value">{user?.name}</span></div>
          <div className="company-info-row"><span className="label">Email</span><span className="value">{user?.email}</span></div>
          <div className="company-info-row"><span className="label">Member Since</span><span className="value">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span></div>
        </div>
      ) : (
        <div style={{ marginBottom: 16 }}>
          <div className="form-group">
            <label>Name</label>
            <input type="text" className="form-input" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" className="form-input" value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn btn-primary" onClick={handleSaveProfile} disabled={saving}>
              <FiSave /> {saving ? 'Saving...' : 'Save'}
            </button>
            <button className="btn btn-secondary" onClick={() => setEditing(false)}>Cancel</button>
          </div>
        </div>
      )}

      {!editing && (
        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn btn-secondary" onClick={() => setEditing(true)}><FiUser /> Edit Profile</button>
          <button className="btn btn-secondary" onClick={() => setShowPasswordSection(!showPasswordSection)}>
            Change Password
          </button>
        </div>
      )}

      {showPasswordSection && (
        <div style={{ marginTop: 20, borderTop: '1px solid var(--border-color)', paddingTop: 20 }}>
          <h4 style={{ marginBottom: 16 }}>Change Password</h4>
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" className="form-input" value={passwords.current} onChange={(e) => setPasswords({ ...passwords, current: e.target.value })} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>New Password</label>
              <input type="password" className="form-input" value={passwords.newPass} onChange={(e) => setPasswords({ ...passwords, newPass: e.target.value })} />
            </div>
            <div className="form-group">
              <label>Confirm</label>
              <input type="password" className="form-input" value={passwords.confirm} onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })} />
            </div>
          </div>
          <button className="btn btn-primary" onClick={handlePasswordChange} disabled={saving}>
            {saving ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileCard;
