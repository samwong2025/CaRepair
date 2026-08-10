'use client';

import * as React from 'react';
import { AlertTriangle, Check, Clock3, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/badge';
import { getSymptomsByCategory } from '../../data/symptoms';
import { findPricingRule } from '../../data/pricing';
import { resolveIcon } from '../../lib/icons';
import { formatDuration } from '../../lib/quote-engine';
import { cn } from '../../lib/utils';
import type { DeviceCategory } from '../../types';

/** 步驟 2：勾選故障症狀（可多選） */
export function StepSymptoms({
  category,
  modelName,
  selected,
  onToggle,
}: {
  category: DeviceCategory;
  modelName: string;
  selected: string[];
  onToggle: (symptomId: string) => void;
}) {
  const list = React.useMemo(
    () => getSymptomsByCategory(category).sort((a, b) => b.frequency - a.frequency),
    [category],
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">
          你部 {modelName} 出現咩問題？
        </h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          可同時勾選多項（呢度只係幫師傅預先準備，最終收費以現場檢測報價為準）；都可以留空，到店再講。
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((symptom) => {
          const Icon = resolveIcon(symptom.icon);
          const checked = selected.includes(symptom.id);
          const rule = findPricingRule(category, symptom.id);

          return (
            <button
              key={symptom.id}
              type="button"
              role="checkbox"
              aria-checked={checked}
              onClick={() => onToggle(symptom.id)}
              className={cn(
                'flex cursor-pointer items-start gap-3.5 rounded-2xl border p-4 text-left transition-all duration-200 ease-smooth',
                checked
                  ? 'border-brand-500 bg-brand-50/60 shadow-card'
                  : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-card',
              )}
            >
              <span
                className={cn(
                  'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors duration-200',
                  checked ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300 bg-white',
                )}
              >
                {checked ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : null}
              </span>

              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                  checked ? 'bg-brand-gradient text-white' : 'bg-slate-100 text-ink-muted',
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={2} />
              </span>

              <span className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[0.95rem] font-bold text-ink">{symptom.shortName}</span>
                  {symptom.urgent ? (
                    <Badge variant="danger" size="sm">
                      <AlertTriangle className="h-3 w-3" />
                      急症
                    </Badge>
                  ) : null}
                  {symptom.frequency >= 90 ? (
                    <Badge variant="accent" size="sm">
                      最常維修
                    </Badge>
                  ) : null}
                </span>

                <span className="mt-1 block text-xs leading-relaxed text-ink-muted">
                  {symptom.description}
                </span>

                {rule ? (
                  <span className="mt-2 flex flex-wrap items-center gap-3 text-[0.7rem] text-ink-faint">
                    <span className="flex items-center gap-1">
                      <Clock3 className="h-3 w-3" />
                      {formatDuration(rule.durationMinutes)}
                    </span>
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="h-3 w-3" />
                      保養 {rule.warrantyDays} 日
                    </span>
                    {rule.requiresLab ? (
                      <span className="rounded bg-amber-50 px-1.5 py-0.5 font-semibold text-amber-700">
                        需送實驗室
                      </span>
                    ) : null}
                  </span>
                ) : null}
              </span>
            </button>
          );
        })}
      </div>

      <p className="rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs leading-relaxed text-brand-800">
        搵唔到你嘅故障？可以先勾選最接近的一項，並於最後一步的備註欄詳細描述，技師會於檢測後同你確認方案先施工。
      </p>
    </div>
  );
}
