'use client';

import Link from 'next/link';
import {
  ArrowRight,
  CheckCircle2,
  Laptop,
  PhoneCall,
  Smartphone,
  Sparkles,
  Tablet,
  Watch,
} from 'lucide-react';
import { Button } from '../ui/button';
import { siteConfig } from '../../config/site';
import { deviceGroups } from '../../data/devices';

const iconMap = {
  Smartphone,
  Tablet,
  Watch,
  Laptop,
} as const;

const heroPoints = [
  '常見故障 30 分鐘即場完成',
  '配件費・人工費逐項透明列明',
  '維修全程錄影・180 日保養',
];

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-ink">
      {/* 背景光暈與網格 */}
      <div className="absolute inset-0 bg-brand-gradient opacity-95" aria-hidden />
      <div className="absolute inset-0 bg-grid-slate bg-grid opacity-[0.18]" aria-hidden />
      <div
        className="absolute -right-24 -top-24 h-[26rem] w-[26rem] rounded-full bg-accent-500/25 blur-[100px]"
        aria-hidden
      />
      <div
        className="absolute -bottom-32 left-1/4 h-[22rem] w-[22rem] rounded-full bg-brand-300/25 blur-[110px]"
        aria-hidden
      />

      <div className="section-shell relative py-16 sm:py-20 lg:py-24">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          {/* 左：文案與 CTA */}
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-sm">
              <Sparkles className="h-3.5 w-3.5 text-accent-300" />
              全港 3 間門市・自 {siteConfig.company.since} 年服務逾 12 萬名客戶
            </span>

            <h1 className="mt-6 text-display-lg text-white">
              蘋果裝置壞咗？
              <br />
              <span className="bg-gradient-to-r from-accent-300 via-accent-400 to-accent-200 bg-clip-text text-transparent">
                30 分鐘
              </span>
              即場修好
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/75">
              iPhone・iPad・Apple Watch・MacBook 專業維修。網上即時報價，
              配件費與人工費逐項列明，冇隱藏收費；持牌技師施工、全程錄影，保養最長 365 日。
            </p>

            <ul className="mt-7 flex flex-col gap-2.5">
              {heroPoints.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-[0.95rem] text-white/85">
                  <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-400" />
                  {point}
                </li>
              ))}
            </ul>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Link href="/repair" className="sm:w-auto">
                <Button variant="cta" size="lg" block className="sm:w-auto">
                  立即免費報價
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
              <a href={`tel:${siteConfig.hotline.replace(/\s/g, '')}`} className="sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  block
                  className="border-white/30 bg-white/10 text-white backdrop-blur-sm hover:border-white/50 hover:bg-white/20 sm:w-auto"
                >
                  <PhoneCall className="h-5 w-5" />
                  致電 {siteConfig.hotline}
                </Button>
              </a>
            </div>

            <p className="mt-5 text-sm text-white/50">
              營業時間 {siteConfig.serviceHours}・全港順豐免費上門收送
            </p>
          </div>

          {/* 右：快速選機型卡片 */}
          <div className="animate-fade-up [animation-delay:150ms]">
            <div className="rounded-3xl border border-white/15 bg-white/95 p-6 shadow-[0_28px_70px_rgba(2,17,48,0.45)] backdrop-blur-xl sm:p-7">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-600">
                    Step 01
                  </p>
                  <h2 className="mt-1.5 text-xl font-extrabold text-ink">你要維修邊部裝置？</h2>
                  <p className="mt-1 text-sm text-ink-muted">揀選裝置類型，即刻睇到維修價目</p>
                </div>
                <span className="hidden rounded-xl bg-accent-50 px-3 py-2 text-center text-[0.7rem] font-bold leading-tight text-accent-700 sm:block">
                  平均
                  <br />
                  90 秒
                  <br />
                  完成
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {deviceGroups.map((group) => {
                  const Icon = iconMap[group.icon as keyof typeof iconMap] ?? Smartphone;
                  return (
                    <Link
                      key={group.id}
                      href={`/repair?category=${group.id}`}
                      className="group flex cursor-pointer flex-col gap-2.5 rounded-2xl border border-slate-200 bg-white p-4 text-left transition-all duration-300 ease-smooth hover:-translate-y-1 hover:border-brand-400 hover:shadow-lift"
                    >
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-300 group-hover:bg-brand-gradient group-hover:text-white">
                        <Icon className="h-5 w-5" strokeWidth={2} />
                      </span>
                      <span className="text-[0.95rem] font-bold text-ink">{group.name}</span>
                      <span className="text-[0.7rem] leading-snug text-ink-faint">
                        {group.popular}
                      </span>
                    </Link>
                  );
                })}
              </div>

              <Link href="/repair" className="mt-5 block">
                <Button variant="primary" size="lg" block>
                  開始四步落單
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>

              <p className="mt-3.5 text-center text-xs text-ink-faint">
                提交後自動開立會員檔案，可隨時追蹤維修進度
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
