import { Sidebar } from '@/components/shared/sidebar';
import { TopBar } from '@/components/shared/topbar';
import DashboardLayoutClient from './layout-client';

function cn(...c: (string|boolean|undefined)[]) { return c.filter(Boolean).join(' '); }

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardLayoutClient>
      {children}
    </DashboardLayoutClient>
  );
}
