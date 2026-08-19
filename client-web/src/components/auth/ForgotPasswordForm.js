import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiArrowLeft } from 'react-icons/fi';

const ForgotPasswordForm = () => {
  const { forgotPassword } = useAuth();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/\S+@\S+\.\S+/.test(email)) { setError('Invalid email'); return; }
    setSubmitting(true);
    setError('');
    const ok = await forgotPassword(email);
    if (ok) setSent(true);
    setSubmitting(false);
  };

  if (sent) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: 16 }}>📧</div>
        <h2>Check Your Email</h2>
        <p className="auth-subtitle">We've sent a password reset link to <strong>{email}</strong></p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>
          <FiArrowLeft /> Back to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Forgot Password?</h2>
      <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="email"
              className={`form-input ${error ? 'error' : ''}`}
              placeholder="you@example.com"
              style={{ paddingLeft: 40 }}
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
            />
          </div>
          {error && <div className="form-error">{error}</div>}
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Sending...' : 'Send Reset Link'}
        </button>
      </form>
      <div className="auth-links">
        <Link to="/login"><FiArrowLeft /> Back to Login</Link>
      </div>
    </div>
  );
};

export default ForgotPasswordForm;
