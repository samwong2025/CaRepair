'use client';

import * as React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  Loader2,
  Minus,
  PackageX,
  Pencil,
  Plus,
  History,
  Save,
  X,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { InventoryAlertBanner } from './inventory-alert-banner';
import { getRepository } from '../../lib/repositories';
import { formatHKD } from '../../lib/format';
import {
  STOCK_MOVEMENT_LABELS,
  type InventoryAlert,
  type Part,
  type StockMovement,
  type StockMovementType,
} from '../../types';

const TYPE_TONE: Record<StockMovementType, string> = {
  inbound: 'bg-emerald-100 text-emerald-700',
  outbound: 'bg-rose-100 text-rose-700',
  adjust: 'bg-amber-100 text-amber-700',
};

interface InventoryManagerProps {
  initialInventory: Part[];
  initialAlerts: InventoryAlert[];
}

export function InventoryManager({ initialInventory, initialAlerts }: InventoryManagerProps) {
  const [inventory, setInventory] = React.useState<Part[]>(initialInventory);
  const [alerts, setAlerts] = React.useState<InventoryAlert[]>(initialAlerts);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [ledgerId, setLedgerId] = React.useState<string | null>(null);
  const [movementPart, setMovementPart] = React.useState<Part | null>(null);

  const updateLocal = (id: string, patch: Partial<Part>) => {
    setInventory((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const adjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)),
    );
  };

  const save = async (part: Part) => {
    setSavingId(part.id);
    try {
      await getRepository().upsertInventory(part);
    } finally {
      setSavingId(null);
    }
  };

  React.useEffect(() => {
    setAlerts(computeAlertsLocal(inventory));
  }, [inventory]);

  return (
    <div className="space-y-4">
      <InventoryAlertBanner alerts={alerts} />

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-ink-faint">
                <th className="py-2 pr-3 font-semibold">配件</th>
                <th className="py-2 pr-3 font-semibold">SKU</th>
                <th className="py-2 pr-3 font-semibold">庫存</th>
                <th className="py-2 pr-3 font-semibold">預警線</th>
                <th className="py-2 pr-3 font-semibold">成本</th>
                <th className="py-2 pr-3 font-semibold">報價</th>
                <th className="py-2 font-semibold">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inventory.map((part) => {
                const low = part.stock <= part.lowStockThreshold;
                const out = part.stock <= 0;
                return (
                  <tr key={part.id} className={out ? 'bg-red-50/40' : low ? 'bg-amber-50/40' : ''}>
                    <td className="py-3 pr-3">
                      <p className="font-bold text-ink">{part.name}</p>
                      {out ? (
                        <span className="mt-0.5 inline-flex items-center gap-1 text-[0.65rem] font-bold text-red-500">
                          <PackageX className="h-3 w-3" /> 缺貨
                        </span>
                      ) : low ? (
                        <span className="mt-0.5 inline-block text-[0.65rem] font-bold text-amber-600">
                          低於預警
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-3 font-mono text-xs text-ink-muted">{part.sku ?? '—'}</td>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => adjustStock(part.id, -1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-muted"
                          aria-label="減少庫存"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <input
                          type="number"
                          min={0}
                          value={part.stock}
                          onChange={(e) =>
                            updateLocal(part.id, { stock: Math.max(0, Number(e.target.value) || 0) })
                          }
                          className="tabular w-16 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm"
                        />
                        <button
                          type="button"
                          onClick={() => adjustStock(part.id, 1)}
                          className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-muted"
                          aria-label="增加庫存"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <input
                        type="number"
                        min={0}
                        value={part.lowStockThreshold}
                        onChange={(e) =>
                          updateLocal(part.id, {
                            lowStockThreshold: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                        className="tabular w-14 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm"
                      />
                    </td>
                    <td className="py-3 pr-3 tabular text-ink-muted">{formatHKD(part.unitCost)}</td>
                    <td className="py-3 pr-3 tabular text-ink-muted">
                      {part.unitPrice != null ? formatHKD(part.unitPrice) : '—'}
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={savingId === part.id}
                          onClick={() => save(part)}
                        >
                          {savingId === part.id ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <Save className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setMovementPart(part)}
                          title="入庫 / 出庫 / 盤點調整"
                        >
                          <ArrowDownLeft className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setLedgerId(part.id)}
                          title="查看異動流水"
                        >
                          <History className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {movementPart && (
        <MovementDialog
          part={movementPart}
          onClose={() => setMovementPart(null)}
          onDone={(updated) => {
            setInventory((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
            setMovementPart(null);
          }}
        />
      )}

      {ledgerId && (
        <LedgerDialog
          part={inventory.find((p) => p.id === ledgerId) as Part}
          onClose={() => setLedgerId(null)}
        />
      )}
    </div>
  );
}

function MovementDialog({
  part,
  onClose,
  onDone,
}: {
  part: Part;
  onClose: () => void;
  onDone: (part: Part) => void;
}) {
  const [type, setType] = React.useState<StockMovementType>('inbound');
  const [qty, setQty] = React.useState(1);
  const [unitCost, setUnitCost] = React.useState(part.unitCost || 0);
  const [note, setNote] = React.useState('');
  const [saving, setSaving] = React.useState(false);

  const submit = async () => {
    if (qty <= 0) return;
    setSaving(true);
    try {
      const { movement, part: updated } = await getRepository().addStockMovement({
        part,
        type,
        qty,
        unitCost: type === 'inbound' ? unitCost : part.unitCost,
        note,
      });
      void movement;
      onDone(updated);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-ink">庫存異動・{part.name}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mb-4 text-sm text-ink-muted">
          目前庫存 <span className="font-bold text-ink">{part.stock}</span> 件
        </p>

        <div className="mb-4 grid grid-cols-3 gap-2">
          {(['inbound', 'outbound', 'adjust'] as StockMovementType[]).map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-xl border px-2 py-2.5 text-xs font-bold transition-colors ${
                type === t
                  ? 'border-brand-300 bg-brand-50 text-brand-700'
                  : 'border-slate-200 text-ink-muted hover:bg-slate-50'
              }`}
            >
              {STOCK_MOVEMENT_LABELS[t]}
            </button>
          ))}
        </div>

        <label className="mb-3 block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">
            {type === 'adjust' ? '盤後結餘數量' : '異動數量'}
          </span>
          <input
            type="number"
            min={0}
            value={qty}
            onChange={(e) => setQty(Math.max(0, Number(e.target.value) || 0))}
            className="form-input tabular"
          />
        </label>

        {type === 'inbound' && (
          <label className="mb-3 block">
            <span className="mb-1 block text-xs font-semibold text-ink-muted">入庫單價（成本，HK$）</span>
            <input
              type="number"
              min={0}
              value={unitCost}
              onChange={(e) => setUnitCost(Math.max(0, Number(e.target.value) || 0))}
              className="form-input tabular"
            />
          </label>
        )}

        <label className="mb-5 block">
          <span className="mb-1 block text-xs font-semibold text-ink-muted">備註（選填）</span>
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="採購單號 / 盤點原因 / 關聯工單"
            className="form-input"
          />
        </label>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={submit} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            確認異動
          </Button>
        </div>
      </div>
    </div>
  );
}

function LedgerDialog({ part, onClose }: { part: Part; onClose: () => void }) {
  const [movements, setMovements] = React.useState<StockMovement[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let active = true;
    getRepository()
      .listStockMovements()
      .then((list) => {
        if (active)
          setMovements(list.filter((m) => m.partId === part.id));
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [part.id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-ink">異動流水・{part.name}</h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        {loading ? (
          <p className="py-10 text-center text-sm text-ink-faint">載入中…</p>
        ) : (
          <div className="space-y-2">
            {movements.length === 0 && (
              <p className="py-10 text-center text-sm text-ink-faint">尚無異動紀錄</p>
            )}
            {movements.map((m) => (
              <div
                key={m.id}
                className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <span className={`rounded-full px-2 py-0.5 text-[0.65rem] font-bold ${TYPE_TONE[m.type]}`}>
                  {STOCK_MOVEMENT_LABELS[m.type]}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">
                    {m.type === 'outbound' ? '−' : '+'}
                    {m.qty} 件
                    <span className="ml-2 text-xs font-normal text-ink-faint">
                      結餘 {m.balance}
                    </span>
                  </p>
                  {m.note && <p className="truncate text-xs text-ink-faint">{m.note}</p>}
                </div>
                <span className="shrink-0 text-[0.7rem] text-ink-faint">
                  {new Date(m.createdAt).toLocaleString('zh-HK')}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function computeAlertsLocal(parts: Part[]): InventoryAlert[] {
  const list: InventoryAlert[] = [];
  for (const part of parts) {
    if (part.stock <= 0) {
      list.push({ part, level: 'out', message: `「${part.name}」庫存為 0，請立即補貨` });
    } else if (part.stock <= part.lowStockThreshold) {
      list.push({
        part,
        level: 'low',
        message: `「${part.name}」僅餘 ${part.stock} 件（低於預警 ${part.lowStockThreshold}）`,
      });
    }
  }
  return list;
}
