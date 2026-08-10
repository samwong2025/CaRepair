'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Tag,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input, Select, Textarea } from '../ui/input';
import { formatDateTime, formatHKD, formatNumber, maskPhone } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { Customer, MemberLevel, RepairOrder } from '../../types';

const levelMeta: Record<MemberLevel, { label: string; variant: 'neutral' | 'brand' | 'accent' | 'cta' }> = {
  regular: { label: '普通會員', variant: 'neutral' },
  silver: { label: '銀卡會員', variant: 'brand' },
  gold: { label: '金卡會員', variant: 'accent' },
  vip: { label: '黑鑽 VIP', variant: 'cta' },
};

/** 後台 CRM：會員檔案、消費統計、維修歷史與備註編輯 */
export function CustomersManager({
  customers,
  orders,
}: {
  customers: Customer[];
  orders: RepairOrder[];
}) {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState('');
  const [levelFilter, setLevelFilter] = React.useState<MemberLevel | 'all'>('all');
  const [expandedId, setExpandedId] = React.useState('');
  const [editingId, setEditingId] = React.useState('');
  const [noteDraft, setNoteDraft] = React.useState('');
  const [pendingId, setPendingId] = React.useState('');

  const filtered = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return customers.filter((customer) => {
      const matchLevel = levelFilter === 'all' || customer.level === levelFilter;
      const matchKeyword =
        !kw ||
        customer.name.toLowerCase().includes(kw) ||
        customer.phone.includes(kw) ||
        customer.memberNo.toLowerCase().includes(kw);
      return matchLevel && matchKeyword;
    });
  }, [customers, keyword, levelFilter]);

  const ordersOf = (phone: string) =>
    orders.filter((order) => order.customerPhone === phone);

  const startEdit = (customer: Customer) => {
    setEditingId(customer.id);
    setNoteDraft(customer.note ?? '');
  };

  const saveNote = async (customer: Customer) => {
    setPendingId(customer.id);
    const response = await fetch(`/api/customers/${customer.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ note: noteDraft.trim() }),
    }).catch((error: unknown) => {
      console.error('更新備註失敗', error);
      return null;
    });
    if (response?.ok) router.refresh();
    setPendingId('');
    setEditingId('');
  };

  return (
    <div>
      <div className="no-print flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜尋姓名 / 電話 / 會員編號"
            className="pl-10"
            aria-label="搜尋會員"
          />
        </div>
        <Select
          value={levelFilter}
          onChange={(event) => setLevelFilter(event.target.value as MemberLevel | 'all')}
          className="sm:w-44"
          aria-label="會員等級篩選"
        >
          <option value="all">全部等級</option>
          {Object.entries(levelMeta).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </Select>
        <p className="shrink-0 text-xs text-ink-faint sm:w-24 sm:text-right">
          共 {filtered.length} 位
        </p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((customer) => {
          const meta = levelMeta[customer.level];
          const expanded = expandedId === customer.id;
          const history = ordersOf(customer.phone);
          return (
            <article
              key={customer.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-shadow duration-200 hover:shadow-lift"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={meta.variant} size="sm">
                      {meta.label}
                    </Badge>
                    <span className="font-mono text-[0.7rem] font-bold text-ink-faint">
                      {customer.memberNo}
                    </span>
                  </div>
                  <p className="mt-2 truncate text-lg font-extrabold leading-none text-ink">
                    {customer.name}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="tabular text-lg font-extrabold leading-none text-brand-600">
                    {formatHKD(customer.totalSpent)}
                  </p>
                  <p className="mt-1 text-[0.68rem] text-ink-faint">{customer.orderCount} 次消費</p>
                </div>
              </div>

              <ul className="mt-3 space-y-1.5 text-xs text-ink-muted">
                <li className="flex items-center gap-2">
                  <Phone className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                  {customer.phone}
                </li>
                {customer.email ? (
                  <li className="flex items-center gap-2">
                    <Mail className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                    {customer.email}
                  </li>
                ) : null}
                {customer.district ? (
                  <li className="flex items-center gap-2">
                    <MapPin className="h-3.5 w-3.5 shrink-0 text-ink-faint" />
                    {customer.district}
                    {customer.address ? <span className="truncate">・{customer.address}</span> : null}
                  </li>
                ) : null}
              </ul>

              {customer.tags.length > 0 ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {customer.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 rounded-md bg-slate-100 px-2 py-0.5 text-[0.68rem] font-semibold text-ink-muted"
                    >
                      <Tag className="h-3 w-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              ) : null}

              <div className="mt-3 flex items-center justify-between rounded-xl bg-surface-soft px-3 py-2 text-[0.7rem]">
                <span className="text-ink-faint">積分 {formatNumber(customer.points)}</span>
                <span className="text-ink-faint">
                  首次 {formatDateTime(customer.createdAt)}
                </span>
                <span className="text-ink-faint">
                  最近 {customer.lastOrderAt ? formatDateTime(customer.lastOrderAt) : '—'}
                </span>
              </div>

              {editingId === customer.id ? (
                <div className="mt-3">
                  <Textarea
                    value={noteDraft}
                    onChange={(event) => setNoteDraft(event.target.value)}
                    rows={2}
                    placeholder="內部備註（不會顯示給客戶）"
                    className="text-xs"
                    aria-label="會員備註"
                  />
                  <div className="mt-2 flex justify-end gap-2">
                    <Button variant="soft" size="sm" onClick={() => setEditingId('')}>
                      取消
                    </Button>
                    <Button
                      variant="primary"
                      size="sm"
                      disabled={pendingId === customer.id}
                      onClick={() => saveNote(customer)}
                    >
                      {pendingId === customer.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : null}
                      儲存備註
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="mt-3 line-clamp-2 text-xs italic text-ink-muted">
                  {customer.note ?? '（暫無備註）'}
                </p>
              )}

              <div className="mt-3 flex gap-2 border-t border-slate-100 pt-3">
                <Button
                  variant="soft"
                  size="sm"
                  className="flex-1"
                  onClick={() => setExpandedId(expanded ? '' : customer.id)}
                >
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform duration-200', expanded && 'rotate-180')}
                  />
                  維修歷史（{history.length}）
                </Button>
                {editingId !== customer.id ? (
                  <Button variant="outline" size="sm" onClick={() => startEdit(customer)}>
                    編輯備註
                  </Button>
                ) : null}
              </div>

              {expanded ? (
                <ul className="mt-3 space-y-2">
                  {history.length === 0 ? (
                    <li className="rounded-lg bg-surface-soft px-3 py-3 text-center text-xs text-ink-muted">
                      暫無維修記錄
                    </li>
                  ) : (
                    history.map((order) => (
                      <li
                        key={order.id}
                        className="rounded-lg border border-slate-100 bg-surface-soft px-3 py-2"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-[0.7rem] font-bold text-ink">
                            {order.orderNo}
                          </span>
                          <span className="tabular text-xs font-extrabold text-brand-600">
                            {formatHKD(order.quote.total)}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-xs text-ink-muted">
                          {order.deviceModelName}・
                          {order.quote.items.map((item) => item.name).join('、')}
                        </p>
                        <p className="mt-0.5 text-[0.68rem] text-ink-faint">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </li>
                    ))
                  )}
                </ul>
              ) : null}
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-ink-muted">
          冇符合條件的會員。
        </p>
      ) : null}
    </div>
  );
}
