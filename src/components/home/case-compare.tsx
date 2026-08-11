'use client';

import * as React from 'react';
import Link from 'next/link';
import { ArrowRight, CalendarDays, Clock3, UserCog, Wrench } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { CompareSlider } from '../ui/compare-slider';
import { Reveal } from '../ui/reveal';
import { SectionHeading } from '../ui/section';
import { repairCases } from '../../data/content';
import { formatDotDate, formatHKD } from '../../lib/format';
import { formatDuration } from '../../lib/quote-engine';
import { cn } from '../../lib/utils';

/** 真實維修案例：前後對比滑桿 + 案例切換 */
export function CaseCompare() {
  const [activeId, setActiveId] = React.useState(repairCases[0].id);
  const active = repairCases.find((item) => item.id === activeId) ?? repairCases[0];

  return (
    <section id="cases" className="scroll-mt-24 bg-surface-muted py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="真實案例"
          title="睇得見的維修質素"
          titleEn="Before / After"
          description="以下全部為門市實際完成的個案，拖曳中間的滑桿即可對比維修前後效果。"
        />

        {/* 案例切換 */}
        <Reveal className="mt-10">
          <div className="-mx-4 flex flex-wrap gap-2.5 px-4 pb-2 lg:mx-0 lg:justify-center lg:px-0">
            {repairCases.map((item) => {
              const selected = item.id === active.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveId(item.id)}
                  aria-pressed={selected}
                  className={cn(
                    'shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-all duration-200 ease-smooth',
                    selected
                      ? 'border-transparent bg-brand-gradient text-white shadow-brand'
                      : 'border-slate-200 bg-white text-ink-muted hover:border-brand-300 hover:text-brand-700',
                  )}
                >
                  {item.deviceModelName}
                </button>
              );
            })}
          </div>
        </Reveal>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-8">
          <Reveal>
            <CompareSlider
              key={active.id}
              beforeSrc={active.beforeImage}
              afterSrc={active.afterImage}
              alt={active.deviceModelName}
              className="shadow-lift"
            />
          </Reveal>

          <Reveal delay={120}>
            <div className="glow-card flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-6 shadow-card sm:p-7">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="accent" size="sm">
                  {active.symptomSummary}
                </Badge>
                <Badge variant="neutral" size="sm">
                  <CalendarDays className="h-3.5 w-3.5" />
                  {formatDotDate(active.date)}
                </Badge>
              </div>

              <h3 className="mt-4 text-xl font-extrabold leading-snug text-ink sm:text-2xl">
                {active.title}
              </h3>

              <p className="mt-4 flex-1 text-[0.95rem] leading-relaxed text-ink-muted">
                {active.summary}
              </p>

              <dl className="mt-6 grid grid-cols-3 gap-3 border-t border-slate-100 pt-5">
                <div>
                  <dt className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-ink-faint">
                    <Clock3 className="h-3.5 w-3.5" />
                    維修工時
                  </dt>
                  <dd className="mt-1.5 text-base font-extrabold text-ink">
                    {formatDuration(active.durationMinutes)}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-ink-faint">
                    <Wrench className="h-3.5 w-3.5" />
                    實收費用
                  </dt>
                  <dd className="mt-1.5 text-base font-extrabold text-brand-600">
                    {formatHKD(active.price)}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-1.5 text-[0.7rem] font-semibold text-ink-faint">
                    <UserCog className="h-3.5 w-3.5" />
                    主理技師
                  </dt>
                  <dd className="mt-1.5 text-base font-extrabold text-ink">{active.technician}</dd>
                </div>
              </dl>

              <Link href="/repair" className="mt-6 block">
                <Button variant="cta" size="lg" block>
                  我部機都想咁樣修好
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
