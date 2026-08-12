import { BadgeCheck, Check } from 'lucide-react';
import { Reveal } from '../ui/reveal';
import { SectionHeading } from '../ui/section';
import { servicePillars } from '../../data/content';
import { resolveIcon } from '../../lib/icons';

/** 品牌服務理念三卡片 */
export function ServicePillars() {
  return (
    <section id="service" className="scroll-mt-24 bg-white py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="服務承諾"
          title="唔止修得好，仲要修得放心"
          titleEn="Why CathyRepair"
          description="由師傅資歷、品檢流程到時間承諾，全部寫明白紙黑字，做唔到就照跌價。"
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {servicePillars.map((pillar, index) => {
            const Icon = resolveIcon(pillar.icon, BadgeCheck);
            return (
              <Reveal key={pillar.id} delay={index * 120}>
                <article className="glow-card group relative flex h-full flex-col rounded-2xl border border-slate-200/80 bg-white p-7 shadow-card transition-all duration-300 ease-smooth hover:-translate-y-1.5 hover:shadow-lift">
                  <span
                    aria-hidden
                    className="absolute -right-10 -top-10 h-32 w-32 overflow-hidden rounded-full bg-brand-50/80 transition-transform duration-500 ease-smooth group-hover:scale-125"
                  />

                  <span className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
                    <Icon className="h-7 w-7" strokeWidth={2} />
                  </span>

                  <h3 className="relative mt-5 text-xl font-extrabold leading-snug text-ink">
                    {pillar.title}
                  </h3>
                  <p className="relative mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink-faint">
                    {pillar.titleEn}
                  </p>

                  <p className="relative mt-4 flex-1 text-[0.93rem] leading-[1.85] text-ink-muted">
                    {pillar.description}
                  </p>

                  <ul className="relative mt-6 space-y-2.5 border-t border-slate-100 pt-5">
                    {pillar.points.map((point) => (
                      <li key={point} className="flex items-center gap-2.5 text-sm font-semibold text-ink">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <Check className="h-3 w-3" strokeWidth={3} />
                        </span>
                        {point}
                      </li>
                    ))}
                  </ul>
                </article>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
