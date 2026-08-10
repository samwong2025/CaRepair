'use client';

import { Check, Loader2 } from 'lucide-react';
import { statusFlow, statusMeta } from '../../data/seed';
import { formatDateTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { OrderStatus, OrderTimelineEntry } from '../../types';

/** 訂單狀態時間軸：已完成節點高亮、當前節點脈動、未來節點灰階 */
export function StatusTimeline({
  status,
  timeline,
}: {
  status: OrderStatus;
  timeline: OrderTimelineEntry[];
}) {
  const cancelled = status === 'cancelled';
  const steps = cancelled ? (['submitted', 'cancelled'] as OrderStatus[]) : statusFlow;
  const currentIndex = steps.indexOf(status);
  const entryMap = new Map(timeline.map((entry) => [entry.status, entry]));

  return (
    <ol className="relative space-y-0">
      {steps.map((step, index) => {
        const meta = statusMeta[step];
        const entry = entryMap.get(step);
        const done = index < currentIndex;
        const active = index === currentIndex;
        const last = index === steps.length - 1;

        return (
          <li key={step} className="relative flex gap-4 pb-6 last:pb-0">
            {!last ? (
              <span
                aria-hidden
                className={cn(
                  'absolute left-[0.9375rem] top-8 h-[calc(100%-1.5rem)] w-0.5 rounded-full',
                  done ? 'bg-brand-500' : 'bg-slate-200',
                )}
              />
            ) : null}

            <span
              className={cn(
                'relative z-10 mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-extrabold transition-colors duration-300',
                done && 'border-transparent bg-brand-gradient text-white',
                active && !cancelled && 'border-accent-500 bg-white text-accent-600',
                active && cancelled && 'border-state-danger bg-white text-state-danger',
                !done && !active && 'border-slate-200 bg-white text-ink-faint',
              )}
            >
              {done ? (
                <Check className="h-4 w-4" strokeWidth={3} />
              ) : active && !cancelled && step !== 'completed' ? (
                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2.5} />
              ) : (
                index + 1
              )}
              {active && !cancelled ? (
                <span
                  aria-hidden
                  className="absolute inset-0 animate-pulse-ring rounded-full border-2 border-accent-500"
                />
              ) : null}
            </span>

            <div className="min-w-0 flex-1 pt-0.5">
              <div className="flex flex-wrap items-center gap-2">
                <p
                  className={cn(
                    'text-[0.95rem] font-extrabold',
                    done || active ? 'text-ink' : 'text-ink-faint',
                  )}
                >
                  {meta.label}
                </p>
                {active ? (
                  <span
                    className={cn(
                      'rounded-full px-2 py-0.5 text-[0.62rem] font-bold text-white',
                      cancelled ? 'bg-state-danger' : 'bg-accent-500',
                    )}
                  >
                    現時狀態
                  </span>
                ) : null}
                {entry ? (
                  <span className="text-xs text-ink-faint">{formatDateTime(entry.at)}</span>
                ) : null}
              </div>

              <p
                className={cn(
                  'mt-1 text-sm leading-relaxed',
                  done || active ? 'text-ink-muted' : 'text-ink-faint',
                )}
              >
                {entry?.note ?? meta.description}
              </p>

              {entry?.operator ? (
                <p className="mt-1 text-xs text-ink-faint">處理人：{entry.operator}</p>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
