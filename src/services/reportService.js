import api from './api';

export const createReport = async (reportData) => {
  const formData = new FormData();
  Object.keys(reportData).forEach((key) => {
    if (key === 'photos' && reportData[key]?.length) {
      reportData[key].forEach((photo, index) => {
        formData.append('photos', {
          uri: photo.uri,
          type: photo.type || 'image/jpeg',
          name: photo.fileName || `photo_${index}.jpg`,
        });
      });
    } else if (reportData[key] !== null && reportData[key] !== undefined) {
      formData.append(key, reportData[key]);
    }
  });
  const response = await api.post('/reports', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const getReports = async (params = {}) => {
  const response = await api.get('/reports', { params });
  return response.data;
};

export const getPublicReports = async (limit = 5) => {
  const response = await api.get('/reports', { params: { limit, status: 'approved' } });
  return response.data;
};

export const getReportById = async (id) => {
  const response = await api.get(`/reports/${id}`);
  return response.data;
};

export const updateReportStatus = async (id, status) => {
  const response = await api.put(`/reports/${id}/status`, { status });
  return response.data;
};

export const deleteReport = async (id) => {
  const response = await api.delete(`/reports/${id}`);
  return response.data;
};

export const getReportStats = async () => {
  const response = await api.get('/reports/stats');
  return response.data;
};
