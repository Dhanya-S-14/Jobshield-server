import React from 'react';
import LoginForm from '../components/auth/LoginForm';
import { ReactComponent as LogoSvg } from '../assets/jobshield-logo.svg';

const LoginPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-shapes">
        <div className="auth-shape auth-shape-1" />
        <div className="auth-shape auth-shape-2" />
        <div className="auth-shape auth-shape-3" />
      </div>
      <div className="auth-container" style={{ position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }} className="animate-fadeInUp">
          <LogoSvg width="64" height="64" style={{ marginBottom: 12, filter: 'drop-shadow(0 4px 16px rgba(37,99,235,0.4))' }} className="animate-bounceIn" />
          <h1 style={{ color: '#fff', fontSize: '2rem', fontWeight: 800, letterSpacing: -1 }}>JobShield</h1>
          <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: '0.95rem' }}>Sign in to your account</p>
        </div>
        <div className="animate-fadeInUp stagger-2">
          <LoginForm />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
