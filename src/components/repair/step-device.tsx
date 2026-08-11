'use client';

import * as React from 'react';
import { Check, Plus, Search, Smartphone } from 'lucide-react';
import { Input } from '../ui/input';
import { deviceGroups } from '../../data/devices';
import { resolveIcon } from '../../lib/icons';
import { cn } from '../../lib/utils';
import type { DeviceCategory, DeviceModel } from '../../types';
import { siteConfig } from '../../config/site';
import { ModelCard } from './model-card';

/** 「客戶自填型號」占位卡：揀唔到啱機型時用，modelId = OTHER_MODEL_ID */
function OtherModelCard({
  selected,
  onSelect,
}: {
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={cn(
        'product-card group flex min-h-[280px] cursor-pointer flex-col items-stretch overflow-hidden rounded-2xl border p-3 text-left box-border transition-all duration-300 ease-smooth',
        selected
          ? 'border-transparent bg-white shadow-lift ring-2 ring-brand-400'
          : 'border-dashed border-slate-300 bg-surface-soft hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift',
      )}
    >
      <span className="relative flex min-h-[150px] w-full flex-1 items-center justify-center overflow-hidden rounded-xl bg-gradient-to-br from-brand-50/70 via-white to-surface-soft">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600 transition-transform duration-500 group-hover:animate-bounce-soft">
          <Plus className="h-6 w-6" strokeWidth={2} />
        </span>
        {selected ? (
          <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-white shadow-brand">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
          </span>
        ) : null}
      </span>
      <span className="mt-3">
        <span className="block break-words text-base font-extrabold leading-tight text-ink">
          （其他）
        </span>
        <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-ink-muted">
          搵唔到你部機？直接填寫型號，我哋技師會人手報價。
        </span>
      </span>
    </button>
  );
}

/** 客戶自填型號的 sentinel：選咗「（其他）」就用呢個 id，具體型號名由 customModel 提供 */
export const OTHER_MODEL_ID = '__other__';

/** 步驟 2 內嵌入的型號選擇器：點即跳（搭配 wizard 內部控制） */
export function ModelPicker({
  category,
  modelId,
  onSelectModel,
  allModels,
  customModel,
  onCustomModelChange,
}: {
  category: DeviceCategory;
  modelId: string | null;
  onSelectModel: (modelId: string) => void;
  allModels: DeviceModel[];
  customModel?: string;
  onCustomModelChange?: (value: string) => void;
}) {
  const [keyword, setKeyword] = React.useState('');

  const models = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return allModels
      .filter((model) => model.category === category)
      .filter((model) => (kw ? model.name.toLowerCase().includes(kw) : true))
      .sort((a, b) => b.year - a.year || Number(Boolean(b.hot)) - Number(Boolean(a.hot)));
  }, [category, keyword, allModels]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof models>();
    models.forEach((model) => {
      const list = map.get(model.series) ?? [];
      list.push(model);
      map.set(model.series, list);
    });
    return Array.from(map.entries());
  }, [models]);

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-extrabold text-ink">揀你部機的具體型號</h3>
          <p className="mt-1 text-sm text-ink-muted">
            型號會影響配件價格級距；揀完即刻可勾選故障，揀錯可隨時更改。
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜尋型號，例如 15 Pro"
            className="pl-10"
            aria-label="搜尋型號"
          />
        </div>
      </div>

      <div className="mt-5 space-y-6">
        {grouped.map(([series, list]) => (
          <div key={series}>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
              {series}
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {list.map((model) => (
                <ModelCard
                  key={model.id}
                  model={model}
                  selected={model.id === modelId}
                  onSelect={onSelectModel}
                />
              ))}
            </div>
          </div>
        ))}

        {/* 所有系列結束後：客戶自填（漏咗或冇呢個型號），每頁只出現一次 */}
        {grouped.length > 0 ? (
          <div>
            <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
              其他
            </p>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              <OtherModelCard
                selected={modelId === OTHER_MODEL_ID}
                onSelect={() => onSelectModel(OTHER_MODEL_ID)}
              />
            </div>
          </div>
        ) : null}

        {grouped.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-surface-soft px-4 py-8 text-center text-sm text-ink-muted">
            搵唔到「{keyword}」相關型號，可致電 {siteConfig.hotline} 由技師人手確認。
          </p>
        ) : null}

        {modelId === OTHER_MODEL_ID ? (
          <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
            <label className="mb-1.5 block text-sm font-bold text-ink">
              填寫你部機嘅型號
            </label>
            <Input
              value={customModel ?? ''}
              onChange={(event) => onCustomModelChange?.(event.target.value)}
              placeholder="例如：iPhone SE 2 (2020)、Samsung Galaxy S21、小米 13"
              aria-label="自填型號"
              className="bg-white"
              autoFocus
            />
            <p className="mt-1.5 text-xs text-ink-muted">
              提交後我哋會按你填嘅型號安排技師報價，唔會影響落單。
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}

/** 步驟 1：選擇產品分類與具體型號 */
export function StepDevice({
  category,
  modelId,
  onSelectCategory,
  onSelectModel,
  allModels,
  customModel,
  onCustomModelChange,
  mode = 'full',
}: {
  category: DeviceCategory | null;
  modelId: string | null;
  onSelectCategory: (category: DeviceCategory) => void;
  onSelectModel: (modelId: string) => void;
  allModels: DeviceModel[];
  customModel?: string;
  onCustomModelChange?: (value: string) => void;
  /** 'full' = 同屏顯示分類與型號；'category-only' = 只顯示分類卡（點即跳） */
  mode?: 'full' | 'category-only';
}) {
  const [keyword, setKeyword] = React.useState('');

  const models = React.useMemo(() => {
    if (!category) return [];
    const kw = keyword.trim().toLowerCase();
    return allModels
      .filter((model) => model.category === category)
      .filter((model) => (kw ? model.name.toLowerCase().includes(kw) : true))
      .sort((a, b) => b.year - a.year || Number(Boolean(b.hot)) - Number(Boolean(a.hot)));
  }, [category, keyword, allModels]);

  const grouped = React.useMemo(() => {
    const map = new Map<string, typeof models>();
    models.forEach((model) => {
      const list = map.get(model.series) ?? [];
      list.push(model);
      map.set(model.series, list);
    });
    return Array.from(map.entries());
  }, [models]);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">你想維修邊款產品？</h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          先揀產品類別，系統會自動載入對應機型與配件庫存。
        </p>

        <div className="mt-5 grid auto-rows-fr gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {deviceGroups.map((group) => {
            const Icon = resolveIcon(group.icon, Smartphone);
            const selected = group.id === category;
            return (
              <button
                key={group.id}
                type="button"
                onClick={() => {
                  onSelectCategory(group.id);
                  setKeyword('');
                }}
                aria-pressed={selected}
                className={cn(
                  'product-card group relative flex h-full min-h-[280px] cursor-pointer flex-col items-stretch overflow-hidden rounded-2xl border p-3 text-left box-border transition-all duration-300 ease-smooth',
                  selected
                    ? 'border-transparent bg-white shadow-lift ring-2 ring-brand-400'
                    : 'border-slate-200 bg-white hover:-translate-y-1 hover:border-brand-200 hover:shadow-lift',
                )}
              >
                {/* 顶部图区：渐变底色 + 设备图撑满，跟 model-card 视觉语言一致 */}
                <span
                  className={cn(
                    'relative flex min-h-[150px] w-full flex-1 items-center justify-center overflow-hidden rounded-xl transition-colors duration-300',
                    selected
                      ? 'bg-gradient-to-br from-brand-100 via-brand-50/60 to-surface-soft'
                      : 'bg-gradient-to-br from-brand-50/70 via-white to-surface-soft',
                  )}
                >
                  {group.coverImage ? (
                    <img
                      src={group.coverImage}
                      alt={group.name}
                      width={120}
                      height={120}
                      loading="lazy"
                      className="max-h-[120px] w-auto max-w-[78%] object-contain transition-transform duration-500 ease-smooth group-hover:animate-bounce-soft"
                    />
                  ) : (
                    <Icon className="h-12 w-12 text-brand-500" strokeWidth={1.8} />
                  )}

                  {selected ? (
                    <span className="absolute right-2.5 top-2.5 flex h-7 w-7 items-center justify-center rounded-full bg-brand-gradient text-white shadow-brand">
                      <Check className="h-3.5 w-3.5" strokeWidth={3} />
                    </span>
                  ) : null}
                </span>

                {/* 标题 + 描述 */}
                <span className="mt-3 flex w-full items-start gap-2.5">
                  <span
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-colors duration-300',
                      selected ? 'bg-brand-gradient text-white shadow-brand' : 'bg-brand-50 text-brand-600',
                    )}
                  >
                    <Icon className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block break-words text-base font-extrabold leading-tight text-ink">
                      {group.name}
                    </span>
                    <span className="mt-1 block line-clamp-2 text-xs leading-relaxed text-ink-muted">
                      {group.description}
                    </span>
                  </span>
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {category && mode === 'full' ? (
        <div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-ink">揀你部機的具體型號</h3>
              <p className="mt-1 text-sm text-ink-muted">
                型號會影響配件價格級距，揀錯可以隨時返嚟改。
              </p>
            </div>
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
              <Input
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="搜尋型號，例如 15 Pro"
                className="pl-10"
                aria-label="搜尋型號"
              />
            </div>
          </div>

          <div className="mt-5 space-y-6">
            {grouped.map(([series, list]) => (
              <div key={series}>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
                  {series}
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {list.map((model) => (
                    <ModelCard
                      key={model.id}
                      model={model}
                      selected={model.id === modelId}
                      onSelect={onSelectModel}
                    />
                  ))}
                </div>
              </div>
            ))}

            {/* 所有系列結束後：客戶自填（漏咗或冇呢個型號），每頁只出現一次 */}
            {grouped.length > 0 ? (
              <div>
                <p className="mb-2.5 text-xs font-bold uppercase tracking-[0.18em] text-ink-faint">
                  其他
                </p>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  <OtherModelCard
                    selected={modelId === OTHER_MODEL_ID}
                    onSelect={() => onSelectModel(OTHER_MODEL_ID)}
                  />
                </div>
              </div>
            ) : null}

            {grouped.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-surface-soft px-4 py-8 text-center text-sm text-ink-muted">
                搵唔到「{keyword}」相關型號，可致電 {siteConfig.hotline} 由技師人手確認。
              </p>
            ) : null}

            {modelId === OTHER_MODEL_ID ? (
              <div className="rounded-2xl border border-brand-200 bg-brand-50/50 p-4">
                <label className="mb-1.5 block text-sm font-bold text-ink">
                  填寫你部機嘅型號
                </label>
                <Input
                  value={customModel ?? ''}
                  onChange={(event) => onCustomModelChange?.(event.target.value)}
                  placeholder="例如：iPhone SE 2 (2020)、Samsung Galaxy S21、小米 13"
                  aria-label="自填型號"
                  className="bg-white"
                  autoFocus
                />
                <p className="mt-1.5 text-xs text-ink-muted">
                  提交後我哋會按你填嘅型號安排技師報價，唔會影響落單。
                </p>
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
