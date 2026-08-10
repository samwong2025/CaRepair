import type { Metadata } from 'next';
import { Sparkles, Tag, ShieldCheck } from 'lucide-react';
import { getRepository } from '../../../lib/repositories';
import { ShopCatalog } from '../../../components/shop/shop-catalog';
import { SectionHeading } from '../../../components/ui/section';

export const metadata: Metadata = {
  title: '二手商店｜CathyRepair 凱西維修',
  description:
    'CathyRepair 二手商店嚴選 iPhone、iPad、Apple Watch、MacBook，全機 32 項功能檢測、分級評估、90 日本店保養，支援送貨上門與到店自取。',
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
          香港行貨來源、透明評級、90 日本店保養，買得安心用得放心。
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
            90 日本店保養
          </span>
        </div>
      </div>

      <div className="mt-10">
        <SectionHeading eyebrow="精選現貨" title="二手裝置目錄" titleEn="Catalog" />
        <div className="mt-5">
          <ShopCatalog products={products} />
        </div>
      </div>
    </div>
  );
}
