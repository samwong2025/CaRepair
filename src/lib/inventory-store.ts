import { inventorySeed } from '../data/inventory';
import { isSupabaseConfigured } from './supabase/client';
import { getServerSupabase } from './supabase/server';
import type { InventoryAlert, Part, PartCategory } from '../types';

const LS_KEY = 'cathayrepair_inventory_overrides';

function partName(p: Part): string {
  return p.name;
}

/* ── localStorage（mock 模式備援） ──────────────────── */
function readLocalOverrides(): Part[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Part[]) : [];
  } catch {
    return [];
  }
}

function writeLocalOverrides(parts: Part[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(parts));
}

/** 合併種子庫存與覆寫（優先使用覆寫值） */
function mergeOverrides(overrides: Part[]): Part[] {
  const map = new Map<string, Part>();
  for (const p of inventorySeed) map.set(p.id, { ...p });
  for (const o of overrides) map.set(o.id, { ...map.get(o.id), ...o, id: o.id });
  return [...map.values()];
}

/* ── 伺服器端：直接讀 Supabase ─────────────────────── */
export async function fetchInventoryFromSupabase(): Promise<Part[] | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('inventory_parts').select('*');
  if (error) {
    console.error('[inventory] fetchInventoryFromSupabase', error.message);
    return null;
  }
  if (!data || data.length === 0) return null;
  return (data as Record<string, unknown>[]).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    category: row.category as PartCategory,
    deviceCategory: (row.device_category as Part['deviceCategory']) ?? undefined,
    symptomId: (row.symptom_id as string) ?? undefined,
    sku: (row.sku as string) ?? undefined,
    stock: Number(row.stock ?? 0),
    lowStockThreshold: Number(row.low_stock_threshold ?? 5),
    unitCost: Number(row.unit_cost ?? 0),
    unitPrice: row.unit_price != null ? Number(row.unit_price) : undefined,
    supplier: (row.supplier as string) ?? undefined,
    updatedAt: (row.updated_at as string) ?? undefined,
  }));
}

/* ── 主要讀取入口（前端 / 後台共用） ────────────────── */
export async function loadInventory(): Promise<Part[]> {
  if (isSupabaseConfigured()) {
    const server = await fetchInventoryFromSupabase();
    if (server) return server;
  }
  return mergeOverrides(readLocalOverrides());
}

/* ── 後台寫入入口 ─────────────────────────────────── */
export interface SaveInventoryResult {
  ok: boolean;
  mode: 'supabase' | 'local';
  error?: string;
}

export async function saveInventory(part: Part): Promise<SaveInventoryResult> {
  if (isSupabaseConfigured()) {
    const supabase = getServerSupabase();
    if (!supabase) return { ok: false, mode: 'supabase', error: 'Supabase 未設定' };
    const { error } = await supabase.from('inventory_parts').upsert(
      {
        id: part.id,
        name: part.name,
        category: part.category,
        device_category: part.deviceCategory ?? null,
        symptom_id: part.symptomId ?? null,
        sku: part.sku ?? null,
        stock: part.stock,
        low_stock_threshold: part.lowStockThreshold,
        unit_cost: part.unitCost,
        unit_price: part.unitPrice ?? null,
        supplier: part.supplier ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'id' },
    );
    if (error) return { ok: false, mode: 'supabase', error: error.message };
    return { ok: true, mode: 'supabase' };
  }

  const overrides = readLocalOverrides();
  const idx = overrides.findIndex((p) => p.id === part.id);
  const enriched: Part = { ...part, updatedAt: new Date().toISOString() };
  if (idx >= 0) overrides[idx] = enriched;
  else overrides.push(enriched);
  writeLocalOverrides(overrides);
  return { ok: true, mode: 'local' };
}

export function findPart(parts: Part[], partId: string): Part | undefined {
  return parts.find((p) => p.id === partId);
}

/** 依裝置類別 / 故障，篩選作業時適用的配件 */
export function filterApplicableParts(
  parts: Part[],
  deviceCategory?: string,
  symptomIds: string[] = [],
): Part[] {
  return parts.filter((p) => {
    if (p.deviceCategory && deviceCategory && p.deviceCategory !== deviceCategory) return false;
    if (p.symptomId && symptomIds.length && !symptomIds.includes(p.symptomId)) return false;
    return true;
  });
}

/** 計算庫存告警（缺貨 / 低庫存） */
export function computeInventoryAlerts(parts: Part[]): InventoryAlert[] {
  const alerts: InventoryAlert[] = [];
  for (const part of parts) {
    if (part.stock <= 0) {
      alerts.push({ part, level: 'out', message: `「${partName(part)}」庫存為 0，請立即補貨` });
    } else if (part.stock <= part.lowStockThreshold) {
      alerts.push({
        part,
        level: 'low',
        message: `「${partName(part)}」僅餘 ${part.stock} 件（低於預警 ${part.lowStockThreshold}）`,
      });
    }
  }
  return alerts.sort((a, b) => (a.level === 'out' ? -1 : 1) - (b.level === 'out' ? -1 : 1));
}

export { partName };
