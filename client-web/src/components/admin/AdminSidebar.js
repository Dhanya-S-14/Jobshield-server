import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiGrid, FiUsers, FiFlag, FiHash, FiBarChart2, FiLogOut, FiShield } from 'react-icons/fi';

const AdminSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useAuth();

  const links = [
    { to: '/admin', icon: <FiGrid />, label: 'Dashboard' },
    { to: '/admin/users', icon: <FiUsers />, label: 'Users' },
    { to: '/admin/reports', icon: <FiFlag />, label: 'Reports' },
    { to: '/admin/keywords', icon: <FiHash />, label: 'Keywords' },
    { to: '/admin/analytics', icon: <FiBarChart2 />, label: 'Analytics' },
  ];

  return (
    <aside className="admin-sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 12px', marginBottom: 24 }}>
        <FiShield style={{ color: 'var(--primary-main)', fontSize: '1.3rem' }} />
        <strong>Admin Panel</strong>
      </div>
      <div className="admin-sidebar-title">Navigation</div>
      <div className="admin-sidebar-links">
        {links.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={location.pathname === link.to ? 'active' : ''}
          >
            {link.icon} {link.label}
          </Link>
        ))}
      </div>
      <div className="admin-sidebar-title">Account</div>
      <div className="admin-sidebar-links">
        <Link to="/dashboard"><FiGrid /> Main App</Link>
        <a href="/" onClick={(e) => { e.preventDefault(); logout(); navigate('/'); }} style={{ color: 'var(--danger)' }}>
          <FiLogOut /> Logout
        </a>
      </div>
    </aside>
  );
};

export default AdminSidebar;
