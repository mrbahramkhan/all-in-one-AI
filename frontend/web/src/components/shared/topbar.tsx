'use client';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';
import { authApi } from '@/lib/api';
import { useRouter } from 'next/navigation';

export function TopBar({ title }: { title?: string }) {
  const { toggleSidebar } = useUIStore();
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const handleLogout = async () => { await authApi.logout().catch(()=>{}); logout(); router.push('/login'); };
  return (
    <header className="h-14 border-b border-border bg-background/95 backdrop-blur flex items-center px-4 gap-4 sticky top-0 z-30">
      <button onClick={toggleSidebar} className="p-1.5 rounded-md hover:bg-accent text-muted-foreground hover:text-foreground transition-colors">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
      {title && <h1 className="text-sm font-semibold">{title}</h1>}
      <div className="flex-1"/>
      {user && (
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent text-xs">
          <span className="text-violet-500">⚡</span>
          <span className="font-medium">{Number(user.credits).toLocaleString()}</span>
          <span className="text-muted-foreground">credits</span>
        </div>
      )}
      <button onClick={handleLogout} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors text-sm text-muted-foreground hover:text-foreground">
        <div className="w-6 h-6 rounded-full bg-violet-500 flex items-center justify-center text-xs text-white font-bold">
          {user?.name?.[0]?.toUpperCase() ?? 'U'}
        </div>
        <span className="hidden md:block text-xs">{user?.name}</span>
      </button>
    </header>
  );
}