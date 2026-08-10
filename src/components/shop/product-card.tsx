'use client';

import * as React from 'react';
import Link from 'next/link';
import { BatteryCharging, Flame, ShieldCheck } from 'lucide-react';
import { Badge } from '../ui/badge';
import { SmartImage } from '../ui/smart-image';
import { formatHKD } from '../../lib/format';
import { gradeLabel } from '../../data/products';
import { categoryLabel } from '../../lib/labels';
import type { Product } from '../../types';

/** 二手商店商品卡片 */
export function ProductCard({ product }: { product: Product }) {
  const grade = gradeLabel[product.grade];
  const discount = Math.round((1 - product.price / product.originalPrice) * 100);

  return (
    <Link
      href={`/shop/${product.id}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card transition-all duration-200 ease-smooth hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative">
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
          {categoryLabel[product.category]}・{product.storage}・{product.color}
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
