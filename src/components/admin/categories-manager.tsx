'use client';

import * as React from 'react';
import { Button } from '../../components/ui/button';
import { Input, Select } from '../../components/ui/input';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { ProductCategory } from '../../types';

const GROUPS = [
  { value: '', label: '通用（不指定）' },
  { value: 'iphone', label: 'iPhone' },
  { value: 'ipad', label: 'iPad' },
  { value: 'watch', label: 'Apple Watch' },
  { value: 'macbook', label: 'Mac' },
];

export function CategoriesManager({ initialCategories }: { initialCategories: ProductCategory[] }) {
  const [categories, setCategories] = React.useState<ProductCategory[]>(initialCategories);
  const [name, setName] = React.useState('');
  const [group, setGroup] = React.useState('');
  const [sortOrder, setSortOrder] = React.useState(0);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const sorted = React.useMemo(
    () => [...categories].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0)),
    [categories],
  );

  function startEdit(c: ProductCategory) {
    setEditingId(c.id);
    setName(c.name);
    setGroup(c.group ?? '');
    setSortOrder(c.sortOrder ?? 0);
    setError(null);
  }
  function reset() {
    setEditingId(null);
    setName('');
    setGroup('');
    setSortOrder(0);
    setError(null);
  }

  async function save() {
    if (!name.trim()) return setError('請填寫分類名稱');
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId ?? undefined, name, group: group || undefined, sortOrder }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? '儲存失敗');
      const saved: ProductCategory = data;
      setCategories((prev) => {
        const idx = prev.findIndex((c) => c.id === saved.id);
        return idx >= 0 ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved];
      });
      reset();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  async function remove(id: string) {
    if (!confirm('確定刪除此分類？')) return;
    await fetch(`/api/admin/categories?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setCategories((prev) => prev.filter((c) => c.id !== id));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card lg:col-span-2">
        <h2 className="text-sm font-bold text-ink">{editingId ? '編輯分類' : '新增分類'}</h2>
        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-faint">分類名稱</span>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="例：iPhone 電池" />
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-faint">關聯產品大類（選填）</span>
            <Select value={group} onChange={(e) => setGroup(e.target.value)}>
              {GROUPS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </Select>
          </label>
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-faint">排序</span>
            <Input
              type="number"
              value={sortOrder}
              onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
            />
          </label>
          {error ? <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p> : null}
          <div className="flex gap-2">
            <Button onClick={save} disabled={saving}>
              {editingId ? '儲存' : (<><Plus className="h-4 w-4" />新增</>)}
            </Button>
            {editingId ? (
              <Button variant="outline" onClick={reset}>
                取消
              </Button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card lg:col-span-3">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 text-left text-xs text-ink-faint">
              <th className="py-2 font-semibold">名稱</th>
              <th className="py-2 font-semibold">大類</th>
              <th className="py-2 font-semibold">排序</th>
              <th className="py-2 text-right font-semibold">操作</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-6 text-center text-xs text-ink-muted">
                  尚無分類
                </td>
              </tr>
            ) : (
              sorted.map((c) => (
                <tr key={c.id} className="border-b border-slate-50">
                  <td className="py-2 font-semibold text-ink">{c.name}</td>
                  <td className="py-2 text-ink-muted">{c.group || '—'}</td>
                  <td className="py-2 text-ink-muted">{c.sortOrder ?? 0}</td>
                  <td className="py-2 text-right">
                    <button
                      onClick={() => startEdit(c)}
                      className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-brand-600 hover:bg-brand-50"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                      編輯
                    </button>
                    <button
                      onClick={() => remove(c.id)}
                      className="ml-1 inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-semibold text-red-500 hover:bg-red-50"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      刪除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
