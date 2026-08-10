import Link from 'next/link';
import { ArrowUpRight, ChevronRight, ClipboardList, Coins, Headphones, Users } from 'lucide-react';
import { AdminPageHeader } from '../../components/admin/page-header';
import { Badge } from '../../components/ui/badge';
import { statusFlow, statusMeta } from '../../data/seed';
import { formatDateTime, formatHKD, formatNumber } from '../../lib/format';
import { getRepository } from '../../lib/repositories';
import type { OrderStatus } from '../../types';

export const dynamic = 'force-dynamic';

export default async function AdminDashboardPage() {
  const repository = getRepository();
  const [orders, customers, tickets, afterSales] = await Promise.all([
    repository.listRepairOrders(),
    repository.listCustomers(),
    repository.listTickets(),
    repository.listAfterSales(),
  ]);

  const activeOrders = orders.filter(
    (order) => order.status !== 'completed' && order.status !== 'cancelled',
  );
  const completedOrders = orders.filter((order) => order.status === 'completed');
  const revenue = completedOrders.reduce((sum, order) => sum + order.quote.total, 0);
  const pendingAfterSales = afterSales.filter((item) => item.status !== 'resolved');

  const stats: Array<{
    label: string;
    value: string;
    suffix: string;
    hint: string;
    icon: typeof ClipboardList;
    href: string | null;
    accent: string;
  }> = [
    {
      label: '進行中工單',
      value: formatNumber(activeOrders.length),
      suffix: '張',
      hint: `累計 ${orders.length} 張維修訂單`,
      icon: ClipboardList,
      href: '/admin/orders?status=active',
      accent: 'from-brand-500/15 to-brand-500/0',
    },
    {
      label: '會員總數',
      value: formatNumber(customers.length),
      suffix: '位',
      hint: `平均消費 ${formatHKD(
        Math.round(
          customers.reduce((sum, item) => sum + item.totalSpent, 0) / Math.max(1, customers.length),
        ),
      )}`,
      icon: Users,
      href: '/admin/customers',
      accent: 'from-sky-500/15 to-sky-500/0',
    },
    {
      label: '已完成營業額',
      value: formatHKD(revenue),
      suffix: '',
      hint: `完成 ${completedOrders.length} 張工單`,
      icon: Coins,
      href: '/admin/orders?status=completed',
      accent: 'from-emerald-500/15 to-emerald-500/0',
    },
    {
      label: '待處理售後',
      value: formatNumber(pendingAfterSales.length),
      suffix: '宗',
      hint: `累計 ${afterSales.length} 宗個案`,
      icon: Headphones,
      href: null,
      accent: 'from-amber-500/15 to-amber-500/0',
    },
  ];

  const distribution = statusFlow.map((status) => ({
    status,
    count: orders.filter((order) => order.status === status).length,
  }));
  const maxCount = Math.max(1, ...distribution.map((item) => item.count));

  const technicianLoad = Object.entries(
    tickets.reduce<Record<string, number>>((acc, ticket) => {
      acc[ticket.technician] = (acc[ticket.technician] ?? 0) + 1;
      return acc;
    }, {}),
  ).sort((a, b) => b[1] - a[1]);

  return (
    <>
      <AdminPageHeader
        title="營運概覽"
        titleEn="Dashboard"
        description="即時掌握工單流量、會員增長與售後負載。"
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => {
          const Icon = item.icon;
          const cardBody = (
            <div
              className={`relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all duration-200 ${
                item.href ? 'hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift' : ''
              }`}
            >
              <div
                className={`pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b ${item.accent}`}
                aria-hidden
              />
              <div className="relative flex items-center justify-between">
                <p className="text-xs font-semibold text-ink-muted">{item.label}</p>
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-4 w-4" strokeWidth={2.2} />
                </span>
              </div>
              <p className="tabular relative mt-3 text-2xl font-extrabold leading-none text-ink">
                {item.value}
                <span className="ml-1 text-sm font-bold text-ink-muted">{item.suffix}</span>
              </p>
              <p className="relative mt-2 text-[0.7rem] text-ink-faint">{item.hint}</p>
              {item.href ? (
                <span className="relative mt-3 inline-flex items-center gap-0.5 text-[0.65rem] font-bold text-brand-700">
                  點擊查看
                  <ChevronRight className="h-3 w-3" />
                </span>
              ) : null}
            </div>
          );

          return item.href ? (
            <Link
              key={item.label}
              href={item.href}
              className="block rounded-2xl outline-none focus-visible:ring-2 focus-visible:ring-brand-400"
              aria-label={`${item.label}：查看詳情`}
            >
              {cardBody}
            </Link>
          ) : (
            <div key={item.label}>{cardBody}</div>
          );
        })}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        {/* 狀態分佈 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-base font-extrabold text-ink">工單狀態分佈</h2>
          <ul className="mt-4 space-y-3">
            {distribution.map((item) => {
              const meta = statusMeta[item.status as OrderStatus];
              return (
                <li key={item.status} className="flex items-center gap-3">
                  <span className="w-16 shrink-0 text-xs font-semibold text-ink-muted">
                    {meta.label}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <span
                      className="block h-full rounded-full bg-brand-gradient transition-all duration-700"
                      style={{ width: `${(item.count / maxCount) * 100}%` }}
                    />
                  </div>
                  <span className="tabular w-8 shrink-0 text-right text-sm font-extrabold text-ink">
                    {item.count}
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* 技師負載 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h2 className="text-base font-extrabold text-ink">技師工單負載</h2>
          <ul className="mt-4 space-y-2.5">
            {technicianLoad.map(([name, count]) => (
              <li
                key={name}
                className="flex items-center justify-between rounded-xl bg-surface-soft px-3.5 py-2.5"
              >
                <span className="flex items-center gap-2.5">
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-gradient text-xs font-extrabold text-white">
                    {name.slice(-2)}
                  </span>
                  <span className="text-sm font-bold text-ink">{name}</span>
                </span>
                <span className="tabular text-sm font-extrabold text-brand-600">{count} 張</span>
              </li>
            ))}
            {technicianLoad.length === 0 ? (
              <li className="py-6 text-center text-sm text-ink-muted">暫未有工單分派</li>
            ) : null}
          </ul>
        </section>
      </div>

      {/* 最新工單 */}
      <section className="mt-6 rounded-2xl border border-slate-200 bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-base font-extrabold text-ink">最新維修工單</h2>
          <Link
            href="/admin/orders"
            className="flex items-center gap-1 text-xs font-bold text-brand-700 hover:underline"
          >
            查看全部
            <ArrowUpRight className="h-3.5 w-3.5" />
          </Link>
        </header>

        <ul className="divide-y divide-slate-100">
          {orders.slice(0, 6).map((order) => {
            const meta = statusMeta[order.status];
            return (
              <li key={order.id}>
                <Link
                  href={`/admin/orders/${encodeURIComponent(order.orderNo)}`}
                  className="flex flex-wrap items-center gap-3 px-5 py-3.5 transition-colors hover:bg-slate-50/70"
                  aria-label={`編輯工單 ${order.orderNo}`}
                >
                  <span className="font-mono text-sm font-bold text-ink">{order.orderNo}</span>
                  <Badge variant={meta.tone} size="sm">
                    {meta.label}
                  </Badge>
                  <span className="text-sm text-ink-muted">
                    {order.deviceModelName}・{order.customerName}
                  </span>
                  <span className="ml-auto flex items-center gap-4">
                    <span className="text-xs text-ink-faint">{formatDateTime(order.createdAt)}</span>
                    <span className="tabular text-sm font-extrabold text-brand-600">
                      {formatHKD(order.quote.total)}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>
    </>
  );
}
