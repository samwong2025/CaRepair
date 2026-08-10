'use client';

import * as React from 'react';
import { Hash, Loader2, PackageSearch, RadioTower, RefreshCw, Search, Smartphone } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { OrderCard } from './order-card';
import { AfterSalesPanel } from './aftersales-panel';
import { useOrderTracking, type TrackMode } from '../../lib/hooks/use-order-tracking';
import { formatDateTime } from '../../lib/format';
import { cn } from '../../lib/utils';

const HK_PHONE = /^[2-9]\d{7}$/;

const tabs = [
  { id: 'orders', label: '維修進度' },
  { id: 'aftersales', label: '售後服務' },
] as const;

type TabId = (typeof tabs)[number]['id'];

/** 訂單追蹤主面板：查詢 + 實時進度 + 售後服務 */
export function TrackPanel({ initialKeyword = '' }: { initialKeyword?: string }) {
  const [tab, setTab] = React.useState<TabId>('orders');
  const [mode, setMode] = React.useState<TrackMode>(initialKeyword ? 'orderNo' : 'phone');
  const [keyword, setKeyword] = React.useState(initialKeyword);
  const [hint, setHint] = React.useState('');

  const { orders, loading, searched, error, channel, lastSyncedAt, search } = useOrderTracking();
  const autoSearched = React.useRef(false);

  React.useEffect(() => {
    if (autoSearched.current || !initialKeyword) return;
    autoSearched.current = true;
    search('orderNo', initialKeyword.trim().toUpperCase());
  }, [initialKeyword, search]);

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    const value = keyword.trim();

    if (mode === 'orderNo' && value.length < 6) {
      setHint('請輸入完整訂單編號，例如 CR-20260810-A1B2');
      return;
    }
    if (mode === 'phone' && !HK_PHONE.test(value)) {
      setHint('請輸入 8 位香港手提號碼');
      return;
    }

    setHint('');
    search(mode, mode === 'orderNo' ? value.toUpperCase() : value);
  };

  const refresh = () => {
    const value = keyword.trim();
    if (!value) return;
    search(mode, mode === 'orderNo' ? value.toUpperCase() : value);
  };

  return (
    <div>
      {/* 分頁 */}
      <div className="mx-auto flex w-full max-w-md gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-card">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-pressed={tab === item.id}
            className={cn(
              'flex-1 cursor-pointer rounded-xl py-2.5 text-sm font-bold transition-all duration-200',
              tab === item.id
                ? 'bg-brand-gradient text-white shadow-brand'
                : 'text-ink-muted hover:bg-slate-50 hover:text-ink',
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      {tab === 'orders' ? (
        <div className="mt-8">
          {/* 查詢表單 */}
          <form
            onSubmit={submit}
            className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6"
          >
            <div className="flex gap-2">
              {(
                [
                  { id: 'orderNo' as TrackMode, label: '用訂單編號', icon: Hash },
                  { id: 'phone' as TrackMode, label: '用手提號碼', icon: Smartphone },
                ]
              ).map((item) => {
                const Icon = item.icon;
                const selected = mode === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setMode(item.id);
                      setHint('');
                    }}
                    aria-pressed={selected}
                    className={cn(
                      'flex cursor-pointer items-center gap-1.5 rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all duration-200',
                      selected
                        ? 'border-brand-500 bg-brand-50 text-brand-700'
                        : 'border-slate-200 text-ink-muted hover:border-brand-300',
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
                <Input
                  value={keyword}
                  onChange={(event) => {
                    setKeyword(event.target.value);
                    setHint('');
                  }}
                  placeholder={
                    mode === 'orderNo' ? '輸入訂單編號，例如 CR-20260810-A1B2' : '輸入 8 位手提號碼'
                  }
                  inputMode={mode === 'phone' ? 'numeric' : 'text'}
                  maxLength={mode === 'phone' ? 8 : 24}
                  className="pl-10"
                  aria-label="查詢關鍵字"
                  invalid={Boolean(hint)}
                />
              </div>
              <Button type="submit" variant="cta" size="lg" disabled={loading} className="sm:min-w-[9rem]">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                查詢進度
              </Button>
            </div>

            {hint ? <p className="mt-2.5 text-xs font-semibold text-state-danger">{hint}</p> : null}
            {error ? <p className="mt-2.5 text-xs font-semibold text-state-danger">{error}</p> : null}
          </form>

          {/* 查詢結果 */}
          {searched ? (
            <div className="mt-6 space-y-4">
              {orders.length > 0 ? (
                <>
                  <div className="flex flex-wrap items-center justify-between gap-3 px-1">
                    <p className="flex items-center gap-2 text-sm text-ink-muted">
                      <span className="relative flex h-2 w-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                      </span>
                      <RadioTower className="h-4 w-4 text-emerald-600" />
                      {channel === 'realtime' ? '已連線實時推播' : '每 20 秒自動更新'}
                      {lastSyncedAt ? (
                        <span className="text-ink-faint">・最後同步 {formatDateTime(lastSyncedAt)}</span>
                      ) : null}
                    </p>
                    <Button variant="ghost" size="sm" onClick={refresh} disabled={loading}>
                      <RefreshCw className={cn('h-3.5 w-3.5', loading && 'animate-spin')} />
                      立即刷新
                    </Button>
                  </div>

                  {orders.map((order, index) => (
                    <OrderCard key={order.id} order={order} defaultOpen={index === 0} />
                  ))}
                </>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
                  <PackageSearch className="mx-auto h-10 w-10 text-slate-300" strokeWidth={1.6} />
                  <p className="mt-4 text-base font-bold text-ink">搵唔到相關維修訂單</p>
                  <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-ink-muted">
                    請確認訂單編號或手提號碼是否正確；如係到店即場落單，
                    可用收據上的訂單編號查詢，或致電 3188 6688 由客服協助。
                  </p>
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : (
        <div className="mt-8">
          <AfterSalesPanel />
        </div>
      )}
    </div>
  );
}
