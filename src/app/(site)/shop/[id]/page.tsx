import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  BatteryCharging,
  CheckCircle2,
  ChevronRight,
  Package,
  ShieldCheck,
  Wrench,
} from 'lucide-react';
import { getRepository } from '../../../../lib/repositories';
import { ProductDetail } from '../../../../components/shop/product-detail';
import { SmartImage } from '../../../../components/ui/smart-image';
import { Badge } from '../../../../components/ui/badge';
import { formatHKD } from '../../../../lib/format';
import { gradeLabel } from '../../../../data/products';
import { resolveProductCategoryLabel } from '../../../../lib/labels';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const product = await getRepository().getProduct(params.id);
  if (!product) return { title: '商品不存在｜CathyRepair' };
  return {
    title: `${product.name}｜二手商店 CathyRepair`,
    description: product.description,
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = await getRepository().getProduct(params.id);
  if (!product) notFound();

  const grade = gradeLabel[product.grade];
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  const specs = [
    { label: '容量', value: product.storage },
    { label: '顏色', value: product.color },
    { label: '評級', value: grade.label },
    { label: '電池健康度', value: `${product.batteryHealth}%` },
    { label: '本店保養', value: `${product.warrantyDays} 日` },
    { label: '現貨', value: `${product.stock} 部` },
  ];

  return (
    <div className="mx-auto w-full max-w-7xl px-4 pb-16 pt-8 sm:px-6 lg:px-8">
      <nav className="flex items-center gap-1 text-xs text-ink-faint">
        <Link href="/" className="hover:text-brand-600">
          首頁
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <Link href="/shop" className="hover:text-brand-600">
          二手商店
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-ink-muted">{product.name}</span>
      </nav>

      <div className="mt-5 grid gap-8 lg:grid-cols-2">
        <div>
          <div className="relative overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-card">
            <SmartImage
              src={product.image}
              alt={product.name}
              wrapperClassName="aspect-[4/3]"
              fallbackText={product.name}
            />
            <div className="absolute left-4 top-4 flex gap-2">
              <Badge variant={grade.tone as 'success' | 'brand' | 'warning' | 'neutral'} size="sm">
                {grade.label}
              </Badge>
              {discount > 0 ? (
                <span className="rounded-lg bg-ink px-2 py-1 text-[0.7rem] font-extrabold text-white">
                  省 {discount}%
                </span>
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {specs.map((spec) => (
              <div key={spec.label} className="rounded-2xl border border-slate-200 bg-white p-3 text-center shadow-card">
                <p className="text-[0.68rem] text-ink-faint">{spec.label}</p>
                <p className="mt-1 text-sm font-extrabold text-ink">{spec.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
            <h2 className="text-base font-extrabold text-ink">商品詳情</h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{product.description}</p>

            <h3 className="mt-5 flex items-center gap-2 text-sm font-bold text-ink">
              <Package className="h-4 w-4 text-brand-600" />
              隨機全新配件
            </h3>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {product.accessories.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-muted">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>

            <h3 className="mt-5 flex items-center gap-2 text-sm font-bold text-ink">
              <ShieldCheck className="h-4 w-4 text-brand-600" />
              品質保證
            </h3>
            <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
              {product.services.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-muted">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lift">
            <p className="text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">
              {resolveProductCategoryLabel(product)}・{product.storage}・{product.color}
            </p>
            <h1 className="mt-1 text-2xl font-extrabold leading-snug text-ink">{product.name}</h1>
            <div className="mt-3 flex items-end gap-3">
              <span className="tabular text-3xl font-extrabold text-brand-600">
                {formatHKD(product.price)}
              </span>
              <span className="text-sm text-ink-faint line-through">
                {formatHKD(product.originalPrice)}
              </span>
            </div>

            <ul className="mt-4 space-y-1.5">
              {product.highlights.map((item) => (
                <li key={item} className="flex items-center gap-2 text-sm text-ink-muted">
                  <ShieldCheck className="h-4 w-4 shrink-0 text-success" />
                  {item}
                </li>
              ))}
            </ul>

            <div className="mt-5">
              <ProductDetail product={product} />
            </div>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-3 rounded-2xl bg-surface-soft p-3">
              <BatteryCharging className="h-5 w-5 text-brand-600" />
              <p className="text-xs font-semibold text-ink-muted">電池健康度實測，絕不虛標</p>
            </div>
            <div className="flex items-center gap-3 rounded-2xl bg-surface-soft p-3">
              <Wrench className="h-5 w-5 text-brand-600" />
              <p className="text-xs font-semibold text-ink-muted">{product.warrantyDays} 日本店保養</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
