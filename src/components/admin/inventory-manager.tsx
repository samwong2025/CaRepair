'use client';

import * as React from 'react';
import { Loader2, Minus, PackageX, Plus, Save } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { InventoryAlertBanner } from './inventory-alert-banner';
import { getRepository } from '../../lib/repositories';
import { formatHKD } from '../../lib/format';
import type { InventoryAlert, Part } from '../../types';

interface InventoryManagerProps {
  initialInventory: Part[];
  initialAlerts: InventoryAlert[];
}

export function InventoryManager({ initialInventory, initialAlerts }: InventoryManagerProps) {
  const [inventory, setInventory] = React.useState<Part[]>(initialInventory);
  const [alerts, setAlerts] = React.useState<InventoryAlert[]>(initialAlerts);
  const [savingId, setSavingId] = React.useState<string | null>(null);

  const updateLocal = (id: string, patch: Partial<Part>) => {
    setInventory((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  };

  const adjustStock = (id: string, delta: number) => {
    setInventory((prev) =>
      prev.map((p) =>
        p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
      ),
    );
  };

  const save = async (part: Part) => {
    setSavingId(part.id);
    try {
      const repo = getRepository();
      await repo.upsertInventory(part);
      const newAlerts = computeAlertsLocal([...inventory]);
      setAlerts(newAlerts);
    } finally {
      setSavingId(null);
    }
  };

  // 每次庫存變動即時重算告警（前端預覽）
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
                          updateLocal(part.id, { lowStockThreshold: Math.max(0, Number(e.target.value) || 0) })
                        }
                        className="tabular w-14 rounded-lg border border-slate-200 px-2 py-1 text-center text-sm"
                      />
                    </td>
                    <td className="py-3 pr-3 tabular text-ink-muted">{formatHKD(part.unitCost)}</td>
                    <td className="py-3 pr-3 tabular text-ink-muted">
                      {part.unitPrice != null ? formatHKD(part.unitPrice) : '—'}
                    </td>
                    <td className="py-3">
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
                        儲存
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
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
