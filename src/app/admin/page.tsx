import Link from 'next/link';
import {
  ArrowUpRight,
  ClipboardList,
  Coins,
  Headphones,
  Package,
  PackageSearch,
  Users,
  Wrench,
} from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/page-header';
import { TechWorkbench } from '../../components/admin/tech-workbench';
import { Badge } from '../../components/ui/badge';
import { statusFlow, statusMeta } from '../../data/seed';
import { formatDateTime, formatHKD, formatNumber, isThisMonth, isThisWeek } from '../../lib/format';
import { computeInventoryAlerts, loadInventory } from '../../lib/inventory-store';
import { getRepository } from '../../lib/repositories';
import { getCurrentUser } from '../../lib/auth';
import type { OrderStatus } from '../../types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const repository = getRepository();
  const [orders, customers, tickets, afterSales, inventory, currentUser] = await Promise.all([
    repository.listRepairOrders(),
    repository.listCustomers(),
    repository.listTickets(),
    repository.listAfterSales(),
    loadInventory(),
    getCurrentUser(),
  ]);

  const completedOrders = orders.filter((order) => order.status === 'completed');
  // 今日預計收入：進行中（未完成 / 未取消）工單報價總和
  const todayProjected = orders
    .filter((order) => order.status !== 'completed' && order.status !== 'cancelled')
    .reduce((sum, order) => sum + order.quote.total, 0);
  // 本週實際收入：本週完成工單
  const weekActual = completedOrders
    .filter((order) => isThisWeek(order.updatedAt))
    .reduce((sum, order) => sum + order.quote.total, 0);
  // 本月實際收入：本月完成工單
  const monthActual = completedOrders
    .filter((order) => isThisMonth(order.updatedAt))
    .reduce((sum, order) => sum + order.quote.total, 0);

  const alerts = computeInventoryAlerts(inventory);

  const pendingAfterSales = afterSales.filter((item) => item.status !== 'resolved');

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

      <TechWorkbench
        orders={orders}
        currentUser={currentUser}
        inventory={inventory}
        alerts={alerts}
        todayProjected={todayProjected}
        weekActual={weekActual}
        monthActual={monthActual}
      />

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

      {/* 待處理售後 */}
      {pendingAfterSales.length > 0 && (
        <section className="rounded-2xl border border-amber-200 bg-amber-50/60 p-5">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-amber-800">待處理售後 {pendingAfterSales.length} 宗</h2>
            <Link href="/admin/aftersales" className="text-[0.7rem] font-bold text-amber-800 hover:underline">
              前往處理
            </Link>
          </div>
        </section>
      )}
    </>
  );
}
