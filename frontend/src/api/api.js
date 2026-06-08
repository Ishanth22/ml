import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';
const FLASK_BASE = 'http://localhost:5000';

const api = axios.create({
  baseURL: API_BASE,
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

// Transactions
export const predictSingle = (data) => api.post('/transactions/predict', data);
export const batchPredict = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/transactions/batch-predict', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
export const getHistory = () => api.get('/transactions/history');
export const getStats = () => api.get('/transactions/stats');

// Metrics (directly from Flask since no auth needed)
export const getMetrics = () => axios.get(`${FLASK_BASE}/metrics`);

export default api;
