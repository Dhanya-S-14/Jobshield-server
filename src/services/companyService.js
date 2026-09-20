import api from './api';

export const verifyCompany = async (companyName) => {
  const response = await api.get(`/companies/verify/${encodeURIComponent(companyName)}`);
  return response.data;
};

export const searchCompanies = async (query) => {
  const response = await api.get(`/companies/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getCompanyDetails = async (id) => {
  const response = await api.get(`/companies/${id}`);
  return response.data;
};
