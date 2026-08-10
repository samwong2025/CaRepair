'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, PhoneCall, Wrench } from 'lucide-react';
import { siteConfig } from '../../config/site';

/** 流動裝置底部固定操作列 —— 提升即時轉化 */
export function MobileActionBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-3 items-center gap-2 px-3 py-2.5">
        <a
          href={`tel:${siteConfig.hotline.replace(/\s/g, '')}`}
          className="flex cursor-pointer flex-col items-center gap-1 rounded-xl py-1.5 text-ink-muted transition-colors hover:bg-slate-50 hover:text-brand-600"
        >
          <PhoneCall className="h-5 w-5" />
          <span className="text-[0.7rem] font-semibold">致電客服</span>
        </a>
        <Link
          href="/repair"
          className="flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-cta-gradient px-3 py-3 text-sm font-bold text-white shadow-cta transition-all hover:brightness-105"
        >
          <Wrench className="h-4 w-4" />
          即時報價
        </Link>
        <Link
          href="/track"
          className="flex cursor-pointer flex-col items-center gap-1 rounded-xl py-1.5 text-ink-muted transition-colors hover:bg-slate-50 hover:text-brand-600"
        >
          <MessageCircle className="h-5 w-5" />
          <span className="text-[0.7rem] font-semibold">查訂單</span>
        </Link>
      </div>
    </div>
  );
}
