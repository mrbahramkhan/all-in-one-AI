'use client';
import { useState, useEffect } from 'react';
import { agentsApi } from '@/lib/api';
export function AgentsClient() {
  const [agents,setAgents]=useState<any[]>([]);
  const [form,setForm]=useState({name:'',systemPrompt:'',model:'gpt-4o',description:''});
  const [show,setShow]=useState(false);
  useEffect(()=>{agentsApi.list().then(r=>setAgents(r.data.data||[])).catch(()=>{});},[]);
  const create=async()=>{try{await agentsApi.create(form);setShow(false);setForm({name:'',systemPrompt:'',model:'gpt-4o',description:''});agentsApi.list().then(r=>setAgents(r.data.data||[])).catch(()=>{});}catch{}};
  return(
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6"><div><h1 className="text-2xl font-bold">🤖 AI Agents</h1><p className="text-muted-foreground text-sm mt-1">Build custom AI assistants.</p></div><button onClick={()=>setShow(true)} className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium">+ Create Agent</button></div>
      <div className="grid md:grid-cols-3 gap-4">
        {agents.map((a:any)=><div key={a.id} className="p-4 rounded-xl border border-border bg-card hover:border-violet-500/50 transition-colors"><div className="flex items-center gap-3 mb-3"><div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white font-bold">{a.name?.[0]||'A'}</div><div><p className="font-semibold text-sm">{a.name}</p><p className="text-xs text-muted-foreground">{a.model}</p></div></div>{a.description&&<p className="text-xs text-muted-foreground mb-3 line-clamp-2">{a.description}</p>}<button className="w-full py-1.5 text-xs bg-violet-600 hover:bg-violet-700 text-white rounded-lg">Chat</button></div>)}
        {agents.length===0&&<div className="col-span-3 text-center py-16 text-muted-foreground"><div className="text-4xl mb-3">🤖</div><p className="font-medium">No agents yet</p></div>}
      </div>
      {show&&<div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"><div className="bg-card border border-border rounded-2xl w-full max-w-md p-6 space-y-4"><h2 className="font-bold text-lg">Create Agent</h2><input value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} placeholder="Name *" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-violet-500"/><textarea value={form.systemPrompt} onChange={e=>setForm(f=>({...f,systemPrompt:e.target.value}))} rows={4} placeholder="System prompt..." className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm resize-none focus:outline-none focus:ring-1 focus:ring-violet-500"/><div className="flex gap-2"><button onClick={()=>setShow(false)} className="flex-1 py-2 border border-border rounded-lg text-sm">Cancel</button><button onClick={create} disabled={!form.name||!form.systemPrompt} className="flex-1 py-2 bg-violet-600 text-white rounded-lg text-sm disabled:opacity-50">Create</button></div></div></div>}
    </div>
  );
}