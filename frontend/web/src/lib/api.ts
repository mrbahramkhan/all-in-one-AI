import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, { refreshToken });
        localStorage.setItem('access_token', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        if (typeof window !== 'undefined') window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

export const authApi = {
  register: (data: { email: string; password: string; name: string }) => api.post('/auth/register', data),
  login: (data: { email: string; password: string }) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

export const chatApi = {
  getConversations: (cursor?: string) => api.get('/conversations', { params: { cursor, limit: 20 } }),
  createConversation: (data: any) => api.post('/conversations', data),
  getMessages: (convId: string) => api.get(`/conversations/${convId}/messages`),
  sendMessage: (convId: string, data: any) => api.post(`/conversations/${convId}/messages`, data),
  deleteConversation: (convId: string) => api.delete(`/conversations/${convId}`),
  searchConversations: (q: string) => api.get('/conversations/search', { params: { q } }),
};

export const aiApi = {
  getModels: () => api.get('/ai/models'),
  complete: (data: any) => api.post('/ai/complete', data),
  compare: (data: any) => api.post('/ai/compare', data),
  route: (data: any) => api.post('/ai/route', data),
};

export const agentsApi = {
  list: () => api.get('/agents'),
  create: (data: any) => api.post('/agents', data),
  get: (id: string) => api.get(`/agents/${id}`),
  update: (id: string, data: any) => api.patch(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
  chat: (id: string, data: any) => api.post(`/agents/${id}/chat`, data),
  listPublic: () => api.get('/agents/public'),
};

export const kbApi = {
  list: () => api.get('/knowledge-bases'),
  create: (data: any) => api.post('/knowledge-bases', data),
  get: (id: string) => api.get(`/knowledge-bases/${id}`),
  delete: (id: string) => api.delete(`/knowledge-bases/${id}`),
  listDocs: (id: string) => api.get(`/knowledge-bases/${id}/documents`),
  uploadDoc: (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/knowledge-bases/${id}/documents`, fd);
  },
  deleteDoc: (kbId: string, docId: string) => api.delete(`/knowledge-bases/${kbId}/documents/${docId}`),
  search: (id: string, query: string) => api.post(`/knowledge-bases/${id}/search`, { query }),
  chat: (id: string, query: string) => api.post(`/knowledge-bases/${id}/chat`, { query }),
  ingestUrl: (id: string, url: string) => api.post(`/knowledge-bases/${id}/ingest-url`, { url }),
};

export const workflowsApi = {
  list: () => api.get('/workflows'),
  create: (data: any) => api.post('/workflows', data),
  get: (id: string) => api.get(`/workflows/${id}`),
  update: (id: string, data: any) => api.patch(`/workflows/${id}`, data),
  delete: (id: string) => api.delete(`/workflows/${id}`),
  execute: (id: string, data?: any) => api.post(`/workflows/${id}/execute`, data),
  getRuns: (id: string) => api.get(`/workflows/${id}/runs`),
};

export const marketplaceApi = {
  list: (params?: any) => api.get('/marketplace', { params }),
  get: (id: string) => api.get(`/marketplace/${id}`),
  create: (data: any) => api.post('/marketplace', data),
  purchase: (id: string) => api.post(`/marketplace/${id}/purchase`),
};

export const billingApi = {
  getPlans: () => api.get('/billing/plans'),
  getUsage: () => api.get('/billing/usage'),
  subscribe: (planId: string) => api.post('/billing/subscribe', { planId }),
  topup: (credits: number) => api.post('/billing/topup', { credits }),
};

export const adminApi = {
  getUsers: (params?: any) => api.get('/admin/users', { params }),
  updateUser: (id: string, data: any) => api.patch(`/admin/users/${id}`, data),
  getAnalytics: () => api.get('/admin/analytics'),
  getAiUsage: () => api.get('/admin/ai-usage'),
};

export default api;
