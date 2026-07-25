import axios from 'axios';
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
export const api = axios.create({ baseURL: API_URL + '/api/v1', withCredentials: true });
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') { const t = localStorage.getItem('access_token'); if (t) config.headers.Authorization = 'Bearer ' + t; }
  return config;
});
api.interceptors.response.use((res) => res, async (err) => {
  const orig = err.config;
  if (err.response?.status === 401 && !orig._retry) {
    orig._retry = true;
    try {
      const rt = typeof window !== 'undefined' ? localStorage.getItem('refresh_token') : null;
      const { data } = await axios.post(API_URL + '/api/v1/auth/refresh', { refreshToken: rt });
      localStorage.setItem('access_token', data.data.accessToken);
      orig.headers.Authorization = 'Bearer ' + data.data.accessToken;
      return api(orig);
    } catch { if (typeof window !== 'undefined') { localStorage.removeItem('access_token'); window.location.href = '/login'; } }
  }
  return Promise.reject(err);
});
export const authApi = { register: (d:any) => api.post('/auth/register',d), login: (d:any) => api.post('/auth/login',d), logout: () => api.post('/auth/logout'), me: () => api.get('/auth/me'), refresh: (t:string) => api.post('/auth/refresh',{refreshToken:t}) };
export const chatApi = { getConversations: (c?:string) => api.get('/conversations',{params:{cursor:c,limit:20}}), createConversation: (d:any) => api.post('/conversations',d), getMessages: (id:string) => api.get('/conversations/'+id+'/messages'), sendMessage: (id:string,d:any) => api.post('/conversations/'+id+'/messages',d), deleteConversation: (id:string) => api.delete('/conversations/'+id), searchConversations: (q:string) => api.get('/conversations/search',{params:{q}}) };
export const aiApi = { getModels: () => api.get('/ai/models'), complete: (d:any) => api.post('/ai/complete',d), compare: (d:any) => api.post('/ai/compare',d), route: (d:any) => api.post('/ai/route',d) };
export const agentsApi = { list: () => api.get('/agents'), create: (d:any) => api.post('/agents',d), get: (id:string) => api.get('/agents/'+id), update: (id:string,d:any) => api.patch('/agents/'+id,d), delete: (id:string) => api.delete('/agents/'+id), chat: (id:string,d:any) => api.post('/agents/'+id+'/chat',d), listPublic: () => api.get('/agents/public') };
export const kbApi = { list: () => api.get('/knowledge-bases'), create: (d:any) => api.post('/knowledge-bases',d), get: (id:string) => api.get('/knowledge-bases/'+id), delete: (id:string) => api.delete('/knowledge-bases/'+id), listDocs: (id:string) => api.get('/knowledge-bases/'+id+'/documents'), uploadDoc: (id:string,f:File) => { const fd=new FormData(); fd.append('file',f); return api.post('/knowledge-bases/'+id+'/documents',fd); }, deleteDoc: (kb:string,doc:string) => api.delete('/knowledge-bases/'+kb+'/documents/'+doc), search: (id:string,q:string) => api.post('/knowledge-bases/'+id+'/search',{query:q}), chat: (id:string,q:string) => api.post('/knowledge-bases/'+id+'/chat',{query:q}), ingestUrl: (id:string,url:string) => api.post('/knowledge-bases/'+id+'/ingest-url',{url}) };
export const workflowsApi = { list: () => api.get('/workflows'), create: (d:any) => api.post('/workflows',d), get: (id:string) => api.get('/workflows/'+id), update: (id:string,d:any) => api.patch('/workflows/'+id,d), delete: (id:string) => api.delete('/workflows/'+id), execute: (id:string,d?:any) => api.post('/workflows/'+id+'/execute',d), getRuns: (id:string) => api.get('/workflows/'+id+'/runs') };
export const marketplaceApi = { list: (p?:any) => api.get('/marketplace',{params:p}), get: (id:string) => api.get('/marketplace/'+id), create: (d:any) => api.post('/marketplace',d), purchase: (id:string) => api.post('/marketplace/'+id+'/purchase') };
export const billingApi = { getPlans: () => api.get('/billing/plans'), getUsage: () => api.get('/billing/usage'), subscribe: (planId:string) => api.post('/billing/subscribe',{planId}), topup: (credits:number) => api.post('/billing/topup',{credits}) };
export const adminApi = { getUsers: (p?:any) => api.get('/admin/users',{params:p}), updateUser: (id:string,d:any) => api.patch('/admin/users/'+id,d), getAnalytics: () => api.get('/admin/analytics'), getAiUsage: () => api.get('/admin/ai-usage') };
export default api;