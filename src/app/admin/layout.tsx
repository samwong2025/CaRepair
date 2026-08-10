import type { Metadata } from 'next';
import { AdminSidebar } from '../../components/admin/sidebar';
import { getRepository } from '../../lib/repositories';

export const metadata: Metadata = {
  title: '後台管理｜CathyRepair 凱西維修',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const source = getRepository().source;

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted lg:flex-row">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <div className="no-print flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-3 lg:px-8">
          <p className="text-xs text-ink-faint">
            資料來源：
            <span className="ml-1 font-bold text-ink">
              {source === 'supabase' ? 'Supabase 雲端資料庫' : '本地示範資料（Mock）'}
            </span>
          </p>
          <p className="hidden text-xs text-ink-faint sm:block">
            內部系統・僅供 CathyRepair 員工使用
          </p>
        </div>

        <div className="px-5 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
