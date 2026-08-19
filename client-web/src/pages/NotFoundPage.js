import React from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiHome } from 'react-icons/fi';

const NotFoundPage = () => {
  return (
    <div className="not-found-page">
      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', color: 'var(--primary-main)', marginBottom: 16, animation: 'pulseShield 2s ease-in-out infinite' }}>
          <FiShield />
        </div>
        <h1>404</h1>
        <h2>Page Not Found</h2>
        <p>The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn btn-primary btn-lg">
          <FiHome /> Back to Home
        </Link>
      </div>
      <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', pointerEvents: 'none', zIndex: 0 }}>
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
      </div>
    </div>
  );
};

export default NotFoundPage;
