'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MessageCircle, Wrench } from 'lucide-react';
import { siteConfig } from '../../config/site';

/** 流動產品底部固定操作列 —— 提升即時轉化 */
export function MobileActionBar() {
  const pathname = usePathname();
  if (pathname.startsWith('/admin')) return null;

  const whatsappDigits = siteConfig.whatsapp.replace(/\s|\+/g, '');
  const whatsappHref = `https://wa.me/852${whatsappDigits}?text=${encodeURIComponent(
    '你好，我想查詢 CathyRepair 的維修服務 🙏'
  )}`;

  return (
    <div className="no-print fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
      <div className="grid grid-cols-3 items-center gap-2 px-3 py-2.5">
        <a
          href={whatsappHref}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="WhatsApp 聯絡客服"
          className="flex cursor-pointer flex-col items-center gap-1 rounded-xl py-1.5 text-ink-muted transition-colors hover:bg-[#25D366]/10 hover:text-[#25D366]"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 32 32"
            aria-hidden="true"
            className="h-5 w-5 fill-current"
          >
            <path d="M19.11 17.63c-.29-.14-1.71-.84-1.97-.94-.26-.1-.46-.14-.65.14-.19.29-.74.94-.91 1.13-.17.19-.34.22-.62.07-.29-.14-1.21-.45-2.31-1.42-.85-.76-1.43-1.7-1.6-1.98-.17-.29-.02-.45.13-.59.13-.13.29-.34.43-.51.14-.17.19-.29.29-.48.1-.19.05-.36-.02-.5-.07-.14-.65-1.56-.89-2.14-.24-.57-.48-.49-.65-.5h-.55c-.19 0-.5.07-.76.36-.26.29-1 .98-1 2.39 0 1.41 1.02 2.77 1.17 2.96.14.19 2.01 3.07 4.87 4.3.68.29 1.21.46 1.62.59.68.22 1.3.19 1.79.11.55-.08 1.71-.7 1.95-1.37.24-.67.24-1.25.17-1.37-.07-.12-.26-.19-.55-.33z" />
            <path d="M27.21 4.79C24.13 1.71 20.06 0 16 0 7.18 0 .05 7.13.05 15.95c0 2.81.74 5.55 2.14 7.96L0 32l8.27-2.16a15.91 15.91 0 0 0 7.73 1.97h.01c8.82 0 15.94-7.13 15.94-15.95 0-4.26-1.66-8.27-4.74-11.07zM16 29.79h-.01a13.85 13.85 0 0 1-7.06-1.93l-.51-.3-5.13 1.34 1.37-5-.33-.52a13.83 13.83 0 0 1-2.12-7.43C2.21 8.43 8.43 2.21 16 2.21c3.62 0 7.02 1.41 9.58 3.96a13.46 13.46 0 0 1 3.96 9.58c0 7.56-6.22 13.95-13.54 13.95z" />
          </svg>
          <span className="text-[0.7rem] font-semibold">WhatsApp 客服</span>
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
