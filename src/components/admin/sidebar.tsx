'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowUpRight,
  BarChart3,
  ClipboardList,
  DollarSign,
  HardDrive,
  Headphones,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Stethoscope,
  Users,
  Warehouse,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '../../lib/utils';

type NavItem = { href: string; label: string; icon: LucideIcon; description: string };

const navGroups: { title?: string; items: NavItem[] }[] = [
  {
    items: [
      { href: '/admin', label: '營運概覽', icon: LayoutDashboard, description: '今日數據與待辦' },
      { href: '/admin/orders', label: '維修工單', icon: ClipboardList, description: '狀態流轉・打印標籤' },
      { href: '/admin/customers', label: 'CRM 客戶', icon: Users, description: '會員檔案與消費' },
      { href: '/admin/aftersales', label: '售後個案', icon: Headphones, description: '保養・投訴跟進' },
      { href: '/admin/reports', label: '報表分析', icon: BarChart3, description: '營收・訂單統計' },
    ],
  },
  {
    title: '維修設定',
    items: [
      { href: '/admin/models', label: '機型管理', icon: HardDrive, description: '增刪改機型' },
      { href: '/admin/symptoms', label: '故障管理', icon: Stethoscope, description: '維修項目設定' },
      { href: '/admin/pricing', label: '維修價格', icon: DollarSign, description: '線上調整報價' },
    ],
  },
  {
    title: '二手商城',
    items: [
      { href: '/admin/products', label: '商品管理', icon: Package, description: '上架・庫存・價格' },
      { href: '/admin/shop-orders', label: '商城訂單', icon: ShoppingBag, description: '出貨・退換貨' },
    ],
  },
  {
    title: '倉庫管理',
    items: [
      { href: '/admin/inventory', label: '配件庫存', icon: Warehouse, description: '維修用料管理' },
      { href: '/admin/inventory-report', label: '進銷存報表', icon: BarChart3, description: '入庫・出庫・盤點' },
    ],
  },
];

/** 後台側邊導航（列印時隱藏） */
export function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="admin-sidebar no-print sticky top-0 z-30 flex shrink-0 flex-col border-b border-slate-200 bg-white lg:h-screen lg:w-64 lg:border-b-0 lg:border-r">
      <div className="flex shrink-0 items-center gap-2.5 px-4 py-3 lg:px-5 lg:py-5">
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

      <nav
        aria-label="後台導航"
        className="flex gap-2 overflow-x-auto px-3 pb-3 lg:flex-1 lg:min-h-0 lg:flex-col lg:gap-3 lg:overflow-x-hidden lg:overflow-y-auto lg:px-3 lg:pb-4"
      >
        {navGroups.map((group, gi) => (
          <div
            key={group.title ?? `g${gi}`}
            className="flex shrink-0 gap-2 lg:flex-col lg:gap-2"
          >
            {group.title && (
              <p className="hidden px-3.5 pb-1 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-ink-faint lg:block">
                {group.title}
              </p>
            )}
            {group.items.map((item) => {
              const Icon = item.icon;
              const active =
                pathname === item.href ||
                (item.href !== '/admin' && pathname.startsWith(item.href + '/'));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 py-1.5 text-[0.78rem] transition-all duration-200 lg:gap-3 lg:whitespace-normal lg:rounded-xl lg:px-3.5 lg:py-2.5 lg:text-sm',
                    active
                      ? 'bg-brand-gradient text-white shadow-brand'
                      : 'bg-slate-100 text-ink-muted hover:bg-slate-200 hover:text-ink',
                  )}
                >
                  <Icon className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={2} />
                  <span className="font-bold">{item.label}</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      <div className="hidden shrink-0 px-3 pb-4 pt-2 lg:mt-auto lg:block">
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
