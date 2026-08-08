'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
export function AdminClient() {
  const [analytics,setAnalytics]=useState<any>(null);
  const [users,setUsers]=useState<any[]>([]);
  useEffect(()=>{adminApi.getAnalytics().then(r=>setAnalytics(r.data.data)).catch(()=>{});adminApi.getUsers().then(r=>setUsers(r.data.data||[])).catch(()=>{});},[]);
  return(
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">👑 Admin Dashboard</h1>
      {analytics&&<div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">{[['Users',analytics.totalUsers,'👥','text-blue-500'],['Paid',analytics.paidUsers,'💳','text-green-500'],['Requests',analytics.totalRequests,'⚡','text-violet-500'],['Revenue','$'+Number(analytics.totalRevenue||0).toFixed(2),'💰','text-orange-500']].map(([l,v,i,c])=><div key={String(l)} className="p-4 rounded-xl border border-border bg-card"><div className={"text-2xl font-bold "+c}>{i}</div><div className="text-xl font-bold mt-2">{v}</div><div className="text-xs text-muted-foreground mt-1">{l}</div></div>)}</div>}
      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm"><thead className="bg-muted/50"><tr>{['Name','Email','Plan','Status'].map(h=><th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground text-xs">{h}</th>)}</tr></thead>
        <tbody className="divide-y divide-border">{users.map((u:any)=><tr key={u.id} className="hover:bg-muted/30"><td className="px-4 py-3 font-medium text-sm">{u.name||'—'}</td><td className="px-4 py-3 text-muted-foreground text-sm">{u.email}</td><td className="px-4 py-3 capitalize text-sm">{u.plan}</td><td className="px-4 py-3"><span className={"px-2 py-0.5 rounded-full text-xs "+(u.isActive?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400')}>{u.isActive?'Active':'Suspended'}</span></td></tr>)}</tbody></table>
      </div>
    </div>
  );
}