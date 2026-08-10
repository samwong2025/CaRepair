'use client';

import { PackageCheck, Star, Timer, Users, type LucideIcon } from 'lucide-react';
import { CountUp } from '../ui/count-up';
import { Reveal } from '../ui/reveal';
import { SectionHeading } from '../ui/section';
import { siteStats } from '../../data/content';

const iconMap: Record<string, LucideIcon> = { Users, Star, Timer, PackageCheck };

/** 核心數據看板：累計服務客戶數、好評率、平均修復時長、即日取機率 */
export function StatsBoard() {
  return (
    <section className="relative overflow-hidden bg-ink py-16 sm:py-20">
      <div className="absolute inset-0 bg-grid-slate bg-grid opacity-[0.07]" aria-hidden />
      <div
        className="absolute left-1/2 top-0 h-64 w-[40rem] -translate-x-1/2 rounded-full bg-brand-500/25 blur-[120px]"
        aria-hidden
      />

      <div className="section-shell relative">
        <SectionHeading
          eyebrow="數據說話"
          title="十年累積的服務實績"
          titleEn="Proven by Numbers"
          description="每一組數字都來自真實維修單據與客戶評分，並非市場宣傳語。"
          invert
        />

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
          {siteStats.map((stat, index) => {
            const Icon = iconMap[stat.icon] ?? Users;
            return (
              <Reveal key={stat.id} delay={index * 90}>
                <div className="glow-card group h-full cursor-default rounded-2xl border border-white/12 bg-white/[0.06] p-6 backdrop-blur-sm transition-all duration-300 ease-smooth hover:border-accent-400/50 hover:bg-white/[0.1]">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/10 text-accent-300 transition-colors duration-300 group-hover:bg-cta-gradient group-hover:text-white">
                    <Icon className="h-5 w-5" strokeWidth={2.1} />
                  </span>

                  <p className="mt-5 flex items-baseline gap-1 font-display text-4xl font-extrabold tracking-tight text-white tabular">
                    <CountUp end={stat.value} decimals={stat.decimals ?? 0} />
                    <span className="text-xl font-bold text-accent-400">{stat.suffix}</span>
                  </p>

                  <p className="mt-2 text-sm font-bold text-white/90">{stat.label}</p>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-white/35">
                    {stat.labelEn}
                  </p>
                  <p className="mt-3 text-xs leading-relaxed text-white/55">{stat.description}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
