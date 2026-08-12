'use client';

import * as React from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { Download } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { formatHKD } from '../../lib/format';
import { type RangeKey, type ReportsData } from '../../lib/reports';

const RANGES: { key: RangeKey; label: string }[] = [
  { key: '30d', label: '近 30 天' },
  { key: '90d', label: '近 90 天' },
  { key: '6m', label: '近 6 個月' },
  { key: '12m', label: '近 12 個月' },
  { key: 'all', label: '全部' },
];

const PIE_COLORS = ['#2563eb', '#0891b2', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

interface ReportsManagerProps {
  initial: ReportsData;
}

export function ReportsManager({ initial }: ReportsManagerProps) {
  const [range, setRange] = React.useState<RangeKey>('12m');
  const [data, setData] = React.useState<ReportsData>(initial);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    if (range === '12m') {
      setData(initial);
      return;
    }
    let active = true;
    setLoading(true);
    fetch(`/api/admin/reports?range=${range}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (active && d) setData(d);
      })
      .finally(() => active && setLoading(false));
    return () => {
      active = false;
    };
  }, [range, initial]);

  const k = data.kpi;

  return (
    <div className="space-y-6">
      {/* 範圍切換 + 匯出 */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-colors ${
                range === r.key
                  ? 'bg-brand-gradient text-white shadow-brand'
                  : 'bg-slate-100 text-ink-muted hover:bg-slate-200'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
        <Button variant="outline" size="sm" onClick={() => exportCsv(data)}>
          <Download className="h-4 w-4" />
          匯出 CSV
        </Button>
      </div>

      {loading ? (
        <div className="py-20 text-center text-sm text-ink-faint">報表計算中…</div>
      ) : (
        <>
          {/* KPI 卡片 */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <KpiCard label="總營收" value={formatHKD(k.totalRevenue)} hint={`維修 ${formatHKD(k.repairRevenue)} ・ 商城 ${formatHKD(k.shopRevenue)}`} accent="brand" />
            <KpiCard label="總訂單數" value={`${k.totalOrders}`} hint={`維修 ${k.repairOrders} ・ 商城 ${k.shopOrders}`} />
            <KpiCard label="客單均價" value={formatHKD(k.avgTicket)} hint={`已成交 ${k.completedRepairs} 單維修`} />
            <KpiCard label="新增會員" value={`${k.newCustomers}`} hint={`未結案售後 ${k.afterSalesOpen}`} accent="accent" />
          </div>

          {/* 營收走勢 */}
          <Panel title="營收走勢" subtitle="按月統計維修與二手商城營收（HK$）">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthly} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} tickFormatter={(v) => `$${v / 1000}k`} />
                <Tooltip
                  formatter={(v: number) => formatHKD(v)}
                  contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="repairRevenue" name="維修營收" stroke="#2563eb" strokeWidth={2.5} dot={false} />
                <Line type="monotone" dataKey="shopRevenue" name="商城營收" stroke="#10b981" strokeWidth={2.5} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </Panel>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {/* 訂單量柱狀 */}
            <Panel title="訂單量（按月）" subtitle="維修與商城訂單筆數">
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={data.monthly} margin={{ top: 8, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#eef2f7" />
                  <XAxis dataKey="label" tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="repairOrders" name="維修" fill="#2563eb" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="shopOrders" name="商城" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Panel>

            {/* 維修狀態分布 */}
            <Panel title="維修訂單狀態" subtitle="當前範圍內各狀態數量">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.repairStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={(e: { name: string; value: number }) => `${e.name} ${e.value}`}
                    labelLine={false}
                  >
                    {data.repairStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Panel>

            {/* 裝置類別營收 */}
            <Panel title="裝置類別營收" subtitle="各類裝置貢獻的維修營收">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.categoryRevenue}
                    dataKey="revenue"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={(e: { name: string; revenue: number }) => `${e.name} ${formatHKD(e.revenue)}`}
                    labelLine={false}
                  >
                    {data.categoryRevenue.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v: number) => formatHKD(v)}
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </Panel>

            {/* 商城訂單狀態 */}
            <Panel title="商城訂單狀態" subtitle="二手商品訂單分布">
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={data.shopStatus}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={95}
                    label={(e: { name: string; value: number }) => `${e.name} ${e.value}`}
                    labelLine={false}
                  >
                    {data.shopStatus.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </Panel>
          </div>

          {/* 熱門機型 */}
          <Panel title="熱門維修機型 Top 8" subtitle="依維修營收排序">
            <div className="space-y-2">
              {data.topModels.map((m, i) => {
                const max = data.topModels[0]?.revenue || 1;
                return (
                  <div key={m.model} className="flex items-center gap-3">
                    <span className="w-6 text-right text-xs font-bold text-ink-faint">{i + 1}</span>
                    <span className="w-48 shrink-0 truncate text-sm font-semibold text-ink">{m.model}</span>
                    <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-brand-gradient"
                        style={{ width: `${Math.max(4, (m.revenue / max) * 100)}%` }}
                      />
                    </div>
                    <span className="w-24 text-right text-sm font-bold text-brand-700">{formatHKD(m.revenue)}</span>
                    <span className="w-14 text-right text-xs text-ink-faint">{m.count} 單</span>
                  </div>
                );
              })}
              {data.topModels.length === 0 && (
                <p className="py-6 text-center text-sm text-ink-faint">尚無維修訂單資料</p>
              )}
            </div>
          </Panel>

          {/* 工單來源分析（online marketing 成效） */}
          <Panel title="工單來源分析" subtitle="網上自助預約 vs 後台手動建單 — 評估線上推廣成效">
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {data.sourceBreakdown.map((s) => {
                const totalCount = data.sourceBreakdown.reduce((sum, x) => sum + x.count, 0) || 1;
                const totalRev = data.sourceBreakdown.reduce((sum, x) => sum + x.revenue, 0) || 1;
                return (
                  <div key={s.key} className="rounded-xl border border-slate-200 bg-white p-4">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-bold text-ink">{s.label}</p>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[0.7rem] font-bold ${
                          s.key === 'online' ? 'bg-cyan-50 text-cyan-700' : 'bg-slate-100 text-ink-muted'
                        }`}
                      >
                        佔比 {((s.count / totalCount) * 100).toFixed(0)}%
                      </span>
                    </div>
                    <p className="mt-1 text-2xl font-extrabold text-ink">{s.count} 單</p>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      已成交營收 {formatHKD(s.revenue)}（{((s.revenue / totalRev) * 100).toFixed(0)}%）
                    </p>
                    <div className="mt-3 space-y-1.5">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="w-16 text-ink-faint">完成率</span>
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className={`h-full rounded-full ${s.key === 'online' ? 'bg-cyan-500' : 'bg-slate-400'}`}
                            style={{ width: `${Math.max(4, s.completionRate * 100)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-semibold text-ink">
                          {(s.completionRate * 100).toFixed(0)}%
                        </span>
                      </div>
                      <p className="text-[0.7rem] text-ink-faint">
                        完成 {s.completed} 單 ・ 客單均價 {formatHKD(s.count ? s.revenue / s.completed : 0)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-3 text-xs text-ink-faint">
              說明：<span className="font-semibold text-ink">網上預約</span> 為官網/WhatsApp 自助下單，
              <span className="font-semibold text-ink">手動建單</span> 為門市或電話代客建單。兩者佔比與成交營收差異，可反映線上推廣（online marketing）帶來的訂單轉化效果。
            </p>
          </Panel>

          {/* 售後統計 */}
          <Panel title="售後個案統計" subtitle="各類型數量與未結案">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {data.afterSales.map((a) => (
                <div key={a.type} className="rounded-xl border border-slate-200 bg-white p-4">
                  <p className="text-sm font-bold text-ink">{a.type}</p>
                  <p className="mt-1 text-2xl font-extrabold text-ink">{a.count}</p>
                  <p className="mt-0.5 text-xs text-ink-faint">未結案 {a.pending}</p>
                </div>
              ))}
            </div>
          </Panel>
        </>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  hint,
  accent,
}: {
  label: string;
  value: string;
  hint?: string;
  accent?: 'brand' | 'accent';
}) {
  const accentBg = accent === 'brand' ? 'bg-brand-50' : accent === 'accent' ? 'bg-accent-50' : 'bg-slate-50';
  return (
    <div className={`rounded-2xl border border-slate-200 p-4 ${accentBg}`}>
      <p className="text-xs font-semibold text-ink-muted">{label}</p>
      <p className="mt-1 text-2xl font-extrabold text-ink">{value}</p>
      {hint && <p className="mt-0.5 text-[0.7rem] text-ink-faint">{hint}</p>}
    </div>
  );
}

function Panel({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="mb-4">
        <h3 className="text-base font-extrabold text-ink">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function exportCsv(d: ReportsData) {
  const rows: string[] = [];
  rows.push('CathyRepair 營收報表');
  rows.push('');
  rows.push('指標,數值');
  rows.push(`總營收,${d.kpi.totalRevenue}`);
  rows.push(`維修營收,${d.kpi.repairRevenue}`);
  rows.push(`商城營收,${d.kpi.shopRevenue}`);
  rows.push(`總訂單數,${d.kpi.totalOrders}`);
  rows.push(`客單均價,${Math.round(d.kpi.avgTicket)}`);
  rows.push(`新增會員,${d.kpi.newCustomers}`);
  rows.push('');
  rows.push('月份,維修營收,商城營收,總營收,維修訂單,商城訂單');
  for (const m of d.monthly) {
    rows.push(
      `${m.label},${m.repairRevenue},${m.shopRevenue},${m.totalRevenue},${m.repairOrders},${m.shopOrders}`,
    );
  }
  rows.push('');
  rows.push('熱門機型,營收,單數');
  for (const m of d.topModels) {
    rows.push(`${m.model},${m.revenue},${m.count}`);
  }
  const csv = '﻿' + rows.join('\n');
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cathayrepair-reports-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
