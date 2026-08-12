import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { AdminSidebar } from '../../components/admin/sidebar';
import { AdminUserMenu } from '../../components/admin/user-menu';
import { getRepository } from '../../lib/repositories';
import { getCurrentUser } from '../../lib/auth';

export const metadata: Metadata = {
  title: '後台管理｜CathyRepair',
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const source = getRepository().source;
  const user = await getCurrentUser();

  return (
    <div className="flex min-h-screen flex-col bg-surface-muted lg:flex-row">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <div className="no-print flex items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 py-2 lg:px-8 lg:py-3">
          <p className="text-[0.7rem] text-ink-faint lg:text-xs">
            資料來源：
            <span className="ml-1 font-bold text-ink">
              {source === 'supabase' ? 'Supabase 雲端資料庫' : '本地示範資料（Mock）'}
            </span>
          </p>
          <div className="flex items-center gap-3">
            <p className="hidden text-xs text-ink-faint sm:block">內部系統・僅供 CathyRepair 員工使用</p>
            <Link
              href="/"
              prefetch={false}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-2 text-xs font-semibold text-ink-muted transition-colors duration-200 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
              aria-label="返回前台"
              title="返回前台"
            >
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span className="sm:hidden">前台</span>
              <span className="hidden sm:inline">返回前台</span>
            </Link>
            <AdminUserMenu user={user} />
          </div>
        </div>

        <div className="px-5 py-6 lg:px-8 lg:py-8">{children}</div>
      </main>
    </div>
  );
}
