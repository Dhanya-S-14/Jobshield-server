import api from './api';

export const verifyCompany = async (companyName) => {
  const res = await api.get(`/api/companies/verify/${encodeURIComponent(companyName)}`);
  return res.data;
};

export const searchCompanies = async (query) => {
  const res = await api.get(`/api/companies/search?q=${encodeURIComponent(query)}`);
  return res.data;
};

export const getCompanyDetails = async (id) => {
  const res = await api.get(`/api/companies/${id}`);
  return res.data;
};
