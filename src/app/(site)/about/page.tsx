import type { Metadata } from 'next';
import Link from 'next/link';
import {
  Award,
  Banknote,
  Clock,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  ShieldCheck,
  Sparkles,
  Train,
} from 'lucide-react';
import { siteConfig, trustBadges } from '../../../config/site';
import { servicePillars, faqs } from '../../../data/content';
import { StatsBoard } from '../../../components/home/stats-board';
import { FaqAccordion } from '../../../components/about/faq-accordion';
import { SmartImage } from '../../../components/ui/smart-image';
import { resolveIcon } from '../../../lib/icons';

export const metadata: Metadata = {
  title: '關於我們｜CathyRepair',
  description:
    'CathyRepair 成立於 2016 年，是香港專營 iPhone、iPad、Apple Watch、MacBook 維修的專業中心。專業師傅、27 項出機檢測與 180 日保養，守護全港超過 12 萬客戶的蘋果產品。',
};

export default function AboutPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-brand-gradient px-6 py-12 text-white sm:px-12 sm:py-16">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
          <Sparkles className="h-4 w-4" />
          Since {siteConfig.company.since}
        </p>
        <h1 className="mt-3 text-4xl font-extrabold leading-tight sm:text-5xl">
          {siteConfig.name}
        </h1>
        <p className="mt-4 max-w-2xl text-base text-white/85 sm:text-lg">
          {siteConfig.tagline}，自 {siteConfig.company.since} 年起立足香港，累計服務超過 12 萬名客戶。
          我們相信，透明、專業與尊重，才是維修這門手藝該有的樣子。
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/repair"
            className="rounded-xl bg-accent px-5 py-3 text-sm font-extrabold text-white shadow-cta transition-transform duration-200 hover:-translate-y-0.5"
          >
            即刻落單維修
          </Link>
          <Link
            href="#shops"
            className="rounded-xl bg-white/15 px-5 py-3 text-sm font-extrabold text-white backdrop-blur transition-colors duration-200 hover:bg-white/25"
          >
            門市地址
          </Link>
        </div>
      </section>

      {/* 數據看板 */}
      <section className="mt-10">
        <StatsBoard />
      </section>

      {/* 品牌故事 */}
      <section className="mt-16 grid gap-8 lg:grid-cols-2 lg:items-center">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-600">
            Our Story
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-ink">由一部跌爛的 iPhone 開始</h2>
          <div className="mt-5 space-y-4 text-sm leading-relaxed text-ink-muted">
            <p>
              2016 年，創辦人阿 Cathy 的 iPhone 換芒後發現被偷換了非原廠零件，從此立志開一間
              「敢把工序攤開喺你面前」嘅維修店。CathyRepair 就喺荔枝角一間百呎舖位誕生，
              第一張工作枱上寫住一句話：「唔會做喺客唔知嘅嘢。」
            </p>
            <p>
              今日，我哋喺荔枝角設有門市、駐店技師平均擁有 8 年蘋果維修經驗，
              維修過程由專業師傅按標準工序處理、配件費與人工費逐項列明。由一粒螺絲到一塊主機板，
              我哋守護嘅唔單止係部機，更加係你嘅資料、私隱同信任。
            </p>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-3">
            {[
              { value: `${new Date().getFullYear() - siteConfig.company.since}+`, label: '年專業經驗' },
              { value: '1', label: '荔枝角門市' },
              { value: '2,300+', label: '配件現貨' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl bg-surface-soft p-3 text-center">
                <p className="text-xl font-extrabold text-brand-600">{item.value}</p>
                <p className="mt-1 text-[0.7rem] text-ink-faint">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative overflow-hidden rounded-3xl shadow-lift">
          <SmartImage
            src="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=1200&q=80"
            alt="CathyRepair 技師維修蘋果產品"
            wrapperClassName="aspect-[4/3]"
            fallbackText="CathyRepair 維修實況"
          />
        </div>
      </section>

      {/* 服務理念 */}
      <section className="mt-16">
        <div className="text-center">
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-brand-600">
            Why Choose Us
          </p>
          <h2 className="mt-2 text-3xl font-extrabold text-ink">三件事，我們堅持唔妥協</h2>
        </div>
        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {servicePillars.map((pillar) => {
            const Icon = resolveIcon(pillar.icon, Award);
            return (
              <article
                key={pillar.id}
                className="glow-card rounded-2xl border border-slate-200 bg-white p-6 shadow-card transition-all duration-200 hover:-translate-y-1 hover:shadow-lift"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-lg font-extrabold text-ink">{pillar.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{pillar.description}</p>
                <ul className="mt-4 space-y-1.5">
                  {pillar.points.map((point) => (
                    <li key={point} className="flex items-center gap-2 text-xs font-semibold text-ink-muted">
                      <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" />
                      {point}
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>
      </section>

      {/* 信任徽章 */}
      <section className="mt-16">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trustBadges.map((badge) => {
            const Icon = resolveIcon(badge.icon, ShieldCheck);
            return (
              <div
                key={badge.label}
                className="glow-card flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" />
                </span>
                <div>
                  <p className="text-sm font-extrabold text-ink">{badge.label}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">{badge.detail}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 門市 */}
      <section id="shops" className="mt-16 scroll-mt-24">
        <h2 className="text-3xl font-extrabold text-ink">門市地址</h2>
        <p className="mt-2 text-sm text-ink-muted">門市鄰近港鐵站，即場維修無需預約。</p>
        <div className="mt-6 grid gap-5 md:grid-cols-1 md:max-w-xl">
          {siteConfig.shops.map((shop) => (
            <article key={shop.name} className="glow-card rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-brand-600" />
                <h3 className="text-lg font-extrabold text-ink">{shop.name}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-ink-muted">{shop.address}</p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-ink-faint">
                <Clock className="h-3.5 w-3.5" />
                營業時間 {shop.hours}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-faint">
                <Train className="h-3.5 w-3.5" />
                {shop.mtr}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* 保養條款 */}
      <section id="warranty" className="mt-16 scroll-mt-24 rounded-3xl bg-surface-soft p-8">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-brand-600 shadow-card">
            <Award className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold text-ink">保養承諾・講明唔玩嘢</h2>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {[
                '一般維修項目保養 180 日',
                '電池更換保養 365 日',
                '主機板級維修保養 90 日',
                '同一故障保養期內免費復修',
                '檢測報告隨機附上',
                '保養記錄可於訂單查詢隨時調閱',
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-muted">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="mt-16 scroll-mt-24">
        <h2 className="text-3xl font-extrabold text-ink">常見問題</h2>
        <p className="mt-2 text-sm text-ink-muted">關於收費、時長、私隱與保養，你想知嘅都喺度。</p>
        <div className="mt-6">
          <FaqAccordion items={[...faqs]} />
        </div>
      </section>

      {/* 加入我們 */}
      <section id="join" className="mt-16 scroll-mt-24">
        <div className="overflow-hidden rounded-3xl bg-cta-gradient px-6 py-10 text-white sm:px-10">
          <h2 className="text-2xl font-extrabold sm:text-3xl">加入我們・做一個被信任嘅技師</h2>
          <p className="mt-3 max-w-2xl text-sm text-white/85">
            如果你熟悉蘋果產品維修、認同透明誠實嘅服務哲學，歡迎投遞履歷。我哋提供有競爭力嘅薪酬、
            持續技術培訓，同埋一個唔使「斬客」都能夠做好嘅工作環境。
          </p>
          <a
            href={`mailto:${siteConfig.email}?subject=應徵技師`}
            className="mt-6 inline-block rounded-xl bg-white px-5 py-3 text-sm font-extrabold text-brand-700 transition-transform duration-200 hover:-translate-y-0.5"
          >
            發送履歷至 {siteConfig.email}
          </a>
        </div>
      </section>

      {/* 聯絡我們 */}
      <section id="contact" className="mt-16 scroll-mt-24">
        <h2 className="text-3xl font-extrabold text-ink">聯絡我們</h2>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Phone, label: '維修熱線', value: siteConfig.hotline, href: `tel:${siteConfig.hotline.replace(/\s/g, '')}` },
            { icon: MessageCircle, label: 'WhatsApp', value: siteConfig.whatsapp, href: `https://wa.me/${siteConfig.whatsapp.replace(/\s/g, '')}` },
            { icon: Mail, label: '電郵', value: siteConfig.email, href: `mailto:${siteConfig.email}` },
            { icon: Clock, label: '服務時間', value: siteConfig.serviceHours, href: null },
          ].map((item) => {
            const Icon = item.icon;
            const content = (
              <>
                <Icon className="h-5 w-5 text-brand-600" />
                <p className="mt-2 text-xs text-ink-faint">{item.label}</p>
                <p className="mt-0.5 text-sm font-extrabold text-ink">{item.value}</p>
              </>
            );
            return item.href ? (
              <a
                key={item.label}
                href={item.href}
                className="glow-card rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lift"
              >
                {content}
              </a>
            ) : (
              <div
                key={item.label}
                className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
              >
                {content}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}
