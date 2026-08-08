'use client';
import { useAuthStore } from '@/stores/auth.store';
import Link from 'next/link';
const STATS=[{l:'Tokens',v:'2.4M',i:'⚡',c:'text-violet-500'},{l:'Cost',v:'$12.40',i:'💰',c:'text-green-500'},{l:'Chats',v:'142',i:'💬',c:'text-blue-500'},{l:'Agents',v:'8',i:'🤖',c:'text-orange-500'}];
const QUICK=[{href:'/chat',icon:'💬',label:'New Chat',desc:'Start AI conversation'},{href:'/agents',icon:'🤖',label:'Agents',desc:'Build AI agents'},{href:'/workflows',icon:'⚡',label:'Workflows',desc:'Automate tasks'},{href:'/studio',icon:'🎨',label:'Studio',desc:'Generate content'}];
export function DashboardHome() {
  const { user } = useAuthStore();
  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      <div><h1 className="text-2xl font-bold">👋 Welcome back, {user?.name?.split(' ')[0]||'User'}</h1><p className="text-muted-foreground text-sm mt-1">Your AI workspace is ready.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s=><div key={s.l} className="p-4 rounded-xl border border-border bg-card"><div className={"text-2xl font-bold "+s.c}>{s.i}</div><div className="text-xl font-bold mt-2">{s.v}</div><div className="text-xs text-muted-foreground mt-1">{s.l}</div></div>)}
      </div>
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK.map(a=><Link key={a.href} href={a.href} className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors group"><div className="text-2xl mb-2">{a.icon}</div><div className="font-medium text-sm group-hover:text-violet-500">{a.label}</div><div className="text-xs text-muted-foreground mt-1">{a.desc}</div></Link>)}
        </div>
      </div>
      <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5">
        <div className="flex items-center justify-between">
          <div><div className="text-sm font-semibold capitalize">{user?.plan||'free'} Plan</div><div className="text-xs text-muted-foreground mt-1">{Number(user?.credits||0).toLocaleString()} credits remaining</div></div>
          {user?.plan==='free'&&<Link href="/settings" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-xs font-medium text-white">Upgrade</Link>}
        </div>
      </div>
    </div>
  );
}