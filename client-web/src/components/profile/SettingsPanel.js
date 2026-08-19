import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { FiSun, FiMoon, FiBell, FiDownload, FiTrash2, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const SettingsPanel = () => {
  const { darkMode, toggleTheme } = useTheme();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState({ email: true, push: true, scanComplete: true, scamAlert: true });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleExport = () => {
    toast.success('Data export started. Check your email.');
  };

  const handleDeleteAccount = () => {
    toast.error('Account deletion request submitted.');
    setShowDeleteConfirm(false);
  };

  return (
    <div className="card" style={{ maxWidth: 600, margin: '0 auto' }}>
      <h3 style={{ marginBottom: 24 }}>Settings</h3>

      {/* Theme */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          {darkMode ? <FiMoon /> : <FiSun />} Appearance
        </h4>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong>{darkMode ? 'Dark Mode' : 'Light Mode'}</strong>
              <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Toggle between dark and light themes</p>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} style={{ fontSize: '1.5rem' }}>
              {darkMode ? <FiSun /> : <FiMoon />}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiBell /> Notification Preferences
        </h4>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16 }}>
          {Object.entries(notifications).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid var(--border-color)' }}>
              <span style={{ fontSize: '0.9rem', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</span>
              <button
                onClick={() => setNotifications({ ...notifications, [key]: !val })}
                style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: val ? 'var(--primary-main)' : 'var(--text-muted)' }}
              >
                {val ? <FiToggleRight /> : <FiToggleLeft />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Data */}
      <div style={{ marginBottom: 24 }}>
        <h4 style={{ marginBottom: 12, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiDownload /> Data Management
        </h4>
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: 16 }}>
          <button className="btn btn-secondary btn-block" onClick={handleExport}>
            <FiDownload /> Export My Data
          </button>
        </div>
      </div>

      {/* Account */}
      <div>
        <h4 style={{ marginBottom: 12, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiTrash2 style={{ color: 'var(--danger)' }} /> Danger Zone
        </h4>
        <div style={{ background: 'rgba(211,47,47,0.05)', borderRadius: 10, padding: 16, border: '1px solid rgba(211,47,47,0.2)' }}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12 }}>
            Once you delete your account, there is no going back. Please be certain.
          </p>
          {!showDeleteConfirm ? (
            <button className="btn btn-danger" onClick={() => setShowDeleteConfirm(true)}>
              <FiTrash2 /> Delete Account
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-danger" onClick={handleDeleteAccount}>Confirm Delete</button>
              <button className="btn btn-secondary" onClick={() => setShowDeleteConfirm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
