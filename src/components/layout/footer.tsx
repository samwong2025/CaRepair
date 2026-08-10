import Link from 'next/link';
import { Clock3, Mail, MapPin, MessageCircle, PhoneCall, Wrench } from 'lucide-react';
import { footerNav, siteConfig } from '../../config/site';

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="site-footer bg-ink text-white">
      <div className="section-shell py-14 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
          <div className="max-w-sm">
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-gradient">
                <Wrench className="h-5 w-5 text-white" strokeWidth={2.4} />
              </span>
              <span className="text-lg font-extrabold tracking-tight">
                Cathy<span className="text-brand-400">Repair</span>
              </span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-white/60">
              {siteConfig.description}
            </p>

            <div className="mt-6 space-y-3 text-sm">
              <a
                href={`tel:${siteConfig.hotline.replace(/\s/g, '')}`}
                className="flex items-center gap-2.5 text-white/80 transition-colors hover:text-accent-300"
              >
                <PhoneCall className="h-4 w-4 shrink-0 text-brand-400" />
                客服熱線 {siteConfig.hotline}
              </a>
              <p className="flex items-center gap-2.5 text-white/60">
                <MessageCircle className="h-4 w-4 shrink-0 text-brand-400" />
                WhatsApp {siteConfig.whatsapp}
              </p>
              <p className="flex items-center gap-2.5 text-white/60">
                <Clock3 className="h-4 w-4 shrink-0 text-brand-400" />
                {siteConfig.serviceHours}
              </p>
              <a
                href={`mailto:${siteConfig.email}`}
                className="flex items-center gap-2.5 text-white/60 transition-colors hover:text-white"
              >
                <Mail className="h-4 w-4 shrink-0 text-brand-400" />
                {siteConfig.email}
              </a>
            </div>
          </div>

          {footerNav.map((column) => (
            <div key={column.title}>
              <h3 className="text-sm font-bold tracking-wide text-white">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={`${column.title}-${link.label}`}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/60 transition-colors duration-200 hover:text-accent-300"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* 門市資訊 */}
        <div className="mt-12 grid gap-4 border-t border-white/10 pt-8 sm:grid-cols-2 lg:grid-cols-3">
          {siteConfig.shops.map((shop) => (
            <div key={shop.name} className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="flex items-center gap-2 text-sm font-bold text-white">
                <MapPin className="h-4 w-4 text-accent-400" />
                {shop.name}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-white/55">{shop.address}</p>
              <p className="mt-2 text-xs text-white/45">
                {shop.mtr}・營業時間 {shop.hours}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="section-shell flex flex-col gap-2 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {siteConfig.company.since}-{year} {siteConfig.company.legalName}・
            {siteConfig.company.brNo}
          </p>
          <div className="flex items-center gap-4">
            <p>本網站所列價格均以港幣（HK$）計算，實際維修價格以檢測後報價單為準。</p>
            <Link
              href="/admin"
              className="rounded-md px-2 py-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              後台管理
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
