'use client';

import * as React from 'react';
import { Check, Database, HardDriveDownload, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input, Select } from '../ui/input';
import { loadModels, saveModel, deleteModel } from '../../lib/catalog-store';
import type { DeviceCategory, DeviceModel, PriceTier } from '../../types';

const CATEGORIES: { value: DeviceCategory; label: string }[] = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'ipad', label: 'iPad' },
  { value: 'watch', label: 'Apple Watch' },
  { value: 'macbook', label: 'MacBook' },
];
const TIERS: { value: PriceTier; label: string }[] = [
  { value: 'flagship', label: '旗艦 1.4x' },
  { value: 'premium', label: '進階 1.2x' },
  { value: 'standard', label: '標準 1.0x' },
  { value: 'legacy', label: '舊款 0.8x' },
];

function emptyModel(): DeviceModel {
  const year = new Date().getFullYear();
  return {
    id: `new-${year}-${Math.random().toString(36).slice(2, 6)}`,
    category: 'iphone',
    name: '',
    series: '',
    year,
    tier: 'standard',
    hot: false,
  };
}

export function ModelsManager() {
  const [models, setModels] = React.useState<DeviceModel[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState('');
  const [savedId, setSavedId] = React.useState('');
  const [mode, setMode] = React.useState('');
  const [filter, setFilter] = React.useState<DeviceCategory | 'all'>('all');
  const [notice, setNotice] = React.useState('');
  const [draft, setDraft] = React.useState<DeviceModel | null>(null);

  React.useEffect(() => {
    loadModels().then((data) => {
      setModels(data);
      setMode(data.length > 0 ? 'supabase' : 'local');
      setLoading(false);
    });
  }, []);

  const update = (id: string, patch: Partial<DeviceModel>) => {
    setModels((prev) => prev.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  };

  const save = async (model: DeviceModel) => {
    if (!model.name.trim()) {
      setNotice('機型名稱不可為空');
      return;
    }
    setSavingId(model.id);
    setNotice('');
    const res = await saveModel(model);
    setSavingId('');
    if (res.ok) {
      setSavedId(model.id);
      setMode(res.mode);
      setNotice(res.mode === 'local' ? '已暫存至瀏覽器（mock 模式）' : '已寫入 Supabase 雲端');
      setTimeout(() => setSavedId(''), 1500);
    } else {
      setNotice(`儲存失敗：${res.error}`);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('確定刪除此機型？此操作不可復原。')) return;
    const res = await deleteModel(id);
    if (res.ok) setModels((prev) => prev.filter((m) => m.id !== id));
    else setNotice(`刪除失敗：${res.error}`);
  };

  const addNew = () => setDraft(emptyModel());

  const commitDraft = async () => {
    if (!draft || !draft.name.trim()) {
      setNotice('機型名稱不可為空');
      return;
    }
    const res = await saveModel(draft);
    if (res.ok) {
      setModels((prev) => [...prev, draft]);
      setDraft(null);
      setMode(res.mode);
      setNotice(res.mode === 'local' ? '新增成功（瀏覽器暫存）' : '新增成功（雲端）');
    } else {
      setNotice(`新增失敗：${res.error}`);
    }
  };

  const visible = models
    .filter((m) => filter === 'all' || m.category === filter)
    .sort((a, b) => b.year - a.year);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-ink-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 載入機型…
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3">
        <div className="flex items-center gap-2 text-sm text-ink-muted">
          {mode === 'local' ? (
            <HardDriveDownload className="h-4 w-4 text-amber-500" />
          ) : (
            <Database className="h-4 w-4 text-brand-500" />
          )}
          <span>
            模式：<span className="font-bold text-ink">{mode === 'local' ? '瀏覽器暫存' : 'Supabase 雲端'}</span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select value={filter} onChange={(e) => setFilter(e.target.value as DeviceCategory | 'all')} className="w-auto">
            <option value="all">全部機型</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </Select>
          <Button size="sm" variant="cta" onClick={addNew}>
            <Plus className="h-3.5 w-3.5" /> 新增機型
          </Button>
        </div>
      </div>

      {notice ? (
        <div className="no-print rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-700">{notice}</div>
      ) : null}

      {draft ? (
        <div className="rounded-xl border border-brand-300 bg-brand-50/50 p-4 space-y-3">
          <p className="text-sm font-semibold text-ink">新增機型</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Input placeholder="機型 ID（如 iphone-18）" value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} />
            <Input placeholder="顯示名稱（如 iPhone 18 Pro）" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Input placeholder="系列（如 iPhone 18）" value={draft.series} onChange={(e) => setDraft({ ...draft, series: e.target.value })} />
            <Input type="number" placeholder="年份" value={draft.year} onChange={(e) => setDraft({ ...draft, year: Number(e.target.value) || new Date().getFullYear() })} />
            <Select value={draft.category} onChange={(e) => setDraft({ ...draft, category: e.target.value as DeviceCategory })}>
              {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </Select>
            <Select value={draft.tier} onChange={(e) => setDraft({ ...draft, tier: e.target.value as PriceTier })}>
              {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
            </Select>
            <Input placeholder="圖片路徑（可留空）" value={draft.image ?? ''} onChange={(e) => setDraft({ ...draft, image: e.target.value || undefined })} />
            <label className="flex items-center gap-2 text-sm text-ink-muted">
              <input type="checkbox" checked={Boolean(draft.hot)} onChange={(e) => setDraft({ ...draft, hot: e.target.checked })} className="h-4 w-4 accent-brand-600" /> 熱門
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="cta" onClick={commitDraft}>建立</Button>
            <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>取消</Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[820px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">機型名稱</th>
              <th className="px-3 py-3">分類</th>
              <th className="px-3 py-3">系列</th>
              <th className="px-3 py-3">年份</th>
              <th className="px-3 py-3">級距</th>
              <th className="px-3 py-3 text-center">熱門</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((m) => {
              const saving = savingId === m.id;
              const saved = savedId === m.id;
              return (
                <tr key={m.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <Input value={m.name} onChange={(e) => update(m.id, { name: e.target.value })} className="font-semibold" />
                    <p className="mt-0.5 px-1 text-xs text-ink-faint">{m.id}</p>
                  </td>
                  <td className="px-3 py-3">
                    <Select value={m.category} onChange={(e) => update(m.id, { category: e.target.value as DeviceCategory })} className="w-auto">
                      {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
                    </Select>
                  </td>
                  <td className="px-3 py-3"><Input value={m.series} onChange={(e) => update(m.id, { series: e.target.value })} /></td>
                  <td className="px-3 py-3"><Input type="number" value={m.year} onChange={(e) => update(m.id, { year: Number(e.target.value) || 0 })} className="w-20" /></td>
                  <td className="px-3 py-3">
                    <Select value={m.tier} onChange={(e) => update(m.id, { tier: e.target.value as PriceTier })} className="w-auto">
                      {TIERS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </Select>
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input type="checkbox" checked={Boolean(m.hot)} onChange={(e) => update(m.id, { hot: e.target.checked })} className="h-4 w-4 accent-brand-600" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="cta" disabled={saving} onClick={() => save(m)}>
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                        {saved ? '已存' : '儲存'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(m.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="no-print px-1 text-xs text-ink-faint">* 新增／修改機型後，線上報價與預約選單即時生效。刪除會影響既有工單參照，請謹慎。</p>
    </div>
  );
}
