'use client';

import * as React from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

/** 關於我們 — 常見問題手風琴 */
export function FaqAccordion({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <div className="divide-y divide-slate-200 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
      {items.map((item, index) => {
        const active = open === index;
        return (
          <div key={item.q}>
            <button
              type="button"
              onClick={() => setOpen(active ? null : index)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors duration-200 hover:bg-surface-soft"
              aria-expanded={active}
            >
              <span className="text-sm font-bold text-ink">{item.q}</span>
              <ChevronDown
                className={cn(
                  'h-4 w-4 shrink-0 text-brand-600 transition-transform duration-300',
                  active && 'rotate-180',
                )}
              />
            </button>
            <div
              className={cn(
                'grid transition-all duration-300 ease-smooth',
                active ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
              )}
            >
              <div className="overflow-hidden">
                <p className="px-5 pb-4 text-sm leading-relaxed text-ink-muted">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
