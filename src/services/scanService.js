import api from './api';

const RISK_CATEGORY_NAMES = {
  keywordAnalysis: 'Keyword Analysis',
  salaryAnalysis: 'Salary',
  emailAnalysis: 'Recruiter Email',
  urlAnalysis: 'URL / Apply Link',
  phoneAnalysis: 'Phone',
  companyAnalysis: 'Company Check',
  textQualityAnalysis: 'Text Quality',
  urgencyAnalysis: 'Urgency',
};

const toCategories = (details) => {
  if (!details || typeof details !== 'object') return [];
  return Object.entries(details)
    .map(([key, r]) => {
      if (!r || typeof r.score !== 'number') return null;
      const sentences = String(r.details || '')
        .split(/(?<=[.!?])\s+/)
        .map((s) => s.trim())
        .filter((s) => s.length > 0);
      const positive = r.score < 20;
      const findings = sentences.length
        ? sentences.map((text) => ({ positive, text }))
        : [{ positive, text: 'No specific finding detected.' }];
      return {
        name: RISK_CATEGORY_NAMES[key] || key,
        risk: r.score >= 50 ? 'high' : r.score >= 20 ? 'medium' : 'low',
        score: r.score,
        findings,
      };
    })
    .filter(Boolean);
};

const enrichScan = (scan) => {
  if (!scan) return null;
  const details = scan.details || scan.scanResults || null;
  return {
    ...scan,
    analysis: {
      explanation: scan.aiExplanation || scan.explanation || '',
      categories: toCategories(details),
    },
  };
};

export const scanJob = async (jobData) => {
  const response = await api.post('/scans/scan', jobData);
  return enrichScan(response.data?.data || response.data);
};

export const getScans = async (params = {}) => {
  const response = await api.get('/scans/history', { params });
  const body = response.data || {};
  const list = Array.isArray(body.data) ? body.data : [];
  return {
    ...body,
    data: list,
    scans: list,
    pagination: body.pagination,
  };
};

export const getScanById = async (id) => {
  const response = await api.get(`/scans/history/${id}`);
  return enrichScan(response.data?.data || response.data);
};

export const deleteScan = async (id) => {
  const response = await api.delete(`/scans/history/${id}`);
  return response.data;
};

export const getScanStats = async () => {
  const response = await api.get('/scans/stats');
  return response.data?.data || response.data;
};

export const saveScan = async (id) => {
  const response = await api.put(`/scans/${id}/save`);
  return response.data;
};

export const shareScan = async (id) => {
  const response = await api.get(`/scans/${id}/share`);
  return response.data;
};