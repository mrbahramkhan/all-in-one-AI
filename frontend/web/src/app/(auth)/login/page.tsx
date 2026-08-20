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
  const { setUser, setTokens } = useAuthStore();
  const router = useRouter();
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      const { data } = await authApi.login({ email, password });
      setTokens(data.data.accessToken, data.data.refreshToken);
      setUser(data.data.user);
      router.push('/chat');
    } catch (err: any) { setError(err.response?.data?.error?.message ?? 'Login failed'); }
    setLoading(false);
  };
  return (
    <div className="min-h-screen bg-[#0A0F2E] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center font-bold text-white text-lg">AI</div>
          <span className="font-bold text-xl text-white">All-In-One AI</span>
        </div>
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">
          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-white/50 text-sm mb-6">Sign in to your account</p>
          {error && <div className="mb-4 px-3 py-2 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">{error}</div>}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm text-white/70 mb-1.5 block">Email</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="you@example.com" className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <div>
              <label className="text-sm text-white/70 mb-1.5 block">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder:text-white/30 text-sm focus:outline-none focus:ring-1 focus:ring-violet-500" />
            </div>
            <button type="submit" disabled={loading} className="w-full py-3 bg-gradient-to-r from-violet-600 to-cyan-600 hover:opacity-90 text-white rounded-xl font-semibold disabled:opacity-50">
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="mt-4 p-3 rounded-lg bg-white/5 text-xs text-white/50">
            <p className="font-medium text-white/70 mb-1">Demo accounts:</p>
            <p>demo@allinone.ai / Demo@123456</p>
            <p>admin@allinone.ai / Admin@123456</p>
          </div>
          <p className="text-center text-sm text-white/40 mt-4">No account? <Link href="/register" className="text-violet-400 hover:text-violet-300">Sign up free</Link></p>
        </div>
      </div>
    </div>
  );
}