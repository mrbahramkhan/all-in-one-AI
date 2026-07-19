'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/shared/sidebar';
import { TopBar } from '@/components/shared/topbar';
import { useAuthStore } from '@/stores/auth.store';
import { useUIStore } from '@/stores/ui.store';
import { authApi } from '@/lib/api';
import { cn } from '@/lib/utils';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, setUser, setLoading } = useAuthStore();
  const { sidebarOpen } = useUIStore();
  const router = useRouter();

  useEffect(() => {
    const checkAuth = async () => {
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
    if (!user) checkAuth();
  }, []);

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-5 h-5 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      <Sidebar />
      <div className={cn(
        'flex-1 flex flex-col min-w-0 transition-all duration-300',
        sidebarOpen ? 'ml-56' : 'ml-14'
      )}>
        <TopBar />
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
