import { pricingRules } from '../data/pricing';
import { symptoms } from '../data/symptoms';
import { isSupabaseConfigured } from './supabase/client';
import { getServerSupabase } from './supabase/server';
import type { DeviceCategory, SymptomPricing } from '../types';

const LS_KEY = 'cathayrepair_pricing_overrides';

function symptomName(symptomId: string): string {
  return symptoms.find((s) => s.id === symptomId)?.name ?? symptomId;
}

/* ── localStorage（mock 模式備援） ───────────────────────── */
function readLocalOverrides(): SymptomPricing[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as SymptomPricing[]) : [];
  } catch {
    return [];
  }
}

function writeLocalOverrides(rules: SymptomPricing[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(rules));
}

/**
 * 合併預設定價（pricing.ts）與覆寫（Supabase 或 localStorage），
 * 優先使用覆寫值。輸出以「類別 → 故障」扁平陣列。
 */
function mergeOverrides(overrides: SymptomPricing[]): SymptomPricing[] {
  const map = new Map<string, SymptomPricing>();
  for (const r of pricingRules) {
    map.set(`${r.category}:${r.symptomId}`, { ...r });
  }
  for (const o of overrides) {
    const key = `${o.category}:${o.symptomId}`;
    const base = map.get(key);
    map.set(key, { ...base, ...o, category: o.category, symptomId: o.symptomId });
  }
  return [...map.values()];
}

/* ── 伺服器端：直接讀 Supabase ─────────────────────────── */
export async function fetchPricingFromSupabase(): Promise<SymptomPricing[] | null> {
  const supabase = getServerSupabase();
  if (!supabase) return null;
  const { data, error } = await supabase.from('repair_pricing').select('*');
  if (error) {
    console.error('[pricing] fetchPricingFromSupabase', error.message);
    return null;
  }
  if (!data || data.length === 0) return null;
  return (data as Record<string, unknown>[]).map((row) => ({
    category: row.category as DeviceCategory,
    symptomId: row.symptom_id as string,
    partName: row.part_name as string,
    basePartFee: Number(row.base_part_fee ?? 0),
    baseLaborFee: Number(row.base_labor_fee ?? 0),
    durationMinutes: Number(row.duration_minutes ?? 30),
    warrantyDays: Number(row.warranty_days ?? 90),
    requiresLab: Boolean(row.requires_lab),
  }));
}

/* ── 主要讀取入口（前端 / 後台共用） ───────────────────── */
export async function loadPricing(): Promise<SymptomPricing[]> {
  // 已連 Supabase：優先讀雲端價格表
  if (isSupabaseConfigured()) {
    const server = await fetchPricingFromSupabase();
    if (server) return server;
  }
  // mock 模式：讀 localStorage 覆寫，合併預設
  return mergeOverrides(readLocalOverrides());
}

/* ── 後台寫入入口 ─────────────────────────────────────── */
export interface SaveResult {
  ok: boolean;
  mode: 'supabase' | 'local';
  error?: string;
}

export async function savePricing(rule: SymptomPricing): Promise<SaveResult> {
  if (isSupabaseConfigured()) {
    const supabase = getServerSupabase();
    if (!supabase) return { ok: false, mode: 'supabase', error: 'Supabase 未設定' };
    const { error } = await supabase.from('repair_pricing').upsert(
      {
        category: rule.category,
        symptom_id: rule.symptomId,
        part_name: rule.partName,
        base_part_fee: rule.basePartFee,
        base_labor_fee: rule.baseLaborFee,
        duration_minutes: rule.durationMinutes,
        warranty_days: rule.warrantyDays,
        requires_lab: rule.requiresLab,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'category,symptom_id' },
    );
    if (error) return { ok: false, mode: 'supabase', error: error.message };
    return { ok: true, mode: 'supabase' };
  }

  // mock 模式：寫入 localStorage
  const overrides = readLocalOverrides();
  const idx = overrides.findIndex(
    (r) => r.category === rule.category && r.symptomId === rule.symptomId,
  );
  const enriched: SymptomPricing = { ...rule };
  if (idx >= 0) overrides[idx] = enriched;
  else overrides.push(enriched);
  writeLocalOverrides(overrides);
  return { ok: true, mode: 'local' };
}

/** 取得某類別某故障的單筆規則（供 quote-engine 快速查詢） */
export function findRule(
  rules: SymptomPricing[],
  category: string,
  symptomId: string,
): SymptomPricing | undefined {
  return rules.find((r) => r.category === category && r.symptomId === symptomId);
}

export { symptomName };
