import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

const api = axios.create({
  baseURL: API_URL,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.warn('Error getting token:', error.message);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    if (!error.response && !config._retried) {
      config._retried = true;
      await new Promise((resolve) => setTimeout(resolve, 3000));
      try {
        return await api(config);
      } catch (retryErr) {
        return Promise.reject(retryErr);
      }
    }
    if (error.response) {
      const { status, data } = error.response;
      if (status === 401) {
        await AsyncStorage.multiRemove(['token', 'user']);
      }
      const message = data?.message || data?.error || 'An error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('Network error. Please check your connection and try again.'));
  }
);

export const setAuthToken = async (token) => {
  if (token) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    await AsyncStorage.setItem('token', token);
  } else {
    delete api.defaults.headers.common['Authorization'];
    await AsyncStorage.removeItem('token');
  }
};

export const getAuthToken = async () => {
  try {
    return await AsyncStorage.getItem('token');
  } catch {
    return null;
  }
};

export const clearAuthToken = async () => {
  try {
    await AsyncStorage.removeItem('token');
    delete api.defaults.headers.common['Authorization'];
  } catch (error) {
    console.warn('Error clearing token:', error.message);
  }
};

export default api;
