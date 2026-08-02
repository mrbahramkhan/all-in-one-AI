'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

interface AnalyticsData {
  totalUsers: number;
  paidUsers: number;
  totalRequests: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<any[]>([]);

  useEffect(() => {
    adminApi.getAnalytics().then(r => setAnalytics(r.data.data)).catch(() => {});
    adminApi.getUsers().then(r => setUsers(r.data.data ?? [])).catch(() => {});
  }, []);

  const statItems = analytics ? [
    { label: 'Users', value: analytics.totalUsers, icon: '[Users]', color: 'text-blue-500' },
    { label: 'Paid', value: analytics.paidUsers, icon: '[Paid]', color: 'text-green-500' },
    { label: 'Requests', value: analytics.totalRequests, icon: '[Requests]', color: 'text-violet-500' },
    { label: 'Revenue', value: '$' + Number(analytics.totalRevenue || 0).toFixed(2), icon: '[Revenue]', color: 'text-orange-500' },
  ] : [];

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {statItems.map((stat) => (
            <div key={stat.label} className="p-4 rounded-xl border border-border bg-card">
              <div className={`text-lg font-semibold ${stat.color}`}>{stat.icon}</div>
              <div className="text-xl font-bold mt-2">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="rounded-xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              {['Name', 'Email', 'Plan', 'Credits', 'Status'].map((header) => (
                <th key={header} className="px-4 py-3 text-left font-medium text-muted-foreground">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((user: any) => (
              <tr key={user.id} className="hover:bg-muted/30">
                <td className="px-4 py-3 font-medium">{user.name || '�'}</td>
                <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                <td className="px-4 py-3 capitalize">{user.plan}</td>
                <td className="px-4 py-3">{Number(user.credits || 0).toLocaleString()}</td>
                <td className="px-4 py-3">
                  <span
                    className={
                      'px-2 py-0.5 rounded-full text-xs ' +
                      (user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400')
                    }
                  >
                    {user.isActive ? 'Active' : 'Suspended'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
