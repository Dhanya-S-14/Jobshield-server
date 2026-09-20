import api from './api';

export const sendChatMessage = async (message) => {
  const response = await api.post('/chatbot/chat', { message });
  return response.data.data.reply;
};

export const getQuickActions = async () => {
  const response = await api.get('/chatbot/quick-actions');
  return response.data.data;
};
