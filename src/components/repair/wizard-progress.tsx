'use client';

import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export const WIZARD_STEPS = [
  { step: 1, title: '選機型', titleEn: 'Device' },
  { step: 2, title: '揀故障', titleEn: 'Symptoms' },
  { step: 3, title: '睇報價', titleEn: 'Quote' },
  { step: 4, title: '約時間', titleEn: 'Booking' },
] as const;

/** 四步驟進度條，已完成的步驟可點擊回頭修改 */
export function WizardProgress({
  current,
  maxReached,
  onJump,
}: {
  current: number;
  maxReached: number;
  onJump: (step: number) => void;
}) {
  return (
    <ol className="flex items-start gap-1 sm:gap-2">
      {WIZARD_STEPS.map((item, index) => {
        const done = item.step < current;
        const active = item.step === current;
        const reachable = item.step <= maxReached;

        return (
          <li key={item.step} className="flex flex-1 items-start">
            <div className="flex flex-1 flex-col items-center gap-2">
              <div className="flex w-full items-center">
                <span
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors duration-500',
                    index === 0 ? 'opacity-0' : done || active ? 'bg-brand-500' : 'bg-slate-200',
                  )}
                />
                <button
                  type="button"
                  disabled={!reachable}
                  onClick={() => reachable && onJump(item.step)}
                  aria-current={active ? 'step' : undefined}
                  className={cn(
                    'mx-1.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-extrabold transition-all duration-300 sm:h-11 sm:w-11',
                    done && 'border-transparent bg-brand-gradient text-white shadow-brand',
                    active &&
                      'border-accent-500 bg-white text-accent-600 shadow-cta ring-4 ring-accent-500/15',
                    !done && !active && 'border-slate-200 bg-white text-ink-faint',
                    reachable ? 'cursor-pointer' : 'cursor-not-allowed',
                  )}
                >
                  {done ? <Check className="h-5 w-5" strokeWidth={3} /> : item.step}
                </button>
                <span
                  className={cn(
                    'h-1 flex-1 rounded-full transition-colors duration-500',
                    index === WIZARD_STEPS.length - 1
                      ? 'opacity-0'
                      : done
                        ? 'bg-brand-500'
                        : 'bg-slate-200',
                  )}
                />
              </div>

              <div className="text-center">
                <p
                  className={cn(
                    'text-[0.82rem] font-bold transition-colors duration-300 sm:text-sm',
                    active ? 'text-ink' : done ? 'text-brand-600' : 'text-ink-faint',
                  )}
                >
                  {item.title}
                </p>
                <p className="hidden text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-ink-faint sm:block">
                  {item.titleEn}
                </p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
