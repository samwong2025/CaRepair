'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, Loader2, Printer, ReceiptText, Search, Tag } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input, Select } from '../ui/input';
import { PrintDialog } from './print-dialog';
import { RepairLabel } from './repair-label';
import { Receipt } from './receipt';
import { statusFlow, statusMeta } from '../../data/seed';
import { formatDateTime, formatHKD } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { CurrentUser } from '../../lib/auth';
import type { OrderStatus, RepairOrder } from '../../types';

type PrintTarget = { type: 'label' | 'receipt'; order: RepairOrder } | null;

function nextStatus(status: OrderStatus): OrderStatus | null {
  const index = statusFlow.indexOf(status);
  if (index < 0 || index >= statusFlow.length - 1) return null;
  return statusFlow[index + 1];
}

const ROLE_LABEL: Record<string, string> = {
  admin: '管理員',
  technician: '維修師傅',
};

/** 後台維修工單管理：狀態流轉 + 列印維修識別標籤 / 售後收據 */
export function OrdersManager({
  orders,
  currentUser,
}: {
  orders: RepairOrder[];
  currentUser: CurrentUser | null;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | 'all'>('all');
  const [pendingId, setPendingId] = React.useState('');
  const [printTarget, setPrintTarget] = React.useState<PrintTarget>(null);

  // 師傅視圖：只看分派給自己的工單
  const isTechnician = currentUser?.role === 'technician';
  const scopedOrders = React.useMemo(() => {
    if (!isTechnician || !currentUser?.technicianName) return orders;
    return orders.filter((o) => o.technician === currentUser.technicianName);
  }, [orders, isTechnician, currentUser]);

  const filtered = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return scopedOrders.filter((order) => {
      const matchStatus = statusFilter === 'all' || order.status === statusFilter;
      const matchKeyword =
        !kw ||
        order.orderNo.toLowerCase().includes(kw) ||
        order.customerName.toLowerCase().includes(kw) ||
        order.customerPhone.includes(kw) ||
        order.deviceModelName.toLowerCase().includes(kw);
      return matchStatus && matchKeyword;
    });
  }, [scopedOrders, keyword, statusFilter]);

  const operatorName =
    currentUser?.name ?? (isTechnician ? currentUser?.technicianName ?? '師傅' : '後台管理員');

  const advance = async (order: RepairOrder) => {
    const next = nextStatus(order.status);
    if (!next) return;

    setPendingId(order.id);
    const response = await fetch(`/api/orders/${order.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: next, operator: operatorName }),
    }).catch((error: unknown) => {
      console.error('推進訂單狀態失敗', error);
      return null;
    });

    if (response?.ok) router.refresh();
    setPendingId('');
  };

  return (
    <div>
      {/* 篩選列 */}
      <div className="no-print flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜尋訂單編號 / 客戶 / 電話 / 機型"
            className="pl-10"
            aria-label="搜尋工單"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as OrderStatus | 'all')}
          className="sm:w-44"
          aria-label="狀態篩選"
        >
          <option value="all">全部狀態</option>
          {Object.entries(statusMeta).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </Select>
        <p className="shrink-0 text-xs text-ink-faint sm:w-24 sm:text-right">
          共 {filtered.length} 張
        </p>
      </div>

      {/* 視圖標記 */}
      {currentUser ? (
        <div className="no-print mt-4 flex items-center gap-2 rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
          <Badge variant={isTechnician ? 'warning' : 'brand'} size="sm">
            {ROLE_LABEL[currentUser.role] ?? currentUser.role}
          </Badge>
          <span>
            歡迎，<span className="font-bold">{currentUser.name}</span>
            {isTechnician && currentUser.technicianName
              ? `（僅顯示分派給「${currentUser.technicianName}」的工單）`
              : '（可檢視全部工單）'}
          </span>
        </div>
      ) : null}

      {/* 工單列表 */}
      <div className="no-print mt-4 space-y-3">
        {filtered.map((order) => {
          const meta = statusMeta[order.status];
          const next = nextStatus(order.status);

          return (
            <article
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-shadow duration-200 hover:shadow-lift sm:p-5"
            >
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-mono text-sm font-extrabold tracking-wide text-ink">
                      {order.orderNo}
                    </p>
                    <Badge variant={meta.tone} size="sm">
                      {meta.label}
                    </Badge>
                    {order.quote.requiresLab ? (
                      <Badge variant="warning" size="sm">
                        需送實驗室
                      </Badge>
                    ) : null}
                  </div>

                  <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-ink-muted sm:grid-cols-2 lg:grid-cols-4">
                    <p>
                      <span className="text-ink-faint">客戶：</span>
                      <span className="font-semibold text-ink">
                        {order.customerName}
                        {!isTechnician ? `・${order.customerPhone}` : ''}
                      </span>
                    </p>
                    <p>
                      <span className="text-ink-faint">機型：</span>
                      <span className="font-semibold text-ink">{order.deviceModelName}</span>
                    </p>
                    <p className="truncate">
                      <span className="text-ink-faint">項目：</span>
                      {order.quote.items.map((item) => item.name).join('、')}
                    </p>
                    <p>
                      <span className="text-ink-faint">技師：</span>
                      {order.technician ?? '待分派'}
                    </p>
                    <p>
                      <span className="text-ink-faint">預約：</span>
                      {formatDateTime(order.appointmentAt)}
                    </p>
                    <p>
                      <span className="text-ink-faint">落單：</span>
                      {formatDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-col gap-3 lg:items-end">
                  <p className="text-xl font-extrabold leading-none text-brand-600">
                    {formatHKD(order.quote.total)}
                  </p>

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => setPrintTarget({ type: 'label', order })}
                    >
                      <Tag className="h-3.5 w-3.5" />
                      維修標籤
                    </Button>
                    <Button
                      variant="soft"
                      size="sm"
                      onClick={() => setPrintTarget({ type: 'receipt', order })}
                    >
                      <ReceiptText className="h-3.5 w-3.5" />
                      售後收據
                    </Button>
                    {next ? (
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={pendingId === order.id}
                        onClick={() => advance(order)}
                      >
                        {pendingId === order.id ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <ChevronRight className="h-3.5 w-3.5" />
                        )}
                        推進至「{statusMeta[next].label}」
                      </Button>
                    ) : (
                      <span
                        className={cn(
                          'inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-bold',
                          order.status === 'cancelled'
                            ? 'bg-red-50 text-red-600'
                            : 'bg-emerald-50 text-emerald-700',
                        )}
                      >
                        {order.status === 'cancelled' ? '已取消' : '流程已完成'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </article>
          );
        })}

        {filtered.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-ink-muted">
            冇符合條件的工單。
          </p>
        ) : null}
      </div>

      <PrintDialog
        open={printTarget !== null}
        title={printTarget?.type === 'receipt' ? '售後收據預覽' : '維修識別標籤預覽'}
        description={
          printTarget?.type === 'receipt'
            ? 'A4 尺寸，建議使用一般影印紙列印'
            : '70mm × 100mm 標籤紙，建議使用熱敏標籤機'
        }
        onClose={() => setPrintTarget(null)}
      >
        {printTarget?.type === 'label' ? <RepairLabel order={printTarget.order} /> : null}
        {printTarget?.type === 'receipt' ? <Receipt order={printTarget.order} /> : null}
      </PrintDialog>
    </div>
  );
}
