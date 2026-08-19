import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import { toast } from 'react-toastify';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('jobshield-token'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadUser = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await api.get('/api/auth/me');
      setUser(res.data.data || res.data.user || res.data);
    } catch {
      localStorage.removeItem('jobshield-token');
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    setError(null);
    try {
      const res = await api.post('/api/auth/login', { email, password });
      const data = res.data;
      const t = data.token || data.data?.token;
      const u = data.user || data.data?.user;
      if (t) {
        localStorage.setItem('jobshield-token', t);
        setToken(t);
        setUser(u);
      }
      toast.success('Logged in successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Login failed';
      setError(msg);
      toast.error(msg);
      return false;
    }
  };

  const register = async (name, email, password) => {
    setError(null);
    try {
      const res = await api.post('/api/auth/register', { name, email, password });
      const data = res.data;
      const t = data.token || data.data?.token;
      const u = data.user || data.data?.user;
      if (t) {
        localStorage.setItem('jobshield-token', t);
        setToken(t);
        setUser(u);
      }
      toast.success('Account created successfully!');
      return true;
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Registration failed';
      setError(msg);
      toast.error(msg);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('jobshield-token');
    setToken(null);
    setUser(null);
    toast.info('Logged out');
  };

  const updateProfile = async (data) => {
    try {
      const res = await api.put('/api/auth/updatedetails', data);
      setUser(prev => ({ ...prev, ...res.data.data }));
      toast.success('Profile updated');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed');
      return false;
    }
  };

  const updatePassword = async (currentPassword, newPassword) => {
    try {
      await api.put('/api/auth/updatepassword', { currentPassword, newPassword });
      toast.success('Password updated');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Password update failed');
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      await api.post('/api/auth/forgotpassword', { email });
      toast.success('Password reset email sent');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
      return false;
    }
  };

  const resetPassword = async (token, password) => {
    try {
      await api.put(`/api/auth/resetpassword/${token}`, { password });
      toast.success('Password reset successful');
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{
      user, token, loading, error,
      login, register, logout, loadUser,
      updateProfile, updatePassword, forgotPassword, resetPassword,
      setError
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
