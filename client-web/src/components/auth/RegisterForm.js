import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';

const RegisterForm = () => {
  const { register, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '', terms: false });
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Name is required';
    if (!form.email) errs.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Invalid email';
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    if (!form.terms) errs.terms = 'You must agree to the terms';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await register(form.name, form.email, form.password);
    setSubmitting(false);
    if (ok) navigate('/dashboard');
  };

  return (
    <div className="auth-card">
      <h2>Create Account</h2>
      <p className="auth-subtitle">Join JobShield and stay protected</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Full Name</label>
          <div style={{ position: 'relative' }}>
            <FiUser style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className={`form-input ${errors.name ? 'error' : ''}`}
              placeholder="John Doe"
              style={{ paddingLeft: 40 }}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>
          {errors.name && <div className="form-error">{errors.name}</div>}
        </div>
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
        <div className="form-row">
          <div className="form-group">
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
              <input
                type={showPassword ? 'text' : 'password'}
                className={`form-input ${errors.password ? 'error' : ''}`}
                placeholder="Min 6 chars"
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
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type="password"
              className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Repeat password"
              value={form.confirmPassword}
              onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            />
            {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
          </div>
        </div>
        <div className="form-group">
          <label className="form-checkbox">
            <input
              type="checkbox"
              checked={form.terms}
              onChange={(e) => setForm({ ...form, terms: e.target.checked })}
            />
            I agree to the <a href="/terms" style={{ color: 'var(--primary-main)', marginLeft: 4 }}>Terms of Service</a> and <a href="/privacy" style={{ color: 'var(--primary-main)', marginLeft: 4 }}>Privacy Policy</a>
          </label>
          {errors.terms && <div className="form-error">{errors.terms}</div>}
        </div>
        {error && <div style={{ background: 'rgba(211,47,47,0.1)', color: 'var(--danger)', padding: '10px 14px', borderRadius: 8, marginBottom: 16, fontSize: '0.85rem' }}>{error}</div>}
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <div className="auth-links">
        Already have an account? <Link to="/login">Sign in</Link>
      </div>
    </div>
  );
};

export default RegisterForm;
