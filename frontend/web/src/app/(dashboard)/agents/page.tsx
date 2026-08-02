'use client';
import { useState, useEffect } from 'react';
import { agentsApi } from '@/lib/api';

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [form, setForm] = useState({ name: '', systemPrompt: '', model: 'gpt-4o' });
  const [showCreate, setShowCreate] = useState(false);

  useEffect(() => {
    agentsApi.list().then((r) => setAgents(r.data.data ?? [])).catch(() => {});
  }, []);

  const create = async () => {
    await agentsApi.create(form);
    setShowCreate(false);
    agentsApi.list().then((r) => setAgents(r.data.data ?? [])).catch(() => {});
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">AI Agents</h1>
          <p className="text-muted-foreground text-sm mt-1">Build custom AI assistants</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium"
        >
          + Create Agent
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {agents.map((agent: any) => (
          <div key={agent.id} className="p-4 rounded-xl border border-border bg-card">
            <div className="font-semibold">{agent.name}</div>
            <div className="text-xs text-muted-foreground mt-1">{agent.model}</div>
            <div className="text-xs text-muted-foreground mt-2 line-clamp-2">
              {agent.description || agent.systemPrompt}
            </div>
          </div>
        ))}
      </div>

      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4">
            <h2 className="font-bold text-lg">Create Agent</h2>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Agent Name"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none"
            />
            <textarea
              value={form.systemPrompt}
              onChange={(e) => setForm((f) => ({ ...f, systemPrompt: e.target.value }))}
              rows={4}
              placeholder="System prompt..."
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2 border border-border rounded-lg text-sm"
              >
                Cancel
              </button>
              <button
                onClick={create}
                disabled={!form.name}
                className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
