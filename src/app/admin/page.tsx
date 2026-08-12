import Link from 'next/link';
import {
  ArrowUpRight,
  ClipboardList,
  Headphones,
  PackageSearch,
  Users,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/page-header';
import DashboardClient from '../../components/admin/dashboard-client';

export const dynamic = 'force-dynamic';

export default function AdminDashboardPage() {
  const quickLinks = [
    { label: '工單管理', href: '/admin/orders', icon: ClipboardList },
    { label: '會員管理', href: '/admin/customers', icon: Users },
    { label: '庫存管理', href: '/admin/inventory', icon: PackageSearch },
    { label: '售後追蹤', href: '/admin/aftersales', icon: Headphones },
  ];

  return (
    <>
      <AdminPageHeader
        title="師傅工作台"
        titleEn="Tech Workbench"
        description="一進後台就看今天有哪些新客戶、做什麼項目，快速 WhatsApp 溝通、選用庫存配件、列印維修標籤並確認客戶。"
      />

      <DashboardClient />

      {/* 快捷入口 */}
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {quickLinks.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon className="h-5 w-5" />
              </span>
              <span className="font-bold text-ink">{item.label}</span>
              <ArrowUpRight className="ml-auto h-4 w-4 text-ink-faint" />
            </Link>
          );
        })}
      </section>
    </>
  );
}
