import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  withCredentials: true,
});

// Auto-attach access token
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-refresh on 401
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    const original = err.config;
    if (err.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const { data } = await axios.post(`${API_URL}/api/v1/auth/refresh`, {}, { withCredentials: true });
        localStorage.setItem('access_token', data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
      }
    }
    return Promise.reject(err);
  }
);

// ─── Auth ─────────────────────────────────────────────────────────
export const authApi = {
  register: (data: { email: string; password: string; name: string }) =>
    api.post('/auth/register', data),
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  me: () => api.get('/auth/me'),
  refresh: () => api.post('/auth/refresh'),
};

// ─── Chat ─────────────────────────────────────────────────────────
export const chatApi = {
  getConversations: (cursor?: string) =>
    api.get('/conversations', { params: { cursor, limit: 20 } }),
  createConversation: (data: { title?: string; model?: string; mode?: string }) =>
    api.post('/conversations', data),
  getMessages: (convId: string, cursor?: string) =>
    api.get(`/conversations/${convId}/messages`, { params: { cursor, limit: 50 } }),
  sendMessage: (convId: string, data: { content: string; model?: string; files?: string[] }) =>
    api.post(`/conversations/${convId}/messages`, data),
  deleteConversation: (convId: string) =>
    api.delete(`/conversations/${convId}`),
  searchConversations: (q: string) =>
    api.get('/conversations/search', { params: { q } }),
};

// ─── AI ───────────────────────────────────────────────────────────
export const aiApi = {
  getModels: () => api.get('/ai/models'),
  getProviders: () => api.get('/ai/providers'),
  complete: (data: object) => api.post('/ai/complete', data),
  compare: (data: object) => api.post('/ai/compare', data),
  route: (data: object) => api.post('/ai/route', data),
};

// ─── Agents ───────────────────────────────────────────────────────
export const agentsApi = {
  list: () => api.get('/agents'),
  create: (data: object) => api.post('/agents', data),
  get: (id: string) => api.get(`/agents/${id}`),
  update: (id: string, data: object) => api.patch(`/agents/${id}`, data),
  delete: (id: string) => api.delete(`/agents/${id}`),
  chat: (id: string, data: object) => api.post(`/agents/${id}/chat`, data),
  getMemory: (id: string) => api.get(`/agents/${id}/memory`),
  clearMemory: (id: string) => api.delete(`/agents/${id}/memory`),
  listPublic: () => api.get('/agents/public'),
};

// ─── Knowledge Base ───────────────────────────────────────────────
export const kbApi = {
  list: () => api.get('/knowledge-bases'),
  create: (data: object) => api.post('/knowledge-bases', data),
  get: (id: string) => api.get(`/knowledge-bases/${id}`),
  delete: (id: string) => api.delete(`/knowledge-bases/${id}`),
  listDocs: (id: string) => api.get(`/knowledge-bases/${id}/documents`),
  uploadDoc: (id: string, file: File) => {
    const fd = new FormData();
    fd.append('file', file);
    return api.post(`/knowledge-bases/${id}/documents`, fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  deleteDoc: (kbId: string, docId: string) =>
    api.delete(`/knowledge-bases/${kbId}/documents/${docId}`),
  search: (id: string, query: string) =>
    api.post(`/knowledge-bases/${id}/search`, { query }),
  chat: (id: string, query: string) =>
    api.post(`/knowledge-bases/${id}/chat`, { query }),
  ingestUrl: (id: string, url: string) =>
    api.post(`/knowledge-bases/${id}/ingest-url`, { url }),
};

// ─── Workflows ────────────────────────────────────────────────────
export const workflowsApi = {
  list: () => api.get('/workflows'),
  create: (data: object) => api.post('/workflows', data),
  get: (id: string) => api.get(`/workflows/${id}`),
  update: (id: string, data: object) => api.patch(`/workflows/${id}`, data),
  delete: (id: string) => api.delete(`/workflows/${id}`),
  execute: (id: string, data?: object) => api.post(`/workflows/${id}/execute`, data),
  getRuns: (id: string) => api.get(`/workflows/${id}/runs`),
  getRun: (id: string, runId: string) => api.get(`/workflows/${id}/runs/${runId}`),
};

// ─── Marketplace ──────────────────────────────────────────────────
export const marketplaceApi = {
  list: (params?: object) => api.get('/marketplace', { params }),
  get: (id: string) => api.get(`/marketplace/${id}`),
  create: (data: object) => api.post('/marketplace', data),
  purchase: (id: string) => api.post(`/marketplace/${id}/purchase`),
  review: (id: string, data: object) => api.post(`/marketplace/${id}/reviews`, data),
};

// ─── Billing ──────────────────────────────────────────────────────
export const billingApi = {
  getPlans: () => api.get('/billing/plans'),
  getUsage: () => api.get('/billing/usage'),
  subscribe: (planId: string) => api.post('/billing/subscribe', { planId }),
  portal: () => api.post('/billing/portal'),
  topup: (credits: number) => api.post('/billing/topup', { credits }),
};

// ─── Admin ────────────────────────────────────────────────────────
export const adminApi = {
  getUsers: (params?: object) => api.get('/admin/users', { params }),
  getUser: (id: string) => api.get(`/admin/users/${id}`),
  updateUser: (id: string, data: object) => api.patch(`/admin/users/${id}`, data),
  getAnalytics: () => api.get('/admin/analytics'),
  getRevenue: () => api.get('/admin/revenue'),
  getAiUsage: () => api.get('/admin/ai-usage'),
};

export default api;
