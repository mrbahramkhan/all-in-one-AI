import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://all-in-one-ai-api-production.up.railway.app';
export const api = axios.create({ baseURL: API_URL + '/api/v1', withCredentials: true });
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const t = localStorage.getItem('access_token');
    if (t) config.headers.Authorization = 'Bearer ' + t;
  }
  return config;
});
api.interceptors.response.use((res) => res, async (err) => {
  if (err.response?.status === 401 && !err.config._retry) {
    err.config._retry = true;
    try {
      const rt = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      const { data } = await axios.post(API_URL + '/api/v1/auth/refresh', { refreshToken: rt });
      localStorage.setItem('access_token', data.data.accessToken);
      err.config.headers.Authorization = 'Bearer ' + data.data.accessToken;
      return api(err.config);
    } catch {
      if (typeof window !== 'undefined') { localStorage.removeItem('access_token'); window.location.href = '/login'; }
    }
  }
  return Promise.reject(err);
});
export const authApi = {
  register: (d: any) => api.post('/auth/register', d),
  login: (d: any) => api.post('/auth/login', d),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
};
export const chatApi = {
  getConversations: () => api.get('/conversations'),
  createConversation: (d: any) => api.post('/conversations', d),
  getMessages: (id: string) => api.get('/conversations/' + id + '/messages'),
  sendMessage: (id: string, d: any) => api.post('/conversations/' + id + '/messages', d),
  deleteConversation: (id: string) => api.delete('/conversations/' + id),
};
export const aiApi = {
  getModels: () => api.get('/ai/models'),
  complete: (d: any) => api.post('/ai/complete', d),
  compare: (d: any) => api.post('/ai/compare', d),
  route: (d: any) => api.post('/ai/route', d),
};
export const agentsApi = {
  list: () => api.get('/agents'),
  create: (d: any) => api.post('/agents', d),
  get: (id: string) => api.get('/agents/' + id),
  update: (id: string, d: any) => api.patch('/agents/' + id, d),
  delete: (id: string) => api.delete('/agents/' + id),
  chat: (id: string, d: any) => api.post('/agents/' + id + '/chat', d),
};
export const adminApi = {
  getUsers: () => api.get('/admin/users'),
  updateUser: (id: string, d: any) => api.patch('/admin/users/' + id, d),
  getAnalytics: () => api.get('/admin/analytics'),
  getAiUsage: () => api.get('/admin/ai-usage'),
};
export const billingApi = {
  getPlans: () => api.get('/billing/plans'),
  getUsage: () => api.get('/billing/usage'),
  subscribe: (planId: string) => api.post('/billing/subscribe', { planId }),
};
export default api;