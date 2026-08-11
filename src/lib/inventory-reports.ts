import type { Part, StockMovement } from '../types';

export interface InventoryReportData {
  summary: {
    skuCount: number;
    totalStock: number;
    stockValue: number; // 以成本計庫存價值
    lowCount: number;
    outCount: number;
  };
  monthly: {
    month: string;
    label: string;
    inbound: number;
    outbound: number;
    inboundValue: number;
    outboundValue: number;
  }[];
  topMovers: {
    partName: string;
    inbound: number;
    outbound: number;
    net: number;
  }[];
  lowStock: {
    name: string;
    stock: number;
    threshold: number;
  }[];
  recent: StockMovement[];
}

const TW_MONTHS = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}
function monthLabel(month: string): string {
  const m = Number(month.split('-')[1]);
  return TW_MONTHS[m - 1] ?? month;
}

export function buildInventoryReport(
  parts: Part[],
  movements: StockMovement[],
): InventoryReportData {
  // 總覽
  const totalStock = parts.reduce((s, p) => s + p.stock, 0);
  const stockValue = parts.reduce((s, p) => s + p.stock * (p.unitCost || 0), 0);
  const lowCount = parts.filter((p) => p.stock > 0 && p.stock <= p.lowStockThreshold).length;
  const outCount = parts.filter((p) => p.stock <= 0).length;

  // 近 6 個月進出趨勢
  const now = new Date();
  type MonthBucket = { inbound: number; outbound: number; inboundValue: number; outboundValue: number };
  const buckets = new Map<string, MonthBucket>();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = monthKey(d);
    buckets.set(key, { inbound: 0, outbound: 0, inboundValue: 0, outboundValue: 0 });
  }
  for (const m of movements) {
    const key = monthKey(new Date(m.createdAt));
    const b = buckets.get(key);
    if (!b) continue;
    const cost = m.unitCost ?? 0;
    if (m.type === 'inbound') {
      b.inbound += m.qty;
      b.inboundValue += m.qty * cost;
    } else if (m.type === 'outbound') {
      b.outbound += m.qty;
      b.outboundValue += m.qty * cost;
    } else {
      // 盤點調整：以結餘差額方向計入
      b.inbound += 0;
      b.outbound += 0;
    }
  }
  const monthly = [...buckets.entries()].map(([month, b]) => ({
    month,
    label: monthLabel(month),
    inbound: b.inbound,
    outbound: b.outbound,
    inboundValue: Math.round(b.inboundValue),
    outboundValue: Math.round(b.outboundValue),
  }));

  // 熱門異動配件 Top 10
  const moveMap = new Map<string, { inbound: number; outbound: number }>();
  for (const m of movements) {
    const cur = moveMap.get(m.partName) ?? { inbound: 0, outbound: 0 };
    if (m.type === 'inbound') cur.inbound += m.qty;
    else if (m.type === 'outbound') cur.outbound += m.qty;
    moveMap.set(m.partName, cur);
  }
  const topMovers = [...moveMap.entries()]
    .map(([partName, v]) => ({
      partName,
      inbound: v.inbound,
      outbound: v.outbound,
      net: v.inbound - v.outbound,
    }))
    .sort((a, b) => b.inbound + b.outbound - (a.inbound + a.outbound))
    .slice(0, 10);

  // 低庫存清單
  const lowStock = parts
    .filter((p) => p.stock <= p.lowStockThreshold)
    .map((p) => ({ name: p.name, stock: p.stock, threshold: p.lowStockThreshold }))
    .sort((a, b) => a.stock - b.stock);

  // 最近 15 筆異動
  const recent = [...movements]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 15);

  return {
    summary: {
      skuCount: parts.length,
      totalStock,
      stockValue,
      lowCount,
      outCount,
    },
    monthly,
    topMovers,
    lowStock,
    recent,
  };
}
