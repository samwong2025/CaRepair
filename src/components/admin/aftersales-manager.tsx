'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import {
  ChevronDown,
  Loader2,
  MessageSquareWarning,
  Search,
  User,
} from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input, Select, Textarea } from '../ui/input';
import { formatDateTime } from '../../lib/format';
import { cn } from '../../lib/utils';
import type { AfterSalesRecord, AfterSalesStatus, AfterSalesType } from '../../types';

const typeMeta: Record<AfterSalesType, { label: string; variant: 'brand' | 'danger' | 'accent' | 'neutral' }> = {
  warranty: { label: '保養維修', variant: 'brand' },
  return: { label: '退貨退款', variant: 'danger' },
  complaint: { label: '投訴跟進', variant: 'accent' },
  consult: { label: '售後諮詢', variant: 'neutral' },
};

const statusMeta: Record<AfterSalesStatus, { label: string; variant: 'warning' | 'brand' | 'success' | 'danger' | 'neutral' }> = {
  pending: { label: '待處理', variant: 'warning' },
  processing: { label: '跟進中', variant: 'brand' },
  resolved: { label: '已解決', variant: 'success' },
  rejected: { label: '不成立', variant: 'danger' },
};

const nextStatus: Record<AfterSalesStatus, AfterSalesStatus | null> = {
  pending: 'processing',
  processing: 'resolved',
  resolved: null,
  rejected: null,
};

/** 後台售後管理：個案分派、狀態推進與處理結果記錄 */
export function AfterSalesManager({ records }: { records: AfterSalesRecord[] }) {
  const router = useRouter();
  const [keyword, setKeyword] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState<AfterSalesStatus | 'all'>('all');
  const [expandedId, setExpandedId] = React.useState('');
  const [busyId, setBusyId] = React.useState('');
  const [handlers, setHandlers] = React.useState<Record<string, string>>({});
  const [resolutions, setResolutions] = React.useState<Record<string, string>>({});

  const filtered = React.useMemo(() => {
    const kw = keyword.trim().toLowerCase();
    return records
      .filter((record) => statusFilter === 'all' || record.status === statusFilter)
      .filter(
        (record) =>
          !kw ||
          record.caseNo.toLowerCase().includes(kw) ||
          record.customerName.toLowerCase().includes(kw) ||
          record.customerPhone.includes(kw) ||
          record.orderNo.toLowerCase().includes(kw),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [records, keyword, statusFilter]);

  const update = async (id: string, patch: Record<string, string>) => {
    setBusyId(id);
    const response = await fetch(`/api/aftersales/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    }).catch((error: unknown) => {
      console.error('更新售後個案失敗', error);
      return null;
    });
    if (response?.ok) router.refresh();
    setBusyId('');
  };

  return (
    <div>
      <div className="no-print flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <Input
            value={keyword}
            onChange={(event) => setKeyword(event.target.value)}
            placeholder="搜尋個案編號 / 姓名 / 電話 / 訂單號"
            className="pl-10"
            aria-label="搜尋售後個案"
          />
        </div>
        <Select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as AfterSalesStatus | 'all')}
          className="sm:w-40"
          aria-label="狀態篩選"
        >
          <option value="all">全部狀態</option>
          {Object.entries(statusMeta).map(([value, meta]) => (
            <option key={value} value={value}>
              {meta.label}
            </option>
          ))}
        </Select>
        <p className="shrink-0 text-xs text-ink-faint sm:w-20 sm:text-right">
          {filtered.length} 宗
        </p>
      </div>

      <div className="mt-4 grid gap-3 lg:grid-cols-2">
        {filtered.map((record) => {
          const expanded = expandedId === record.id;
          const next = nextStatus[record.status];
          const canReject = record.status === 'pending' || record.status === 'processing';
          return (
            <article
              key={record.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card transition-shadow duration-200 hover:shadow-lift"
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={typeMeta[record.type].variant} size="sm">
                  {typeMeta[record.type].label}
                </Badge>
                <Badge variant={statusMeta[record.status].variant} size="sm">
                  {statusMeta[record.status].label}
                </Badge>
                <span className="ml-auto font-mono text-[0.72rem] font-bold text-ink-faint">
                  {record.caseNo}
                </span>
              </div>

              <h3 className="mt-2.5 text-base font-extrabold leading-snug text-ink">
                {record.subject}
              </h3>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-muted">
                <User className="h-3.5 w-3.5 text-ink-faint" />
                {record.customerName}・{record.customerPhone}
              </p>
              <p className="mt-0.5 text-[0.7rem] text-ink-faint">
                關聯訂單 {record.orderNo}・提交 {formatDateTime(record.createdAt)}
                {record.handler ? `・處理人 ${record.handler}` : ''}
              </p>

              <div className="mt-3 flex flex-wrap gap-2 border-t border-slate-100 pt-3">
                {next ? (
                  <Button
                    variant="primary"
                    size="sm"
                    disabled={busyId === record.id}
                    onClick={() => update(record.id, { status: next })}
                  >
                    {busyId === record.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : null}
                    推進至「{statusMeta[next].label}」
                  </Button>
                ) : null}
                {canReject ? (
                  <Button
                    variant="soft"
                    size="sm"
                    disabled={busyId === record.id}
                    onClick={() => update(record.id, { status: 'rejected' })}
                  >
                    標記不成立
                  </Button>
                ) : null}
                <Button
                  variant="outline"
                  size="sm"
                  className="ml-auto"
                  onClick={() => setExpandedId(expanded ? '' : record.id)}
                >
                  <ChevronDown
                    className={cn('h-3.5 w-3.5 transition-transform duration-200', expanded && 'rotate-180')}
                  />
                  詳情
                </Button>
              </div>

              {expanded ? (
                <div className="mt-3 space-y-3">
                  <div>
                    <p className="mb-1 text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">
                      客戶描述
                    </p>
                    <p className="rounded-lg bg-surface-soft px-3 py-2 text-sm text-ink-muted">
                      {record.detail}
                    </p>
                  </div>
                  <div>
                    <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">
                      指派處理人
                    </label>
                    <div className="flex gap-2">
                      <Input
                        value={handlers[record.id] ?? record.handler ?? ''}
                        onChange={(event) =>
                          setHandlers((prev) => ({ ...prev, [record.id]: event.target.value }))
                        }
                        placeholder="例如：客服 Amy"
                        className="text-sm"
                        aria-label="指派處理人"
                      />
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busyId === record.id}
                        onClick={() =>
                          update(record.id, { handler: handlers[record.id] ?? record.handler ?? '' })
                        }
                      >
                        儲存
                      </Button>
                    </div>
                  </div>
                  <div>
                    <label className="mb-1 block text-[0.7rem] font-bold uppercase tracking-wide text-ink-faint">
                      處理結果
                    </label>
                    <Textarea
                      value={resolutions[record.id] ?? record.resolution ?? ''}
                      onChange={(event) =>
                        setResolutions((prev) => ({ ...prev, [record.id]: event.target.value }))
                      }
                      rows={2}
                      placeholder="填寫處理方式、答覆與結案結果"
                      className="text-sm"
                      aria-label="處理結果"
                    />
                    <div className="mt-2 flex justify-end">
                      <Button
                        variant="primary"
                        size="sm"
                        disabled={busyId === record.id}
                        onClick={() =>
                          update(record.id, {
                            resolution: resolutions[record.id] ?? record.resolution ?? '',
                            ...(record.status === 'pending' ? { status: 'processing' as const } : {}),
                          })
                        }
                      >
                        記錄結果
                      </Button>
                    </div>
                  </div>
                </div>
              ) : null}
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="mt-4 flex items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center text-sm text-ink-muted">
          <MessageSquareWarning className="h-4 w-4" />
          暫時無相關售後個案。
        </p>
      ) : null}
    </div>
  );
}
