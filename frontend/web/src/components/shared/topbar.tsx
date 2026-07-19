'use client';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

interface TopBarProps { title?: string; }

export function TopBar({ title }: TopBarProps) {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = async () => {
    await authApi.logout().catch(() => {});
    logout();
    router.push('/login');
  };

  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-4 sticky top-0 z-30">
      <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {title && <h1 className="text-sm font-semibold">{title}</h1>}

      <div className="flex-1" />

      {/* Credits */}
      {user && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-xs">
          <span className="text-violet-500">⚡</span>
          <span className="font-medium">{user.credits.toLocaleString()}</span>
          <span className="text-muted-foreground">credits</span>
        </div>
      )}

      {/* Notifications */}
      <button className="relative p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
      </button>

      {/* User menu */}
      <button onClick={handleLogout} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
        <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-xs text-white font-bold">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <span className="hidden md:block text-xs">{user?.name}</span>
      </button>
    </header>
  );
}
