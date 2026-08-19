import React from 'react';
import ResetPasswordForm from '../components/auth/ResetPasswordForm';
import { ReactComponent as LogoSvg } from '../assets/jobshield-logo.svg';

const ResetPasswordPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-shapes">
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
      </div>
      <div className="auth-container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <LogoSvg width="64" height="64" style={{ marginBottom: 12, filter: 'drop-shadow(0 4px 16px rgba(37,99,235,0.4))' }} />
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, letterSpacing: -1 }}>JobShield</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>Set a new password</p>
        </div>
        <ResetPasswordForm />
      </div>
    </div>
  );
};

export default ResetPasswordPage;
