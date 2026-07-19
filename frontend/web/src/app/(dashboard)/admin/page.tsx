'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [analytics, setAnalytics] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [aiUsage, setAiUsage] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'ai'>('overview');

  useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'superadmin') {
      router.push('/chat');
      return;
    }
    loadData();
  }, [user]);

  const loadData = async () => {
    const [analyticsRes, usersRes, aiRes] = await Promise.allSettled([
      adminApi.getAnalytics(),
      adminApi.getUsers(),
      adminApi.getAiUsage(),
    ]);
    if (analyticsRes.status === 'fulfilled') setAnalytics(analyticsRes.value.data.data);
    if (usersRes.status === 'fulfilled') setUsers(usersRes.value.data.data ?? []);
    if (aiRes.status === 'fulfilled') setAiUsage(aiRes.value.data.data ?? []);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">👑 Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">Platform management and analytics</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-border">
        {(['overview', 'users', 'ai'] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 text-sm font-medium capitalize border-b-2 transition-colors ${activeTab === tab ? 'border-violet-500 text-violet-500' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
            {tab === 'ai' ? 'AI Usage' : tab}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && analytics && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Total Users', value: analytics.totalUsers?.toLocaleString(), icon: '👥', color: 'text-blue-500' },
              { label: 'Paid Users', value: analytics.paidUsers?.toLocaleString(), icon: '💳', color: 'text-green-500' },
              { label: 'AI Requests', value: analytics.totalRequests?.toLocaleString(), icon: '⚡', color: 'text-violet-500' },
              { label: 'Total Revenue', value: `$${Number(analytics.totalRevenue ?? 0).toFixed(2)}`, icon: '💰', color: 'text-orange-500' },
            ].map(stat => (
              <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
                <div className={`text-2xl font-bold ${stat.color}`}>{stat.icon}</div>
                <div className="text-2xl font-bold mt-2">{stat.value}</div>
                <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Name', 'Email', 'Plan', 'Credits', 'Spend', 'Role', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map(u => (
                <tr key={u.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{u.name ?? '—'}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.plan === 'pro' ? 'bg-violet-500/20 text-violet-400' : u.plan === 'business' ? 'bg-blue-500/20 text-blue-400' : 'bg-muted text-muted-foreground'}`}>
                      {u.plan}
                    </span>
                  </td>
                  <td className="px-4 py-3">{Number(u.credits ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">${Number(u.monthlySpend ?? 0).toFixed(4)}</td>
                  <td className="px-4 py-3 capitalize">{u.role}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${u.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {u.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => adminApi.updateUser(u.id, { isActive: !u.isActive }).then(loadData)}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                      {u.isActive ? 'Suspend' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No users found</div>}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="rounded-xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Model', 'Provider', 'Requests', 'Tokens In', 'Tokens Out', 'Cost'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {aiUsage.map((row: any, i: number) => (
                <tr key={i} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{row.model}</td>
                  <td className="px-4 py-3 text-muted-foreground capitalize">{row.provider}</td>
                  <td className="px-4 py-3">{row._count?.id?.toLocaleString()}</td>
                  <td className="px-4 py-3">{Number(row._sum?.tokensInput ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">{Number(row._sum?.tokensOutput ?? 0).toLocaleString()}</td>
                  <td className="px-4 py-3">${Number(row._sum?.costUsd ?? 0).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {aiUsage.length === 0 && <div className="text-center py-8 text-muted-foreground text-sm">No AI usage data yet</div>}
        </div>
      )}
    </div>
  );
}
