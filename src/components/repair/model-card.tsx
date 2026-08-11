'use client';

import * as React from 'react';
import { Check, Flame, Laptop, Smartphone, Tablet, Watch } from 'lucide-react';
import { cn } from '../../lib/utils';
import { getModelImage, tierLabel } from '../../data/devices';
import type { DeviceCategory, DeviceModel } from '../../types';

const thumbIcon = (cat: DeviceCategory) => {
  if (cat === 'watch') return Watch;
  if (cat === 'ipad') return Tablet;
  if (cat === 'macbook') return Laptop;
  return Smartphone;
};

/**
 * 杂志式竖排大卡：
 * ① 顶部 112px 高的图片展示位（缩略图比之前大 65%）
 * ② 名称全宽显示（不再 truncate），最长 "iPhone 17 Pro Max" 也完整呈现
 * ③ 底部状态条：左侧「已選取 / 點擊選型號」；右侧显眼 selected 圆圈
 * 整张卡片高度统一，方便客户快速扫视对比型号
 */
export function ModelCard({
  model,
  selected,
  onSelect,
}: {
  model: DeviceModel;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const Thumb = thumbIcon(model.category);
  const image = getModelImage(model);
  return (
    <button
      key={model.id}
      type="button"
      onClick={() => onSelect(model.id)}
      aria-pressed={selected}
      className={cn(
        'product-card group relative flex h-full w-full cursor-pointer flex-col items-stretch overflow-hidden rounded-2xl border p-3.5 text-left box-border transition-all duration-200 ease-smooth',
        selected
          ? 'border-brand-500 bg-brand-50/70 shadow-card ring-1 ring-brand-300'
          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-200 hover:bg-surface-soft hover:shadow-card',
      )}
    >
      {/* 图片位 */}
      <span
        className={cn(
          'relative flex h-[112px] w-full items-center justify-center overflow-hidden rounded-xl',
          image ? 'bg-white' : 'bg-brand-50 text-brand-600',
        )}
      >
        {image ? (
          <img
            src={image}
            alt={model.name}
            className="max-h-[100px] w-auto max-w-[80%] object-contain transition-transform duration-300 ease-smooth group-hover:scale-105"
          />
        ) : (
          <Thumb className="h-10 w-10" strokeWidth={2} />
        )}

        {model.hot ? (
          <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[10px] font-bold text-accent-600 shadow-sm ring-1 ring-accent-200">
            <Flame className="h-2.5 w-2.5" />
            熱門
          </span>
        ) : null}
      </span>

      {/* 名称 + 描述 */}
      <span className="mt-3 flex-1">
        <span className="block break-words text-[0.98rem] font-extrabold leading-snug text-ink">
          {model.name}
        </span>
        <span className="mt-1 block text-[0.74rem] text-ink-faint">
          {model.year} 年・{tierLabel[model.tier]}
        </span>
      </span>

      {/* 底部状态条：年份・级别 | 选中圆圈 */}
      <span
        className={cn(
          'mt-3 flex items-center justify-between rounded-lg border px-2.5 py-1.5 transition-colors duration-200',
          selected ? 'border-brand-200 bg-brand-100/50' : 'border-slate-100 bg-surface-soft',
        )}
      >
        <span className="text-[11px] font-semibold text-ink-muted">
          {selected ? '已選取' : '點擊選型號'}
        </span>
        <span
          className={cn(
            'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
            selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 bg-white',
          )}
        >
          {selected ? <Check className="h-3 w-3" strokeWidth={3.5} /> : null}
        </span>
      </span>
    </button>
  );
}
