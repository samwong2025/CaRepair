'use client';

import * as React from 'react';
import {
  Check,
  Database,
  HardDriveDownload,
  Loader2,
  RotateCcw,
  Save,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input, Select } from '../ui/input';
import { formatHKD } from '../../lib/format';
import { loadPricing, savePricing, type SaveResult } from '../../lib/pricing-store';
import { pricingRules as DEFAULT_RULES } from '../../data/pricing';
import type { DeviceCategory, SymptomPricing } from '../../types';

const CATEGORIES: { value: DeviceCategory; label: string }[] = [
  { value: 'iphone', label: 'iPhone' },
  { value: 'ipad', label: 'iPad' },
  { value: 'watch', label: 'Apple Watch' },
  { value: 'macbook', label: 'MacBook' },
];

const CATEGORY_LABEL: Record<DeviceCategory, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  watch: 'Apple Watch',
  macbook: 'MacBook',
};

export function PricingManager() {
  const [rules, setRules] = React.useState<SymptomPricing[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [savingKey, setSavingKey] = React.useState('');
  const [savedKey, setSavedKey] = React.useState('');
  const [mode, setMode] = React.useState<'supabase' | 'local' | ''>('');
  const [filter, setFilter] = React.useState<DeviceCategory | 'all'>('all');
  const [notice, setNotice] = React.useState('');

  React.useEffect(() => {
    loadPricing().then((data) => {
      setRules(data);
      setMode(data.length > 0 && data.some((r) => r.partName) ? 'supabase' : 'local');
      setLoading(false);
    });
  }, []);

  const update = (key: string, patch: Partial<SymptomPricing>) => {
    setRules((prev) => prev.map((r) => (keyOf(r) === key ? { ...r, ...patch } : r)));
  };

  const save = async (rule: SymptomPricing) => {
    const key = keyOf(rule);
    setSavingKey(key);
    setNotice('');
    const res: SaveResult = await savePricing(rule);
    setSavingKey('');
    if (res.ok) {
      setSavedKey(key);
      setMode(res.mode);
      setNotice(
        res.mode === 'local'
          ? '已暫存至瀏覽器（mock 模式）；連上 Supabase 後將自動同步至雲端。'
          : '已寫入 Supabase 雲端價格表。',
      );
      setTimeout(() => setSavedKey(''), 1500);
    } else {
      setNotice(`儲存失敗：${res.error ?? '未知錯誤'}`);
    }
  };

  const resetRule = (rule: SymptomPricing) => {
    // 還原為預設 pricing.ts 的對應值
    const def = DEFAULT_RULES.find(
      (d) => d.category === rule.category && d.symptomId === rule.symptomId,
    );
    if (def) update(keyOf(rule), def);
  };

  const visible = rules.filter((r) => filter === 'all' || r.category === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-ink-muted">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> 載入價格表…
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
            當前模式：
            <span className="font-bold text-ink">
              {mode === 'local' ? '瀏覽器暫存（mock）' : 'Supabase 雲端'}
            </span>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as DeviceCategory | 'all')}
            className="w-auto"
          >
            <option value="all">全部機型</option>
            {CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>
                {c.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      {notice ? (
        <div className="no-print rounded-xl border border-brand-200 bg-brand-50 px-4 py-2.5 text-sm text-brand-700">
          {notice}
        </div>
      ) : null}

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
        <table className="w-full min-w-[760px] text-sm">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-ink-faint">
              <th className="px-4 py-3">機型 / 故障</th>
              <th className="px-3 py-3 text-right">配件費 (HKD)</th>
              <th className="px-3 py-3 text-right">人工費 (HKD)</th>
              <th className="px-3 py-3 text-right">工時 (分)</th>
              <th className="px-3 py-3 text-right">保養 (日)</th>
              <th className="px-3 py-3 text-center">無塵室</th>
              <th className="px-4 py-3 text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {visible.map((rule) => {
              const key = keyOf(rule);
              const saving = savingKey === key;
              const saved = savedKey === key;
              return (
                <tr key={key} className="border-b border-slate-100 last:border-0">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="brand">{CATEGORY_LABEL[rule.category]}</Badge>
                      <span className="font-semibold text-ink">{rule.partName}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-ink-faint">{rule.symptomId}</p>
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Input
                      type="number"
                      min={0}
                      value={rule.basePartFee}
                      onChange={(e) =>
                        update(key, { basePartFee: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="ml-auto w-28 text-right"
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Input
                      type="number"
                      min={0}
                      value={rule.baseLaborFee}
                      onChange={(e) =>
                        update(key, { baseLaborFee: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="ml-auto w-28 text-right"
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Input
                      type="number"
                      min={0}
                      step={5}
                      value={rule.durationMinutes}
                      onChange={(e) =>
                        update(key, { durationMinutes: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="ml-auto w-20 text-right"
                    />
                  </td>
                  <td className="px-3 py-3 text-right">
                    <Input
                      type="number"
                      min={0}
                      step={15}
                      value={rule.warrantyDays}
                      onChange={(e) =>
                        update(key, { warrantyDays: Math.max(0, Number(e.target.value) || 0) })
                      }
                      className="ml-auto w-20 text-right"
                    />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <input
                      type="checkbox"
                      checked={Boolean(rule.requiresLab)}
                      onChange={(e) => update(key, { requiresLab: e.target.checked })}
                      className="h-4 w-4 accent-brand-600"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => resetRule(rule)}
                        title="還原預設"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        size="sm"
                        variant="cta"
                        disabled={saving}
                        onClick={() => save(rule)}
                      >
                        {saving ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : saved ? (
                          <Check className="h-3.5 w-3.5" />
                        ) : (
                          <Save className="h-3.5 w-3.5" />
                        )}
                        {saved ? '已存' : '儲存'}
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="no-print px-1 text-xs text-ink-faint">
        * 報價時會再依機型級距係數（旗艦 1.4 / 進階 1.2 / 標準 1.0 / 舊款 0.8）浮動。修改即時生效於線上報價與後台建單。
      </p>
    </div>
  );
}

function keyOf(r: SymptomPricing): string {
  return `${r.category}:${r.symptomId}`;
}
