'use client';

import { Clock3, ShieldCheck, Smartphone, Sparkles, Tag } from 'lucide-react';
import { formatHKD } from '../../lib/format';
import { formatDuration } from '../../lib/quote-engine';
import type { DeviceModel, Quote } from '../../types';

/** 側邊即時報價摘要，貫穿四個步驟 */
export function QuoteSummary({
  model,
  quote,
  symptomNames,
}: {
  model: DeviceModel | undefined;
  quote: Quote;
  symptomNames: string[];
}) {
  const hasItems = quote.items.length > 0;

  return (
    <aside className="min-w-0 lg:sticky lg:top-28">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="bg-brand-gradient px-5 py-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">
            Live Quote
          </p>
          <p className="mt-1 text-lg font-extrabold text-white">預估報價</p>
        </div>

        <div className="space-y-4 px-5 py-5">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <Smartphone className="h-5 w-5" strokeWidth={2} />
            </span>
            <div className="min-w-0">
              <p className="text-xs text-ink-faint">維修產品</p>
              <p className="mt-0.5 text-[0.95rem] font-bold text-ink">
                {model ? model.name : '未選擇'}
              </p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <p className="flex items-center gap-1.5 text-xs text-ink-faint">
              <Tag className="h-3.5 w-3.5" />
              已選故障（{symptomNames.length}）
            </p>
            {symptomNames.length > 0 ? (
              <ul className="mt-2 space-y-1.5">
                {symptomNames.map((name) => (
                  <li key={name} className="flex items-center gap-2 text-sm font-semibold text-ink">
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand-500" />
                    {name}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-ink-faint">仲未揀故障項目</p>
            )}
          </div>

          {hasItems ? (
            <div className="space-y-2 border-t border-slate-100 pt-4 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">配件費</span>
                <span className="font-semibold text-ink">{formatHKD(quote.partsTotal)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink-muted">人工費</span>
                <span className="font-semibold text-ink">{formatHKD(quote.laborTotal)}</span>
              </div>
              {quote.bundleDiscount > 0 ? (
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-semibold text-accent-600">
                    <Sparkles className="h-3.5 w-3.5" />
                    套餐折扣
                  </span>
                  <span className="font-bold text-accent-600">
                    −{formatHKD(quote.bundleDiscount)}
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="flex items-end justify-between border-t border-slate-100 pt-4">
            <span className="text-sm font-bold text-ink">預計總額</span>
            <span className="text-2xl font-extrabold leading-none text-brand-600">
              {hasItems ? formatHKD(quote.total) : '到店報價'}
            </span>
          </div>

          {hasItems ? (
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-4">
              <div className="rounded-xl bg-surface-soft px-3 py-2.5">
                <p className="flex items-center gap-1 text-[0.68rem] text-ink-faint">
                  <Clock3 className="h-3 w-3" />
                  預計工時
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-ink">
                  {formatDuration(quote.estimatedMinutes)}
                </p>
              </div>
              <div className="rounded-xl bg-surface-soft px-3 py-2.5">
                <p className="flex items-center gap-1 text-[0.68rem] text-ink-faint">
                  <ShieldCheck className="h-3 w-3" />
                  保養期
                </p>
                <p className="mt-0.5 text-sm font-extrabold text-ink">{quote.warrantyDays} 日</p>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <p className="mt-3 px-1 text-[0.7rem] leading-relaxed text-ink-faint">
        網上報價僅供參考，最終收費以現場師傅檢測後報價為準；免費檢測，唔修唔收費。
      </p>
    </aside>
  );
}
