'use client';
import { useState, useEffect } from 'react';
import { agentsApi } from '@/lib/api';
import type { Agent } from '@ai-os/types';

const TOOLS = ['web_search','code_exec','http_request','file_read','calculator'];
const MODELS = ['gpt-4o','claude-sonnet-4-6','gemini-2.0-flash','deepseek-chat'];

export default function AgentsPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({
    name: '', description: '', systemPrompt: '', model: 'claude-sonnet-4-6',
    temperature: 0.7, tools: [] as string[], memoryType: 'session',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => { loadAgents(); }, []);

  const loadAgents = async () => {
    try { const { data } = await agentsApi.list(); setAgents(data.data); } catch {}
  };

  const createAgent = async () => {
    setSaving(true);
    try {
      await agentsApi.create(form);
      setShowCreate(false);
      setForm({ name: '', description: '', systemPrompt: '', model: 'claude-sonnet-4-6', temperature: 0.7, tools: [], memoryType: 'session' });
      loadAgents();
    } catch {}
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">🤖 AI Agents</h1>
          <p className="text-muted-foreground text-sm mt-1">Build custom AI assistants with memory, tools, and knowledge.</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">
          + Create Agent
        </button>
      </div>

      {/* Agent grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {agents.map(agent => (
          <AgentCard key={agent.id} agent={agent} onDelete={async () => { await agentsApi.delete(agent.id); loadAgents(); }} />
        ))}
        {agents.length === 0 && !showCreate && (
          <div className="col-span-3 text-center py-16 text-muted-foreground">
            <div className="text-4xl mb-3">🤖</div>
            <p className="font-medium">No agents yet</p>
            <p className="text-sm mt-1">Create your first AI agent to get started.</p>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-border flex items-center justify-between">
              <h2 className="font-bold text-lg">Create New Agent</h2>
              <button onClick={() => setShowCreate(false)} className="text-muted-foreground hover:text-foreground">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">Agent Name *</label>
                <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="e.g. Sales Assistant, Code Reviewer..." />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Description</label>
                <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"
                  placeholder="What does this agent do?" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">System Prompt *</label>
                <textarea value={form.systemPrompt} onChange={e => setForm(f => ({ ...f, systemPrompt: e.target.value }))} rows={5}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 resize-none"
                  placeholder="You are an expert assistant that..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Model</label>
                  <select value={form.model} onChange={e => setForm(f => ({ ...f, model: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none">
                    {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1.5 block">Memory</label>
                  <select value={form.memoryType} onChange={e => setForm(f => ({ ...f, memoryType: e.target.value }))}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none">
                    <option value="none">No Memory</option>
                    <option value="session">Session Memory</option>
                    <option value="persistent">Persistent Memory</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Tools</label>
                <div className="flex flex-wrap gap-2">
                  {TOOLS.map(tool => (
                    <button key={tool} onClick={() => setForm(f => ({
                      ...f, tools: f.tools.includes(tool) ? f.tools.filter(t => t !== tool) : [...f.tools, tool]
                    }))} className={`px-3 py-1.5 rounded-full text-xs border transition-colors ${form.tools.includes(tool) ? 'border-violet-500 bg-violet-500/20 text-violet-300' : 'border-border text-muted-foreground'}`}>
                      {tool}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-border flex gap-3 justify-end">
              <button onClick={() => setShowCreate(false)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors">Cancel</button>
              <button onClick={createAgent} disabled={saving || !form.name || !form.systemPrompt}
                className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium disabled:opacity-50 transition-colors">
                {saving ? 'Creating...' : 'Create Agent'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function AgentCard({ agent, onDelete }: { agent: Agent; onDelete: () => void }) {
  return (
    <div className="p-4 rounded-xl border border-border bg-card hover:border-violet-500/50 transition-colors">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-lg font-bold text-white">
            {agent.avatarUrl ? <img src={agent.avatarUrl} className="w-full h-full rounded-xl object-cover" /> : agent.name[0]}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{agent.name}</h3>
            <span className="text-xs text-muted-foreground">{agent.model}</span>
          </div>
        </div>
        <div className="flex gap-1">
          {agent.isPublic && <span className="text-xs px-2 py-0.5 rounded-full bg-green-500/20 text-green-400">Public</span>}
        </div>
      </div>
      {agent.description && <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{agent.description}</p>}
      {agent.tools.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {(agent.tools as string[]).slice(0, 3).map((t) => (
            <span key={t} className="text-xs px-2 py-0.5 rounded-full bg-accent text-muted-foreground">{t}</span>
          ))}
        </div>
      )}
      <div className="flex gap-2 mt-auto pt-2 border-t border-border">
        <button className="flex-1 py-1.5 text-xs text-center rounded-lg bg-violet-600 hover:bg-violet-700 text-white transition-colors">Chat</button>
        <button onClick={onDelete} className="px-3 py-1.5 text-xs rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive transition-colors">Delete</button>
      </div>
    </div>
  );
}
