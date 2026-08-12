'use client';

import * as React from 'react';
import {
  CalendarCheck,
  ChevronDown,
  MapPin,
  Package,
  ShieldCheck,
  Store,
  Truck,
  UserCog,
  Wrench,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { StatusTimeline } from './status-timeline';
import { statusMeta } from '../../data/seed';
import { formatDateTime, formatHKD, maskName, effectivePrice, isDiscounted, maskPhone } from '../../lib/format';
import { formatDuration } from '../../lib/quote-engine';
import { cn } from '../../lib/utils';
import type { RepairOrder, ShopOrder, ShopOrderStatus } from '../../types';

const serviceModeLabel: Record<string, string> = {
  walk_in: '到店維修',
  pickup: '順豐寄修',
  mail_in: '自行寄件',
};

const shopStatusMeta: Record<
  ShopOrderStatus,
  { label: string; tone: 'brand' | 'accent' | 'success' | 'warning' | 'neutral' | 'danger' }
> = {
  pending: { label: '待確認', tone: 'neutral' },
  paid: { label: '已付款', tone: 'brand' },
  shipped: { label: '已送貨', tone: 'accent' },
  picked: { label: '已自取', tone: 'success' },
  completed: { label: '已完成', tone: 'success' },
  cancelled: { label: '已取消', tone: 'danger' },
};

/** 單張訂單卡：維修或二手購買，依資料自動判別 */
export function OrderCard({ order, defaultOpen = false }: { order: RepairOrder | ShopOrder; defaultOpen?: boolean }) {
  if ('quote' in order) return <RepairOrderCard order={order} defaultOpen={defaultOpen} />;
  return <ShopOrderCard order={order} defaultOpen={defaultOpen} />;
}

/** 維修訂單卡：狀態、報價摘要與可展開的進度時間軸 */
function RepairOrderCard({ order, defaultOpen = false }: { order: RepairOrder; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const meta = statusMeta[order.status];

  return (
    <article className="glow-card rounded-2xl border border-slate-200 bg-white shadow-card">
      <header className="flex flex-col gap-4 rounded-t-2xl border-b border-slate-100 bg-surface-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-extrabold tracking-wide text-ink">{order.orderNo}</p>
            <Badge variant={meta.tone} size="sm">
              {meta.label}
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {order.deviceModelName}・{maskName(order.customerName)}・落單於{' '}
            {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-ink-faint">維修總額</p>
          <p className="text-2xl font-extrabold leading-none text-brand-600">
            {formatHKD(effectivePrice(order))}
          </p>
          {isDiscounted(order) ? (
            <p className="mt-0.5 text-xs text-emerald-600">
              尊享折扣 HK${(order.quote.total - effectivePrice(order)).toLocaleString()}（原 {formatHKD(order.quote.total)}）
            </p>
          ) : null}
        </div>
      </header>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            <Wrench className="h-3.5 w-3.5" />
            維修項目
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {order.quote.items.map((item) => item.name).join('、')}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            <CalendarCheck className="h-3.5 w-3.5" />
            預約時間
          </p>
          <p className="mt-1 text-sm font-bold text-ink">{formatDateTime(order.appointmentAt)}</p>
          <p className="mt-0.5 text-xs text-ink-muted">
            {serviceModeLabel[order.serviceMode] ?? order.serviceMode}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            {order.serviceMode === 'walk_in' ? (
              <MapPin className="h-3.5 w-3.5" />
            ) : (
              <Truck className="h-3.5 w-3.5" />
            )}
            {order.serviceMode === 'walk_in' ? '維修門市' : '收送地址'}
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {order.serviceMode === 'walk_in' ? order.shopName : order.address}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            <UserCog className="h-3.5 w-3.5" />
            主理師傅
          </p>
          <p className="mt-1 text-sm font-bold text-ink">{order.technician ?? '待分派'}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
            <ShieldCheck className="h-3 w-3 text-emerald-600" />
            保養 {order.quote.warrantyDays} 日・工時 {formatDuration(order.quote.estimatedMinutes)}
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 border-t border-slate-100 px-5 py-3.5 text-sm font-bold text-brand-700 transition-colors duration-200 hover:bg-brand-50/60 sm:px-6"
      >
        {open ? '收起維修進度' : '查看維修進度時間軸'}
        <ChevronDown
          className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')}
        />
      </button>

      {open ? (
        <div className="border-t border-slate-100 px-5 py-6 sm:px-6">
          <StatusTimeline status={order.status} timeline={order.timeline} />

          {order.remark ? (
            <p className="mt-5 rounded-xl border border-slate-200 bg-surface-soft px-4 py-3 text-xs leading-relaxed text-ink-muted">
              客戶備註：{order.remark}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

/** 二手購買訂單卡：商品、交收方式、狀態，無維修時間軸 */
function ShopOrderCard({ order, defaultOpen = false }: { order: ShopOrder; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const meta = shopStatusMeta[order.status];
  const isPickup = order.fulfillment === 'pickup';
  const total = order.price * order.qty;

  const stepLabel: Record<ShopOrderStatus, string> = {
    pending: '門市收到落單，會致電確認庫存與交收安排',
    paid: '已收妥款項，準備安排交收',
    shipped: '已交速遞寄出，留意收貨電話',
    picked: '已到店自取並簽收',
    completed: '交易完成，進入本店保養期',
    cancelled: '訂單已取消',
  };

  return (
    <article className="glow-card rounded-2xl border border-slate-200 bg-white shadow-card">
      <header className="flex flex-col gap-4 rounded-t-2xl border-b border-slate-100 bg-surface-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-extrabold tracking-wide text-ink">{order.orderNo}</p>
            <Badge variant={meta.tone} size="sm">
              {meta.label}
            </Badge>
            <Badge variant="neutral" size="sm" className="bg-slate-100">
              二手購買
            </Badge>
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            {order.productName}・{maskName(order.customerName)}・落單於 {formatDateTime(order.createdAt)}
          </p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-xs text-ink-faint">訂單總額</p>
          <p className="text-2xl font-extrabold leading-none text-brand-600">{formatHKD(total)}</p>
          {order.qty > 1 ? <p className="mt-0.5 text-xs text-ink-muted">數量 {order.qty} 件</p> : null}
        </div>
      </header>

      <div className="grid gap-4 px-5 py-5 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
        <div>
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            <Package className="h-3.5 w-3.5" />
            購買商品
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {order.productName}
            {order.qty > 1 ? ` ×${order.qty}` : ''}
          </p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            {isPickup ? <Store className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
            交收方式
          </p>
          <p className="mt-1 text-sm font-bold text-ink">{isPickup ? '到店自取' : '送貨上門'}</p>
          <p className="mt-0.5 text-xs text-ink-muted">{isPickup ? order.pickupShop : '安排速遞寄出'}</p>
        </div>

        <div>
          <p className="flex items-center gap-1.5 text-xs text-ink-faint">
            {isPickup ? <MapPin className="h-3.5 w-3.5" /> : <Truck className="h-3.5 w-3.5" />}
            {isPickup ? '自取門市 / 時間' : '送貨地址'}
          </p>
          <p className="mt-1 text-sm font-bold text-ink">
            {isPickup
              ? order.pickupShop ?? '門市自取'
              : order.deliveryAddress ?? '待補地址'}
          </p>
          {isPickup && order.pickupAt ? (
            <p className="mt-0.5 text-xs text-ink-muted">預計 {formatDateTime(order.pickupAt)}</p>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center justify-between gap-2 border-t border-slate-100 px-5 py-3.5 text-sm font-bold text-brand-700 transition-colors duration-200 hover:bg-brand-50/60 sm:px-6"
      >
        {open ? '收起訂單詳情' : '查看訂單詳情'}
        <ChevronDown className={cn('h-4 w-4 transition-transform duration-300', open && 'rotate-180')} />
      </button>

      {open ? (
        <div className="space-y-3 border-t border-slate-100 px-5 py-5 text-sm sm:px-6">
          <p className="flex items-start gap-2 text-ink-muted">
            <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{stepLabel[order.status]}</span>
          </p>
          <p className="text-xs text-ink-faint">聯絡電話：{maskPhone(order.customerPhone)}</p>
          {order.remark ? (
            <p className="rounded-xl border border-slate-200 bg-surface-soft px-4 py-3 text-xs leading-relaxed text-ink-muted">
              客戶備註：{order.remark}
            </p>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}
