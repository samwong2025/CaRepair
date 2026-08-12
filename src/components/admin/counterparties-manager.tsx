'use client';

import * as React from 'react';
import { Button } from '../../components/ui/button';
import { Input, Select, Textarea } from '../../components/ui/input';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import type { Counterparty, CounterpartyType } from '../../types';

const TYPE_OPTIONS: { value: CounterpartyType; label: string }[] = [
  { value: 'supplier', label: '供應商' },
  { value: 'customer', label: '客戶' },
  { value: 'both', label: '供應商 + 客戶' },
];

const EMPTY: Omit<Counterparty, 'id'> = {
  name: '',
  type: 'supplier',
  contact: '',
  phone: '',
  email: '',
  address: '',
  taxNo: '',
  settlement: '',
  note: '',
};

export function CounterpartiesManager({
  initialCounterparties,
}: {
  initialCounterparties: Counterparty[];
}) {
  const [list, setList] = React.useState<Counterparty[]>(initialCounterparties);
  const [form, setForm] = React.useState<Omit<Counterparty, 'id'>>(EMPTY);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  function set<K extends keyof Omit<Counterparty, 'id'>>(key: K, value: Omit<Counterparty, 'id'>[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function startEdit(c: Counterparty) {
    setEditingId(c.id);
    const { id: _id, ...rest } = c;
    setForm(rest);
    setError(null);
  }
  function reset() {
    setEditingId(null);
    setForm(EMPTY);
    setError(null);
  }

  async function save() {
    if (!form.name.trim()) return setError('請填寫單位名稱');
    setSaving(true);
    setError(null);
    try {
      const res = await fetch('/api/admin/counterparties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: editingId ?? undefined, ...form }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? '儲存失敗');
      const saved: Counterparty = data;
      setList((prev) => {
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
    if (!confirm('確定刪除此往來單位？')) return;
    await fetch(`/api/admin/counterparties?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
    setList((prev) => prev.filter((c) => c.id !== id));
  }

  const field = (label: string, node: React.ReactNode) => (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-faint">{label}</span>
      {node}
    </label>
  );

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card lg:col-span-2">
        <h2 className="text-sm font-bold text-ink">{editingId ? '編輯往來單位' : '新增往來單位'}</h2>
        <div className="mt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            {field(
              '單位名稱',
              <Input value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="例：ACME 零件供應商" />,
            )}
            {field(
              '類型',
              <Select value={form.type} onChange={(e) => set('type', e.target.value as CounterpartyType)}>
                {TYPE_OPTIONS.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>,
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('聯絡人', <Input value={form.contact ?? ''} onChange={(e) => set('contact', e.target.value)} />)}
            {field('電話', <Input value={form.phone ?? ''} onChange={(e) => set('phone', e.target.value)} />)}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {field('電郵', <Input value={form.email ?? ''} onChange={(e) => set('email', e.target.value)} />)}
            {field('稅號 / 統一編號', <Input value={form.taxNo ?? ''} onChange={(e) => set('taxNo', e.target.value)} />)}
          </div>
          {field('地址', <Input value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} />)}
          {field(
            '結算條件',
            <Input
              value={form.settlement ?? ''}
              onChange={(e) => set('settlement', e.target.value)}
              placeholder="例：月結 30 天 / 貨到付款 / 預付"
            />,
          )}
          {field('備註', <Textarea rows={2} value={form.note ?? ''} onChange={(e) => set('note', e.target.value)} />)}
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
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-ink-faint">
                <th className="py-2 font-semibold">名稱</th>
                <th className="py-2 font-semibold">類型</th>
                <th className="py-2 font-semibold">聯絡</th>
                <th className="py-2 font-semibold">結算</th>
                <th className="py-2 text-right font-semibold">操作</th>
              </tr>
            </thead>
            <tbody>
              {list.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-xs text-ink-muted">
                    尚無往來單位
                  </td>
                </tr>
              ) : (
                list.map((c) => (
                  <tr key={c.id} className="border-b border-slate-50 align-top">
                    <td className="py-2 font-semibold text-ink">{c.name}</td>
                    <td className="py-2 text-ink-muted">
                      {TYPE_OPTIONS.find((t) => t.value === c.type)?.label ?? c.type}
                    </td>
                    <td className="py-2 text-xs text-ink-muted">
                      {c.contact ? <div>{c.contact}</div> : null}
                      {c.phone ? <div>{c.phone}</div> : null}
                      {c.email ? <div className="truncate">{c.email}</div> : null}
                    </td>
                    <td className="py-2 text-xs text-ink-muted">{c.settlement ?? '—'}</td>
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
    </div>
  );
}
