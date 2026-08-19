import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { FiLock, FiEye, FiEyeOff, FiCheck } from 'react-icons/fi';

const ResetPasswordForm = () => {
  const { token } = useParams();
  const { resetPassword } = useAuth();
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!form.password) errs.password = 'Password is required';
    else if (form.password.length < 6) errs.password = 'Minimum 6 characters';
    if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const ok = await resetPassword(token, form.password);
    if (ok) setDone(true);
    setSubmitting(false);
  };

  if (done) {
    return (
      <div className="auth-card" style={{ textAlign: 'center' }}>
        <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(56,142,60,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontSize: '2rem', color: 'var(--success)' }}>
          <FiCheck />
        </div>
        <h2>Password Reset!</h2>
        <p className="auth-subtitle">Your password has been successfully updated.</p>
        <Link to="/login" className="btn btn-primary" style={{ marginTop: 16 }}>Sign In</Link>
      </div>
    );
  }

  return (
    <div className="auth-card">
      <h2>Set New Password</h2>
      <p className="auth-subtitle">Enter your new password below</p>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>New Password</label>
          <div style={{ position: 'relative' }}>
            <FiLock style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="Min 6 characters"
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
          <label>Confirm New Password</label>
          <input
            type="password"
            className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
            placeholder="Repeat password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
          />
          {errors.confirmPassword && <div className="form-error">{errors.confirmPassword}</div>}
        </div>
        <button type="submit" className="btn btn-primary btn-block btn-lg" disabled={submitting}>
          {submitting ? 'Resetting...' : 'Reset Password'}
        </button>
      </form>
    </div>
  );
};

export default ResetPasswordForm;
