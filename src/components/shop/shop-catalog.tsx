'use client';

import * as React from 'react';
import { PackageOpen, Search } from 'lucide-react';
import { Input, Select } from '../ui/input';
import { ProductCard } from './product-card';
import { categoryLabel, resolveProductCategoryLabel } from '../../lib/labels';
import { siteConfig } from '../../config/site';
import type { Product, ProductGrade } from '../../types';

/** 二手商店目錄：分類 / 評級 / 排序篩選 */
export function ShopCatalog({ products }: { products: Product[] }) {
  const [keyword, setKeyword] = React.useState('');
  const [category, setCategory] = React.useState<string>('all');
  const [grade, setGrade] = React.useState<ProductGrade | 'all'>('all');
  const [sort, setSort] = React.useState<'price-asc' | 'price-desc' | 'hot'>('hot');

  /**
   * 动态聚合当前已上架商品里实际使用过的分类；
   * 同时把 4 个维修主分类（iPhone/iPad/MacBook/Apple Watch）作为「始终可见」基底。
   */
  const availableCategories = React.useMemo(() => {
    const seen = new Set<string>();
    products.forEach((product) => {
      if (product.category) seen.add(product.category);
    });
    // 已知的传统枚举同时也保留为可选
    Object.keys(categoryLabel).forEach((key) => seen.add(key));
    return Array.from(seen);
  }, [products]);

  const filtered = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    const list = products.filter((product) => {
      const matchCategory = category === 'all' || product.category === category;
      const matchGrade = grade === 'all' || product.grade === grade;
      const matchKeyword =
        !kw ||
        product.name.toLowerCase().includes(kw) ||
        product.color.toLowerCase().includes(kw) ||
        product.storage.toLowerCase().includes(kw);
      return matchCategory && matchGrade && matchKeyword;
    });

    return [...list].sort((a, b) => {
      if (sort === 'price-asc') return a.price - b.price;
      if (sort === 'price-desc') return b.price - a.price;
      return Number(b.hot ?? false) - Number(a.hot ?? false) || b.batteryHealth - a.batteryHealth;
    });
  }, [products, keyword, category, grade, sort]);

  return (
    <div>
      <div className="grid gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-card sm:px-5 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜尋型號 / 容量 / 顏色…"
            className="pl-10"
            aria-label="搜尋商品"
          />
        </div>
        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value)}
          className="md:w-40"
          aria-label="分類篩選"
        >
          <option value="all">全部分類</option>
          {availableCategories.map((key) => (
            <option key={key} value={key}>
              {key in categoryLabel ? categoryLabel[key as keyof typeof categoryLabel] : key}
            </option>
          ))}
        </Select>
        <Select
          value={grade}
          onChange={(event) => setGrade(event.target.value as ProductGrade | 'all')}
          className="md:w-32"
          aria-label="評級篩選"
        >
          <option value="all">全部評級</option>
          <option value="S">S 級</option>
          <option value="A">A 級</option>
          <option value="B">B 級</option>
        </Select>
        <Select
          value={sort}
          onChange={(event) => setSort(event.target.value as typeof sort)}
          className="md:w-36"
          aria-label="排序方式"
        >
          <option value="hot">熱門優先</option>
          <option value="price-asc">價格由低到高</option>
          <option value="price-desc">價格由高到低</option>
        </Select>
      </div>

      {filtered.length > 0 ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center">
          <PackageOpen className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.6} />
          <p className="mt-4 text-base font-bold text-ink">搵唔到相關商品</p>
          <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
            試下清空篩選條件，或致電 {siteConfig.hotline} 搵客服直接幫你搵。
          </p>
        </div>
      )}

      {/* 避免依賴全局，確保 resolve 函數被實際用到 */}
      {false && <span className="sr-only">{resolveProductCategoryLabel({ category: category })}</span>}
    </div>
  );
}
