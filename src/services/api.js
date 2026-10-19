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
    // Prevent duplicate /api when API_URL already ends with /api
    if (config.url && config.baseURL?.endsWith('/api') && config.url.startsWith('/api/')) {
      config.url = config.url.substring(4);
    }
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

const RETRYABLE_STATUSES = [502, 503, 504, 408];
const MAX_RETRIES = 3;
const RETRY_DELAYS = [2000, 5000, 10000];

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config || {};
    const status = error.response ? error.response.status : null;
    const isNetworkError = !error.response;
    const isRetryable = isNetworkError || RETRYABLE_STATUSES.includes(status);
    const isRefreshable = config.url && !config.url.includes('/auth/refresh');

    if (isRetryable && isRefreshable) {
      config._retryCount = config._retryCount || 0;
      if (config._retryCount < MAX_RETRIES) {
        const delay = RETRY_DELAYS[config._retryCount] || 10000;
        config._retryCount += 1;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return api(config);
      }
    }

    if (error.response) {
      const { status, data } = error.response;
      const isLoginOrRegister = config.url && (config.url.includes('/auth/login') || config.url.includes('/auth/register'));
      if (status === 401 && !isLoginOrRegister) {
        await AsyncStorage.multiRemove(['token', 'user']);
      }
      const message = data?.message || data?.error || 'An error occurred';
      return Promise.reject(new Error(message));
    }
    return Promise.reject(new Error('Cannot reach JobShield server. If the server is starting up, please wait a moment and try again.'));
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

export const warmUpServer = async () => {
  try {
    const rootApi = axios.create({
      baseURL: API_URL.replace(/\/api$/, ''),
      timeout: 60000,
    });
    await rootApi.get('/health');
    return true;
  } catch {
    try {
      await api.get('/health', { timeout: 60000 });
      return true;
    } catch {
      return false;
    }
  }
};

export default api;
