import api from './api';

export const createReport = async (formData) => {
  const config = { headers: { 'Content-Type': 'multipart/form-data' } };
  const res = await api.post('/api/reports', formData, config);
  return res.data;
};

export const getReports = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const res = await api.get(`/api/reports${query ? `?${query}` : ''}`);
  return res.data;
};

export const getReportById = async (id) => {
  const res = await api.get(`/api/reports/${id}`);
  return res.data;
};

export const updateReportStatus = async (id, status) => {
  const res = await api.put(`/api/reports/${id}`, { status });
  return res.data;
};

export const deleteReport = async (id) => {
  const res = await api.delete(`/api/reports/${id}`);
  return res.data;
};
