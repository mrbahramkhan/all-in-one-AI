'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { authApi } from '@/lib/api';

export function DashboardLayoutClient({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        setLoading(true);
        const { data } = await authApi.me();
        setUser(data.data);
      } catch {
        router.push('/login');
      } finally {
        setLoading(false);
      }
    };
    if (!user) check();
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  const links = [
    { href: '/chat', icon: '💬', label: 'Chat' },
    { href: '/agents', icon: '🤖', label: 'Agents' },
    { href: '/workflows', icon: '⚡', label: 'Workflows' },
    { href: '/knowledge', icon: '📚', label: 'Knowledge' },
    { href: '/studio', icon: '🎨', label: 'Studio' },
    { href: '/marketplace', icon: '🛒', label: 'Marketplace' },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <aside
        style={{ width: sidebarOpen ? '224px' : '56px' }}
        className="fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-40"
      >
        <div className="flex items-center gap-3 px-3 py-4 border-b border-border">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">
            AI
          </div>
          {sidebarOpen && <span className="font-bold text-sm truncate">All-In-One AI</span>}
        </div>
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {links.map(item => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </a>
          ))}
        </nav>
        <div className="border-t border-border p-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-xs text-white font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.plan}</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      <div
        className="flex-1 flex flex-col min-w-0 transition-all duration-300"
        style={{ marginLeft: sidebarOpen ? '224px' : '56px' }}
      >
        <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-4 sticky top-0 z-30">
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div className="flex-1" />
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-xs">
            <span className="text-violet-500">⚡</span>
            <span className="font-medium">{Number(user.credits || 0).toLocaleString()}</span>
            <span className="text-muted-foreground">credits</span>
          </div>
          <button
            onClick={() => {
              authApi.logout().catch(() => {});
              useAuthStore.getState().logout();
              window.location.href = '/login';
            }}
            className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors"
          >
            <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-xs text-white font-bold">
              {user.name?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="hidden md:block text-xs text-muted-foreground">{user.name}</span>
          </button>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}