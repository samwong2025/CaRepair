'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ChevronRight,
  Clock3,
  Menu,
  PackageSearch,
  PhoneCall,
  Search,
  ShieldCheck,
  Wrench,
  X,
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { mainNav, siteConfig } from '../../config/site';
import { Button } from '../ui/button';

export function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = React.useState(false);
  const [scrolled, setScrolled] = React.useState(false);

  React.useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  React.useEffect(() => {
    setOpen(false);
  }, [pathname]);

  React.useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header className="site-header fixed inset-x-0 top-0 z-50">
      {/* 頂部資訊條 —— 對標原站頂部服務承諾條 */}
      <div className="hidden bg-ink text-white lg:block">
        <div className="section-shell flex h-9 items-center justify-between text-xs">
          <div className="flex items-center gap-6 text-white/70">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-brand-300" />
              專業師傅駐店・荔枝角門市即場快修
            </span>
            <span className="flex items-center gap-1.5">
              <Clock3 className="h-3.5 w-3.5 text-brand-300" />
              {siteConfig.serviceHours}
            </span>
            <span className="flex items-center gap-1.5">
              <Wrench className="h-3.5 w-3.5 text-brand-300" />
              常見故障 30 分鐘即場完成
            </span>
          </div>
          <div className="flex items-center gap-5">
            <Link href="/track" className="text-white/70 transition-colors hover:text-white">
              訂單查詢
            </Link>
            <span className="h-3 w-px bg-white/20" />
            <a
              href={`tel:${siteConfig.hotline.replace(/\s/g, '')}`}
              className="flex items-center gap-1.5 font-semibold text-accent-300 transition-colors hover:text-accent-200"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              客服熱線 {siteConfig.hotline}
            </a>
          </div>
        </div>
      </div>

      {/* 主導覽 */}
      <div
        className={cn(
          'transition-all duration-300 ease-smooth',
          scrolled
            ? 'border-b border-slate-200/70 bg-white/90 shadow-soft backdrop-blur-xl'
            : 'border-b border-transparent bg-white/70 backdrop-blur-md',
        )}
      >
        <nav className="section-shell flex h-16 items-center justify-between gap-4 lg:h-24">
                <Link href="/" className="group flex shrink-0 items-center gap-3.5">
                  {/* 品牌標誌：直接採用設計稿 PNG（蘋果外輪廓 + 內部女技師剪影） */}
                  <img
                    src="/logo-mark.png"
                    alt="CathyRepair"
                    width={96}
                    height={96}
                    className="h-20 w-20 sm:h-24 sm:w-24"
                  />
                  <span className="flex flex-col leading-none">
                    <span className="text-[1.85rem] font-extrabold tracking-tight text-ink sm:text-[2.05rem]">
                      Cathy<span className="text-brand-600">Repair</span>
                    </span>
                    <span className="mt-1.5 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-ink-faint sm:text-[0.78rem]">
                      Apple Product Specialist
                    </span>
                  </span>
                </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {mainNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'relative rounded-lg px-3.5 py-2 text-[0.95rem] font-semibold transition-colors duration-200',
                  isActive(item.href)
                    ? 'text-brand-600'
                    : 'text-ink-muted hover:bg-slate-100 hover:text-ink',
                )}
              >
                {item.label}
                {isActive(item.href) ? (
                  <span className="absolute inset-x-3.5 -bottom-0.5 h-0.5 rounded-full bg-accent-500" />
                ) : null}
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-2.5 lg:flex">
            <Link href="/track">
              <Button variant="outline" size="md">
                <Search className="h-4 w-4" />
                查訂單
              </Button>
            </Link>
            <Link href="/repair">
              <Button variant="cta" size="md" className="animate-pulse-ring">
                即時報價
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>

          <button
            type="button"
            aria-label={open ? '關閉選單' : '開啟選單'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-ink transition-colors hover:bg-slate-50 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>
      </div>

      {/* 流動產品抽屜選單 */}
      <div
        className={cn(
          'fixed inset-x-0 top-16 z-40 origin-top overflow-hidden border-b border-slate-200 bg-white shadow-card transition-all duration-300 ease-smooth lg:hidden',
          open ? 'max-h-[80vh] opacity-100' : 'pointer-events-none max-h-0 opacity-0',
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-4">
          {mainNav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center justify-between rounded-xl px-4 py-3.5 transition-colors',
                isActive(item.href) ? 'bg-brand-50' : 'hover:bg-slate-50',
              )}
            >
              <span className="flex flex-col">
                <span
                  className={cn(
                    'text-base font-bold',
                    isActive(item.href) ? 'text-brand-700' : 'text-ink',
                  )}
                >
                  {item.label}
                </span>
                {item.description ? (
                  <span className="mt-0.5 text-xs text-ink-muted">{item.description}</span>
                ) : null}
              </span>
              <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />
            </Link>
          ))}

          <div className="mt-3 grid grid-cols-2 gap-2.5 border-t border-slate-100 pt-4">
            <Link href="/track">
              <Button variant="outline" size="md" block>
                <PackageSearch className="h-4 w-4" />
                查訂單
              </Button>
            </Link>
            <a href={`tel:${siteConfig.hotline.replace(/\s/g, '')}`}>
              <Button variant="outline" size="md" block>
                <PhoneCall className="h-4 w-4" />
                致電客服
              </Button>
            </a>
          </div>
          <Link href="/repair" className="block pt-2.5">
            <Button variant="cta" size="md" block>
              即時報價
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
