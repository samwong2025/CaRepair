'use client';

import { BadgeCheck, Clock3, FlaskConical, Info, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { formatHKD } from '../../lib/format';
import { formatDuration, getBundleDiscountLabel } from '../../lib/quote-engine';
import { resolveIcon } from '../../lib/icons';
import { getSymptomById } from '../../data/symptoms';
import type { Quote } from '../../types';

/** 步驟 3：維修方案與逐項報價明細（配件費 / 人工費 分列） */
export function StepQuote({ quote, modelName }: { quote: Quote; modelName: string }) {
  const bundleLabel = getBundleDiscountLabel(quote.items.length);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">為你配對的維修方案</h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          以下係 {modelName} 的實際收費明細，配件費與人工費逐項列明，到店收費一致。
        </p>
      </div>

      {/* 明細表 */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <div className="hidden bg-surface-soft px-6 py-3 text-xs font-bold text-ink-muted sm:grid sm:grid-cols-[1fr_7rem_7rem_7rem]">
          <span>維修項目</span>
          <span className="text-right">配件費</span>
          <span className="text-right">人工費</span>
          <span className="text-right">小計</span>
        </div>

        <ul className="divide-y divide-slate-100">
          {quote.items.map((item) => {
            const symptom = getSymptomById(item.symptomId);
            const Icon = resolveIcon(symptom?.icon);
            return (
              <li
                key={item.symptomId}
                className="px-5 py-4 sm:grid sm:grid-cols-[1fr_7rem_7rem_7rem] sm:items-center sm:px-6"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[0.95rem] font-bold text-ink">{item.name}</p>
                    <p className="mt-0.5 text-xs text-ink-faint">更換／使用：{item.partName}</p>
                    <p className="mt-1.5 flex flex-wrap items-center gap-2.5 text-[0.7rem] text-ink-faint">
                      <span className="flex items-center gap-1">
                        <Clock3 className="h-3 w-3" />
                        {formatDuration(item.durationMinutes)}
                      </span>
                      <span className="flex items-center gap-1">
                        <ShieldCheck className="h-3 w-3" />
                        保養 {item.warrantyDays} 日
                      </span>
                      {item.requiresLab ? (
                        <span className="flex items-center gap-1 rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-700">
                          <FlaskConical className="h-3 w-3" />
                          送實驗室
                        </span>
                      ) : null}
                    </p>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between text-sm sm:mt-0 sm:block sm:text-right">
                  <span className="text-xs text-ink-faint sm:hidden">配件費</span>
                  <span className="font-semibold text-ink">{formatHKD(item.partFee)}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm sm:mt-0 sm:block sm:text-right">
                  <span className="text-xs text-ink-faint sm:hidden">人工費</span>
                  <span className="font-semibold text-ink">{formatHKD(item.laborFee)}</span>
                </div>
                <div className="mt-1.5 flex items-center justify-between text-sm sm:mt-0 sm:block sm:text-right">
                  <span className="text-xs text-ink-faint sm:hidden">小計</span>
                  <span className="font-extrabold text-brand-600">{formatHKD(item.subtotal)}</span>
                </div>
              </li>
            );
          })}
        </ul>

        {/* 合計 */}
        <div className="space-y-2.5 border-t border-slate-100 bg-surface-soft px-5 py-5 sm:px-6">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">配件費小計</span>
            <span className="font-semibold text-ink">{formatHKD(quote.partsTotal)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-muted">人工費小計</span>
            <span className="font-semibold text-ink">{formatHKD(quote.laborTotal)}</span>
          </div>

          {quote.bundleDiscount > 0 ? (
            <div className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-1.5 font-semibold text-accent-600">
                <Sparkles className="h-4 w-4" />
                套餐折扣{bundleLabel ? `（${bundleLabel}）` : ''}
              </span>
              <span className="font-bold text-accent-600">
                −{formatHKD(quote.bundleDiscount)}
              </span>
            </div>
          ) : null}

          <div className="flex items-end justify-between border-t border-slate-200 pt-3.5">
            <div>
              <p className="text-sm font-bold text-ink">維修總額</p>
              <p className="mt-0.5 text-[0.7rem] text-ink-faint">已含配件、人工及出機檢測</p>
            </div>
            <p className="text-3xl font-extrabold leading-none text-brand-600">
              {formatHKD(quote.total)}
            </p>
          </div>
        </div>
      </div>

      {/* 方案保障 */}
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
          <Clock3 className="h-5 w-5 shrink-0 text-brand-600" />
          <div>
            <p className="text-xs text-ink-faint">預計維修時間</p>
            <p className="text-[0.95rem] font-extrabold text-ink">
              {formatDuration(quote.estimatedMinutes)}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
          <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-xs text-ink-faint">保養期</p>
            <p className="text-[0.95rem] font-extrabold text-ink">{quote.warrantyDays} 日</p>
          </div>
        </div>
        <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3.5">
          <BadgeCheck className="h-5 w-5 shrink-0 text-accent-500" />
          <div>
            <p className="text-xs text-ink-faint">服務模式</p>
            <p className="text-[0.95rem] font-extrabold text-ink">
              {quote.requiresLab ? '需送實驗室處理' : '門市即場快修'}
            </p>
          </div>
        </div>
      </div>

      {quote.requiresLab ? (
        <div className="flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
          <p className="text-xs leading-relaxed text-amber-800">
            所選項目包含入水／主機板級維修，需送內部實驗室處理，一般 1 至 3 個工作天。
            檢測後如發現額外損壞，我哋會先致電同你確認方案先施工。
          </p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="success" size="sm">
          <ShieldCheck className="h-3.5 w-3.5" />
          報價即最終收費
        </Badge>
        <Badge variant="brand" size="sm">
          網上落單再減 HK$50
        </Badge>
        <Badge variant="neutral" size="sm">
          維修全程錄影
        </Badge>
      </div>
    </div>
  );
}
