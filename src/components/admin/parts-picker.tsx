'use client';

import { Minus, Plus, PackageSearch, Search, Sparkles, Wrench, X } from 'lucide-react';
import React from 'react';
import type { Part, UsedPart } from '../../types';
import { PartStockBadge } from './inventory-alert-banner';

interface PartsPickerProps {
  inventory: Part[];
  selected: UsedPart[];
  onChange: (next: UsedPart[]) => void;
  deviceCategory?: string;
  symptomIds?: string[];
}

/** 師傅在工單上「選擇庫存配件」：可自由選擇，亦支援依機型 / 故障智能篩選 */
export function PartsPicker({ inventory, selected, onChange, deviceCategory, symptomIds = [] }: PartsPickerProps) {
  /* 模式：smart = 依機型 / 故障過濾；all = 列出全部庫存；search = 關鍵字搜尋 */
  const [mode, setMode] = React.useState<'smart' | 'all'>('smart');
  const [query, setQuery] = React.useState('');

  const trimmed = query.trim().toLowerCase();
  const hasFilter = mode === 'smart' && (deviceCategory || symptomIds.length > 0);

  const filtered = inventory.filter((p) => {
    if (mode === 'smart') {
      if (p.deviceCategory && deviceCategory && p.deviceCategory !== deviceCategory) return false;
      if (p.symptomId && symptomIds.length && !symptomIds.includes(p.symptomId)) return false;
    }
    if (trimmed) {
      if (!p.name.toLowerCase().includes(trimmed) && !(p.category ?? '').toLowerCase().includes(trimmed)) {
        return false;
      }
    }
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

  const removeSelected = (partId: string) => {
    onChange(selected.filter((s) => s.partId !== partId));
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold text-ink-muted">
          <Wrench className="h-3.5 w-3.5" />
          選擇庫存配件（不鎖死，可自由挑選）
        </p>
        <div
          role="tablist"
          aria-label="配件篩選模式"
          className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5 text-[11px] font-bold"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'smart'}
            onClick={() => setMode('smart')}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
              mode === 'smart' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-muted'
            }`}
          >
            <Sparkles className="h-3 w-3" /> 智能篩選
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === 'all'}
            onClick={() => setMode('all')}
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 transition-colors ${
              mode === 'all' ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-muted'
            }`}
          >
            <PackageSearch className="h-3 w-3" /> 全部配件
          </button>
        </div>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-faint" />
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="以名稱 / 分類關鍵字快速尋找（例如：電池、屏幕）"
          className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-ink placeholder:text-ink-faint focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
          aria-label="關鍵字搜尋配件"
        />
        {trimmed && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-ink-faint hover:bg-slate-100 hover:text-ink"
            aria-label="清除搜尋"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {mode === 'smart' && !hasFilter && (
        <p className="rounded-lg bg-amber-50 px-3 py-2 text-[11px] font-medium text-amber-700">
          尚未選型號 / 故障，目前不會自動過濾；可輸入關鍵字搜尋或切換到「全部配件」。
        </p>
      )}

      {filtered.length === 0 && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-ink-faint">
          {trimmed
            ? `找不到符合「${query}」的配件`
            : mode === 'smart'
              ? '此機型 / 故障尚無對應庫存配件；可切換到「全部配件」自行挑選'
              : '目前沒有任何庫存配件'}
        </p>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {filtered.map((part) => {
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
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  {part.category && (
                    <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold text-ink-muted">
                      {part.category}
                    </span>
                  )}
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
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs">
          <p className="mb-2 font-bold text-ink-muted">已選配件（可點 ✕ 移除）</p>
          <ul className="space-y-1">
            {selected.map((s) => (
              <li
                key={s.partId}
                className="flex items-center justify-between gap-2 rounded-lg bg-white px-2.5 py-1.5"
              >
                <span className="truncate font-medium text-ink">
                  {s.name} <span className="text-ink-faint">× {s.qty}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-[0.65rem] text-ink-faint">成本 ${s.unitCost * s.qty}</span>
                  <button
                    type="button"
                    onClick={() => removeSelected(s.partId)}
                    className="rounded-full p-1 text-ink-faint hover:bg-red-50 hover:text-red-600"
                    aria-label={`移除 ${s.name}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-[0.65rem] font-bold text-ink-muted">
            成本合計 ${selected.reduce((sum, s) => sum + s.unitCost * s.qty, 0)}
          </p>
        </div>
      )}

      <p className="flex items-center gap-1 text-[0.65rem] text-ink-faint">
        <PackageSearch className="h-3 w-3" />
        配件與報價自動連動，提交後寫入工單時間軸
      </p>
    </div>
  );
}
