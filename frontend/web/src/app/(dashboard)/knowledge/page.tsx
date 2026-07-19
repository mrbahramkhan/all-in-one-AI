'use client';
import { useState, useEffect } from 'react';
import { kbApi } from '@/lib/api';

export default function KnowledgePage() {
  const [kbs, setKbs] = useState<any[]>([]);
  const [activeKb, setActiveKb] = useState<any>(null);
  const [docs, setDocs] = useState<any[]>([]);
  const [query, setQuery] = useState('');
  const [answer, setAnswer] = useState('');
  const [searching, setSearching] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [newKbName, setNewKbName] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => { loadKbs(); }, []);
  useEffect(() => { if (activeKb) loadDocs(activeKb.id); }, [activeKb]);

  const loadKbs = async () => {
    try { const { data } = await kbApi.list(); setKbs(data.data ?? []); } catch {}
  };
  const loadDocs = async (id: string) => {
    try { const { data } = await kbApi.listDocs(id); setDocs(data.data ?? []); } catch {}
  };
  const createKb = async () => {
    try { await kbApi.create({ name: newKbName }); setNewKbName(''); setShowCreate(false); loadKbs(); } catch {}
  };
  const uploadFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!activeKb || !e.target.files?.[0]) return;
    setUploading(true);
    try { await kbApi.uploadDoc(activeKb.id, e.target.files[0]); loadDocs(activeKb.id); } catch {}
    setUploading(false);
  };
  const chatWithKb = async () => {
    if (!activeKb || !query) return;
    setSearching(true); setAnswer('');
    try { const { data } = await kbApi.chat(activeKb.id, query); setAnswer(data.data?.answer ?? 'No answer found.'); } catch {}
    setSearching(false);
  };

  return (
    <div className="flex h-full">
      {/* KB list */}
      <div className="w-60 border-r border-border flex flex-col shrink-0 bg-card">
        <div className="p-3 border-b border-border">
          <button onClick={() => setShowCreate(true)} className="w-full px-3 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors">
            + New Knowledge Base
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {kbs.map(kb => (
            <button key={kb.id} onClick={() => setActiveKb(kb)}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${activeKb?.id === kb.id ? 'bg-accent text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-accent/50'}`}>
              📚 <span className="truncate">{kb.name}</span>
              <div className="text-xs text-muted-foreground mt-0.5">{kb.docCount} docs</div>
            </button>
          ))}
        </div>
      </div>

      {/* Main area */}
      <div className="flex-1 flex flex-col min-w-0 p-6">
        {activeKb ? (
          <>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-bold">📚 {activeKb.name}</h2>
                <p className="text-muted-foreground text-sm">{docs.length} documents · {activeKb.vectorCount?.toLocaleString() ?? 0} vectors indexed</p>
              </div>
              <label className={`px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium cursor-pointer transition-colors ${uploading ? 'opacity-50' : ''}`}>
                {uploading ? 'Uploading...' : '+ Upload Document'}
                <input type="file" className="hidden" accept=".pdf,.docx,.txt,.md,.csv" onChange={uploadFile} disabled={uploading} />
              </label>
            </div>

            {/* Chat with KB */}
            <div className="bg-card border border-border rounded-xl p-4 mb-6">
              <h3 className="text-sm font-semibold mb-3">💬 Chat with Knowledge Base</h3>
              <div className="flex gap-2">
                <input value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && chatWithKb()}
                  placeholder="Ask a question about your documents..."
                  className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-violet-500" />
                <button onClick={chatWithKb} disabled={searching || !query}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm disabled:opacity-50 transition-colors">
                  {searching ? '...' : 'Ask'}
                </button>
              </div>
              {answer && (
                <div className="mt-3 p-3 bg-accent rounded-lg text-sm">
                  <p className="font-medium text-xs text-muted-foreground mb-1">Answer:</p>
                  <p>{answer}</p>
                </div>
              )}
            </div>

            {/* Documents */}
            <div>
              <h3 className="text-sm font-semibold mb-3">📄 Documents ({docs.length})</h3>
              <div className="space-y-2">
                {docs.map(doc => (
                  <div key={doc.id} className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
                    <span className="text-xl">{doc.fileType?.includes('pdf') ? '📄' : doc.fileType?.includes('doc') ? '📝' : '📃'}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{doc.filename}</p>
                      <p className="text-xs text-muted-foreground">{doc.chunksCount} chunks · {doc.status}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${doc.status === 'indexed' ? 'bg-green-500/20 text-green-400' : doc.status === 'processing' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-muted text-muted-foreground'}`}>
                      {doc.status}
                    </span>
                    <button onClick={() => kbApi.deleteDoc(activeKb.id, doc.id).then(() => loadDocs(activeKb.id))}
                      className="text-xs text-muted-foreground hover:text-destructive transition-colors">✕</button>
                  </div>
                ))}
                {docs.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm">No documents yet. Upload a PDF, DOCX, or TXT file to get started.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">📚</div>
              <h3 className="text-lg font-semibold mb-2">Select a Knowledge Base</h3>
              <p className="text-muted-foreground text-sm mb-4">Or create a new one to get started with RAG-powered document Q&A.</p>
              <button onClick={() => setShowCreate(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">
                Create Knowledge Base
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-card border border-border rounded-xl p-6 w-80">
            <h3 className="font-bold mb-4">New Knowledge Base</h3>
            <input value={newKbName} onChange={e => setNewKbName(e.target.value)} placeholder="Knowledge Base Name"
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm mb-4 focus:outline-none focus:ring-1 focus:ring-violet-500" />
            <div className="flex gap-2">
              <button onClick={() => setShowCreate(false)} className="flex-1 py-2 border border-border rounded-lg text-sm hover:bg-accent">Cancel</button>
              <button onClick={createKb} disabled={!newKbName} className="flex-1 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm disabled:opacity-50">Create</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
