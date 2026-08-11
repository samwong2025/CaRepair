'use client';

import * as React from 'react';
import { Check, Flame, Laptop, Search, Smartphone, Tablet, Watch } from 'lucide-react';
import { Input } from '../ui/input';
import { deviceGroups, tierLabel, getModelImage } from '../../data/devices';
import { resolveIcon } from '../../lib/icons';
import { cn } from '../../lib/utils';
import type { DeviceCategory, DeviceModel } from '../../types';
import { siteConfig } from '../../config/site';

/** 步驟 2 內嵌入的型號選擇器：點即跳（搭配 wizard 內部控制） */
export function ModelPicker({
  category,
  modelId,
  onSelectModel,
  allModels,
}: {
  category: DeviceCategory;
  modelId: string | null;
  onSelectModel: (modelId: string) => void;
  allModels: DeviceModel[];
}) {
  const [keyword, setKeyword] = React.useState('');

  const thumbIcon = (cat: DeviceCategory) => {
    if (cat === 'watch') return Watch;
    if (cat === 'ipad') return Tablet;
    if (cat === 'macbook') return Laptop;
    return Smartphone;
  };

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
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
              {list.map((model) => {
                const selected = model.id === modelId;
                const Thumb = thumbIcon(model.category);
                const img = getModelImage(model);
                return (
                  <button
                    key={model.id}
                    type="button"
                    onClick={() => onSelectModel(model.id)}
                    aria-pressed={selected}
                    className={cn(
                      'product-card relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border px-4 py-4 pr-5 text-left box-border transition-all duration-200 ease-smooth',
                      selected
                        ? 'border-brand-500 bg-brand-50/70 shadow-card'
                        : 'border-slate-200 bg-white hover:bg-surface-soft',
                    )}
                  >
                    <span
                      className={cn(
                        'flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-xl',
                        img ? 'bg-white' : 'bg-brand-50 text-brand-600',
                      )}
                    >
                      {img ? (
                        <img src={img} alt={model.name} className="h-[68px] w-[68px] object-contain" />
                      ) : (
                        <Thumb className="h-7 w-7" strokeWidth={2} />
                      )}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate text-[0.95rem] font-bold text-ink">
                          {model.name}
                        </span>
                        {model.hot ? (
                          <Flame className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-[0.72rem] text-ink-faint">
                        {model.year} 年・{tierLabel[model.tier]}
                      </span>
                    </span>
                    <span
                      className={cn(
                        'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
                        selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300',
                      )}
                    >
                      {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {grouped.length === 0 ? (
          <p className="rounded-xl border border-dashed border-slate-300 bg-surface-soft px-4 py-8 text-center text-sm text-ink-muted">
            搵唔到「{keyword}」相關型號，可致電 {siteConfig.hotline} 由技師人手確認。
          </p>
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
  mode = 'full',
}: {
  category: DeviceCategory | null;
  modelId: string | null;
  onSelectCategory: (category: DeviceCategory) => void;
  onSelectModel: (modelId: string) => void;
  allModels: DeviceModel[];
  /** 'full' = 同屏顯示分類與型號；'category-only' = 只顯示分類卡（點即跳） */
  mode?: 'full' | 'category-only';
}) {
  const [keyword, setKeyword] = React.useState('');

  const thumbIcon = (category: DeviceCategory) => {
    if (category === 'watch') return Watch;
    if (category === 'ipad') return Tablet;
    if (category === 'macbook') return Laptop;
    return Smartphone;
  };

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

        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
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
                  'product-card group relative flex cursor-pointer flex-col items-start gap-3 overflow-hidden rounded-2xl border p-5 text-left box-border transition-all duration-300 ease-smooth',
                  selected
                    ? 'border-brand-500 bg-brand-50/60 shadow-lift'
                    : 'border-slate-200 bg-white hover:-translate-y-1 hover:shadow-lift',
                )}
              >
                {selected ? (
                  <span className="absolute right-3 top-3 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-brand-gradient text-white">
                    <Check className="h-3.5 w-3.5" strokeWidth={3} />
                  </span>
                ) : null}

                {group.coverImage ? (
                  <img
                    src={group.coverImage}
                    alt={group.name}
                    width={120}
                    height={120}
                    loading="lazy"
                    className="pointer-events-none absolute right-3 top-5 z-0 h-[88px] w-[88px] object-contain opacity-95 transition-transform duration-500 ease-smooth group-hover:scale-110"
                  />
                ) : null}

                <span
                  className={cn(
                    'relative z-10 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-300',
                    selected ? 'bg-brand-gradient text-white shadow-brand' : 'bg-brand-50 text-brand-600',
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>

                <span className="relative z-10">
                  <span className="block text-base font-extrabold text-ink">{group.name}</span>
                  <span className="mt-1 block max-w-[14ch] text-xs leading-relaxed text-ink-muted">
                    {group.description}
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
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3">
                  {list.map((model) => {
                    const selected = model.id === modelId;
                    const Thumb = thumbIcon(model.category);
                    const img = getModelImage(model);
                    return (
                      <button
                        key={model.id}
                        type="button"
                        onClick={() => onSelectModel(model.id)}
                        aria-pressed={selected}
                        className={cn(
                          'product-card relative flex cursor-pointer items-center gap-4 overflow-hidden rounded-2xl border px-4 py-4 pr-5 text-left box-border transition-all duration-200 ease-smooth',
                          selected
                            ? 'border-brand-500 bg-brand-50/70 shadow-card'
                            : 'border-slate-200 bg-white hover:bg-surface-soft',
                        )}
                      >
                        <span
                          className={cn(
                            'flex h-[68px] w-[68px] shrink-0 items-center justify-center overflow-hidden rounded-xl',
                            img ? 'bg-white' : 'bg-brand-50 text-brand-600',
                          )}
                        >
                          {img ? (
                            <img src={img} alt={model.name} className="h-[68px] w-[68px] object-contain" />
                          ) : (
                            <Thumb className="h-7 w-7" strokeWidth={2} />
                          )}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-[0.95rem] font-bold text-ink">
                              {model.name}
                            </span>
                            {model.hot ? (
                              <Flame className="h-3.5 w-3.5 shrink-0 text-accent-500" />
                            ) : null}
                          </span>
                          <span className="mt-0.5 block text-[0.72rem] text-ink-faint">
                            {model.year} 年・{tierLabel[model.tier]}
                          </span>
                        </span>
                        <span
                          className={cn(
                            'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-200',
                            selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300',
                          )}
                        >
                          {selected ? <Check className="h-3.5 w-3.5" strokeWidth={3.5} /> : null}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {grouped.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-300 bg-surface-soft px-4 py-8 text-center text-sm text-ink-muted">
                搵唔到「{keyword}」相關型號，可致電 {siteConfig.hotline} 由技師人手確認。
              </p>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
