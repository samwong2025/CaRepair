'use client';

import * as React from 'react';
import Link from 'next/link';
import { BatteryCharging, Flame, PackageOpen, ShieldCheck, Sparkles } from 'lucide-react';
import { Badge } from '../ui/badge';
import { SmartImage } from '../ui/smart-image';
import { formatHKD } from '../../lib/format';
import { gradeLabel } from '../../data/products';
import { resolveProductCategoryLabel } from '../../lib/labels';
import type { Product } from '../../types';

/** 二手商店商品卡片 */
export function ProductCard({ product }: { product: Product }) {
  const grade = gradeLabel[product.grade];
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);
  const categoryDisplay = resolveProductCategoryLabel(product);

  return (
    <Link
      href={`/shop/${product.id}`}
      className="glow-card group flex flex-col rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 ease-smooth hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative overflow-hidden rounded-t-2xl">
        <SmartImage
          src={product.image}
          alt={product.name}
          wrapperClassName="aspect-[4/3]"
          fallbackText={product.name}
        />
        <div className="pointer-events-none absolute left-3 top-3 flex flex-wrap gap-1.5">
          {product.hot ? (
            <Badge variant="cta" size="sm">
              <Flame className="h-3 w-3" />
              熱賣
            </Badge>
          ) : null}
          <Badge variant={grade.tone as 'success' | 'brand' | 'warning' | 'neutral'} size="sm">
            {grade.label}
          </Badge>
        </div>
        {discount > 0 ? (
          <span className="absolute right-3 top-3 rounded-lg bg-ink px-2 py-1 text-[0.7rem] font-extrabold text-white shadow-cta">
            省 {discount}%
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <p className="text-[0.68rem] font-bold uppercase tracking-wide text-ink-faint">
          {categoryDisplay}・{product.storage}・{product.color}
        </p>
        <h3 className="mt-1 line-clamp-2 text-base font-extrabold leading-snug text-ink">
          {product.name}
        </h3>

        <ul className="mt-2.5 space-y-1">
          {product.highlights.slice(0, 3).map((item) => (
            <li key={item} className="flex items-start gap-1.5 text-xs text-ink-muted">
              <ShieldCheck className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
              {item}
            </li>
          ))}
        </ul>

        <div className="mt-3 space-y-2 rounded-xl bg-slate-50 p-3">
          <div>
            <p className="mb-1 flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-wide text-ink-faint">
              <PackageOpen className="h-3 w-3 text-brand-500" />
              隨機全新配件
            </p>
            <div className="flex flex-wrap gap-1">
              {product.accessories.map((acc) => (
                <span
                  key={acc}
                  className="inline-flex items-center gap-1 rounded-md bg-white px-1.5 py-0.5 text-[0.68rem] font-medium text-ink-muted ring-1 ring-slate-200"
                >
                  <Sparkles className="h-2.5 w-2.5 text-success" />
                  {acc}
                </span>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1 flex items-center gap-1 text-[0.68rem] font-bold uppercase tracking-wide text-ink-faint">
              <ShieldCheck className="h-3 w-3 text-brand-500" />
              品質保證
            </p>
            <div className="flex flex-wrap gap-1">
              {product.services.map((svc) => (
                <span
                  key={svc}
                  className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-1.5 py-0.5 text-[0.68rem] font-medium text-brand-700"
                >
                  <ShieldCheck className="h-2.5 w-2.5 text-brand-500" />
                  {svc}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-auto flex items-end justify-between pt-4">
          <div>
            <p className="tabular text-xl font-extrabold leading-none text-brand-600">
              {formatHKD(product.price)}
            </p>
            <p className="mt-1 text-[0.7rem] text-ink-faint line-through">
              {formatHKD(product.originalPrice)}
            </p>
          </div>
          <span className="inline-flex items-center gap-1 rounded-lg bg-success/10 px-2 py-1 text-[0.7rem] font-bold text-success">
            <BatteryCharging className="h-3.5 w-3.5" />
            電量 {product.batteryHealth}%
          </span>
        </div>
      </div>
    </Link>
  );
}
