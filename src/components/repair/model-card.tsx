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
 * 杂志式竖排大卡（v2）：
 * ① 图区改为 min-h-[180px] 弹性高度，让缩略图真正占满空间，不再留白
 * ② 图片上限 160px / 88%，透明 PNG 在 brand-50 渐变底色上更融入
 * ③ 「熱門」徽章缩到 9px 文案，整体不抢图视觉
 * ④ 状态条文字加粗加色，更显眼
 * 整张卡片在 4 列网格下高度约 280px，图文比例约 6:4，留白舒展
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
        'product-card group relative flex h-full min-h-[260px] w-full cursor-pointer flex-col items-stretch overflow-hidden rounded-2xl border p-3 text-left box-border transition-all duration-200 ease-smooth',
        selected
          ? 'border-brand-500 bg-brand-50/70 shadow-card ring-1 ring-brand-300'
          : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-200 hover:bg-surface-soft hover:shadow-card',
      )}
    >
      {/* 图片位：渐变底色 + 弹性高度，让缩略图真正撑满 */}
      <span
        className={cn(
          'relative flex min-h-[180px] w-full flex-1 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br',
          image ? 'from-brand-50/70 via-white to-surface-soft' : 'bg-brand-50 text-brand-600',
        )}
      >
        {image ? (
          <img
            src={image}
            alt={model.name}
            className="max-h-[160px] w-auto max-w-[88%] object-contain transition-transform duration-300 ease-smooth group-hover:animate-bounce-soft"
          />
        ) : (
          <Thumb className="h-12 w-12" strokeWidth={2} />
        )}

        {model.hot ? (
          <span className="absolute right-2 top-2 flex items-center gap-0.5 rounded-full bg-white/95 px-1.5 py-0.5 text-[9px] font-bold text-accent-600 shadow-sm ring-1 ring-accent-200">
            <Flame className="h-2.5 w-2.5" />
            熱門
          </span>
        ) : null}
      </span>

      {/* 名称 + 描述 */}
      <span className="mt-2.5">
        <span className="block break-words text-[0.98rem] font-extrabold leading-snug text-ink">
          {model.name}
        </span>
        <span className="mt-0.5 block text-[0.74rem] text-ink-faint">
          {model.year} 年・{tierLabel[model.tier]}
        </span>
      </span>

      {/* 底部状态条：年份・级别 | 选中圆圈 */}
      <span
        className={cn(
          'mt-2.5 flex items-center justify-between rounded-lg border px-2.5 py-2 transition-colors duration-200',
          selected ? 'border-brand-200 bg-brand-100/50' : 'border-slate-100 bg-surface-soft',
        )}
      >
        <span className="text-[12px] font-bold text-ink">
          {selected ? '✓ 已選取' : '點擊選型號'}
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
