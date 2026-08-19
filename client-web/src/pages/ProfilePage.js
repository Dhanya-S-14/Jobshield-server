import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ProfileCard from '../components/profile/ProfileCard';
import SettingsPanel from '../components/profile/SettingsPanel';
import { FiUser, FiSettings } from 'react-icons/fi';

const ProfilePage = () => {
  const [tab, setTab] = useState('profile');

  return (
    <div className="page-container" style={{ maxWidth: 800, margin: '0 auto' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 700, marginBottom: 4 }}>My Account</h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Manage your profile and account settings
        </p>
      </div>

      <div className="profile-tabs" style={{ display: 'flex', gap: 4, marginBottom: 28, background: 'var(--bg-secondary)', borderRadius: 12, padding: 4, maxWidth: 320 }}>
        <button
          style={{
            flex: 1, padding: '10px 20px', border: 'none', borderRadius: 10, cursor: 'pointer',
            background: tab === 'profile' ? 'var(--bg-card)' : 'transparent',
            color: tab === 'profile' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.9rem', boxShadow: tab === 'profile' ? 'var(--shadow)' : 'none',
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          }}
          onClick={() => setTab('profile')}
        >
          <FiUser /> Profile
        </button>
        <button
          style={{
            flex: 1, padding: '10px 20px', border: 'none', borderRadius: 10, cursor: 'pointer',
            background: tab === 'settings' ? 'var(--bg-card)' : 'transparent',
            color: tab === 'settings' ? 'var(--text-primary)' : 'var(--text-secondary)',
            fontWeight: 600, fontSize: '0.9rem', boxShadow: tab === 'settings' ? 'var(--shadow)' : 'none',
            transition: 'all 0.2s ease', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
          }}
          onClick={() => setTab('settings')}
        >
          <FiSettings /> Settings
        </button>
      </div>

      {tab === 'profile' ? <ProfileCard /> : <SettingsPanel />}
    </div>
  );
};

export default ProfilePage;
