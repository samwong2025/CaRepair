'use client';

import * as React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  ChevronRight,
  ClipboardList,
  Coins,
  MessageCircle,
  Package,
  PackageSearch,
  Phone,
  Printer,
  CheckCircle2,
  Loader2,
  Wrench,
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { statusMeta } from '../../data/seed';
import {
  formatHKD,
  formatNumber,
  formatPhone,
  hoursUntil,
  isToday,
  effectivePrice,
  isDiscounted,
} from '../../lib/format';
import { buildWhatsappUrl } from '../../lib/utils';
import { getSymptomById } from '../../data/symptoms';
import { InventoryAlertBanner } from './inventory-alert-banner';
import type { CurrentUser } from '../../lib/auth';
import type { InventoryAlert, OrderStatus, Part, RepairOrder } from '../../types';

interface TechWorkbenchProps {
  orders: RepairOrder[];
  currentUser: CurrentUser | null;
  inventory: Part[];
  alerts: InventoryAlert[];
  todayProjected: number;
  weekActual: number;
  monthActual: number;
}

const NEXT_CONFIRM: Partial<Record<OrderStatus, OrderStatus>> = {
  submitted: 'confirmed',
  confirmed: 'diagnosing',
  diagnosing: 'repairing',
  repairing: 'quality_check',
  quality_check: 'ready',
  ready: 'completed',
};

function symptomNames(order: RepairOrder): string {
  return order.symptomIds.map((s) => getSymptomById(s)?.shortName ?? s).join('、') || '未填寫';
}

export function TechWorkbench({
  orders,
  currentUser,
  inventory,
  alerts,
  todayProjected,
  weekActual,
  monthActual,
}: TechWorkbenchProps) {
  const router = useRouter();
  const [pendingId, setPendingId] = React.useState('');
  const [printTarget, setPrintTarget] = React.useState<RepairOrder | null>(null);

  const isTechnician = currentUser?.role === 'technician';
  const technicianName = currentUser?.technicianName;

  const scoped = React.useMemo(() => {
    if (isTechnician && technicianName) return orders.filter((o) => o.technician === technicianName);
    return orders;
  }, [orders, isTechnician, technicianName]);

  const newToday = React.useMemo(() => scoped.filter((o) => isToday(o.createdAt)), [scoped]);
  const activeOrders = React.useMemo(
    () => scoped.filter((o) => o.status !== 'completed' && o.status !== 'cancelled'),
    [scoped],
  );

  async function advance(order: RepairOrder) {
    const next = NEXT_CONFIRM[order.status];
    if (!next) return;
    setPendingId(order.id);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: next,
          operator: currentUser?.name ?? '師傅',
          note: `確認客戶：${statusMeta[order.status].label} → ${statusMeta[next].label}`,
        }),
      });
      if (res.ok) router.refresh();
    } finally {
      setPendingId('');
    }
  }

  const stats = [
    {
      label: '今日預計收入',
      value: formatHKD(todayProjected),
      hint: `進行中 ${activeOrders.length} 張工單`,
      icon: Coins,
      accent: 'from-brand-500/15 to-brand-500/0',
      href: '/admin/orders?status=active',
    },
    {
      label: '本週實際收入',
      value: formatHKD(weekActual),
      hint: '本週已完成結算',
      icon: ClipboardList,
      accent: 'from-sky-500/15 to-sky-500/0',
      href: '/admin/reports',
    },
    {
      label: '本月實際收入',
      value: formatHKD(monthActual),
      hint: '本月已完成結算',
      icon: PackageSearch,
      accent: 'from-emerald-500/15 to-emerald-500/0',
      href: '/admin/reports',
    },
  ];

  return (
    <div className="space-y-6">
      {/* 收入概覽 */}
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className="group relative block overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-lift"
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
              <p className="tabular relative mt-3 text-2xl font-extrabold leading-none text-ink">{item.value}</p>
              <p className="relative mt-2 flex items-center gap-1 text-[0.7rem] text-ink-faint">
                {item.hint}
                <ChevronRight className="h-3 w-3 text-brand-400 opacity-0 transition-opacity group-hover:opacity-100" />
              </p>
            </Link>
          );
        })}
      </div>

      {/* 庫存警告 */}
      <InventoryAlertBanner alerts={alerts} onJumpToInventory={() => router.push('/admin/inventory')} />

      {/* 今日新客 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-ink">
            今日新客戶 <span className="text-brand-600">{formatNumber(newToday.length)}</span>
          </h2>
          <Link
            href="/admin/orders?status=active"
            className="inline-flex items-center gap-0.5 text-[0.7rem] font-bold text-brand-700"
          >
            查看全部進行中 <ChevronRight className="h-3 w-3" />
          </Link>
        </div>
        {newToday.length === 0 ? (
          <p className="mt-4 text-xs text-ink-faint">今天還沒有新客戶下單</p>
        ) : (
          <ul className="mt-3 divide-y divide-slate-100">
            {newToday.map((order) => (
              <li key={order.id} className="flex flex-col gap-3 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
                <Link
                  href={`/admin/orders/${encodeURIComponent(order.orderNo)}`}
                  className="font-mono text-sm font-bold text-ink hover:text-brand-600"
                >
                  {order.orderNo}
                </Link>
                <span className="text-sm text-ink-muted">
                  {order.customerName}・{order.deviceModelName}
                </span>
                <span className="inline-flex w-fit rounded-md bg-slate-100 px-2 py-0.5 text-[0.65rem] font-semibold text-ink-muted">
                  {symptomNames(order)}
                </span>
                {/* 手機端：電話與 WhatsApp 各自獨立成行；WhatsApp 按鈕撐滿寬度，符合 44px 觸控標準 */}
                <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row sm:items-center sm:gap-2">
                  <span className="tabular text-sm font-semibold text-ink sm:text-xs sm:font-normal sm:text-ink-faint">
                    {formatPhone(order.customerPhone)}
                  </span>
                  <a
                    href={buildWhatsappUrl(order.customerPhone, `你好 ${order.customerName}，我是 CathyRepair 師傅，關於您的 ${order.deviceModelName} 維修…`)}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`用 WhatsApp 聯絡 ${order.customerName}`}
                    className="inline-flex h-11 w-full items-center justify-center gap-1.5 rounded-xl bg-emerald-500 px-4 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:bg-emerald-600 hover:shadow-md active:scale-[0.98] sm:h-9 sm:w-auto sm:px-3 sm:text-xs sm:shadow-none"
                  >
                    <MessageCircle className="h-4 w-4 sm:h-3.5 sm:w-3.5" /> WhatsApp
                  </a>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 進行中工單 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">
          進行中工單 <span className="text-brand-600">{formatNumber(activeOrders.length)}</span>
        </h2>
        <p className="mt-1 text-xs text-ink-faint">
          快速聯絡客戶、選用庫存配件、列印維修標籤，確認客戶後自動推進狀態。
        </p>
        <div className="mt-4 space-y-3">
          {activeOrders.map((order) => {
            const meta = statusMeta[order.status];
            const next = NEXT_CONFIRM[order.status];
            const hours = hoursUntil(order.appointmentAt);
            const soon = hours != null && hours >= 0 && hours < 24;
            const overdue = hours != null && hours < 0;
            return (
              <div
                key={order.id}
                className="rounded-xl border border-slate-200 bg-white p-4 transition-shadow hover:shadow-lift"
              >
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href={`/admin/orders/${encodeURIComponent(order.orderNo)}`}
                    className="group inline-flex items-center gap-1.5 rounded-md px-1 py-0.5 font-mono text-sm font-bold text-brand-700 transition-colors duration-200 hover:bg-brand-50"
                    aria-label={`打開工單 ${order.orderNo}`}
                  >
                    {order.orderNo}
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                  <Badge variant={meta.tone} size="sm">
                    {meta.label}
                  </Badge>
                  {order.technician && (
                    <span className="inline-flex items-center gap-1 text-[0.7rem] text-ink-muted">
                      <Wrench className="h-3 w-3" /> {order.technician}
                    </span>
                  )}
                  {soon && (
                    <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[0.65rem] font-bold text-amber-600">
                      24h 內到店
                    </span>
                  )}
                  {overdue && (
                    <span className="rounded-full bg-red-50 px-2 py-0.5 text-[0.65rem] font-bold text-red-600">
                      已過預約
                    </span>
                  )}
                  <span className="ml-auto flex items-center gap-1.5 tabular text-sm font-extrabold text-brand-600">
                    {formatHKD(effectivePrice(order))}
                    {isDiscounted(order) ? (
                      <span className="rounded bg-emerald-50 px-1 text-[0.6rem] font-bold text-emerald-700">
                        優惠
                      </span>
                    ) : null}
                  </span>
                </div>

                <p className="mt-2 text-sm text-ink">
                  {order.customerName}・{order.deviceModelName}
                </p>
                <p className="mt-1 text-xs text-ink-muted">項目：{symptomNames(order)}</p>

                {/* 已選配件 */}
                {order.partsUsed && order.partsUsed.length > 0 && (
                  <p className="mt-1 text-[0.7rem] text-ink-faint">
                    配件：{order.partsUsed.map((p) => `${p.name}×${p.qty}`).join('、')}
                  </p>
                )}

                {/* 操作列 */}
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <a
                    href={buildWhatsappUrl(order.customerPhone, `你好 ${order.customerName}，關於您的 ${order.deviceModelName}（${order.orderNo}）維修進度…`)}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500 px-2.5 py-1.5 text-[0.7rem] font-bold text-white hover:bg-emerald-600"
                  >
                    <MessageCircle className="h-3.5 w-3.5" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${order.customerPhone.replace(/\D/g, '')}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[0.7rem] font-bold text-ink-muted hover:bg-slate-50"
                  >
                    <Phone className="h-3.5 w-3.5" /> 致電
                  </a>

                  <Link
                    href={`/admin/orders/${encodeURIComponent(order.orderNo)}`}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1.5 text-[0.7rem] font-bold text-ink-muted hover:bg-slate-50"
                  >
                    <Package className="h-3.5 w-3.5" /> 選配件
                  </Link>

                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1 text-ink-muted"
                    onClick={() => setPrintTarget(order)}
                  >
                    <Printer className="h-3.5 w-3.5" /> 列印標籤
                  </Button>

                  {next && (
                    <Button
                      size="sm"
                      className="ml-auto gap-1.5 shadow-sm hover:shadow-md"
                      disabled={pendingId === order.id}
                      onClick={() => advance(order)}
                    >
                      {pendingId === order.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3.5 w-3.5" />
                      )}
                      確認並推進至「{statusMeta[next].label}」
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
          {activeOrders.length === 0 && (
            <p className="mt-4 text-xs text-ink-faint">目前沒有進行中的工單</p>
          )}
        </div>
      </section>

      {printTarget && (
        <PrintDialog
          order={printTarget}
          onClose={() => setPrintTarget(null)}
        />
      )}
    </div>
  );
}

/* 直接內嵌列印對話框（沿用既有 RepairLabel 元件） */
import { RepairLabel } from './repair-label';

function PrintDialog({ order, onClose }: { order: RepairOrder; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <div
        className="max-h-[90vh] w-full max-w-md overflow-auto rounded-2xl bg-white p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-bold text-ink">維修標籤預覽</h3>
          <div className="flex items-center gap-2">
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="h-3.5 w-3.5" /> 列印
            </Button>
            <button onClick={onClose} className="text-ink-faint hover:text-ink">
              ✕
            </button>
          </div>
        </div>
        <RepairLabel order={order} />
      </div>
    </div>
  );
}
