import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// Create axios instance
const api = axios.create({
  baseURL: `${API_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Issues API
export const issuesAPI = {
  create: (formData) => api.post('/issues', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getAll: (filters = {}) => api.get('/issues', { params: filters }),
  getById: (id) => api.get(`/issues/${id}`),
  pickIssue: (id) => api.post(`/issues/${id}/pick`),
  sponsorIssue: (id, amount) => api.post(`/issues/${id}/sponsor`, { amount }),
  updateStatus: (id, status) => api.put(`/issues/${id}/status`, { status }),
  uploadAfterImage: (id, formData) => api.post(`/issues/${id}/after-image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getStats: () => api.get('/issues/stats'),
};

// AI API
export const aiAPI = {
  categorize: (data) => api.post('/ai/categorize-issue', data),
  enhance: (data) => api.post('/ai/enhance-description', data),
  matchVolunteer: (data) => api.post('/ai/match-volunteer', data),
};

export default api;
