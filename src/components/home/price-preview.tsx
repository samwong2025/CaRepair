'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { Reveal } from '../ui/reveal';
import { SectionHeading } from '../ui/section';
import { deviceGroups } from '../../data/devices';
import { getSymptomsByCategory } from '../../data/symptoms';
import { formatHKD } from '../../lib/format';
import { resolveIcon } from '../../lib/icons';
import { getStartingPrice } from '../../lib/quote-engine';
import { cn } from '../../lib/utils';

/** 熱門維修價目：按產品分類切換，顯示「HK$X 起」引流價 */
export function PricePreview() {
  const [category, setCategory] = React.useState(deviceGroups[0].id);

  const rows = React.useMemo(() => {
    return getSymptomsByCategory(category)
      .map((symptom) => ({ symptom, from: getStartingPrice(category, symptom.id) }))
      .filter((row) => row.from > 0)
      .sort((a, b) => b.symptom.frequency - a.symptom.frequency)
      .slice(0, 6);
  }, [category]);

  return (
    <section id="pricing" className="scroll-mt-24 bg-surface-muted py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="透明報價"
          title="熱門維修價目一覽"
          titleEn="Transparent Pricing"
          description="以下為各機型最低起始價，實際收費按型號級距計算，落單時即時顯示配件費與人工費明細。"
        />

        <Reveal className="mt-10">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {deviceGroups.map((group) => {
              const Icon = resolveIcon(group.icon, Smartphone);
              const selected = group.id === category;
              return (
                <button
                  key={group.id}
                  type="button"
                  onClick={() => setCategory(group.id)}
                  aria-pressed={selected}
                  className={cn(
                    'glow-card relative flex cursor-pointer items-start gap-3 overflow-hidden rounded-2xl border p-4 text-left transition-all duration-300 ease-smooth',
                    selected
                      ? 'border-brand-500 bg-white shadow-lift'
                      : 'border-slate-200/80 bg-white/70 hover:-translate-y-1 hover:bg-white hover:shadow-card',
                  )}
                >
                  {group.coverImage ? (
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      width={112}
                      height={112}
                      loading="lazy"
                      className="pointer-events-none absolute -right-4 -top-3 h-[72px] w-[72px] object-contain opacity-95"
                    />
                  ) : null}
                  <span
                    className={cn(
                      'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                      selected ? 'bg-brand-gradient text-white' : 'bg-brand-50 text-brand-600',
                    )}
                  >
                    <Icon className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-[0.95rem] font-extrabold text-ink">
                      {group.name}
                    </span>
                    <span className="mt-0.5 block truncate text-xs text-ink-faint">
                      {group.popular}
                    </span>
                  </span>
                </button>
              );
            })}
          </div>
        </Reveal>

        <Reveal delay={120} className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-card">
            <ul className="divide-y divide-slate-100">
              {rows.map((row) => {
                const Icon = resolveIcon(row.symptom.icon);
                return (
                  <li
                    key={row.symptom.id}
                    className="flex flex-col gap-3 px-5 py-4 transition-colors duration-200 hover:bg-surface-soft sm:flex-row sm:items-center sm:gap-5 sm:px-6"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="h-5 w-5" strokeWidth={2} />
                    </span>

                    <div className="min-w-0 flex-1">
                      <p className="flex flex-wrap items-center gap-2 text-[0.95rem] font-bold text-ink">
                        {row.symptom.name}
                        {row.symptom.urgent ? (
                          <span className="rounded bg-red-50 px-1.5 py-0.5 text-[0.62rem] font-bold text-red-600">
                            急症優先
                          </span>
                        ) : null}
                      </p>
                      <p className="mt-1 text-xs leading-relaxed text-ink-faint">
                        {row.symptom.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between gap-4 sm:justify-end">
                      <p className="text-right">
                        <span className="text-xs text-ink-faint">最平</span>{' '}
                        <span className="text-xl font-extrabold text-brand-600">
                          {formatHKD(row.from)}
                        </span>
                        <span className="text-xs text-ink-faint"> 起</span>
                      </p>
                      <Link href="/repair" aria-label={`為 ${row.symptom.shortName} 取得報價`}>
                        <Button variant="soft" size="sm">
                          取報價
                          <ArrowRight className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>

            <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 bg-surface-soft px-6 py-4 text-center sm:flex-row sm:text-left">
              <p className="text-xs leading-relaxed text-ink-faint">
                價格已包含配件費與人工費，同時修復兩項或以上自動套用套餐折扣；檢測後如需額外項目，必先致電確認。
              </p>
              <Link href="/repair" className="shrink-0">
                <Button variant="primary" size="md">
                  查看我部機的報價
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
