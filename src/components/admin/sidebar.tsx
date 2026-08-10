'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  ClipboardList,
  DollarSign,
  Headphones,
  LayoutDashboard,
  Users,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

const navItems: { href: string; label: string; icon: LucideIcon; description: string }[] = [
  { href: '/admin', label: '營運概覽', icon: LayoutDashboard, description: '今日數據與待辦' },
  { href: '/admin/orders', label: '維修工單', icon: ClipboardList, description: '狀態流轉・打印標籤' },
  { href: '/admin/customers', label: 'CRM 客戶', icon: Users, description: '會員檔案與消費' },
  { href: '/admin/aftersales', label: '售後個案', icon: Headphones, description: '保養・投訴跟進' },
  { href: '/admin/pricing', label: '維修價格', icon: DollarSign, description: '線上調整報價' },
];

/** 後台側邊導航（列印時隱藏） */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar no-print sticky top-0 z-30 h-auto shrink-0 border-b border-slate-200 bg-white lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white">
          <Wrench className="h-5 w-5" strokeWidth={2.4} />
        </span>
        <div>
          <p className="text-[0.95rem] font-extrabold leading-none text-ink">CathyRepair</p>
          <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-ink-faint">
            Admin Console
          </p>
        </div>
      </div>

      <nav className="flex gap-1.5 overflow-x-auto px-3 pb-4 lg:flex-col lg:overflow-visible">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-2.5 transition-all duration-200',
                active
                  ? 'bg-brand-gradient text-white shadow-brand'
                  : 'text-ink-muted hover:bg-slate-100 hover:text-ink',
              )}
            >
              <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={2} />
              <span className="min-w-0">
                <span className="block text-sm font-bold">{item.label}</span>
                <span
                  className={cn(
                    'hidden text-[0.68rem] lg:block',
                    active ? 'text-white/65' : 'text-ink-faint',
                  )}
                >
                  {item.description}
                </span>
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden px-3 lg:mt-auto lg:block">
        <Link
          href="/"
          className="flex items-center justify-between rounded-xl border border-slate-200 px-3.5 py-3 text-sm font-semibold text-ink-muted transition-colors duration-200 hover:border-brand-300 hover:text-brand-700"
        >
          返回前台網站
          <ArrowUpRight className="h-4 w-4" />
        </Link>
      </div>
    </aside>
  );
}
