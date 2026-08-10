import Link from 'next/link';
import { ArrowRight, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { Reveal } from '../ui/reveal';
import { SectionHeading } from '../ui/section';
import { orderSteps } from '../../data/content';
import { resolveIcon } from '../../lib/icons';

/** 線上落單流程 1-2-3-4 圖解 */
export function ProcessSteps() {
  return (
    <section id="process" className="scroll-mt-24 bg-surface-soft py-16 sm:py-20 lg:py-24">
      <div className="section-shell">
        <SectionHeading
          eyebrow="落單流程"
          title="90 秒完成落單，即刻知價"
          titleEn="How It Works"
          description="唔使打電話問價、唔使親身跑一趟，四個步驟網上搞掂，到店即修即取。"
        />

        <div className="relative mt-12">
          {/* 桌面版連接線 */}
          <span
            aria-hidden
            className="absolute left-[12.5%] right-[12.5%] top-9 hidden h-0.5 bg-gradient-to-r from-brand-200 via-brand-400 to-accent-400 lg:block"
          />

          <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {orderSteps.map((item, index) => {
              const Icon = resolveIcon(item.icon, Smartphone);
              return (
                <Reveal as="li" key={item.step} delay={index * 110} className="relative">
                  <div className="glow-card flex h-full flex-col items-center rounded-2xl border border-slate-200/70 bg-white/90 p-6 text-center shadow-card backdrop-blur-sm transition-all duration-300 ease-smooth hover:-translate-y-1.5 hover:shadow-lift">
                    <span className="relative flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-brand">
                      <Icon className="h-8 w-8" strokeWidth={2} />
                      <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-accent-500 text-xs font-extrabold text-white shadow-sm">
                        {item.step}
                      </span>
                    </span>

                    <h3 className="mt-5 text-lg font-extrabold text-ink">{item.title}</h3>
                    <p className="mt-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-ink-faint">
                      {item.titleEn}
                    </p>
                    <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-muted">
                      {item.description}
                    </p>
                    <span className="mt-4 rounded-full bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
                      {item.duration}
                    </span>
                  </div>
                </Reveal>
              );
            })}
          </ol>
        </div>

        <Reveal delay={200} className="mt-12">
          <div className="overflow-hidden rounded-2xl bg-brand-gradient px-6 py-8 shadow-brand sm:px-10 sm:py-9">
            <div className="flex flex-col items-center gap-6 text-center lg:flex-row lg:justify-between lg:text-left">
              <div>
                <h3 className="text-xl font-extrabold text-white sm:text-2xl">
                  依家落單，即減 HK$50 網上預約優惠
                </h3>
                <p className="mt-2 text-sm text-white/75">
                  凡經網站提交維修訂單並到店完成維修，即減 HK$50；同時修復兩項或以上另有套餐折扣。
                </p>
              </div>
              <Link href="/repair" className="w-full shrink-0 sm:w-auto">
                <Button variant="cta" size="lg" className="w-full sm:w-auto">
                  立即免費報價
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
