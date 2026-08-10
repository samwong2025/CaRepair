import Link from 'next/link';
import { ArrowRight, Clock4, MapPin, MessageCircle, PhoneCall, Train } from 'lucide-react';
import { Button } from '../ui/button';
import { Reveal } from '../ui/reveal';
import { SectionHeading } from '../ui/section';
import { siteConfig } from '../../config/site';

/** 落地頁尾段轉化區：門市資訊 + 熱線 + 主 CTA */
export function CtaBanner() {
  return (
    <section id="shops" className="relative scroll-mt-24 overflow-hidden bg-ink py-16 sm:py-20 lg:py-24">
      <span
        aria-hidden
        className="absolute inset-0 bg-grid-slate opacity-[0.18]"
      />
      <span
        aria-hidden
        className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-brand-600/25 blur-3xl"
      />
      <span
        aria-hidden
        className="absolute -right-20 bottom-0 h-80 w-80 rounded-full bg-accent-500/20 blur-3xl"
      />

      <div className="section-shell relative">
        <SectionHeading
          invert
          eyebrow="全港三間門市"
          title="就近攞機，即修即走"
          titleEn="Visit Our Stores"
          description="港九三間門市均設獨立無塵維修室，亦可揀順豐上門收送，全港（含離島）來回運費全免。"
        />

        <div className="mt-12 grid gap-5 lg:grid-cols-3">
          {siteConfig.shops.map((shop, index) => (
            <Reveal key={shop.name} delay={index * 110}>
              <article className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.06] p-6 backdrop-blur-sm transition-all duration-300 ease-smooth hover:-translate-y-1.5 hover:border-brand-400/40 hover:bg-white/[0.1]">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-brand">
                    <MapPin className="h-5 w-5" strokeWidth={2} />
                  </span>
                  <div>
                    <h3 className="text-lg font-extrabold text-white">{shop.name}</h3>
                    <p className="text-xs text-white/45">{shop.district}</p>
                  </div>
                </div>

                <p className="mt-5 flex-1 text-sm leading-relaxed text-white/70">{shop.address}</p>

                <dl className="mt-5 space-y-2.5 border-t border-white/10 pt-4 text-sm">
                  <div className="flex items-center gap-2 text-white/70">
                    <Clock4 className="h-4 w-4 shrink-0 text-brand-300" />
                    <span>{shop.hours}</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <Train className="h-4 w-4 shrink-0 text-brand-300" />
                    <span>{shop.mtr}</span>
                  </div>
                </dl>
              </article>
            </Reveal>
          ))}
        </div>

        <Reveal delay={220} className="mt-12">
          <div className="flex flex-col items-center gap-6 rounded-2xl border border-white/10 bg-gradient-to-r from-brand-700/60 via-brand-600/35 to-accent-500/25 px-6 py-8 text-center backdrop-blur-sm sm:px-10 lg:flex-row lg:justify-between lg:text-left">
            <div>
              <h3 className="text-2xl font-extrabold leading-snug text-white sm:text-3xl">
                部機有事？依家就搞掂佢
              </h3>
              <p className="mt-2 text-sm text-white/70">
                {siteConfig.serviceHours}・熱線 {siteConfig.hotline}・WhatsApp {siteConfig.whatsapp}
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Link href="/repair" className="w-full sm:w-auto">
                <Button variant="cta" size="lg" className="w-full sm:w-auto">
                  立即免費報價
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <a href={`tel:${siteConfig.hotline.replace(/\s/g, '')}`} className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full border-white/25 bg-white/10 text-white hover:border-white/50 hover:bg-white/20 sm:w-auto"
                >
                  <PhoneCall className="h-4 w-4" />
                  致電門市
                </Button>
              </a>
              <a
                href={`https://wa.me/852${siteConfig.whatsapp.replace(/\s/g, '')}`}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button
                  variant="ghost"
                  size="lg"
                  className="w-full text-white hover:bg-white/15 hover:text-white sm:w-auto"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp 查詢
                </Button>
              </a>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
