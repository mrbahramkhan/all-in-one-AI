'use client';
import { useAuthStore } from '@/stores/auth.store';
import Link from 'next/link';

const QUICK_ACTIONS = [
  { href: '/chat',      icon: '💬', label: 'New Chat',       desc: 'Start a conversation' },
  { href: '/agents',    icon: '🤖', label: 'Create Agent',   desc: 'Build a custom AI agent' },
  { href: '/workflows', icon: '⚡', label: 'New Workflow',   desc: 'Automate your tasks' },
  { href: '/studio',    icon: '🎨', label: 'Create Content', desc: 'Generate text, images, video' },
];

const STATS = [
  { label: 'Tokens Used', value: '2.4M', icon: '⚡', color: 'text-violet-500' },
  { label: 'Cost This Month', value: '$12.40', icon: '💰', color: 'text-green-500' },
  { label: 'Conversations', value: '142', icon: '💬', color: 'text-blue-500' },
  { label: 'Active Agents', value: '8', icon: '🤖', color: 'text-orange-500' },
];

export default function DashboardPage() {
  const { user } = useAuthStore();

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold">👋 Welcome back, {user?.name?.split(' ')[0]}</h1>
        <p className="text-muted-foreground text-sm mt-1">Here's what's happening with your AI workspace.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {STATS.map(s => (
          <div key={s.label} className="p-4 rounded-xl border border-border bg-card">
            <div className={`text-2xl font-bold ${s.color}`}>{s.icon}</div>
            <div className="text-xl font-bold mt-2">{s.value}</div>
            <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {QUICK_ACTIONS.map(a => (
            <Link key={a.href} href={a.href} className="p-4 rounded-xl border border-border bg-card hover:bg-accent transition-colors group">
              <div className="text-2xl mb-2">{a.icon}</div>
              <div className="font-medium text-sm group-hover:text-violet-500 transition-colors">{a.label}</div>
              <div className="text-xs text-muted-foreground mt-1">{a.desc}</div>
            </Link>
          ))}
        </div>
      </div>

      {/* Plan status */}
      <div className="p-4 rounded-xl border border-violet-500/30 bg-violet-500/5">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold capitalize">{user?.plan} Plan</div>
            <div className="text-xs text-muted-foreground mt-1">
              {user?.credits?.toLocaleString()} credits remaining
            </div>
          </div>
          {user?.plan === 'free' && (
            <Link href="/settings/billing" className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-xs font-medium text-white transition-colors">
              Upgrade to Pro
            </Link>
          )}
        </div>
        {/* Usage bar */}
        <div className="mt-3 h-1.5 bg-border rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full" style={{ width: '34%' }} />
        </div>
        <div className="text-xs text-muted-foreground mt-1">34% of monthly credits used</div>
      </div>
    </div>
  );
}
