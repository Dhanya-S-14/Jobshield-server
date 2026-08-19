import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const LoginForm = () => {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '', remember: false });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await login(form.email, form.password);
    setSubmitting(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="auth-card">
      <h2>Welcome Back</h2>
      <p className="auth-subtitle">Sign in to your JobShield account</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Email Address</label>
          <div style={{ position: 'relative' }}>
            <FiMail style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              style={{ paddingLeft: 40 }}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          {errors.email && <div className="form-error">{errors.email}</div>}
        </div>
        <div className="form-group">
          <label>Password</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Enter your password"
              style={{ paddingLeft: 40, paddingRight: 40 }}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
            <button
              type="button"
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          {errors.password && <div className="form-error">{errors.password}</div>}
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={form.remember}
              onChange={(e) => setForm({ ...form, remember: e.target.checked })}
            />
            Remember me
          </label>
          <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--primary-main)', fontWeight: 600 }}>
            Forgot password?
          </Link>
        </div>
        {error && <div style={{ background: 'rgba(211,47,47,0.1)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </button>
      </form>
      <div className="auth-links">
        Don't have an account? <Link to="/register">Create one</Link>
      </div>
    </div>
  );
};

export default LoginForm;
