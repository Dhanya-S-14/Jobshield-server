import api from './api';

export const getActiveWarnings = async () => {
  const response = await api.get('/warnings');
  return response.data.data;
};

export const dismissWarning = async (id) => {
  const response = await api.put(`/warnings/${id}/dismiss`);
  return response.data;
};
