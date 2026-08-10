'use client';

import * as React from 'react';
import { Check, Database, HardDriveDownload, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input, Select } from '../ui/input';
import { loadSymptoms, saveSymptom, deleteSymptom } from '../../lib/catalog-store';
import type { DeviceCategory, Symptom } from '../../types';

const CATEGORIES: { value: DeviceCategory; label: string }[] = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'ipad', label: 'iPad' },
  { value: 'watch', label: 'Apple Watch' },
  { value: 'macbook', label: 'MacBook' },
];

function emptySymptom(): Symptom {
  return {
    id: `new-${Math.random().toString(36).slice(2, 6)}`,
    name: '',
    shortName: '',
    icon: 'Wrench',
    description: '',
    categories: ['iphone'],
    frequency: 50,
    urgent: false,
  };
}

export function SymptomsManager() {
  const [symptoms, setSymptoms] = React.useState<Symptom[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingId, setSavingId] = React.useState('');
  const [savedId, setSavedId] = React.useState('');
  const [mode, setMode] = React.useState('');
  const [notice, setNotice] = React.useState('');
  const [draft, setDraft] = React.useState<Symptom | null>(null);

  React.useEffect(() => {
    loadSymptoms().then((data) => {
      setSymptoms(data);
      setMode(data.length > 0 ? 'supabase' : 'local');
      setLoading(false);
    });
  }, []);

  const update = (id: string, patch: Partial<Symptom>) => {
    setSymptoms((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  };
  const toggleCat = (s: Symptom, cat: DeviceCategory) => {
    const has = s.categories.includes(cat);
    const next = has ? s.categories.filter((c) => c !== cat) : [...s.categories, cat];
    update(s.id, { categories: next });
  };

  const save = async (s: Symptom) => {
    if (!s.name.trim()) {
      setNotice('故障名稱不可為空');
      return;
    }
    setSavingId(s.id);
    setNotice('');
    const res = await saveSymptom(s);
    setSavingId('');
    if (res.ok) {
      setSavedId(s.id);
      setMode(res.mode);
      setNotice(res.mode === 'local' ? '已暫存至瀏覽器（mock 模式）' : '已寫入 Supabase 雲端');
      setTimeout(() => setSavedId(''), 1500);
    } else {
      setNotice(`儲存失敗：${res.error}`);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('確定刪除此故障項目？此操作不可復原。')) return;
    const res = await deleteSymptom(id);
    if (res.ok) setSymptoms((prev) => prev.filter((s) => s.id !== id));
    else setNotice(`刪除失敗：${res.error}`);
  };

  const addNew = () => setDraft(emptySymptom());
  const commitDraft = async () => {
    if (!draft || !draft.name.trim()) {
      setNotice('故障名稱不可為空');
      return;
    }
    const res = await saveSymptom(draft);
    if (res.ok) {
      setSymptoms((prev) => [...prev, draft]);
      setDraft(null);
      setMode(res.mode);
      setNotice(res.mode === 'local' ? '新增成功（瀏覽器暫存）' : '新增成功（雲端）');
    } else {
      setNotice(`新增失敗：${res.error}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-ink-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 載入故障清單…
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
          <span>模式：<span className="font-bold text-ink">{mode === 'local' ? '瀏覽器暫存' : 'Supabase 雲端'}</span></span>
        </div>
        <Button size="sm" variant="cta" onClick={addNew}>
          <Plus className="h-3.5 w-3.5" /> 新增故障
        </Button>
      </div>

      {notice ? (
        <div className="no-print rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-700">{notice}</div>
      ) : null}

      {draft ? (
        <div className="rounded-xl border border-brand-300 bg-brand-50/50 p-4 space-y-3">
          <p className="text-sm font-semibold text-ink">新增故障</p>
          <div className="grid gap-3 sm:grid-cols-2">
            <Input placeholder="故障 ID（如 screen_crack）" value={draft.id} onChange={(e) => setDraft({ ...draft, id: e.target.value })} />
            <Input placeholder="顯示名稱" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <Input placeholder="簡稱（如 爆芒換屏）" value={draft.shortName} onChange={(e) => setDraft({ ...draft, shortName: e.target.value })} />
            <Input placeholder="圖示名（lucide，如 BatteryWarning）" value={draft.icon} onChange={(e) => setDraft({ ...draft, icon: e.target.value })} />
            <Input placeholder="描述" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            <Input type="number" placeholder="常見度（數字越大越前）" value={draft.frequency} onChange={(e) => setDraft({ ...draft, frequency: Number(e.target.value) || 0 })} />
          </div>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => {
              const on = draft.categories.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => {
                    const has = draft.categories.includes(c.value);
                    setDraft({ ...draft, categories: has ? draft.categories.filter((x) => x !== c.value) : [...draft.categories, c.value] });
                  }}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${on ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-muted'}`}
                >
                  {c.label}
                </button>
              );
            })}
            <label className="flex items-center gap-1.5 text-xs text-ink-muted">
              <input type="checkbox" checked={Boolean(draft.urgent)} onChange={(e) => setDraft({ ...draft, urgent: e.target.checked })} className="h-4 w-4 accent-rose-500" /> 緊急
            </label>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="cta" onClick={commitDraft}>建立</Button>
            <Button size="sm" variant="ghost" onClick={() => setDraft(null)}>取消</Button>
          </div>
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">故障名稱</th>
              <th className="px-3 py-3">簡稱</th>
              <th className="px-3 py-3">適用機型</th>
              <th className="px-3 py-3">常見度</th>
              <th className="px-3 py-3 text-center">緊急</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {[...symptoms].sort((a, b) => b.frequency - a.frequency).map((s) => {
              const saving = savingId === s.id;
              const saved = savedId === s.id;
              return (
                <tr key={s.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <Input value={s.name} onChange={(e) => update(s.id, { name: e.target.value })} className="font-semibold" />
                    <p className="mt-0.5 px-1 text-xs text-ink-faint">{s.id} · {s.icon}</p>
                  </td>
                  <td className="px-3 py-3"><Input value={s.shortName} onChange={(e) => update(s.id, { shortName: e.target.value })} /></td>
                  <td className="px-3 py-3">
                    <div className="flex flex-wrap gap-1">
                      {CATEGORIES.map((c) => {
                        const on = s.categories.includes(c.value);
                        return (
                          <button
                            key={c.value}
                            type="button"
                            onClick={() => toggleCat(s, c.value)}
                            className={`rounded-full px-2 py-0.5 text-[0.7rem] font-medium transition-colors ${on ? 'bg-brand-600 text-white' : 'bg-slate-100 text-ink-faint'}`}
                          >
                            {c.label}
                          </button>
                        );
                      })}
                    </div>
                  </td>
                  <td className="px-3 py-3"><Input type="number" value={s.frequency} onChange={(e) => update(s.id, { frequency: Number(e.target.value) || 0 })} className="w-20" /></td>
                  <td className="px-3 py-3 text-center">
                    <input type="checkbox" checked={Boolean(s.urgent)} onChange={(e) => update(s.id, { urgent: e.target.checked })} className="h-4 w-4 accent-rose-500" />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button size="sm" variant="cta" disabled={saving} onClick={() => save(s)}>
                        {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
                        {saved ? '已存' : '儲存'}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(s.id)}>
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
      <p className="no-print px-1 text-xs text-ink-faint">* 適用機型決定該故障在預約流程中對哪些分類顯示；常見度越高排序越前。</p>
    </div>
  );
}
