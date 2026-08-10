'use client';

import * as React from 'react';
import { PackageOpen, Search } from 'lucide-react';
import { Input, Select } from '../ui/input';
import { ProductCard } from './product-card';
import { categoryLabel } from '../../lib/labels';
import type { DeviceCategory, Product, ProductGrade } from '../../types';

/** 二手商店目錄：分類 / 評級 / 排序篩選 */
export function ShopCatalog({ products }: { products: Product[] }) {
  const [keyword, setKeyword] = React.useState('');
  const [category, setCategory] = React.useState<DeviceCategory | 'all'>('all');
  const [grade, setGrade] = React.useState<ProductGrade | 'all'>('all');
  const [sort, setSort] = React.useState<'price-asc' | 'price-desc' | 'hot'>('hot');

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
      <div className="no-print flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜尋型號 / 顏色 / 容量"
            className="pl-10"
            aria-label="搜尋二手商品"
          />
        </div>
        <Select
          value={category}
          onChange={(event) => setCategory(event.target.value as DeviceCategory | 'all')}
          className="md:w-40"
          aria-label="分類篩選"
        >
          <option value="all">全部分類</option>
          {(Object.keys(categoryLabel) as DeviceCategory[]).map((key) => (
            <option key={key} value={key}>
              {categoryLabel[key]}
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
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <p className="mt-6 flex flex-col items-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-16 text-center text-sm text-ink-muted">
          <PackageOpen className="h-6 w-6 text-ink-faint" />
          暫時無符合條件的商品，歡迎調整篩選或聯絡門市查詢現貨。
        </p>
      )}
    </div>
  );
}
