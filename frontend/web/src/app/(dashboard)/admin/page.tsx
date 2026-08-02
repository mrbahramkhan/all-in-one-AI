'use client';
import { useState, useEffect } from 'react';
import { adminApi } from '@/lib/api';

interface BugReport {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'fixed' | 'verified';
  createdAt: string;
}

interface SEOSettings {
  siteTitle: string;
  metaDescription: string;
  keywords: string[];
  twitterHandle: string;
}

interface AnalyticsData {
  totalUsers: number;
  paidUsers: number;
  totalRequests: number;
  totalRevenue: number;
}

export default function AdminPage() {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [seoSettings, setSeoSettings] = useState<SEOSettings>({
    siteTitle: 'All-In-One AI',
    metaDescription: 'Universal AI platform - Chat, Agents, Workflows',
    keywords: ['ai', 'chatbot', 'automation'],
    twitterHandle: '@allinoneai',
  });
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadAdminData();
    const interval = setInterval(runBugDetection, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadAdminData = async () => {
    try {
      const analytics = await adminApi.getAnalytics();
      setAnalytics(analytics.data?.data);
      const usersData = await adminApi.getUsers();
      setUsers(usersData.data?.data ?? []);
      await runBugDetection();
    } catch (error) {
      console.error('Failed to load admin data:', error);
    }
  };

  const runBugDetection = async () => {
    try {
      const response = await fetch('/api/health');
      if (!response.ok) {
        addBug('Health Check Failed', 'high');
      }
      const health = await response.json();
      if (health.frontend?.status !== 'ok') addBug('Frontend Issue Detected', 'medium');
    } catch (error) {
      addBug('System Health Check Error', 'critical');
    }
  };

  const addBug = (title: string, severity: BugReport['severity']) => {
    setBugs((prev) => {
      const exists = prev.some((b) => b.title === title && b.status === 'open');
      if (exists) return prev;
      return [
        {
          id: Date.now().toString(),
          title,
          severity,
          status: 'open',
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ];
    });
  };

  const fixBug = (bugId: string) => {
    setBugs((prev) =>
      prev.map((b) => (b.id === bugId ? { ...b, status: 'fixed' } : b))
    );
  };

  const generateSitemap = () => {
    const routes = ['/login', '/register', '/chat', '/agents', '/workflows', '/studio', '/admin'];
    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${routes.map((r) => `  <url><loc>https://allinone.ai${r}</loc><lastmod>${new Date().toISOString().split('T')[0]}</lastmod></url>`).join('\n')}
</urlset>`;
    const blob = new Blob([sitemap], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    a.click();
  };

  const generateRobotsTxt = () => {
    const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Crawl-delay: 1

Sitemap: https://allinone.ai/sitemap.xml`;
    const blob = new Blob([robots], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'robots.txt';
    a.click();
  };

  const updateSEO = () => {
    localStorage.setItem('seo-settings', JSON.stringify(seoSettings));
    alert('SEO settings updated');
  };

  const statItems = analytics
    ? [
        { label: 'Users', value: analytics.totalUsers, color: 'text-blue-500' },
        { label: 'Paid', value: analytics.paidUsers, color: 'text-green-500' },
        { label: 'Requests', value: analytics.totalRequests, color: 'text-violet-500' },
        { label: 'Revenue', value: '$' + Number(analytics.totalRevenue || 0).toFixed(2), color: 'text-orange-500' },
      ]
    : [];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-border">
        {['overview', 'bugs', 'seo', 'users'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium text-sm transition-colors ${
              activeTab === tab
                ? 'text-violet-500 border-b-2 border-violet-500'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Overview */}
      {activeTab === 'overview' && analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {statItems.map((stat) => (
            <div key={stat.label} className="bg-card p-4 rounded-lg border">
              <p className="text-muted-foreground text-xs">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Bugs */}
      {activeTab === 'bugs' && (
        <div className="space-y-4">
          <button
            onClick={runBugDetection}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium"
          >
            Run Detection Now
          </button>
          <div className="space-y-2">
            {bugs.length === 0 ? (
              <p className="text-muted-foreground">No bugs detected</p>
            ) : (
              bugs.map((bug) => (
                <div key={bug.id} className="bg-card p-4 rounded-lg border flex justify-between items-start">
                  <div>
                    <p className="font-medium">{bug.title}</p>
                    <span
                      className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                        bug.severity === 'critical'
                          ? 'bg-red-500/20 text-red-500'
                          : bug.severity === 'high'
                            ? 'bg-orange-500/20 text-orange-500'
                            : 'bg-yellow-500/20 text-yellow-500'
                      }`}
                    >
                      {bug.severity}
                    </span>
                  </div>
                  <button
                    onClick={() => fixBug(bug.id)}
                    disabled={bug.status !== 'open'}
                    className="px-3 py-1 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 rounded text-sm"
                  >
                    {bug.status === 'fixed' ? 'Fixed' : 'Fix'}
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* SEO */}
      {activeTab === 'seo' && (
        <div className="space-y-4">
          <div className="bg-card p-4 rounded-lg border space-y-4">
            <div>
              <label className="text-sm font-medium">Site Title</label>
              <input
                type="text"
                value={seoSettings.siteTitle}
                onChange={(e) => setSeoSettings({ ...seoSettings, siteTitle: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Meta Description</label>
              <textarea
                value={seoSettings.metaDescription}
                onChange={(e) => setSeoSettings({ ...seoSettings, metaDescription: e.target.value })}
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm min-h-16"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Keywords (comma separated)</label>
              <input
                type="text"
                value={seoSettings.keywords.join(', ')}
                onChange={(e) =>
                  setSeoSettings({
                    ...seoSettings,
                    keywords: e.target.value.split(',').map((k) => k.trim()),
                  })
                }
                className="w-full mt-1 px-3 py-2 bg-background border border-border rounded-lg text-sm"
              />
            </div>
            <button
              onClick={updateSEO}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-700 rounded-lg text-sm font-medium"
            >
              Update SEO
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={generateSitemap}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
            >
              Download Sitemap
            </button>
            <button
              onClick={generateRobotsTxt}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-sm font-medium"
            >
              Download Robots.txt
            </button>
          </div>
        </div>
      )}

      {/* Users */}
      {activeTab === 'users' && (
        <div className="rounded-lg border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                {['Name', 'Email', 'Plan', 'Credits', 'Status'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {users.map((user: any) => (
                <tr key={user.id} className="hover:bg-muted/30">
                  <td className="px-4 py-3 font-medium">{user.name}</td>
                  <td className="px-4 py-3 text-muted-foreground">{user.email}</td>
                  <td className="px-4 py-3">{user.plan}</td>
                  <td className="px-4 py-3">{Number(user.credits || 0).toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-xs ${
                        user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}
                    >
                      {user.isActive ? 'Active' : 'Suspended'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
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
