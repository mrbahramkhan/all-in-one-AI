'use client';
import { useState, useEffect, useCallback } from 'react';
import ReactFlow, {
  Node, Edge, Controls, Background, MiniMap,
  addEdge, Connection, useNodesState, useEdgesState, BackgroundVariant,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { workflowsApi } from '@/lib/api';

const NODE_TYPES_LIST = [
  { type: 'trigger',  label: 'Gmail Trigger',     icon: '📧', color: '#4285f4' },
  { type: 'trigger',  label: 'Webhook',           icon: '🔗', color: '#4285f4' },
  { type: 'trigger',  label: 'Schedule (Cron)',   icon: '⏰', color: '#4285f4' },
  { type: 'ai',       label: 'AI: Summarize',     icon: '🤖', color: '#6C63FF' },
  { type: 'ai',       label: 'AI: Classify',      icon: '🏷️', color: '#6C63FF' },
  { type: 'ai',       label: 'AI: Generate',      icon: '✨', color: '#6C63FF' },
  { type: 'action',   label: 'Slack Message',     icon: '💬', color: '#4CAF50' },
  { type: 'action',   label: 'Send Email',        icon: '📤', color: '#4CAF50' },
  { type: 'action',   label: 'Notion Page',       icon: '📝', color: '#4CAF50' },
  { type: 'action',   label: 'HTTP Request',      icon: '🌐', color: '#4CAF50' },
  { type: 'logic',    label: 'IF / Else',         icon: '🔀', color: '#FF9800' },
  { type: 'logic',    label: 'Loop',              icon: '🔄', color: '#FF9800' },
];

const COLOR_MAP: Record<string, string> = {
  trigger: '#4285f4', ai: '#6C63FF', action: '#4CAF50', logic: '#FF9800',
};

const defaultInitNodes: Node[] = [
  { id: '1', type: 'default', position: { x: 100, y: 150 }, data: { label: '📧 Gmail Trigger\nOn New Email', style: { background: '#4285f4' } } },
  { id: '2', type: 'default', position: { x: 350, y: 150 }, data: { label: '🤖 AI: Summarize\nClaude Sonnet', style: { background: '#6C63FF' } } },
  { id: '3', type: 'default', position: { x: 600, y: 150 }, data: { label: '💬 Slack Message\n#general', style: { background: '#4CAF50' } } },
];
const defaultInitEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: true },
  { id: 'e2-3', source: '2', target: '3', animated: true },
];

export default function WorkflowsPage() {
  const [workflows, setWorkflows] = useState<any[]>([]);
  const [activeWorkflow, setActiveWorkflow] = useState<any | null>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(defaultInitNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(defaultInitEdges);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);

  useEffect(() => { loadWorkflows(); }, []);

  const loadWorkflows = async () => {
    try { const { data } = await workflowsApi.list(); setWorkflows(data.data ?? []); } catch {}
  };

  const onConnect = useCallback((params: Connection) => setEdges(eds => addEdge({ ...params, animated: true }, eds)), [setEdges]);

  const addNode = (tpl: typeof NODE_TYPES_LIST[0]) => {
    const id = crypto.randomUUID();
    const newNode: Node = {
      id, type: 'default',
      position: { x: 100 + Math.random() * 300, y: 100 + Math.random() * 200 },
      data: { label: `${tpl.icon} ${tpl.label}`, style: { background: COLOR_MAP[tpl.type] ?? '#444', color: '#fff', borderRadius: 8, padding: '8px 12px', fontSize: 12 } },
    };
    setNodes(nds => [...nds, newNode]);
  };

  const saveWorkflow = async () => {
    setSaving(true);
    try {
      const definition = { nodes, edges };
      if (activeWorkflow) {
        await workflowsApi.update(activeWorkflow.id, { definition });
      } else {
        const { data } = await workflowsApi.create({ name: 'New Workflow', definition, triggerType: 'manual', status: 'draft' });
        setActiveWorkflow(data.data);
      }
      loadWorkflows();
    } catch {}
    setSaving(false);
  };

  const runWorkflow = async () => {
    if (!activeWorkflow) return;
    setRunning(true);
    try { await workflowsApi.execute(activeWorkflow.id); alert('Workflow triggered!'); } catch {}
    setRunning(false);
  };

  return (
    <div className="flex h-full">
      {/* Left panel: node library + workflow list */}
      <div className="w-60 border-r border-border flex flex-col shrink-0 bg-card">
        <div className="p-3 border-b border-border">
          <h2 className="text-sm font-semibold mb-2">My Workflows</h2>
          <button onClick={() => { setActiveWorkflow(null); setNodes(defaultInitNodes); setEdges(defaultInitEdges); }}
            className="w-full px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors">
            + New Workflow
          </button>
        </div>
        <div className="border-b border-border overflow-y-auto max-h-36 p-2 space-y-1">
          {workflows.map(wf => (
            <button key={wf.id} onClick={() => { setActiveWorkflow(wf); setNodes(wf.definition?.nodes ?? []); setEdges(wf.definition?.edges ?? []); }}
              className={`w-full text-left px-2 py-1.5 rounded text-xs truncate transition-colors ${activeWorkflow?.id === wf.id ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              ⚡ {wf.name}
            </button>
          ))}
        </div>
        <div className="p-3 flex-1 overflow-y-auto">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Add Nodes</h3>
          <div className="space-y-1">
            {NODE_TYPES_LIST.map((t, i) => (
              <button key={i} onClick={() => addNode(t)} className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
                <span>{t.icon}</span>
                <span className="truncate">{t.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Canvas */}
      <div className="flex-1 flex flex-col min-w-0">
        <div className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card">
          <span className="text-sm font-medium">{activeWorkflow?.name ?? 'Untitled Workflow'}</span>
          <div className="flex-1" />
          <span className={`text-xs px-2 py-1 rounded-full ${activeWorkflow?.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-muted text-muted-foreground'}`}>
            {activeWorkflow?.status ?? 'draft'}
          </span>
          <button onClick={runWorkflow} disabled={running || !activeWorkflow}
            className="px-3 py-1.5 border border-border rounded-lg text-xs hover:bg-accent disabled:opacity-40 transition-colors">
            {running ? '⏳ Running...' : '▶ Test Run'}
          </button>
          <button onClick={saveWorkflow} disabled={saving}
            className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium disabled:opacity-50 transition-colors">
            {saving ? 'Saving...' : '💾 Save'}
          </button>
        </div>
        <div className="flex-1">
          <ReactFlow
            nodes={nodes} edges={edges}
            onNodesChange={onNodesChange} onEdgesChange={onEdgesChange} onConnect={onConnect}
            fitView
          >
            <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
            <Controls />
            <MiniMap />
          </ReactFlow>
        </div>
      </div>
    </div>
  );
}
