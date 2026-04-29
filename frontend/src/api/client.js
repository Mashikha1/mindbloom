// ============================================
//  src/api/client.js
//  Central Axios instance.
//  Every API call in the app goes through here.
//
//  WHY AXIOS over fetch()?
//  - Auto JSON parsing
//  - Interceptors (attach token automatically)
//  - Better error handling
//  - Request/response transformation
// ============================================

import axios from 'axios';

// Base URL from .env file
// In development: http://localhost:5000/api
// In production:  https://your-render-app.onrender.com/api
const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000, // 15 second timeout
});

// ── REQUEST INTERCEPTOR ───────────────────
// This runs BEFORE every request is sent.
// It automatically attaches the JWT token
// so you don't have to add it manually every time.
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('mindbloom_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ── RESPONSE INTERCEPTOR ──────────────────
// This runs AFTER every response comes back.
// If token expired (401) → log user out automatically.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid — clear and redirect to login
      localStorage.removeItem('mindbloom_token');
      localStorage.removeItem('mindbloom_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// ── NAMED API FUNCTIONS ───────────────────
// Organized by feature. Import these in components.

// AUTH
export const authAPI = {
  register: (data)  => api.post('/auth/register', data),
  login:    (data)  => api.post('/auth/login', data),
  getMe:    ()      => api.get('/auth/me'),
};

// MOOD
export const moodAPI = {
  log:           (data)      => api.post('/mood', data),
  getToday:      ()          => api.get('/mood/today'),
  getHistory:    (days = 7)  => api.get(`/mood/history?days=${days}`),
  weeklySummary: ()          => api.get('/mood/weekly-summary'),
};

// JOURNAL
export const journalAPI = {
  create:     (data)         => api.post('/journal', data),
  getAll:     (params = {})  => api.get('/journal', { params }),
  getOne:     (id)           => api.get(`/journal/${id}`),
  update:     (id, data)     => api.patch(`/journal/${id}`, data),
  remove:     (id)           => api.delete(`/journal/${id}`),
};

// AI
export const aiAPI = {
  reflect:        (data) => api.post('/ai/reflect', data),
  affirmation:    ()     => api.post('/ai/affirmation'),
  breathingTip:   (data) => api.post('/ai/breathing-tip', data),
  gratitudePrompt:()     => api.post('/ai/gratitude-prompt'),
};

// INSIGHTS
export const insightsAPI = {
  overview:  ()           => api.get('/insights/overview'),
  moodTrend: (days = 30)  => api.get(`/insights/mood-trend?days=${days}`),
};

// USER
export const userAPI = {
  getProfile:       ()     => api.get('/user/profile'),
  updateProfile:    (data) => api.patch('/user/profile', data),
  updatePreferences:(data) => api.patch('/user/preferences', data),
  changePassword:   (data) => api.post('/user/change-password', data),
};
