import type {
  AfterSalesRecord,
  Customer,
  RepairOrder,
  ShopOrder,
} from '../types';

/* ─── 型別 ─────────────────────────────────────────── */
export type RangeKey = '30d' | '90d' | '6m' | '12m' | 'all';

export interface KpiSummary {
  repairRevenue: number;
  shopRevenue: number;
  totalRevenue: number;
  repairOrders: number;
  shopOrders: number;
  totalOrders: number;
  completedRepairs: number;
  newCustomers: number;
  avgTicket: number;
  afterSalesOpen: number;
}

export interface MonthPoint {
  month: string; // YYYY-MM
  label: string; // 6月
  repairRevenue: number;
  shopRevenue: number;
  totalRevenue: number;
  repairOrders: number;
  shopOrders: number;
}

export interface StatusSlice {
  name: string;
  value: number;
}

export interface CategorySlice {
  name: string;
  value: number;
  revenue: number;
}

export interface TopModel {
  model: string;
  count: number;
  revenue: number;
}

export interface AfterSalesStat {
  type: string;
  count: number;
  pending: number;
}

export interface ReportsData {
  kpi: KpiSummary;
  monthly: MonthPoint[];
  repairStatus: StatusSlice[];
  shopStatus: StatusSlice[];
  categoryRevenue: CategorySlice[];
  topModels: TopModel[];
  afterSales: AfterSalesStat[];
}

/* ─── 工具 ─────────────────────────────────────────── */
const TW_MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function toDate(s: string): Date {
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? new Date(0) : d;
}

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function monthLabel(month: string): string {
  const m = Number(month.split('-')[1]);
  return TW_MONTHS[m - 1] ?? month;
}

function rangeStart(range: RangeKey): Date {
  const now = new Date();
  const d = new Date(now);
  switch (range) {
    case '30d':
      d.setDate(d.getDate() - 30);
      break;
    case '90d':
      d.setDate(d.getDate() - 90);
      break;
    case '6m':
      d.setMonth(d.getMonth() - 6);
      break;
    case '12m':
      d.setMonth(d.getMonth() - 12);
      break;
    case 'all':
      return new Date(0);
  }
  return d;
}

const DEVICE_LABEL: Record<string, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  watch: 'Apple Watch',
  macbook: 'MacBook',
};

function orderRevenue(o: RepairOrder): number {
  return typeof o.manualPrice === 'number' && o.manualPrice > 0
    ? o.manualPrice
    : o.quote?.total ?? 0;
}

/* ─── 主聚合 ───────────────────────────────────────── */
export function buildReports(
  repairOrders: RepairOrder[],
  shopOrders: ShopOrder[],
  customers: Customer[],
  afterSales: AfterSalesRecord[],
  range: RangeKey = '12m',
): ReportsData {
  const start = rangeStart(range);

  const repairsIn = repairOrders.filter((o) => toDate(o.createdAt) >= start);
  const shopsIn = shopOrders.filter((o) => toDate(o.createdAt) >= start);

  // 營收以「已完成 / 已付款 / 已出貨 / 已取貨」視為已成交確收
  const repairRevenue = repairsIn
    .filter((o) => o.status === 'completed')
    .reduce((sum, o) => sum + orderRevenue(o), 0);
  const shopRevenue = shopsIn
    .filter((o) => o.status === 'paid' || o.status === 'shipped' || o.status === 'picked' || o.status === 'completed')
    .reduce((sum, o) => sum + o.price * o.qty, 0);

  const completedRepairs = repairsIn.filter((o) => o.status === 'completed').length;
  const newCustomers = customers.filter((c) => toDate(c.createdAt) >= start).length;

  const totalOrders = repairsIn.length + shopsIn.length;
  const avgTicket = totalOrders > 0 ? (repairRevenue + shopRevenue) / totalOrders : 0;

  const afterSalesOpen = afterSales.filter(
    (a) => a.status === 'pending' || a.status === 'processing',
  ).length;

  const kpi: KpiSummary = {
    repairRevenue,
    shopRevenue,
    totalRevenue: repairRevenue + shopRevenue,
    repairOrders: repairsIn.length,
    shopOrders: shopsIn.length,
    totalOrders,
    completedRepairs,
    newCustomers,
    avgTicket,
    afterSalesOpen,
  };

  // 月份走勢（取範圍內最近 12 個月，含不含資料也要補齊空月）
  const monthly = buildMonthly(repairsIn, shopsIn, range);

  // 維修訂單狀態分布
  const repairStatus = countByStatus(
    repairsIn,
    ['submitted', 'confirmed', 'diagnosing', 'repairing', 'quality_check', 'ready', 'completed', 'cancelled'],
    {
      submitted: '已提交',
      confirmed: '已確認',
      diagnosing: '檢測中',
      repairing: '維修中',
      quality_check: '質檢中',
      ready: '待取機',
      completed: '已完成',
      cancelled: '已取消',
    },
  );

  const shopStatus = countByStatus(
    shopsIn,
    ['pending', 'paid', 'shipped', 'picked', 'completed', 'cancelled'],
    {
      pending: '待付款',
      paid: '已付款',
      shipped: '已出貨',
      picked: '已取貨',
      completed: '已完成',
      cancelled: '已取消',
    },
  );

  // 各裝置類別營收
  const catMap = new Map<string, { value: number; revenue: number }>();
  for (const o of repairsIn) {
    const name = DEVICE_LABEL[o.deviceCategory] ?? o.deviceCategory;
    const cur = catMap.get(name) ?? { value: 0, revenue: 0 };
    cur.value += 1;
    cur.revenue += orderRevenue(o);
    catMap.set(name, cur);
  }
  const categoryRevenue: CategorySlice[] = [...catMap.entries()]
    .map(([name, v]) => ({ name, value: v.value, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue);

  // 熱門機型 Top 8
  const modelMap = new Map<string, { count: number; revenue: number }>();
  for (const o of repairsIn) {
    const cur = modelMap.get(o.deviceModelName) ?? { count: 0, revenue: 0 };
    cur.count += 1;
    cur.revenue += orderRevenue(o);
    modelMap.set(o.deviceModelName, cur);
  }
  const topModels: TopModel[] = [...modelMap.entries()]
    .map(([model, v]) => ({ model, count: v.count, revenue: v.revenue }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 8);

  // 售後統計
  const asTypeMap: Record<string, { label: string; count: number; pending: number }> = {
    warranty: { label: '保養', count: 0, pending: 0 },
    complaint: { label: '投訴', count: 0, pending: 0 },
    consult: { label: '諮詢', count: 0, pending: 0 },
    return: { label: '退換貨', count: 0, pending: 0 },
  };
  for (const a of afterSales) {
    const t = asTypeMap[a.type];
    if (!t) continue;
    t.count += 1;
    if (a.status === 'pending' || a.status === 'processing') t.pending += 1;
  }
  const afterSalesStat: AfterSalesStat[] = Object.entries(asTypeMap).map(([type, v]) => ({
    type: v.label,
    count: v.count,
    pending: v.pending,
  }));

  return {
    kpi,
    monthly,
    repairStatus,
    shopStatus,
    categoryRevenue,
    topModels,
    afterSales: afterSalesStat,
  };
}

function buildMonthly(
  repairs: RepairOrder[],
  shops: ShopOrder[],
  range: RangeKey,
): MonthPoint[] {
  const monthsBack = range === '30d' ? 1 : range === '90d' ? 3 : range === '6m' ? 6 : 12;
  const now = new Date();
  const buckets = new Map<string, MonthPoint>();

  for (let i = monthsBack - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    buckets.set(key, {
      month: key,
      label: monthLabel(key),
      repairRevenue: 0,
      shopRevenue: 0,
      totalRevenue: 0,
      repairOrders: 0,
      shopOrders: 0,
    });
  }

  for (const o of repairs) {
    const key = monthKey(toDate(o.createdAt));
    const b = buckets.get(key);
    if (!b) continue;
    b.repairOrders += 1;
    b.repairRevenue += orderRevenue(o);
  }
  for (const o of shops) {
    const key = monthKey(toDate(o.createdAt));
    const b = buckets.get(key);
    if (!b) continue;
    b.shopOrders += 1;
    b.shopRevenue += o.price * o.qty;
  }

  return [...buckets.values()].map((b) => ({
    ...b,
    repairRevenue: Math.round(b.repairRevenue),
    shopRevenue: Math.round(b.shopRevenue),
    totalRevenue: Math.round(b.repairRevenue + b.shopRevenue),
  }));
}

function countByStatus(
  orders: { status: string }[],
  keys: string[],
  labels: Record<string, string>,
): StatusSlice[] {
  const counts = new Map<string, number>();
  for (const k of keys) counts.set(k, 0);
  for (const o of orders) {
    if (counts.has(o.status)) counts.set(o.status, (counts.get(o.status) ?? 0) + 1);
    else counts.set(o.status, 1);
  }
  return keys
    .map((k) => ({ name: labels[k] ?? k, value: counts.get(k) ?? 0 }))
    .filter((s) => s.value > 0);
}
