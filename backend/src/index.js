require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { v4: uuid } = require('uuid');
const OpenAI = require('openai').default;
const Anthropic = require('@anthropic-ai/sdk').default;
const { GoogleGenerativeAI } = require('@google/generative-ai');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder');

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';

// ─── Middleware ───────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }));
app.use(compression());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(require('morgan')('combined'));

// Rate limiting
const limiter = rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true });
const authLimiter = rateLimit({ windowMs: 60 * 1000, max: 10 });
app.use('/api/', limiter);
app.use('/api/v1/auth/', authLimiter);

// ─── In-Memory DB (for demo — replace with PostgreSQL via DATABASE_URL) ──
// In production Railway/Render provides PostgreSQL — use Prisma
const DB = {
  users: [
    { id: 'admin-1', email: 'admin@allinone.ai', name: 'Admin', passwordHash: bcrypt.hashSync('Admin@123456', 10), role: 'admin', plan: 'enterprise', credits: 10000000, monthlySpend: 0, isActive: true, createdAt: new Date() },
    { id: 'demo-1', email: 'demo@allinone.ai', name: 'Demo User', passwordHash: bcrypt.hashSync('Demo@123456', 10), role: 'user', plan: 'pro', credits: 2000000, monthlySpend: 0, isActive: true, createdAt: new Date() },
  ],
  conversations: [],
  messages: [],
  agents: [
    { id: uuid(), userId: 'demo-1', name: 'Code Review Expert', description: 'Analyzes code, finds bugs', systemPrompt: 'You are a senior software engineer. Review code thoroughly.', model: 'gpt-4o', temperature: 0.3, tools: ['web_search', 'code_exec'], isPublic: true, useCount: 1240 },
    { id: uuid(), userId: 'demo-1', name: 'SEO Content Writer', description: 'Creates SEO-optimized content', systemPrompt: 'You are an expert SEO content strategist.', model: 'claude-sonnet-4-6', temperature: 0.7, tools: ['web_search'], isPublic: true, useCount: 892 },
  ],
  knowledgeBases: [],
  kbDocuments: [],
  workflows: [],
  workflowRuns: [],
  marketplaceListings: [
    { id: uuid(), sellerId: 'demo-1', type: 'agent', title: 'Code Review Expert', description: 'AI agent for thorough code reviews', price: 4.99, priceType: 'one-time', downloads: 1240, ratingAvg: 4.8, status: 'active' },
    { id: uuid(), sellerId: 'demo-1', type: 'prompt', title: 'Ultimate Blog Generator', description: 'SEO-optimized blog post generator', price: 9.99, priceType: 'one-time', downloads: 892, ratingAvg: 4.6, status: 'active' },
    { id: uuid(), sellerId: 'demo-1', type: 'workflow', title: 'Auto Email Responder', description: 'Gmail + AI + Slack automation', price: 0, priceType: 'free', downloads: 3456, ratingAvg: 4.9, status: 'active' },
  ],
  aiRequests: [],
};

// ─── Auth Helpers ─────────────────────────────────────────────────
const signToken = (user) => jwt.sign({ sub: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '15m' });
const signRefresh = (user) => jwt.sign({ sub: user.id }, JWT_SECRET + '_refresh', { expiresIn: '30d' });

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ success: false, error: { code: '401', message: 'No token' } });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    req.user = DB.users.find(u => u.id === req.user.sub) || req.user;
    next();
  } catch {
    res.status(401).json({ success: false, error: { code: '401', message: 'Invalid token' } });
  }
};

const ok = (res, data, meta) => res.json({ success: true, data, ...(meta ? { meta } : {}) });
const err = (res, status, message) => res.status(status).json({ success: false, error: { code: String(status), message } });

// ─── AI Clients ───────────────────────────────────────────────────
const getOpenAI = () => process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const getAnthropic = () => process.env.ANTHROPIC_API_KEY ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }) : null;
const getGoogle = () => process.env.GOOGLE_API_KEY ? new GoogleGenerativeAI(process.env.GOOGLE_API_KEY) : null;

const MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', provider: 'openai', contextWindow: 128000, inputCostPer1k: 0.005, outputCostPer1k: 0.015, capabilities: ['text', 'vision', 'code'] },
  { id: 'gpt-4o-mini', name: 'GPT-4o Mini', provider: 'openai', contextWindow: 128000, inputCostPer1k: 0.00015, outputCostPer1k: 0.0006, capabilities: ['text', 'vision'] },
  { id: 'claude-sonnet-4-6', name: 'Claude Sonnet 4.6', provider: 'anthropic', contextWindow: 200000, inputCostPer1k: 0.003, outputCostPer1k: 0.015, capabilities: ['text', 'vision', 'code'] },
  { id: 'claude-haiku-4-5', name: 'Claude Haiku 4.5', provider: 'anthropic', contextWindow: 200000, inputCostPer1k: 0.00025, outputCostPer1k: 0.00125, capabilities: ['text', 'code'] },
  { id: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash', provider: 'google', contextWindow: 1000000, inputCostPer1k: 0.000075, outputCostPer1k: 0.0003, capabilities: ['text', 'vision'] },
  { id: 'gemini-1.5-pro', name: 'Gemini 1.5 Pro', provider: 'google', contextWindow: 2000000, inputCostPer1k: 0.00125, outputCostPer1k: 0.005, capabilities: ['text', 'vision', 'code'] },
];

async function callAI(model, messages, stream = false, res = null) {
  const modelInfo = MODELS.find(m => m.id === model) || MODELS[0];
  const provider = modelInfo.provider;

  if (provider === 'openai' || !provider) {
    const openai = getOpenAI();
    if (!openai) throw new Error('OpenAI API key not configured');
    if (stream && res) {
      const s = await openai.chat.completions.create({ model: model || 'gpt-4o', messages, stream: true });
      for await (const chunk of s) {
        const delta = chunk.choices[0]?.delta?.content || '';
        if (delta) res.write(`data: ${JSON.stringify({ delta, done: false })}\n\n`);
      }
      res.write(`data: ${JSON.stringify({ delta: '', done: true })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return null;
    }
    const r = await openai.chat.completions.create({ model: model || 'gpt-4o', messages });
    return { content: r.choices[0].message.content, tokensInput: r.usage?.prompt_tokens || 0, tokensOutput: r.usage?.completion_tokens || 0, model: r.model, provider: 'openai' };
  }

  if (provider === 'anthropic') {
    const anthropic = getAnthropic();
    if (!anthropic) throw new Error('Anthropic API key not configured');
    const systemMsg = messages.find(m => m.role === 'system');
    const userMsgs = messages.filter(m => m.role !== 'system');
    if (stream && res) {
      const s = await anthropic.messages.create({ model, max_tokens: 4096, system: systemMsg?.content, messages: userMsgs, stream: true });
      for await (const event of s) {
        if (event.type === 'content_block_delta') {
          res.write(`data: ${JSON.stringify({ delta: event.delta?.text || '', done: false })}\n\n`);
        }
      }
      res.write(`data: ${JSON.stringify({ delta: '', done: true })}\n\n`);
      res.write('data: [DONE]\n\n');
      res.end();
      return null;
    }
    const r = await anthropic.messages.create({ model, max_tokens: 4096, system: systemMsg?.content, messages: userMsgs });
    return { content: r.content[0].text, tokensInput: r.usage?.input_tokens || 0, tokensOutput: r.usage?.output_tokens || 0, model, provider: 'anthropic' };
  }

  if (provider === 'google') {
    const google = getGoogle();
    if (!google) throw new Error('Google API key not configured');
    const genModel = google.getGenerativeModel({ model });
    const prompt = messages.map(m => m.content).join('\n');
    const r = await genModel.generateContent(prompt);
    const text = r.response.text();
    return { content: text, tokensInput: 0, tokensOutput: 0, model, provider: 'google' };
  }

  throw new Error(`Unknown provider: ${provider}`);
}

function routeModel(prompt) {
  const p = prompt.toLowerCase();
  if (/code|function|bug|debug|script|programming/.test(p)) return 'claude-sonnet-4-6';
  if (/image|picture|photo|draw/.test(p)) return 'gpt-4o';
  if (/research|analyze|explain|summary/.test(p)) return 'claude-sonnet-4-6';
  if (/fast|quick|brief|short/.test(p)) return 'gpt-4o-mini';
  return 'gpt-4o';
}

// ─── ROUTES ──────────────────────────────────────────────────────

// Health
app.get('/api/v1/health', (req, res) => ok(res, { status: 'ok', timestamp: new Date(), version: '1.0.0' }));

// ── Auth ─────────────────────────────────────────────────────────
app.post('/api/v1/auth/register', async (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) return err(res, 400, 'Email, password, name required');
    if (DB.users.find(u => u.email === email)) return err(res, 409, 'Email already registered');
    const user = { id: uuid(), email: email.toLowerCase(), name, passwordHash: await bcrypt.hash(password, 12), role: 'user', plan: 'free', credits: 50000, monthlySpend: 0, isActive: true, createdAt: new Date() };
    DB.users.push(user);
    const { passwordHash, ...safeUser } = user;
    ok(res, { user: safeUser, accessToken: signToken(user), refreshToken: signRefresh(user), expiresIn: 900 });
  } catch (e) { err(res, 500, e.message); }
});

app.post('/api/v1/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = DB.users.find(u => u.email === email?.toLowerCase());
    if (!user || !await bcrypt.compare(password, user.passwordHash)) return err(res, 401, 'Invalid credentials');
    if (!user.isActive) return err(res, 401, 'Account suspended');
    const { passwordHash, ...safeUser } = user;
    ok(res, { user: safeUser, accessToken: signToken(user), refreshToken: signRefresh(user), expiresIn: 900 });
  } catch (e) { err(res, 500, e.message); }
});

app.post('/api/v1/auth/refresh', (req, res) => {
  try {
    const { refreshToken } = req.body;
    const payload = jwt.verify(refreshToken, JWT_SECRET + '_refresh');
    const user = DB.users.find(u => u.id === payload.sub);
    if (!user) return err(res, 401, 'User not found');
    ok(res, { accessToken: signToken(user), refreshToken: signRefresh(user), expiresIn: 900 });
  } catch { err(res, 401, 'Invalid refresh token'); }
});

app.post('/api/v1/auth/logout', (req, res) => ok(res, { message: 'Logged out' }));
app.get('/api/v1/auth/me', authMiddleware, (req, res) => {
  const { passwordHash, ...safe } = req.user;
  ok(res, safe);
});

// ── Users ────────────────────────────────────────────────────────
app.get('/api/v1/users/me', authMiddleware, (req, res) => { const { passwordHash, ...safe } = req.user; ok(res, safe); });
app.patch('/api/v1/users/me', authMiddleware, (req, res) => {
  const idx = DB.users.findIndex(u => u.id === req.user.id);
  if (idx === -1) return err(res, 404, 'User not found');
  DB.users[idx] = { ...DB.users[idx], ...req.body, updatedAt: new Date() };
  const { passwordHash, ...safe } = DB.users[idx];
  ok(res, safe);
});

// ── AI Models & Routing ──────────────────────────────────────────
app.get('/api/v1/ai/models', authMiddleware, (req, res) => ok(res, MODELS));
app.post('/api/v1/ai/route', authMiddleware, (req, res) => {
  const { prompt } = req.body;
  const model = routeModel(prompt || '');
  const m = MODELS.find(x => x.id === model);
  ok(res, { model, provider: m?.provider, reason: `Best model for this task type`, estimatedCost: 0.001 });
});

// ── AI Complete (non-streaming) ──────────────────────────────────
app.post('/api/v1/ai/complete', authMiddleware, async (req, res) => {
  try {
    const { model, messages } = req.body;
    const start = Date.now();
    const result = await callAI(model || 'gpt-4o', messages);
    const latencyMs = Date.now() - start;
    const m = MODELS.find(x => x.id === result.model);
    const cost = m ? (result.tokensInput * m.inputCostPer1k / 1000 + result.tokensOutput * m.outputCostPer1k / 1000) : 0;
    DB.aiRequests.push({ id: uuid(), userId: req.user.id, model: result.model, provider: result.provider, tokensInput: result.tokensInput, tokensOutput: result.tokensOutput, costUsd: cost, createdAt: new Date() });
    ok(res, { ...result, latencyMs, costUsd: cost });
  } catch (e) { err(res, 500, e.message); }
});

// ── AI Streaming ─────────────────────────────────────────────────
app.post('/api/v1/ai/complete/stream', authMiddleware, async (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();
  try {
    const { model, messages } = req.body;
    await callAI(model || 'gpt-4o', messages, true, res);
  } catch (e) {
    res.write(`data: ${JSON.stringify({ error: e.message, done: true })}\n\n`);
    res.end();
  }
});

// ── AI Compare ──────────────────────────────────────────────────
app.post('/api/v1/ai/compare', authMiddleware, async (req, res) => {
  try {
    const { prompt, models = ['gpt-4o', 'claude-sonnet-4-6'] } = req.body;
    const results = await Promise.allSettled(
      models.map(model => callAI(model, [{ role: 'user', content: prompt }]))
    );
    ok(res, results.map((r, i) => ({
      model: models[i],
      result: r.status === 'fulfilled' ? r.value : null,
      error: r.status === 'rejected' ? r.reason?.message : null,
    })));
  } catch (e) { err(res, 500, e.message); }
});

// ── Conversations ────────────────────────────────────────────────
app.get('/api/v1/conversations', authMiddleware, (req, res) => {
  const convs = DB.conversations.filter(c => c.userId === req.user.id).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  ok(res, convs, { hasMore: false });
});

app.post('/api/v1/conversations', authMiddleware, (req, res) => {
  const conv = { id: uuid(), userId: req.user.id, title: req.body.title || 'New Chat', mode: req.body.mode || 'single', model: req.body.model || 'gpt-4o', totalTokens: 0, totalCost: 0, createdAt: new Date(), updatedAt: new Date() };
  DB.conversations.push(conv);
  ok(res, conv);
});

app.get('/api/v1/conversations/search', authMiddleware, (req, res) => {
  const q = (req.query.q || '').toLowerCase();
  const results = DB.conversations.filter(c => c.userId === req.user.id && c.title.toLowerCase().includes(q));
  ok(res, results);
});

app.get('/api/v1/conversations/:id', authMiddleware, (req, res) => {
  const conv = DB.conversations.find(c => c.id === req.params.id && c.userId === req.user.id);
  if (!conv) return err(res, 404, 'Conversation not found');
  ok(res, conv);
});

app.patch('/api/v1/conversations/:id', authMiddleware, (req, res) => {
  const idx = DB.conversations.findIndex(c => c.id === req.params.id && c.userId === req.user.id);
  if (idx === -1) return err(res, 404, 'Not found');
  DB.conversations[idx] = { ...DB.conversations[idx], ...req.body, updatedAt: new Date() };
  ok(res, DB.conversations[idx]);
});

app.delete('/api/v1/conversations/:id', authMiddleware, (req, res) => {
  const idx = DB.conversations.findIndex(c => c.id === req.params.id && c.userId === req.user.id);
  if (idx === -1) return err(res, 404, 'Not found');
  DB.conversations.splice(idx, 1);
  DB.messages = DB.messages.filter(m => m.conversationId !== req.params.id);
  ok(res, { message: 'Deleted' });
});

app.get('/api/v1/conversations/:id/messages', authMiddleware, (req, res) => {
  const msgs = DB.messages.filter(m => m.conversationId === req.params.id).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  ok(res, msgs);
});

app.post('/api/v1/conversations/:id/messages', authMiddleware, async (req, res) => {
  const { content, model, stream } = req.body;
  const convId = req.params.id;
  const userMsg = { id: uuid(), conversationId: convId, role: 'user', content, createdAt: new Date() };
  DB.messages.push(userMsg);

  if (stream !== false) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();
    try {
      const history = DB.messages.filter(m => m.conversationId === convId).slice(-10).map(m => ({ role: m.role, content: m.content }));
      await callAI(model || 'gpt-4o', history, true, res);
    } catch (e) {
      res.write(`data: ${JSON.stringify({ error: e.message, done: true })}\n\n`);
      res.end();
    }
  } else {
    try {
      const history = DB.messages.filter(m => m.conversationId === convId).slice(-10).map(m => ({ role: m.role, content: m.content }));
      const result = await callAI(model || 'gpt-4o', history);
      const aiMsg = { id: uuid(), conversationId: convId, role: 'assistant', content: result.content, model: result.model, provider: result.provider, createdAt: new Date() };
      DB.messages.push(aiMsg);
      ok(res, aiMsg);
    } catch (e) { err(res, 500, e.message); }
  }
});

// ── Agents ───────────────────────────────────────────────────────
app.get('/api/v1/agents', authMiddleware, (req, res) => ok(res, DB.agents.filter(a => a.userId === req.user.id)));
app.get('/api/v1/agents/public', (req, res) => ok(res, DB.agents.filter(a => a.isPublic)));
app.post('/api/v1/agents', authMiddleware, (req, res) => {
  const agent = { id: uuid(), userId: req.user.id, ...req.body, useCount: 0, createdAt: new Date() };
  DB.agents.push(agent);
  ok(res, agent);
});
app.get('/api/v1/agents/:id', authMiddleware, (req, res) => {
  const a = DB.agents.find(a => a.id === req.params.id);
  if (!a) return err(res, 404, 'Not found');
  ok(res, a);
});
app.patch('/api/v1/agents/:id', authMiddleware, (req, res) => {
  const idx = DB.agents.findIndex(a => a.id === req.params.id && a.userId === req.user.id);
  if (idx === -1) return err(res, 404, 'Not found');
  DB.agents[idx] = { ...DB.agents[idx], ...req.body };
  ok(res, DB.agents[idx]);
});
app.delete('/api/v1/agents/:id', authMiddleware, (req, res) => {
  const idx = DB.agents.findIndex(a => a.id === req.params.id && a.userId === req.user.id);
  if (idx === -1) return err(res, 404, 'Not found');
  DB.agents.splice(idx, 1);
  ok(res, { message: 'Deleted' });
});
app.post('/api/v1/agents/:id/chat', authMiddleware, async (req, res) => {
  const agent = DB.agents.find(a => a.id === req.params.id);
  if (!agent) return err(res, 404, 'Agent not found');
  agent.useCount++;
  try {
    const result = await callAI(agent.model || 'gpt-4o', [
      { role: 'system', content: agent.systemPrompt },
      { role: 'user', content: req.body.message },
    ]);
    ok(res, result);
  } catch (e) { err(res, 500, e.message); }
});
app.post('/api/v1/agents/:id/sessions', authMiddleware, (req, res) => {
  const session = { id: uuid(), agentId: req.params.id, userId: req.user.id, messages: [], startedAt: new Date() };
  ok(res, session);
});
app.get('/api/v1/agents/:id/memory', authMiddleware, (req, res) => ok(res, []));
app.delete('/api/v1/agents/:id/memory', authMiddleware, (req, res) => ok(res, { message: 'Memory cleared' }));

// ── Knowledge Bases ──────────────────────────────────────────────
app.get('/api/v1/knowledge-bases', authMiddleware, (req, res) => ok(res, DB.knowledgeBases.filter(k => k.userId === req.user.id)));
app.post('/api/v1/knowledge-bases', authMiddleware, (req, res) => {
  const kb = { id: uuid(), userId: req.user.id, ...req.body, docCount: 0, vectorCount: 0, status: 'active', createdAt: new Date() };
  DB.knowledgeBases.push(kb);
  ok(res, kb);
});
app.get('/api/v1/knowledge-bases/:id', authMiddleware, (req, res) => {
  const kb = DB.knowledgeBases.find(k => k.id === req.params.id);
  if (!kb) return err(res, 404, 'Not found');
  ok(res, kb);
});
app.delete('/api/v1/knowledge-bases/:id', authMiddleware, (req, res) => {
  const idx = DB.knowledgeBases.findIndex(k => k.id === req.params.id);
  if (idx > -1) DB.knowledgeBases.splice(idx, 1);
  ok(res, { message: 'Deleted' });
});
app.get('/api/v1/knowledge-bases/:id/documents', authMiddleware, (req, res) => ok(res, DB.kbDocuments.filter(d => d.kbId === req.params.id)));
app.post('/api/v1/knowledge-bases/:id/documents', authMiddleware, (req, res) => {
  const doc = { id: uuid(), kbId: req.params.id, filename: req.body.filename || 'document.pdf', fileType: 'application/pdf', status: 'indexed', chunksCount: 15, createdAt: new Date() };
  DB.kbDocuments.push(doc);
  const kbIdx = DB.knowledgeBases.findIndex(k => k.id === req.params.id);
  if (kbIdx > -1) { DB.knowledgeBases[kbIdx].docCount++; DB.knowledgeBases[kbIdx].vectorCount += 15; }
  ok(res, doc);
});
app.delete('/api/v1/knowledge-bases/:id/documents/:docId', authMiddleware, (req, res) => {
  const idx = DB.kbDocuments.findIndex(d => d.id === req.params.docId);
  if (idx > -1) DB.kbDocuments.splice(idx, 1);
  ok(res, { message: 'Deleted' });
});
app.post('/api/v1/knowledge-bases/:id/search', authMiddleware, async (req, res) => {
  ok(res, { query: req.body.query, results: [{ chunk: 'Relevant content from your documents...', score: 0.92, source: 'document.pdf', page: 1 }] });
});
app.post('/api/v1/knowledge-bases/:id/chat', authMiddleware, async (req, res) => {
  try {
    const result = await callAI('gpt-4o', [
      { role: 'system', content: 'Answer based on the provided context. Be helpful and cite sources.' },
      { role: 'user', content: req.body.query },
    ]);
    ok(res, { answer: result.content, sources: [{ source: 'document.pdf', page: 1 }] });
  } catch (e) { err(res, 500, e.message); }
});
app.post('/api/v1/knowledge-bases/:id/ingest-url', authMiddleware, (req, res) => {
  const doc = { id: uuid(), kbId: req.params.id, filename: req.body.url, fileType: 'url', status: 'indexed', chunksCount: 10, createdAt: new Date() };
  DB.kbDocuments.push(doc);
  ok(res, doc);
});

// ── Workflows ────────────────────────────────────────────────────
app.get('/api/v1/workflows', authMiddleware, (req, res) => ok(res, DB.workflows.filter(w => w.userId === req.user.id)));
app.post('/api/v1/workflows', authMiddleware, (req, res) => {
  const wf = { id: uuid(), userId: req.user.id, ...req.body, runCount: 0, status: req.body.status || 'draft', createdAt: new Date() };
  DB.workflows.push(wf);
  ok(res, wf);
});
app.get('/api/v1/workflows/:id', authMiddleware, (req, res) => {
  const wf = DB.workflows.find(w => w.id === req.params.id);
  if (!wf) return err(res, 404, 'Not found');
  ok(res, wf);
});
app.patch('/api/v1/workflows/:id', authMiddleware, (req, res) => {
  const idx = DB.workflows.findIndex(w => w.id === req.params.id);
  if (idx === -1) return err(res, 404, 'Not found');
  DB.workflows[idx] = { ...DB.workflows[idx], ...req.body, updatedAt: new Date() };
  ok(res, DB.workflows[idx]);
});
app.delete('/api/v1/workflows/:id', authMiddleware, (req, res) => {
  const idx = DB.workflows.findIndex(w => w.id === req.params.id);
  if (idx > -1) DB.workflows.splice(idx, 1);
  ok(res, { message: 'Deleted' });
});
app.post('/api/v1/workflows/:id/execute', authMiddleware, async (req, res) => {
  const wf = DB.workflows.find(w => w.id === req.params.id);
  if (!wf) return err(res, 404, 'Not found');
  const run = { id: uuid(), workflowId: req.params.id, userId: req.user.id, status: 'completed', logs: [{ step: 'trigger', status: 'success', output: 'Workflow triggered' }, { step: 'ai_node', status: 'success', output: 'AI processed the request' }, { step: 'action', status: 'success', output: 'Action completed' }], startedAt: new Date(), completedAt: new Date() };
  DB.workflowRuns.push(run);
  if (wf) wf.runCount = (wf.runCount || 0) + 1;
  ok(res, run);
});
app.get('/api/v1/workflows/:id/runs', authMiddleware, (req, res) => ok(res, DB.workflowRuns.filter(r => r.workflowId === req.params.id)));
app.get('/api/v1/workflows/:id/runs/:runId', authMiddleware, (req, res) => {
  const run = DB.workflowRuns.find(r => r.id === req.params.runId);
  ok(res, run || null);
});

// ── Marketplace ──────────────────────────────────────────────────
app.get('/api/v1/marketplace', authMiddleware, (req, res) => {
  let listings = DB.marketplaceListings.filter(l => l.status === 'active');
  if (req.query.type) listings = listings.filter(l => l.type === req.query.type);
  ok(res, listings);
});
app.post('/api/v1/marketplace', authMiddleware, (req, res) => {
  const listing = { id: uuid(), sellerId: req.user.id, ...req.body, downloads: 0, status: 'active', createdAt: new Date() };
  DB.marketplaceListings.push(listing);
  ok(res, listing);
});
app.get('/api/v1/marketplace/:id', authMiddleware, (req, res) => {
  const l = DB.marketplaceListings.find(x => x.id === req.params.id);
  if (!l) return err(res, 404, 'Not found');
  ok(res, l);
});
app.post('/api/v1/marketplace/:id/purchase', authMiddleware, (req, res) => {
  const l = DB.marketplaceListings.find(x => x.id === req.params.id);
  if (!l) return err(res, 404, 'Not found');
  l.downloads++;
  ok(res, { message: 'Purchase successful', listing: l });
});

// ── Content Generation ───────────────────────────────────────────
app.post('/api/v1/content/generate', authMiddleware, async (req, res) => {
  const { type, prompt, options = {} } = req.body;
  const systemPrompts = {
    article: `You are an expert content writer. Write a comprehensive, well-structured article with proper headings. Use markdown. Tone: ${options.tone || 'professional'}. Length: ${options.length || 'medium'}.`,
    social: `You are a social media expert. Create engaging platform-optimized posts with hashtags. Tone: ${options.tone || 'casual'}.`,
    marketing: `You are a direct-response copywriter. Write compelling copy that drives action. Tone: ${options.tone || 'persuasive'}.`,
    email: `You are an email marketing specialist. Write a complete email with subject line, body, and CTA.`,
    blog: `You are a professional blogger. Write an engaging, SEO-optimized blog post with clear structure and markdown formatting.`,
  };
  try {
    const model = type === 'image' ? 'gpt-4o' : 'claude-sonnet-4-6';
    const result = await callAI(model, [
      { role: 'system', content: systemPrompts[type] || 'You are a helpful AI content creator.' },
      { role: 'user', content: prompt },
    ]);
    ok(res, { content: result.content, model: result.model, type });
  } catch (e) { err(res, 500, e.message); }
});

// ── Billing ──────────────────────────────────────────────────────
app.get('/api/v1/billing/plans', (req, res) => ok(res, [
  { id: 'free', name: 'Free', slug: 'free', priceMonthly: 0, credits: 50000, features: { models: 5, agents: 1, knowledgeBasesGb: 0.01, workflows: 3, apiAccess: false } },
  { id: 'starter', name: 'Starter', slug: 'starter', priceMonthly: 19, credits: 500000, features: { models: 10, agents: 5, knowledgeBasesGb: 0.5, workflows: 10, apiAccess: true } },
  { id: 'pro', name: 'Pro', slug: 'pro', priceMonthly: 49, credits: 2000000, features: { models: 'all', agents: 20, knowledgeBasesGb: 5, workflows: 50, apiAccess: true } },
  { id: 'business', name: 'Business', slug: 'business', priceMonthly: 149, credits: 10000000, features: { models: 'all', agents: 100, knowledgeBasesGb: 50, workflows: 500, apiAccess: true, sso: true } },
]));

app.get('/api/v1/billing/usage', authMiddleware, (req, res) => {
  const u = req.user;
  ok(res, { credits: u.credits, monthlySpend: u.monthlySpend, plan: u.plan, planCredits: 50000 });
});

app.post('/api/v1/billing/subscribe', authMiddleware, async (req, res) => {
  const { planId } = req.body;
  if (!process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'sk_test_placeholder') {
    return ok(res, { url: `/settings?plan=${planId}&demo=true`, message: 'Demo mode — Stripe not configured' });
  }
  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: process.env[`STRIPE_${planId.toUpperCase()}_PRICE_ID`], quantity: 1 }],
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?success=true`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/settings?canceled=true`,
    });
    ok(res, { url: session.url });
  } catch (e) { err(res, 500, e.message); }
});

app.post('/api/v1/billing/topup', authMiddleware, (req, res) => {
  const { credits = 1000 } = req.body;
  const user = DB.users.find(u => u.id === req.user.id);
  if (user) user.credits += credits;
  ok(res, { credits, message: `${credits} credits added` });
});

// ── Admin ────────────────────────────────────────────────────────
app.get('/api/v1/admin/users', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return err(res, 403, 'Forbidden');
  ok(res, DB.users.map(({ passwordHash, ...u }) => u));
});
app.patch('/api/v1/admin/users/:id', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return err(res, 403, 'Forbidden');
  const idx = DB.users.findIndex(u => u.id === req.params.id);
  if (idx === -1) return err(res, 404, 'Not found');
  DB.users[idx] = { ...DB.users[idx], ...req.body };
  const { passwordHash, ...safe } = DB.users[idx];
  ok(res, safe);
});
app.get('/api/v1/admin/analytics', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin' && req.user.role !== 'superadmin') return err(res, 403, 'Forbidden');
  ok(res, {
    totalUsers: DB.users.length,
    paidUsers: DB.users.filter(u => u.plan !== 'free').length,
    freeUsers: DB.users.filter(u => u.plan === 'free').length,
    totalRequests: DB.aiRequests.length,
    totalRevenue: DB.aiRequests.reduce((s, r) => s + (r.costUsd || 0), 0),
    totalConversations: DB.conversations.length,
    totalAgents: DB.agents.length,
    marketplaceListings: DB.marketplaceListings.length,
  });
});
app.get('/api/v1/admin/ai-usage', authMiddleware, (req, res) => {
  if (req.user.role !== 'admin') return err(res, 403, 'Forbidden');
  const grouped = {};
  DB.aiRequests.forEach(r => {
    const key = r.model;
    if (!grouped[key]) grouped[key] = { model: r.model, provider: r.provider, count: 0, totalCost: 0 };
    grouped[key].count++;
    grouped[key].totalCost += r.costUsd || 0;
  });
  ok(res, Object.values(grouped));
});

// ─── 404 handler ─────────────────────────────────────────────────
app.use((req, res) => err(res, 404, `Route not found: ${req.method} ${req.path}`));

// ─── Error handler ────────────────────────────────────────────────
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  err(res, 500, error.message || 'Internal server error');
});

// ─── Start ────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 All-In-One AI API running on port ${PORT}`);
  console.log(`📚 Health check: http://localhost:${PORT}/api/v1/health`);
  console.log(`🔑 OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not set'}`);
  console.log(`🔑 Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not set'}`);
  console.log(`🔑 Google: ${process.env.GOOGLE_API_KEY ? '✅ Configured' : '❌ Not set'}\n`);
});

module.exports = app;
