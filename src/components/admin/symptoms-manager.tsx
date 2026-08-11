'use client';

import * as React from 'react';
import { Check, Database, DollarSign, HardDriveDownload, Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input, Select } from '../ui/input';
import { loadSymptoms, saveSymptom, deleteSymptom } from '../../lib/catalog-store';
import { loadPricing, savePricing, type SaveResult } from '../../lib/pricing-store';
import type { DeviceCategory, Symptom, SymptomPricing } from '../../types';

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
  const [pricing, setPricing] = React.useState<SymptomPricing[]>([]);
  const [expanded, setExpanded] = React.useState<string | null>(null);
  const [priceSaving, setPriceSaving] = React.useState<string>('');

  React.useEffect(() => {
    loadSymptoms().then((data) => {
      setSymptoms(data);
      setMode(data.length > 0 ? 'supabase' : 'local');
      setLoading(false);
    });
    loadPricing().then(setPricing);
  }, []);

  /** 取得某故障在各類別下的關聯價格（category:symptomId 維度） */
  const pricesFor = (symptomId: string): SymptomPricing[] =>
    pricing.filter((p) => p.symptomId === symptomId);

  const updatePrice = (rule: SymptomPricing) => {
    setPricing((prev) => {
      const idx = prev.findIndex((p) => p.category === rule.category && p.symptomId === rule.symptomId);
      if (idx >= 0) return prev.map((p) => (p.category === rule.category && p.symptomId === rule.symptomId ? rule : p));
      return [...prev, rule];
    });
  };

  const savePrice = async (rule: SymptomPricing) => {
    const key = `${rule.category}:${rule.symptomId}`;
    setPriceSaving(key);
    const res: SaveResult = await savePricing(rule);
    setPriceSaving('');
    if (!res.ok) setNotice(`價格儲存失敗：${res.error}`);
    else setNotice(res.mode === 'local' ? '價格已暫存至瀏覽器（mock 模式）' : '價格已寫入 Supabase 雲端');
  };

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
              const open = expanded === s.id;
              const related = pricesFor(s.id);
              return (
                <React.Fragment key={s.id}>
                  <tr className="border-b border-slate-100 last:border-0">
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
                        <Button
                          size="sm"
                          variant={open ? 'primary' : 'ghost'}
                          onClick={() => setExpanded((prev) => (prev === s.id ? null : s.id))}
                          title="編輯此故障關聯的維修價格"
                        >
                          <DollarSign className="h-3.5 w-3.5" />
                          價格
                        </Button>
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
                  {open ? (
                    <tr className="bg-slate-50/70">
                      <td colSpan={6} className="px-4 py-4">
                        <SymptomPriceEditor
                          symptom={s}
                          rules={related}
                          savingKey={priceSaving}
                          onSave={savePrice}
                          onCreate={(rule) => {
                            // 該 category 尚未有價格，先寫入本地再儲存
                            updatePrice(rule);
                            return savePrice(rule);
                          }}
                        />
                      </td>
                    </tr>
                  ) : null}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="no-print px-1 text-xs text-ink-faint">* 適用機型決定該故障在預約流程中對哪些分類顯示；常見度越高排序越前。</p>
    </div>
  );
}

const CATEGORY_LABEL: Record<DeviceCategory, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  watch: 'Apple Watch',
  macbook: 'MacBook',
};

/**
 * 故障關聯維修價格編輯器：
 * 列出該故障在每一個適用機型分類下的價格（category:symptomId 維度），可直接編輯
 * 配件費 / 人工費 / 工時 / 保養日數 / 無塵室，並即時儲存。尚未設定價格的分類可一鍵新增。
 */
function SymptomPriceEditor({
  symptom,
  rules,
  savingKey,
  onSave,
  onCreate,
}: {
  symptom: Symptom;
  rules: SymptomPricing[];
  savingKey: string;
  onSave: (rule: SymptomPricing) => void;
  onCreate: (rule: SymptomPricing) => void;
}) {
  const known = new Set(rules.map((r) => r.category));
  const cats = symptom.categories.length > 0 ? symptom.categories : (['iphone'] as DeviceCategory[]);

  const updateRule = (rule: SymptomPricing, patch: Partial<SymptomPricing>) => {
    onSave({ ...rule, ...patch });
  };

  return (
    <div className="space-y-3">
      <p className="text-xs font-semibold text-ink">
        關聯維修價格（修改即時生效於線上報價與後台建單）
      </p>
      <div className="grid gap-3">
        {cats.map((cat) => {
          const rule = rules.find((r) => r.category === cat);
          if (!rule) {
            return (
              <div
                key={cat}
                className="flex items-center justify-between rounded-lg border border-dashed border-slate-300 bg-white px-3 py-2.5"
              >
                <span className="text-sm text-ink-muted">
                  <span className="font-semibold text-ink">{CATEGORY_LABEL[cat]}</span>：尚無價格
                </span>
                <Button
                  size="sm"
                  variant="cta"
                  onClick={() =>
                    onCreate({
                      symptomId: symptom.id,
                      category: cat,
                      partName: symptom.name,
                      basePartFee: 0,
                      baseLaborFee: 0,
                      durationMinutes: 30,
                      warrantyDays: 90,
                      requiresLab: false,
                    })
                  }
                >
                  <Plus className="h-3.5 w-3.5" /> 新增價格
                </Button>
              </div>
            );
          }
          const key = `${rule.category}:${rule.symptomId}`;
          const saving = savingKey === key;
          return (
            <div
              key={cat}
              className="rounded-lg border border-slate-200 bg-white p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-sm font-semibold text-ink">{CATEGORY_LABEL[cat]}</span>
                <span className="text-xs text-ink-faint">{rule.partName}</span>
              </div>
              <div className="grid gap-2 sm:grid-cols-5">
                <label className="text-xs text-ink-muted">
                  配件費
                  <Input
                    type="number"
                    min={0}
                    value={rule.basePartFee}
                    onChange={(e) => updateRule(rule, { basePartFee: Math.max(0, Number(e.target.value) || 0) })}
                    className="mt-1 w-full text-right"
                  />
                </label>
                <label className="text-xs text-ink-muted">
                  人工費
                  <Input
                    type="number"
                    min={0}
                    value={rule.baseLaborFee}
                    onChange={(e) => updateRule(rule, { baseLaborFee: Math.max(0, Number(e.target.value) || 0) })}
                    className="mt-1 w-full text-right"
                  />
                </label>
                <label className="text-xs text-ink-muted">
                  工時(分)
                  <Input
                    type="number"
                    min={0}
                    step={5}
                    value={rule.durationMinutes}
                    onChange={(e) => updateRule(rule, { durationMinutes: Math.max(0, Number(e.target.value) || 0) })}
                    className="mt-1 w-full text-right"
                  />
                </label>
                <label className="text-xs text-ink-muted">
                  保養(日)
                  <Input
                    type="number"
                    min={0}
                    step={15}
                    value={rule.warrantyDays}
                    onChange={(e) => updateRule(rule, { warrantyDays: Math.max(0, Number(e.target.value) || 0) })}
                    className="mt-1 w-full text-right"
                  />
                </label>
                <label className="flex flex-col items-start gap-1 text-xs text-ink-muted">
                  無塵室
                  <input
                    type="checkbox"
                    checked={Boolean(rule.requiresLab)}
                    onChange={(e) => updateRule(rule, { requiresLab: e.target.checked })}
                    className="mt-1 h-4 w-4 accent-brand-600"
                  />
                </label>
              </div>
              <div className="mt-2 flex justify-end">
                <Button size="sm" variant="soft" disabled={saving} onClick={() => onSave(rule)}>
                  {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
                  儲存價格
                </Button>
              </div>
            </div>
          );
        })}
        {cats.length === 0 ? (
          <p className="text-xs text-ink-faint">請先選擇適用機型，才能設定對應價格。</p>
        ) : null}
      </div>
    </div>
  );
}
