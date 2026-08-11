'use client';

import * as React from 'react';
import { Loader2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatHKD } from '../../lib/format';
import type { ShopOrder, ShopOrderStatus } from '../../types';

interface ShopOrdersManagerProps {
  initialOrders: ShopOrder[];
}

const STATUS_FLOW: ShopOrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'picked',
  'completed',
  'cancelled',
];

const STATUS_META: Record<ShopOrderStatus, { label: string; tone: string }> = {
  pending: { label: '待付款', tone: 'bg-amber-100 text-amber-700' },
  paid: { label: '已付款', tone: 'bg-blue-100 text-blue-700' },
  shipped: { label: '已出貨', tone: 'bg-purple-100 text-purple-700' },
  picked: { label: '已取貨', tone: 'bg-indigo-100 text-indigo-700' },
  completed: { label: '已完成', tone: 'bg-emerald-100 text-emerald-700' },
  cancelled: { label: '已取消', tone: 'bg-red-100 text-red-700' },
};

const FULFILL_LABEL: Record<ShopOrder['fulfillment'], string> = {
  delivery: '送貨上門',
  pickup: '到店自取',
};

export function ShopOrdersManager({ initialOrders }: ShopOrdersManagerProps) {
  const [orders, setOrders] = React.useState<ShopOrder[]>(initialOrders);
  const [filter, setFilter] = React.useState<ShopOrderStatus | 'all'>('all');
  const [savingId, setSavingId] = React.useState<string | null>(null);

  const visible =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const advance = async (order: ShopOrder) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    await updateStatus(order, next);
  };

  const updateStatus = async (order: ShopOrder, status: ShopOrderStatus) => {
    setSavingId(order.id);
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
    try {
      const res = await fetch('/api/admin/shop-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status }),
      });
      if (!res.ok) throw new Error('更新失敗');
    } catch {
      // 回滾
      setOrders((prev) => prev.map((o) => (o.id === order.id ? order : o)));
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <FilterChip label="全部" active={filter === 'all'} onClick={() => setFilter('all')} />
        {STATUS_FLOW.map((s) => (
          <FilterChip
            key={s}
            label={STATUS_META[s].label}
            active={filter === s}
            onClick={() => setFilter(s)}
          />
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-ink-faint">
                <th className="py-2.5 pr-3 pl-4 font-semibold">訂單編號</th>
                <th className="py-2.5 pr-3 font-semibold">商品</th>
                <th className="py-2.5 pr-3 font-semibold">客戶</th>
                <th className="py-2.5 pr-3 font-semibold">取貨方式</th>
                <th className="py-2.5 pr-3 font-semibold">金額</th>
                <th className="py-2.5 pr-3 font-semibold">狀態</th>
                <th className="py-2.5 pr-3 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {visible.map((o) => (
                <tr key={o.id} className="align-top">
                  <td className="py-3 pl-4 pr-3 font-mono text-xs text-ink-muted">{o.orderNo}</td>
                  <td className="py-3 pr-3">
                    <p className="font-bold text-ink">{o.productName}</p>
                    <p className="text-xs text-ink-faint">
                      {formatHKD(o.price)} × {o.qty}
                    </p>
                  </td>
                  <td className="py-3 pr-3">
                    <p className="text-ink">{o.customerName}</p>
                    <p className="text-xs text-ink-faint">{o.customerPhone}</p>
                  </td>
                  <td className="py-3 pr-3 text-xs text-ink-muted">
                    {FULFILL_LABEL[o.fulfillment]}
                    <br />
                    <span className="text-ink-faint">
                      {o.fulfillment === 'delivery'
                        ? o.deliveryAddress ?? '—'
                        : o.pickupShop ?? '—'}
                    </span>
                  </td>
                  <td className="py-3 pr-3 tabular font-bold text-ink">
                    {formatHKD(o.price * o.qty)}
                  </td>
                  <td className="py-3 pr-3">
                    <span
                      className={`inline-block rounded-full px-2.5 py-1 text-[0.7rem] font-bold ${STATUS_META[o.status].tone}`}
                    >
                      {STATUS_META[o.status].label}
                    </span>
                  </td>
                  <td className="py-3 pr-3">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <select
                        value={o.status}
                        disabled={savingId === o.id}
                        onChange={(e) => updateStatus(o, e.target.value as ShopOrderStatus)}
                        className="rounded-lg border border-slate-200 px-2 py-1 text-xs outline-none focus:border-brand-300"
                      >
                        {STATUS_FLOW.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_META[s].label}
                          </option>
                        ))}
                      </select>
                      {o.status !== 'completed' && o.status !== 'cancelled' && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingId === o.id}
                          onClick={() => advance(o)}
                        >
                          {savingId === o.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            '推進'
                          )}
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {visible.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-sm text-ink-faint">
                    沒有符合的訂單
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
        active ? 'bg-brand-gradient text-white shadow-brand' : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
      }`}
    >
      {label}
    </button>
  );
}
