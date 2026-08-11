'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatHKD } from '../../lib/format';
import type { InventoryReportData } from '../../lib/inventory-reports';
import { STOCK_MOVEMENT_LABELS } from '../../types';

export function InventoryReportManager({ data }: { data: InventoryReportData }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-muted">倉庫進銷存總覽（以成本計價）</p>
        <Button variant="outline" size="sm" onClick={() => exportCsv(data)}>
          <Download className="h-4 w-4" />
          匯出 CSV
        </Button>
      </div>

      {/* 總覽卡片 */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
        <Stat label="配件 SKU" value={`${data.summary.skuCount}`} />
        <Stat label="庫存總量" value={`${data.summary.totalStock}`} />
        <Stat label="庫存價值" value={formatHKD(data.summary.stockValue)} accent />
        <Stat label="低於預警" value={`${data.summary.lowCount}`} warn={data.summary.lowCount > 0} />
        <Stat label="缺貨" value={`${data.summary.outCount}`} warn={data.summary.outCount > 0} />
      </div>

      {/* 進出趨勢 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-4">
          <h3 className="text-base font-extrabold text-ink">近 6 個月進銷存趨勢</h3>
          <p className="mt-0.5 text-xs text-ink-faint">入庫 / 出庫數量與金額（成本）</p>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.monthly} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} />
            <Tooltip
              formatter={(v: number, n: string) =>
                n.includes('Value') ? formatHKD(v) : `${v} 件`
              }
              contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="inbound" name="入庫數量" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="outbound" name="出庫數量" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* 熱門異動配件 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 text-base font-extrabold text-ink">熱門異動配件 Top 10</h3>
          <div className="space-y-2">
            {data.topMovers.map((m) => {
              const max = Math.max(
                ...data.topMovers.map((x) => x.inbound + x.outbound),
                1,
              );
              return (
                <div key={m.partName} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm font-semibold text-ink">
                    {m.partName}
                  </span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div
                      className="h-full rounded-full bg-emerald-500"
                      style={{ width: `${(m.inbound / max) * 100}%` }}
                    />
                    <div
                      className="h-full -mt-2.5 rounded-full bg-rose-400"
                      style={{ width: `${(m.outbound / max) * 100}%` }}
                    />
                  </div>
                  <span className="w-24 text-right text-xs text-ink-muted">
                    入 {m.inbound} / 出 {m.outbound}
                  </span>
                </div>
              );
            })}
            {data.topMovers.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-faint">尚無異動資料</p>
            )}
          </div>
        </section>

        {/* 低庫存預警 */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
          <h3 className="mb-4 text-base font-extrabold text-ink">低庫存 / 缺貨清單</h3>
          <div className="space-y-2">
            {data.lowStock.map((l) => {
              const danger = l.stock <= 0;
              return (
                <div
                  key={l.name}
                  className={`flex items-center justify-between rounded-xl border px-3 py-2.5 ${
                    danger ? 'border-red-200 bg-red-50' : 'border-amber-200 bg-amber-50'
                  }`}
                >
                  <span className="text-sm font-semibold text-ink">{l.name}</span>
                  <span
                    className={`text-sm font-bold ${danger ? 'text-red-500' : 'text-amber-600'}`}
                  >
                    結餘 {l.stock} / 預警 {l.threshold}
                  </span>
                </div>
              );
            })}
            {data.lowStock.length === 0 && (
              <p className="py-6 text-center text-sm text-ink-faint">庫存狀態健康 🎉</p>
            )}
          </div>
        </section>
      </div>

      {/* 最近異動流水 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h3 className="mb-4 text-base font-extrabold text-ink">最近異動流水</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs text-ink-faint">
                <th className="py-2 pr-3 font-semibold">時間</th>
                <th className="py-2 pr-3 font-semibold">配件</th>
                <th className="py-2 pr-3 font-semibold">類型</th>
                <th className="py-2 pr-3 font-semibold">數量</th>
                <th className="py-2 pr-3 font-semibold">結餘</th>
                <th className="py-2 font-semibold">備註</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.recent.map((m) => (
                <tr key={m.id}>
                  <td className="py-2.5 pr-3 text-xs text-ink-muted">
                    {new Date(m.createdAt).toLocaleString('zh-HK')}
                  </td>
                  <td className="py-2.5 pr-3 font-semibold text-ink">{m.partName}</td>
                  <td className="py-2.5 pr-3">
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[0.7rem] font-bold text-ink-muted">
                      {STOCK_MOVEMENT_LABELS[m.type]}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 tabular">
                    {m.type === 'outbound' ? '−' : '+'}
                    {m.qty}
                  </td>
                  <td className="py-2.5 pr-3 tabular text-ink-muted">{m.balance}</td>
                  <td className="py-2.5 pr-3 text-xs text-ink-faint">{m.note ?? '—'}</td>
                </tr>
              ))}
              {data.recent.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-sm text-ink-faint">
                    尚無異動紀錄
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
  warn,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warn?: boolean;
}) {
  const bg = warn ? 'bg-red-50' : accent ? 'bg-brand-50' : 'bg-slate-50';
  const valColor = warn ? 'text-red-500' : accent ? 'text-brand-700' : 'text-ink';
  return (
    <div className={`rounded-2xl border border-slate-200 p-4 ${bg}`}>
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      <p className={`mt-1 text-xl font-extrabold ${valColor}`}>{value}</p>
    </div>
  );
}

function exportCsv(d: InventoryReportData) {
  const rows: string[] = [];
  rows.push('CathyRepair 進銷存報表');
  rows.push('');
  rows.push('指標,數值');
  rows.push(`配件 SKU,${d.summary.skuCount}`);
  rows.push(`庫存總量,${d.summary.totalStock}`);
  rows.push(`庫存價值,${d.summary.stockValue}`);
  rows.push(`低於預警,${d.summary.lowCount}`);
  rows.push(`缺貨,${d.summary.outCount}`);
  rows.push('');
  rows.push('月份,入庫數,出庫數,入庫金額,出庫金額');
  for (const m of d.monthly) {
    rows.push(`${m.label},${m.inbound},${m.outbound},${m.inboundValue},${m.outboundValue}`);
  }
  rows.push('');
  rows.push('配件,入庫,出庫,淨變動');
  for (const m of d.topMovers) {
    rows.push(`${m.partName},${m.inbound},${m.outbound},${m.net}`);
  }
  const csv = '﻿' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cathayrepair-inventory-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
