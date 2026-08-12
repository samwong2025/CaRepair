'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronRight,
  Loader2,
  MessageCircle,
  Plus,
  Printer,
  ReceiptText,
  Search,
  Tag,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input, Select } from '../ui/input';
import { PrintDialog } from './print-dialog';
import { RepairLabel } from './repair-label';
import { Receipt } from './receipt';
import { statusFlow, statusMeta } from '../../data/seed';
import { formatDateTime, formatHKD, formatPhone, effectivePrice, isDiscounted } from '../../lib/format';
import { cn, buildWhatsappUrl } from '../../lib/utils';
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
  initialStatus = 'all',
  statusPreset = null,
}: {
  orders: RepairOrder[];
  currentUser: CurrentUser | null;
  initialStatus?: OrderStatus | 'all';
  statusPreset?: 'active' | 'completed' | null;
}) {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<OrderStatus | 'all'>(initialStatus);
  const [dateFrom, setDateFrom] = React.useState('');
  const [dateTo, setDateTo] = React.useState('');
  const [pendingId, setPendingId] = React.useState('');
  const [printTarget, setPrintTarget] = React.useState<PrintTarget>(null);

  // 師傅視圖：只看分派給自己的工單
  const isTechnician = currentUser?.role === 'technician';
  const scopedOrders = React.useMemo(() => {
    if (!isTechnician || !currentUser?.technicianName) return orders;
    return orders.filter((o) => o.technician === currentUser.technicianName);
  }, [orders, isTechnician, currentUser]);

  // 仪表板快捷入口预设：在 UI 層再做一次篩選，避免父層需要解析 active/completed 語意
  const applyPreset = React.useCallback(
    (order: RepairOrder) => {
      if (!statusPreset) return true;
      if (statusPreset === 'completed') return order.status === 'completed';
      // active: 非完成、非取消
      return order.status !== 'completed' && order.status !== 'cancelled';
    },
    [statusPreset],
  );

  // 日期篩選：以預約日期為準，缺預約日期時回退建立日期
  const matchDate = React.useCallback(
    (order: RepairOrder) => {
      if (!dateFrom && !dateTo) return true;
      const raw = order.appointmentAt ?? order.createdAt;
      if (!raw) return false;
      const t = new Date(raw as string | number | Date).getTime();
      if (Number.isNaN(t)) return false;
      const dayStart = dateFrom ? new Date(dateFrom + 'T00:00:00').getTime() : -Infinity;
      const dayEnd = dateTo ? new Date(dateTo + 'T23:59:59.999').getTime() : Infinity;
      return t >= dayStart && t <= dayEnd;
    },
    [dateFrom, dateTo],
  );

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
      return matchStatus && matchKeyword && applyPreset(order) && matchDate(order);
    });
  }, [scopedOrders, keyword, statusFilter, applyPreset, matchDate]);

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
        <div className="flex items-center gap-2">
          <Input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="w-auto"
            aria-label="預約起始日"
            title="預約起始日"
          />
          <span className="text-xs text-ink-faint">至</span>
          <Input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="w-auto"
            aria-label="預約結束日"
            title="預約結束日"
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              onClick={() => {
                setDateFrom('');
                setDateTo('');
              }}
              className="rounded-lg px-2 py-1 text-xs font-semibold text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
              aria-label="清除日期篩選"
            >
              清除
            </button>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-3 sm:ml-auto">
          <Link
            href="/admin/orders/new"
            className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-3.5 py-2 text-xs font-bold text-white shadow-brand transition-transform hover:scale-[1.03] active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            新增工單
          </Link>
          <p className="text-xs text-ink-faint sm:text-right">共 {filtered.length} 張</p>
        </div>
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
          const whatsappUrl = buildWhatsappUrl(
            order.customerPhone,
            `你好，我是 CathyRepair 凱西維修的${currentUser?.name ?? '客服'}，想跟進你 ${order.orderNo} 的維修進度 🙏`,
          );
          const editHref = `/admin/orders/${encodeURIComponent(order.orderNo)}`;

          return (
            <article
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white shadow-card transition-shadow duration-200 hover:shadow-lift"
            >
              {/* 點擊上半部進入編輯（互動元素按鈕在外部，避免錨點嵌套） */}
              <Link
                href={editHref}
                className="block rounded-t-2xl p-4 outline-none transition-colors hover:bg-slate-50/70 focus-visible:bg-slate-50 sm:p-5"
                aria-label={`編輯工單 ${order.orderNo}`}
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
                      <span className="hidden text-[0.65rem] text-ink-faint sm:inline">（點擊卡片編輯）</span>
                    </div>

                    <div className="mt-2 grid gap-x-6 gap-y-1 text-xs text-ink-muted sm:grid-cols-2 lg:grid-cols-4">
                      <p>
                        <span className="text-ink-faint">客戶：</span>
                        <span className="font-semibold text-ink">{order.customerName}</span>
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

                  <div className="flex shrink-0 flex-col items-end gap-1">
                    <p className="flex items-center gap-1.5 text-xl font-extrabold leading-none text-brand-600">
                      {formatHKD(effectivePrice(order))}
                      {isDiscounted(order) ? (
                        <span className="rounded bg-emerald-50 px-1 text-[0.6rem] font-bold text-emerald-700">
                          優惠
                        </span>
                      ) : null}
                    </p>
                    <p className="text-[0.7rem] text-ink-faint">
                      {order.serviceMode === 'walk_in'
                        ? `到店・${order.shopName ?? ''}`
                        : '郵寄送修'}
                    </p>
                  </div>
                </div>
              </Link>

              {/* 電話 + WhatsApp（按鈕獨立於 Link 之外，符合 HTML5 規範） */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 px-4 py-2.5 sm:px-5">
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] uppercase tracking-wide text-ink-faint">電話</span>
                  <span className="font-mono text-sm font-semibold text-ink">
                    {formatPhone(order.customerPhone)}
                  </span>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`WhatsApp 聯絡 ${order.customerName}`}
                    title="WhatsApp 聯絡客戶"
                    className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#25D366] text-white shadow-sm transition-transform hover:scale-105 active:scale-95"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                </div>
                <span className="text-[0.65rem] text-ink-faint">
                  客戶電話已顯示 ・ 點卡片上方進入編輯
                </span>
              </div>

              {/* 列印 / 推進等互動按鈕（獨立於 Link 之外） */}
              <div className="flex flex-wrap items-center justify-end gap-2 rounded-b-2xl border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:px-5">
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
        order={printTarget?.type === 'receipt' ? printTarget.order : undefined}
      >
        {printTarget?.type === 'label' ? <RepairLabel order={printTarget.order} /> : null}
        {printTarget?.type === 'receipt' ? <Receipt order={printTarget.order} /> : null}
      </PrintDialog>
    </div>
  );
}
