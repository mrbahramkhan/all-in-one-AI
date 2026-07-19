'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authApi } from '@/lib/api';
import { useAuthStore } from '@/stores/auth.store';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { setUser, setAccessToken } = useAuthStore();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError('');
    try {
      const { data } = await authApi.login({ email, password });
      setAccessToken(data.data.accessToken);
      setUser(data.data.user);
      router.push('/chat');
    } catch (err: any) {
      setError(err.response?.data?.error?.message ?? 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0A0F2E] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-white">AI</div>
          <span className="font-bold text-xl text-white">All-In-One AI</span>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white/50 text-sm mb-6">Sign in to your account</p>

          {error && (
            <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                placeholder="you@example.com" />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500 focus:border-violet-500"
                placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white rounded-xl font-semibold disabled:opacity-50 transition-opacity">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10" /></div>
            <div className="relative flex justify-center"><span className="px-2 bg-transparent text-white/30 text-xs">or continue with</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[{ label: 'Google', icon: 'G' }, { label: 'GitHub', icon: '⌥' }].map(p => (
              <a key={p.label} href={`${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/${p.label.toLowerCase()}`}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-white/70 text-sm transition-colors">
                <span className="font-bold">{p.icon}</span> {p.label}
              </a>
            ))}
          </div>

          <p className="text-center text-sm text-white/40 mt-6">
            Don't have an account?{' '}
            <Link href="/register" className="text-violet-400 hover:text-violet-300 transition-colors">Sign up free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
