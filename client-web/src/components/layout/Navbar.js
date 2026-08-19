import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { FiSun, FiMoon, FiMenu, FiX, FiHome, FiGrid, FiSearch, FiClock, FiBookmark, FiUsers, FiFileText, FiSettings, FiLogOut, FiUser, FiChevronDown, FiFlag } from 'react-icons/fi';
import { ReactComponent as LogoSvg } from '../../assets/jobshield-logo.svg';

const Navbar = () => {
  const { user, logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const lastScrollRef = useRef(0);
  const navigate = useNavigate();
  const location = useLocation();
  const dropdownRef = useRef();

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      setScrolled(current > 20);
      if (current > 200) {
        setHidden(current > lastScrollRef.current);
      } else {
        setHidden(false);
      }
      lastScrollRef.current = current;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setDropdownOpen(false);
  }, [location]);

  const isActive = (path) => location.pathname === path;

  const publicLinks = (
    <>
      <Link to="/">Home</Link>
      <Link to="/scanner"><FiSearch /> Try Scanner</Link>
      <a href="/#features">Features</a>
      <a href="/#about">About</a>
      <a href="/#contact">Contact</a>
    </>
  );

  const authLinks = (
    <>
      <Link to="/dashboard" className={isActive('/dashboard') ? 'active' : ''}><FiGrid /> Dashboard</Link>
      <Link to="/scanner" className={isActive('/scanner') ? 'active' : ''}><FiSearch /> Scanner</Link>
      <Link to="/history" className={isActive('/history') ? 'active' : ''}><FiClock /> History</Link>
      <Link to="/community-reports" className={isActive('/community-reports') ? 'active' : ''}><FiFlag /> Reports</Link>
      {user?.role === 'admin' && (
        <Link to="/admin" className={isActive('/admin') ? 'active' : ''}><FiSettings /> Admin</Link>
      )}
    </>
  );

  return (
    <nav className={`navbar ${scrolled ? 'navbar-scrolled' : ''} ${hidden ? 'navbar-hidden' : ''}`}>
      <div className="navbar-container">
        <Link to={user ? '/dashboard' : '/'} className="navbar-logo">
          <LogoSvg width="28" height="28" style={{ marginRight: 8 }} />
          JobShield
        </Link>

        <div className="navbar-links">
          {user ? authLinks : publicLinks}
        </div>

        <div className="navbar-actions">
          <button className="theme-toggle" onClick={toggleTheme} title="Toggle theme">
            {darkMode ? <FiSun /> : <FiMoon />}
          </button>

          {user ? (
            <div className="navbar-user" ref={dropdownRef}>
              <div className="navbar-avatar" onClick={() => setDropdownOpen(!dropdownOpen)}>
                {user.avatar ? <img src={user.avatar} alt="" /> : (user.name?.charAt(0) || 'U')}
              </div>
              {dropdownOpen && (
                <div className="user-dropdown">
                  <Link to="/profile"><FiUser /> Profile</Link>
                  <Link to="/saved"><FiBookmark /> Saved Jobs</Link>
                  <Link to="/new-report"><FiFileText /> Report Scam</Link>
                  <Link to="/company-verify"><FiUsers /> Company Verify</Link>
                  <div className="divider" />
                  <button className="logout-btn" onClick={() => { logout(); navigate('/'); }}>
                    <FiLogOut /> Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}

          <button className={`hamburger ${mobileOpen ? 'active' : ''}`} onClick={() => setMobileOpen(!mobileOpen)}>
            <span /><span /><span />
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="mobile-drawer">
          {user ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderBottom: '1px solid var(--border-color)', marginBottom: 12 }}>
                <div className="navbar-avatar" style={{ width: 44, height: 44, fontSize: 18 }}>
                  {user.avatar ? <img src={user.avatar} alt="" /> : (user.name?.charAt(0) || 'U')}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user.email}</div>
                </div>
              </div>
              <Link to="/dashboard"><FiGrid /> Dashboard</Link>
              <Link to="/scanner"><FiSearch /> Scanner</Link>
              <Link to="/history"><FiClock /> History</Link>
              <Link to="/saved"><FiBookmark /> Saved Jobs</Link>
              <Link to="/community-reports"><FiFlag /> Community Reports</Link>
              <Link to="/new-report"><FiFileText /> Report a Scam</Link>
              <Link to="/company-verify"><FiUsers /> Company Verify</Link>
              <Link to="/profile"><FiUser /> Profile</Link>
              {user?.role === 'admin' && <Link to="/admin"><FiSettings /> Admin Panel</Link>}
              <hr style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
              <button onClick={() => { logout(); navigate('/'); }} style={{ color: 'var(--danger)' }}>
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/"><FiHome /> Home</Link>
              <a href="/#features"><FiGrid /> Features</a>
              <a href="/#about"><FiUsers /> About</a>
              <a href="/#contact"><FiFileText /> Contact</a>
              <hr style={{ borderColor: 'var(--border-color)', margin: '8px 0' }} />
              <Link to="/login" style={{ color: 'var(--primary-main)' }}>Login</Link>
              <Link to="/register" className="btn btn-primary" style={{ textAlign: 'center', marginTop: 8 }}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
