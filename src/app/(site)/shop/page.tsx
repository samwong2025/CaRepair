import type { Metadata } from 'next';
import Link from 'next/link';
import { Sparkles, Tag, ShieldCheck, PackageSearch } from 'lucide-react';
import { getRepository } from '../../../lib/repositories';
import { ShopCatalog } from '../../../components/shop/shop-catalog';
import { SectionHeading } from '../../../components/ui/section';

export const metadata: Metadata = {
  title: '二手商店｜CathyRepair',
  description:
    'CathyRepair 二手商店嚴選 iPhone、iPad、Apple Watch、MacBook，全機 32 項功能檢測、分級評估、30 日本店保養，支援送貨上門與到店自取。',
};

export const dynamic = 'force-dynamic';

export default async function ShopPage() {
  const products = await getRepository().listProducts();

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-10 sm:px-6 lg:px-8">
      <div className="rounded-3xl bg-brand-gradient px-6 py-10 text-white sm:px-10">
        <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
          <Sparkles className="h-4 w-4" />
          Certified Pre-owned
        </p>
        <h1 className="mt-2 text-3xl font-extrabold sm:text-4xl">二手商店・嚴選靚機</h1>
        <p className="mt-3 max-w-2xl text-sm text-white/85 sm:text-base">
          每一部機器均經 32 項功能檢測與外觀分級，附原裝或全新配件及檢測報告。
          香港行貨來源、透明評級、30 日本店保養，買得安心用得放心。
        </p>
        <div className="mt-6 flex flex-wrap gap-3 text-sm">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            32 項功能檢測
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold backdrop-blur">
            <Tag className="h-4 w-4" />
            S / A / B 透明評級
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 font-semibold backdrop-blur">
            <ShieldCheck className="h-4 w-4" />
            30 日本店保養
          </span>
        </div>
      </div>

      <div className="mt-10">
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
              <PackageSearch className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-bold text-ink">已落單？查詢二手購買進度</p>
              <p className="mt-0.5 text-xs text-ink-muted">
                用手機號碼或訂單編號即可查看出貨、到店自取與保養狀態。
              </p>
            </div>
          </div>
          <Link
            href="/track"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-brand transition-transform hover:scale-[1.03] active:scale-95"
          >
            <PackageSearch className="h-4 w-4" />
            查訂單
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading eyebrow="精選現貨" title="二手產品目錄" titleEn="Catalog" />
        <div className="mt-5">
          <ShopCatalog products={products} />
        </div>
      </div>
    </div>
  );
}
