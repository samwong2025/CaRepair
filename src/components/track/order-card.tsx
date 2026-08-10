'use client';

import * as React from 'react';
import { CalendarCheck, ChevronDown, MapPin, ShieldCheck, Truck, UserCog, Wrench } from 'lucide-react';
import { Badge } from '../ui/badge';
import { StatusTimeline } from './status-timeline';
import { statusMeta } from '../../data/seed';
import { formatDateTime, formatHKD, maskName } from '../../lib/format';
import { formatDuration } from '../../lib/quote-engine';
import { cn } from '../../lib/utils';
import type { RepairOrder } from '../../types';

const serviceModeLabel: Record<string, string> = {
  walk_in: '到店維修',
  pickup: '順豐上門收送',
  mail_in: '自行寄件',
};

/** 單張維修訂單卡：狀態、報價摘要與可展開的進度時間軸 */
export function OrderCard({ order, defaultOpen = false }: { order: RepairOrder; defaultOpen?: boolean }) {
  const [open, setOpen] = React.useState(defaultOpen);
  const meta = statusMeta[order.status];

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      <header className="flex flex-col gap-4 border-b border-slate-100 bg-surface-soft px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
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
            {formatHKD(order.quote.total)}
          </p>
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
            主理技師
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
