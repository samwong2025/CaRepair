'use client';

import * as React from 'react';
import Image from 'next/image';
import {
  Loader2,
  Pencil,
  Plus,
  Save,
  Trash2,
  X,
  Star,
  StarOff,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatHKD } from '../../lib/format';
import { genProductId, SHOP_CATEGORIES, SHOP_GRADES } from '../../lib/shop-store';
import type { Product } from '../../types';

interface ProductsManagerProps {
  initialProducts: Product[];
}

const emptyProduct = (): Product => ({
  id: genProductId(),
  name: '',
  category: 'watch',
  storage: '',
  color: '',
  grade: 'A',
  batteryHealth: 90,
  price: 0,
  originalPrice: 0,
  stock: 1,
  warrantyDays: 90,
  image: '',
  highlights: [],
  description: '',
  accessories: [],
  hot: false,
});

export function ProductsManager({ initialProducts }: ProductsManagerProps) {
  const [products, setProducts] = React.useState<Product[]>(initialProducts);
  const [keyword, setKeyword] = React.useState('');
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [savingId, setSavingId] = React.useState<string | null>(null);
  const [toast, setToast] = React.useState<string | null>(null);

  const filtered = products.filter((p) =>
    `${p.name} ${p.category} ${p.color}`.toLowerCase().includes(keyword.toLowerCase()),
  );

  const openCreate = () => setEditing(emptyProduct());
  const openEdit = (p: Product) => setEditing({ ...p });

  const persist = async (product: Product) => {
    setSavingId(product.id);
    try {
      const res = await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      });
      if (!res.ok) throw new Error('儲存失敗');
      const saved = (await res.json()) as Product;
      setProducts((prev) => {
        const idx = prev.findIndex((p) => p.id === saved.id);
        const next = idx >= 0 ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved];
        return next;
      });
      setToast('商品已儲存');
      setEditing(null);
    } catch (e) {
      setToast(e instanceof Error ? e.message : '儲存失敗');
    } finally {
      setSavingId(null);
      window.setTimeout(() => setToast(null), 2200);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('確定要刪除這項商品？此動作無法復原。')) return;
    setProducts((prev) => prev.filter((p) => p.id !== id));
    try {
      await fetch(`/api/admin/products?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      setToast('商品已刪除');
    } catch {
      setToast('刪除失敗，請稍後再試');
    } finally {
      window.setTimeout(() => setToast(null), 2200);
    }
  };

  const toggleHot = async (p: Product) => {
    const next = { ...p, hot: !p.hot };
    setProducts((prev) => prev.map((x) => (x.id === p.id ? next : x)));
    try {
      await fetch('/api/admin/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(next),
      });
    } catch {
      /* 忽略 */
    }
  };

  return (
    <div className="space-y-4">
      {toast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-xl bg-ink px-5 py-2.5 text-sm font-semibold text-white shadow-lg">
          {toast}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <input
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          placeholder="搜尋名稱 / 分類 / 顏色…"
          className="h-10 flex-1 rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-brand-300"
        />
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          新增商品
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => (
          <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <div className="relative mb-3 h-36 w-full overflow-hidden rounded-xl bg-slate-100">
              {p.image ? (
                <Image src={p.image} alt={p.name} fill className="object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xs text-ink-faint">
                  無圖片
                </div>
              )}
              {p.hot && (
                <span className="absolute left-2 top-2 rounded-full bg-amber-400 px-2 py-0.5 text-[0.65rem] font-bold text-amber-900">
                  熱賣
                </span>
              )}
            </div>
            <p className="line-clamp-1 font-bold text-ink">{p.name}</p>
            <p className="mt-0.5 text-xs text-ink-faint">
              {p.category}・{p.grade} 級・{p.storage}
            </p>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-lg font-extrabold text-brand-700">{formatHKD(p.price)}</span>
              {p.originalPrice > 0 && (
                <span className="text-xs text-ink-faint line-through">
                  {formatHKD(p.originalPrice)}
                </span>
              )}
            </div>
            <div className="mt-1 flex items-center gap-2 text-xs">
              <span className={p.stock > 0 ? 'text-ink-muted' : 'font-bold text-red-500'}>
                庫存 {p.stock}
              </span>
              <span className="text-ink-faint">・電池 {p.batteryHealth}%</span>
            </div>
            <div className="mt-3 flex items-center gap-2">
              <Button size="sm" variant="outline" onClick={() => openEdit(p)}>
                <Pencil className="h-3.5 w-3.5" />
                編輯
              </Button>
              <Button size="sm" variant="ghost" onClick={() => toggleHot(p)}>
                {p.hot ? (
                  <Star className="h-3.5 w-3.5 text-amber-400" />
                ) : (
                  <StarOff className="h-3.5 w-3.5" />
                )}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="ml-auto text-red-500 hover:bg-red-50"
                onClick={() => remove(p.id)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-ink-faint">沒有符合的商品</p>
        )}
      </div>

      {editing && (
        <ProductEditor
          product={editing}
          savingId={savingId}
          onClose={() => setEditing(null)}
          onSave={persist}
        />
      )}
    </div>
  );
}

function ProductEditor({
  product,
  savingId,
  onClose,
  onSave,
}: {
  product: Product;
  savingId: string | null;
  onClose: () => void;
  onSave: (p: Product) => void;
}) {
  const [draft, setDraft] = React.useState<Product>(product);
  const patch = (p: Partial<Product>) => setDraft((prev) => ({ ...prev, ...p }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-extrabold text-ink">
            {product.name ? '編輯商品' : '新增商品'}
          </h3>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-faint hover:bg-slate-100">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="商品名稱" className="sm:col-span-2">
            <input
              value={draft.name}
              onChange={(e) => patch({ name: e.target.value })}
              className="form-input"
              placeholder="例如：Apple Watch Series 9（45mm）"
            />
          </Field>

          <Field label="分類">
            <select
              value={draft.category}
              onChange={(e) => patch({ category: e.target.value as Product['category'] })}
              className="form-input"
            >
              {SHOP_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>

          <Field label="成色評級">
            <select
              value={draft.grade}
              onChange={(e) => patch({ grade: e.target.value as Product['grade'] })}
              className="form-input"
            >
              {SHOP_GRADES.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
          </Field>

          <Field label="容量 / 規格">
            <input
              value={draft.storage}
              onChange={(e) => patch({ storage: e.target.value })}
              className="form-input"
              placeholder="256GB / 64GB"
            />
          </Field>

          <Field label="顏色">
            <input
              value={draft.color}
              onChange={(e) => patch({ color: e.target.value })}
              className="form-input"
              placeholder="午夜暗色"
            />
          </Field>

          <Field label="售價（HK$）">
            <input
              type="number"
              min={0}
              value={draft.price}
              onChange={(e) => patch({ price: Math.max(0, Number(e.target.value) || 0) })}
              className="form-input tabular"
            />
          </Field>

          <Field label="原價（HK$，選填）">
            <input
              type="number"
              min={0}
              value={draft.originalPrice}
              onChange={(e) => patch({ originalPrice: Math.max(0, Number(e.target.value) || 0) })}
              className="form-input tabular"
            />
          </Field>

          <Field label="庫存數量">
            <input
              type="number"
              min={0}
              value={draft.stock}
              onChange={(e) => patch({ stock: Math.max(0, Number(e.target.value) || 0) })}
              className="form-input tabular"
            />
          </Field>

          <Field label="電池健康度（%）">
            <input
              type="number"
              min={0}
              max={100}
              value={draft.batteryHealth}
              onChange={(e) =>
                patch({ batteryHealth: Math.min(100, Math.max(0, Number(e.target.value) || 0)) })
              }
              className="form-input tabular"
            />
          </Field>

          <Field label="保養天數">
            <input
              type="number"
              min={0}
              value={draft.warrantyDays}
              onChange={(e) => patch({ warrantyDays: Math.max(0, Number(e.target.value) || 0) })}
              className="form-input tabular"
            />
          </Field>

          <Field label="圖片網址">
            <input
              value={draft.image}
              onChange={(e) => patch({ image: e.target.value })}
              className="form-input"
              placeholder="https://…"
            />
          </Field>

          <Field label="商品描述" className="sm:col-span-2">
            <textarea
              value={draft.description}
              onChange={(e) => patch({ description: e.target.value })}
              rows={3}
              className="form-input"
            />
          </Field>

          <Field label="賣點（每行一項）" className="sm:col-span-2">
            <textarea
              value={draft.highlights.join('\n')}
              onChange={(e) =>
                patch({ highlights: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })
              }
              rows={3}
              className="form-input"
              placeholder="電池健康度 96%\n無花無崩"
            />
          </Field>

          <Field label="隨附配件（每行一項）" className="sm:col-span-2">
            <textarea
              value={draft.accessories.join('\n')}
              onChange={(e) =>
                patch({ accessories: e.target.value.split('\n').map((s) => s.trim()).filter(Boolean) })
              }
              rows={3}
              className="form-input"
              placeholder="原裝包裝盒\nUSB-C 充電線"
            />
          </Field>

          <label className="flex items-center gap-2 sm:col-span-2">
            <input
              type="checkbox"
              checked={draft.hot}
              onChange={(e) => patch({ hot: e.target.checked })}
              className="h-4 w-4 rounded border-slate-300"
            />
            <span className="text-sm text-ink-muted">標記為熱賣商品</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <Button variant="outline" onClick={onClose}>
            取消
          </Button>
          <Button onClick={() => onSave(draft)} disabled={savingId === draft.id}>
            {savingId === draft.id ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            儲存商品
          </Button>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={`block ${className ?? ''}`}>
      <span className="mb-1 block text-xs font-semibold text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
