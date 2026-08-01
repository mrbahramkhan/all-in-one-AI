'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore } from '@/stores/ui.store';
import { useAuthStore } from '@/stores/auth.store';

const NAV=[{href:'/chat',icon:'💬',label:'Chat'},{href:'/agents',icon:'🤖',label:'Agents'},{href:'/workflows',icon:'⚡',label:'Workflows'},{href:'/knowledge',icon:'📚',label:'Knowledge'},{href:'/studio',icon:'🎨',label:'Studio'},{href:'/marketplace',icon:'🛒',label:'Marketplace'}];

function cn(...c: (string|boolean|undefined)[]) { return c.filter(Boolean).join(' '); }

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen } = useUIStore();
  const { user } = useAuthStore();
  return (
    <aside className={cn('fixed left-0 top-0 h-full bg-card border-r border-border flex flex-col transition-all duration-300 z-40', sidebarOpen ? 'w-56' : 'w-14')}>
      <div className="flex items-center gap-3 px-3 py-4 border-b border-border">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-xs font-bold text-white shrink-0">AI</div>
        {sidebarOpen && <span className="font-bold text-sm truncate">All-In-One AI</span>}
      </div>
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {NAV.map((item) => {
          const active = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn('flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors text-sm', active ? 'bg-primary text-primary-foreground font-medium' : 'text-muted-foreground hover:text-foreground hover:bg-accent')}>
              <span className="text-base shrink-0">{item.icon}</span>
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>
      <div className="border-t border-border p-2 space-y-1">
        <Link href="/settings" className="flex items-center gap-3 px-2 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
          <span className="shrink-0">⚙️</span>
          {sidebarOpen && <span>Settings</span>}
        </Link>
        {user && (
          <div className="flex items-center gap-3 px-2 py-2">
            <div className="w-7 h-7 rounded-full bg-violet-500 flex items-center justify-center text-xs text-white font-bold shrink-0">
              {user.name?.[0]?.toUpperCase() ?? 'U'}
            </div>
            {sidebarOpen && (
              <div className="min-w-0">
                <p className="text-xs font-medium truncate">{user.name}</p>
                <p className="text-xs text-muted-foreground capitalize">{user.plan}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
}