'use client';
import { useState } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { billingApi } from '@/lib/api';

const PLANS = [
  { id: 'free',     name: 'Free',     price: '$0',   credits: '50K tokens/mo',  features: ['5 models','50 convos','1 agent'] },
  { id: 'starter',  name: 'Starter',  price: '$19',  credits: '500K tokens/mo', features: ['10 models','Unlimited convos','5 agents','500MB KB'] },
  { id: 'pro',      name: 'Pro',      price: '$49',  credits: '2M tokens/mo',   features: ['All 15+ models','Compare mode','20 agents','5GB KB','50 workflows'] },
  { id: 'business', name: 'Business', price: '$149', credits: '10M tokens/mo',  features: ['Everything in Pro','Team seats','SSO','99.95% SLA'] },
];

export default function SettingsPage() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'profile'|'billing'|'api'|'security'>('profile');
  const [apiKeys] = useState([{ id: '1', name: 'Production Key', prefix: 'sk-aio-prod', lastUsed: '2h ago' }]);

  const handleUpgrade = async (planId: string) => {
    try {
      const { data } = await billingApi.subscribe(planId);
      if (data.data?.url) window.location.href = data.data.url;
    } catch { alert('Failed to start checkout. Please try again.'); }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">⚙️ Settings</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage your account, billing, and API access.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border border-border rounded-xl p-1 w-fit">
        {(['profile','billing','api','security'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors capitalize ${tab === t ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            {t === 'api' ? 'API Keys' : t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="space-y-6">
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-semibold">Profile Information</h3>
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-2xl font-bold text-white">
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <button className="px-3 py-1.5 border border-border rounded-lg text-sm hover:bg-accent transition-colors">Change Photo</button>
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                { label: 'Full Name', value: user?.name, type: 'text' },
                { label: 'Email', value: user?.email, type: 'email' },
              ].map(f => (
                <div key={f.label}>
                  <label className="text-sm font-medium mb-1.5 block">{f.label}</label>
                  <input type={f.type} defaultValue={f.value ?? ''} className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-violet-500" />
                </div>
              ))}
            </div>
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">Save Changes</button>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-sm">Current Plan</h3>
                <p className="text-xs text-muted-foreground mt-0.5 capitalize">{user?.plan} — {user?.credits?.toLocaleString()} credits remaining</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${user?.plan === 'pro' ? 'bg-violet-500/20 text-violet-400' : user?.plan === 'free' ? 'bg-muted text-muted-foreground' : 'bg-blue-500/20 text-blue-400'}`}>
                {user?.plan}
              </span>
            </div>
          </div>
        </div>
      )}

      {tab === 'billing' && (
        <div className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            {PLANS.map(plan => (
              <div key={plan.id} className={`p-5 rounded-xl border bg-card ${user?.plan === plan.id ? 'border-violet-500 ring-1 ring-violet-500' : 'border-border'}`}>
                {user?.plan === plan.id && <div className="text-xs font-bold text-violet-400 mb-2 uppercase tracking-wider">Current Plan</div>}
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-2xl font-bold">{plan.price}</span>
                  {plan.price !== '$0' && <span className="text-muted-foreground text-sm">/mo</span>}
                </div>
                <div className="font-semibold mb-1">{plan.name}</div>
                <div className="text-xs text-muted-foreground mb-3">{plan.credits}</div>
                <ul className="space-y-1.5 mb-4">
                  {plan.features.map(f => (
                    <li key={f} className="text-xs flex items-center gap-2 text-muted-foreground">
                      <span className="text-green-400">✓</span> {f}
                    </li>
                  ))}
                </ul>
                <button onClick={() => handleUpgrade(plan.id)} disabled={user?.plan === plan.id}
                  className={`w-full py-2 rounded-lg text-sm font-medium transition-colors ${user?.plan === plan.id ? 'bg-muted text-muted-foreground cursor-default' : 'bg-violet-600 hover:bg-violet-700 text-white'}`}>
                  {user?.plan === plan.id ? 'Current Plan' : `Upgrade to ${plan.name}`}
                </button>
              </div>
            ))}
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-semibold text-sm mb-3">Buy Extra Credits</h3>
            <div className="flex gap-3 flex-wrap">
              {[{ credits: 1000, price: '$5' }, { credits: 5000, price: '$20' }, { credits: 10000, price: '$35' }].map(c => (
                <button key={c.credits} onClick={() => billingApi.topup(c.credits)} className="px-4 py-2 border border-border rounded-lg text-sm hover:bg-accent transition-colors">
                  {c.credits.toLocaleString()} credits — {c.price}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'api' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl border border-border bg-card">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-sm">API Keys</h3>
              <button className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-medium transition-colors">+ Generate New Key</button>
            </div>
            <div className="space-y-3">
              {apiKeys.map(key => (
                <div key={key.id} className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                  <div className="flex-1">
                    <div className="text-sm font-medium">{key.name}</div>
                    <div className="text-xs text-muted-foreground font-mono mt-0.5">{key.prefix}••••••••••••</div>
                  </div>
                  <div className="text-xs text-muted-foreground">Last used: {key.lastUsed}</div>
                  <button className="text-xs text-destructive hover:text-destructive/80 transition-colors">Revoke</button>
                </div>
              ))}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card">
            <h3 className="font-semibold text-sm mb-2">Base URL</h3>
            <code className="text-xs text-violet-400 bg-accent px-3 py-2 rounded-lg block">{process.env.NEXT_PUBLIC_API_URL}/api/v1</code>
            <p className="text-xs text-muted-foreground mt-2">Include your API key in the Authorization header: <code className="text-violet-400">Bearer sk-aio-...</code></p>
          </div>
        </div>
      )}

      {tab === 'security' && (
        <div className="space-y-4">
          <div className="p-6 rounded-xl border border-border bg-card space-y-4">
            <h3 className="font-semibold">Change Password</h3>
            {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
              <div key={l}>
                <label className="text-sm font-medium mb-1.5 block">{l}</label>
                <input type="password" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-1 focus:ring-violet-500" />
              </div>
            ))}
            <button className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-sm font-medium transition-colors">Update Password</button>
          </div>
          <div className="p-4 rounded-xl border border-border bg-card flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-sm">Two-Factor Authentication</h3>
              <p className="text-xs text-muted-foreground mt-0.5">{user?.mfaEnabled ? 'Enabled — using authenticator app' : 'Not enabled'}</p>
            </div>
            <button className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${user?.mfaEnabled ? 'border border-destructive text-destructive hover:bg-destructive/10' : 'bg-green-600 hover:bg-green-700 text-white'}`}>
              {user?.mfaEnabled ? 'Disable MFA' : 'Enable MFA'}
            </button>
          </div>
          <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5">
            <h3 className="font-semibold text-sm text-destructive mb-1">Danger Zone</h3>
            <p className="text-xs text-muted-foreground mb-3">Permanently delete your account and all data.</p>
            <button className="px-4 py-2 border border-destructive text-destructive rounded-lg text-sm hover:bg-destructive hover:text-white transition-colors">Delete Account</button>
          </div>
        </div>
      )}
    </div>
  );
}
