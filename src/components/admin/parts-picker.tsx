'use client';

import { Minus, Plus, PackageSearch } from 'lucide-react';
import type { Part, UsedPart } from '../../types';
import { PartStockBadge } from './inventory-alert-banner';

interface PartsPickerProps {
  inventory: Part[];
  selected: UsedPart[];
  onChange: (next: UsedPart[]) => void;
  deviceCategory?: string;
  symptomIds?: string[];
}

/** 師傅在工單上「選擇庫存配件」：依機型 / 故障篩選，含庫存警告 */
export function PartsPicker({ inventory, selected, onChange, deviceCategory, symptomIds = [] }: PartsPickerProps) {
  const candidates = inventory.filter((p) => {
    if (p.deviceCategory && deviceCategory && p.deviceCategory !== deviceCategory) return false;
    if (p.symptomId && symptomIds.length && !symptomIds.includes(p.symptomId)) return false;
    return true;
  });

  const selectedIds = new Set(selected.map((s) => s.partId));

  const updateQty = (partId: string, qty: number) => {
    if (qty <= 0) {
      onChange(selected.filter((s) => s.partId !== partId));
      return;
    }
    const part = inventory.find((p) => p.id === partId);
    if (!part) return;
    const exists = selected.find((s) => s.partId === partId);
    if (exists) {
      onChange(selected.map((s) => (s.partId === partId ? { ...s, qty } : s)));
    } else {
      onChange([
        ...selected,
        {
          partId: part.id,
          name: part.name,
          qty,
          unitCost: part.unitCost,
          category: part.category,
        },
      ]);
    }
  };

  const qtyOf = (partId: string) => selected.find((s) => s.partId === partId)?.qty ?? 0;

  return (
    <div className="space-y-2">
      <p className="text-xs font-bold text-ink-muted">選擇庫存配件（依機型 / 故障自動篩選）</p>
      {candidates.length === 0 && (
        <p className="text-xs text-ink-faint">此機型 / 故障尚無對應庫存配件</p>
      )}
      <div className="grid gap-2 sm:grid-cols-2">
        {candidates.map((part) => {
          const qty = qtyOf(part.id);
          const checked = selectedIds.has(part.id);
          const insufficient = part.stock > 0 && qty > part.stock;
          return (
            <div
              key={part.id}
              className={`flex items-center gap-3 rounded-xl border p-3 transition-colors ${
                checked ? 'border-brand-300 bg-brand-50/50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink">{part.name}</p>
                <div className="mt-1 flex items-center gap-2">
                  <PartStockBadge part={part} />
                  {part.unitPrice != null && (
                    <span className="text-[0.65rem] text-ink-faint">報價 ${part.unitPrice}</span>
                  )}
                </div>
                {insufficient && (
                  <p className="mt-1 text-[0.65rem] font-bold text-red-500">
                    數量超過庫存（剩 {part.stock}）
                  </p>
                )}
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => updateQty(part.id, qty - 1)}
                  disabled={qty <= 0}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-muted disabled:opacity-40"
                  aria-label="減少"
                >
                  <Minus className="h-3.5 w-3.5" />
                </button>
                <span className="tabular w-6 text-center text-sm font-extrabold text-ink">{qty}</span>
                <button
                  type="button"
                  onClick={() => updateQty(part.id, qty + 1)}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 bg-white text-ink-muted"
                  aria-label="增加"
                >
                  <Plus className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
      {selected.length > 0 && (
        <div className="rounded-xl bg-slate-50 p-3 text-xs text-ink-muted">
          已選配件：
          {selected.map((s) => `${s.name}×${s.qty}`).join('、')}；成本合計 $
          {selected.reduce((sum, s) => sum + s.unitCost * s.qty, 0)}
        </div>
      )}
      <p className="flex items-center gap-1 text-[0.65rem] text-ink-faint">
        <PackageSearch className="h-3 w-3" />
        配件與報價自動連動，提交後寫入工單時間軸
      </p>
    </div>
  );
}
