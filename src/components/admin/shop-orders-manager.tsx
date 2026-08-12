'use client';

import * as React from 'react';
import { AlertTriangle, CheckCircle2, Loader2, Pencil } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Modal } from '../../components/ui/modal';
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

const STATUS_META: Record<ShopOrderStatus, { label: string; tone: string; description: string }> = {
  pending: {
    label: '待付款',
    tone: 'bg-amber-100 text-amber-700',
    description: '客戶尚未付款，訂單仍在等待核帳。',
  },
  paid: {
    label: '已付款',
    tone: 'bg-blue-100 text-blue-700',
    description: '已收到款項，準備包裝出貨或安排取貨。',
  },
  shipped: {
    label: '已出貨',
    tone: 'bg-purple-100 text-purple-700',
    description: '已交給物流，送貨上門的訂單正在路上。',
  },
  picked: {
    label: '已取貨',
    tone: 'bg-indigo-100 text-indigo-700',
    description: '客戶已親自取貨或由順豐代收。',
  },
  completed: {
    label: '已完成',
    tone: 'bg-emerald-100 text-emerald-700',
    description: '訂單全流程完結，計入最終營收。',
  },
  cancelled: {
    label: '已取消',
    tone: 'bg-red-100 text-red-700',
    description: '訂單取消，不計入營收。',
  },
};

const FULFILL_LABEL: Record<ShopOrder['fulfillment'], string> = {
  delivery: '送貨上門',
  pickup: '到店自取',
};

/** 高風險操作：付款、出貨、取貨、完成、取消；這些一經變更就會影響帳目或客戶履約。 */
const HIGH_RISK_STATUSES: ShopOrderStatus[] = ['paid', 'shipped', 'picked', 'completed', 'cancelled'];

export function ShopOrdersManager({ initialOrders }: ShopOrdersManagerProps) {
  const [orders, setOrders] = React.useState<ShopOrder[]>(initialOrders);
  const [filter, setFilter] = React.useState<ShopOrderStatus | 'all'>('all');
  const [savingId, setSavingId] = React.useState<string | null>(null);

  // 狀態切換確認彈窗
  const [pendingStatusChange, setPendingStatusChange] = React.useState<{
    order: ShopOrder;
    nextStatus: ShopOrderStatus;
  } | null>(null);

  // 編輯彈窗
  const [editingOrder, setEditingOrder] = React.useState<ShopOrder | null>(null);

  const visible =
    filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  const advance = (order: ShopOrder) => {
    const idx = STATUS_FLOW.indexOf(order.status);
    const next = STATUS_FLOW[idx + 1];
    if (!next) return;
    setPendingStatusChange({ order, nextStatus: next });
  };

  const requestStatusChange = (order: ShopOrder, next: ShopOrderStatus) => {
    if (next === order.status) return;
    // 已完成 / 已取消不可再隨意改回（防止誤按把帳目弄亂）
    if ((order.status === 'completed' || order.status === 'cancelled') && next !== order.status) {
      setPendingStatusChange({ order, nextStatus: next });
      return;
    }
    // 低風險（pending → paid 之類關鍵步驟）也要確認
    setPendingStatusChange({ order, nextStatus: next });
  };

  const confirmStatusChange = async () => {
    if (!pendingStatusChange) return;
    const { order, nextStatus } = pendingStatusChange;
    setSavingId(order.id);
    setPendingStatusChange(null);
    // 樂觀更新
    const previous = orders;
    setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status: nextStatus } : o)));
    try {
      const res = await fetch('/api/admin/shop-orders', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: nextStatus }),
      });
      if (!res.ok) throw new Error('更新失敗');
    } catch {
      // 回滾
      setOrders(previous);
      alert('狀態更新失敗，已自動復原。請稍後再試。');
    } finally {
      setSavingId(null);
    }
  };

  const saveEdit = async (
    orderId: string,
    patch: { customerName: string; customerPhone: string; remark?: string },
  ) => {
    setSavingId(orderId);
    const previous = orders;
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, ...patch } : o)),
    );
    try {
      // 暫時複用 PATCH API，未來可擴展為支援 customer 欄位更新
      const res = await fetch(`/api/admin/shop-orders/${encodeURIComponent(orderId)}/customer`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(patch),
      });
      if (!res.ok) {
        // API 尚未實作：仍以本地狀態保存，提示稍後再同步
        if (res.status === 404) {
          alert('伺服器端編輯 API 尚未啟用，本次僅保存在瀏覽器內；重新整理後會還原。');
        } else {
          throw new Error('更新失敗');
        }
      }
    } catch (e) {
      setOrders(previous);
      alert(e instanceof Error ? e.message : '更新失敗，已復原。');
    } finally {
      setSavingId(null);
      setEditingOrder(null);
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
                      {/* 狀態下拉：選擇後彈窗確認，避免誤觸 */}
                      <select
                        value={o.status}
                        disabled={savingId === o.id}
                        onChange={(e) =>
                          requestStatusChange(o, e.target.value as ShopOrderStatus)
                        }
                        title="切換狀態會彈出確認視窗"
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
                          title="推進到下一個狀態（會彈出確認）"
                        >
                          {savingId === o.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            '推進'
                          )}
                        </Button>
                      )}
                      {/* 編輯入口：可改客戶姓名 / 電話 / 備註（金額、商品、訂單號不可改） */}
                      <button
                        type="button"
                        onClick={() => setEditingOrder(o)}
                        disabled={savingId === o.id}
                        aria-label={`編輯訂單 ${o.orderNo} 的客戶資料`}
                        title="編輯客戶姓名 / 電話 / 備註"
                        className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-ink-muted transition-colors hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-50"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
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

      {/* 狀態切換確認彈窗 */}
      <Modal
        open={!!pendingStatusChange}
        onClose={() => setPendingStatusChange(null)}
        size="sm"
        title={
          <span className="inline-flex items-center gap-2">
            <AlertTriangle
              className={`h-4 w-4 ${
                HIGH_RISK_STATUSES.includes(pendingStatusChange?.nextStatus ?? 'pending')
                  ? 'text-amber-500'
                  : 'text-brand-500'
              }`}
            />
            確認訂單狀態變更？
          </span>
        }
        description={
          pendingStatusChange?.nextStatus &&
          STATUS_META[pendingStatusChange.nextStatus].description
        }
        footer={
          <>
            <Button variant="ghost" onClick={() => setPendingStatusChange(null)}>
              取消
            </Button>
            <Button onClick={confirmStatusChange}>
              <CheckCircle2 className="h-3.5 w-3.5" /> 確認變更狀態
            </Button>
          </>
        }
      >
        {pendingStatusChange && (
          <div className="space-y-3 text-sm">
            <div className="rounded-xl border border-slate-200 bg-surface-soft p-3 text-xs">
              <p>
                <span className="text-ink-faint">訂單：</span>
                <span className="font-mono font-bold text-ink">
                  {pendingStatusChange.order.orderNo}
                </span>
              </p>
              <p className="mt-1">
                <span className="text-ink-faint">客戶：</span>
                <span className="text-ink">
                  {pendingStatusChange.order.customerName}
                </span>
                <span className="ml-1 text-ink-faint">
                  ({pendingStatusChange.order.customerPhone})
                </span>
              </p>
              <p className="mt-1">
                <span className="text-ink-faint">金額：</span>
                <span className="font-bold tabular text-ink">
                  {formatHKD(pendingStatusChange.order.price * pendingStatusChange.order.qty)}
                </span>
              </p>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm">
              <span
                className={`rounded-full px-2.5 py-1 text-[0.7rem] font-bold ${
                  STATUS_META[pendingStatusChange.order.status].tone
                }`}
              >
                {STATUS_META[pendingStatusChange.order.status].label}
              </span>
              <span className="text-ink-muted">→</span>
              <span
                className={`rounded-full px-2.5 py-1 text-[0.7rem] font-bold ${
                  STATUS_META[pendingStatusChange.nextStatus].tone
                }`}
              >
                {STATUS_META[pendingStatusChange.nextStatus].label}
              </span>
            </div>

            {HIGH_RISK_STATUSES.includes(pendingStatusChange.nextStatus) && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-700">
                ⚠ 此變更會影響帳目或客戶履約狀態，請確認資料無誤後再點擊「確認變更」。
              </p>
            )}
          </div>
        )}
      </Modal>

      {/* 編輯客戶資料彈窗 */}
      <EditOrderModal
        order={editingOrder}
        saving={!!savingId && savingId === editingOrder?.id}
        onClose={() => setEditingOrder(null)}
        onSave={(patch) => editingOrder && saveEdit(editingOrder.id, patch)}
      />
    </div>
  );
}

interface EditOrderModalProps {
  order: ShopOrder | null;
  saving: boolean;
  onClose: () => void;
  onSave: (patch: { customerName: string; customerPhone: string; remark?: string }) => void;
}

function EditOrderModal({ order, saving, onClose, onSave }: EditOrderModalProps) {
  const [name, setName] = React.useState('');
  const [phone, setPhone] = React.useState('');
  const [remark, setRemark] = React.useState('');

  React.useEffect(() => {
    if (order) {
      setName(order.customerName);
      setPhone(order.customerPhone);
      setRemark(order.remark ?? '');
    }
  }, [order]);

  if (!order) return null;

  return (
    <Modal
      open={!!order}
      onClose={onClose}
      size="md"
      title={`編輯訂單 ${order.orderNo}`}
      description="只可修改客戶姓名、電話、備註。金額、商品、訂單號已鎖定，避免破壞帳目。"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={saving}>
            取消
          </Button>
          <Button
            onClick={() => onSave({ customerName: name.trim(), customerPhone: phone.trim(), remark })}
            disabled={saving || !name.trim() || !phone.trim()}
          >
            {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            儲存修改
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm">
        <div className="rounded-xl border border-slate-200 bg-surface-soft p-3 text-xs">
          <p>
            <span className="text-ink-faint">商品：</span>
            <span className="font-bold text-ink">{order.productName}</span>
          </p>
          <p className="mt-1">
            <span className="text-ink-faint">金額：</span>
            <span className="font-bold tabular text-ink">
              {formatHKD(order.price * order.qty)}
            </span>
          </p>
        </div>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">客戶姓名</span>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            placeholder="例：陳大文"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">聯絡電話</span>
          <input
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400 tabular"
            placeholder="例：9123 4567 / 0912345678"
          />
        </label>

        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">備註（可選）</span>
          <textarea
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-brand-400"
            placeholder="內部備註，如客戶特殊要求、出貨偏好…"
          />
        </label>
      </div>
    </Modal>
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
