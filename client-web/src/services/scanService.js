import api from './api';

export const scanJob = async (formData) => {
  const res = await api.post('/api/scans/scan', formData);
  return res.data;
};

export const getScanHistory = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`/api/scans/history${query ? `?${query}` : ''}`);
  return res.data;
};

export const getScanById = async (id) => {
  const res = await api.get(`/api/scans/history/${id}`);
  return res.data;
};

export const deleteScan = async (id) => {
  const res = await api.delete(`/api/scans/history/${id}`);
  return res.data;
};

export const saveScan = async (scanHistoryId, notes = '') => {
  const res = await api.post('/api/saved-jobs/save', { scanHistoryId, notes });
  return res.data;
};

export const getSavedScans = async () => {
  const res = await api.get('/api/saved-jobs/saved');
  return res.data;
};

export const getDashboardStats = async () => {
  try {
    const res = await api.get('/api/scans/stats');
    const data = res.data?.data || res.data;
    return { data: { total: data.total || 0, safe: data.safe || 0, suspicious: data.suspicious || 0, scam: data.scam || 0 } };
  } catch {
    return { data: { total: 0, safe: 0, suspicious: 0, scam: 0 } };
  }
};

export const getDashboardRecent = async () => {
  const res = await api.get('/api/scans/history?limit=5&sort=-createdAt');
  return res.data;
};

export const getChartData = async () => {
  try {
    const res = await api.get('/api/scans/stats');
    const data = res.data?.data || res.data;
    return { data: { safe: data.safe || 0, suspicious: data.suspicious || 0, scam: data.scam || 0, total: data.total || 0 } };
  } catch {
    return { data: { safe: 0, suspicious: 0, scam: 0, total: 0 } };
  }
};
