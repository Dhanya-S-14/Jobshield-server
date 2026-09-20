import api from './api';

export const createComment = async (commentData) => {
  const response = await api.post('/comments', commentData);
  return response.data;
};

export const getComments = async (params = {}) => {
  const query = new URLSearchParams(params).toString();
  const response = await api.get(`/comments${query ? `?${query}` : ''}`);
  return response.data;
};

export const deleteComment = async (id) => {
  const response = await api.delete(`/comments/${id}`);
  return response.data;
};

export const markHelpful = async (id) => {
  const response = await api.put(`/comments/${id}/helpful`);
  return response.data;
};

export const addReply = async (commentId, content) => {
  const response = await api.post(`/comments/${commentId}/reply`, { content });
  return response.data;
};
