import { deviceModels as DEFAULT_MODELS, deviceGroups } from '../data/devices';
import { symptoms as DEFAULT_SYMPTOMS } from '../data/symptoms';
import { isSupabaseConfigured } from './supabase/client';
import { getServerSupabase } from './supabase/server';
import { ensurePricingForSymptom, deletePricingBySymptom } from './pricing-store';
import type { DeviceCategory, DeviceModel, Symptom } from '../types';

const LS_MODELS = 'cathayrepair_models_overrides';
const LS_SYMPTOMS = 'cathayrepair_symptoms_overrides';

/* ── localStorage（mock 模式備援） ───────────────────────── */
function readLS<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T[]) : [];
  } catch {
    return [];
  }
}
function writeLS<T>(key: string, rows: T[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(key, JSON.stringify(rows));
}

/* ── 機型 ───────────────────────────────────────────────── */
export async function loadModels(): Promise<DeviceModel[]> {
  if (isSupabaseConfigured()) {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('device_models').select('*');
      if (!error && data && data.length) {
        return (data as Record<string, unknown>[]).map(rowToModel);
      }
    }
  }
  const overrides = readLS<DeviceModel>(LS_MODELS);
  return overrides.length ? overrides : DEFAULT_MODELS;
}

function rowToModel(row: Record<string, unknown>): DeviceModel {
  return {
    id: row.id as string,
    category: row.category as DeviceCategory,
    name: row.name as string,
    series: (row.series as string) ?? '',
    year: Number(row.year ?? 2025),
    tier: (row.tier as DeviceModel['tier']) ?? 'standard',
    hot: Boolean(row.hot),
    image: (row.image as string) || undefined,
  };
}

export async function saveModel(model: DeviceModel): Promise<{ ok: boolean; mode: string; error?: string }> {
  if (isSupabaseConfigured()) {
    const supabase = getServerSupabase();
    if (!supabase) return { ok: false, mode: 'supabase', error: 'Supabase 未設定' };
    const { error } = await supabase.from('device_models').upsert({
      id: model.id,
      category: model.category,
      name: model.name,
      series: model.series,
      year: model.year,
      tier: model.tier,
      hot: Boolean(model.hot),
      image: model.image ?? null,
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, mode: 'supabase', error: error.message };
    return { ok: true, mode: 'supabase' };
  }
  const list = readLS<DeviceModel>(LS_MODELS);
  const idx = list.findIndex((m) => m.id === model.id);
  if (idx >= 0) list[idx] = model;
  else list.push(model);
  writeLS(LS_MODELS, list);
  return { ok: true, mode: 'local' };
}

export async function deleteModel(id: string): Promise<{ ok: boolean; mode: string; error?: string }> {
  if (isSupabaseConfigured()) {
    const supabase = getServerSupabase();
    if (!supabase) return { ok: false, mode: 'supabase', error: 'Supabase 未設定' };
    const { error } = await supabase.from('device_models').delete().eq('id', id);
    if (error) return { ok: false, mode: 'supabase', error: error.message };
    return { ok: true, mode: 'supabase' };
  }
  const list = readLS<DeviceModel>(LS_MODELS).filter((m) => m.id !== id);
  writeLS(LS_MODELS, list);
  return { ok: true, mode: 'local' };
}

/* ── 故障症狀 ───────────────────────────────────────────── */
export async function loadSymptoms(): Promise<Symptom[]> {
  if (isSupabaseConfigured()) {
    const supabase = getServerSupabase();
    if (supabase) {
      const { data, error } = await supabase.from('device_symptoms').select('*');
      if (!error && data && data.length) {
        return (data as Record<string, unknown>[]).map(rowToSymptom);
      }
    }
  }
  const overrides = readLS<Symptom>(LS_SYMPTOMS);
  return overrides.length ? overrides : DEFAULT_SYMPTOMS;
}

function rowToSymptom(row: Record<string, unknown>): Symptom {
  return {
    id: row.id as string,
    name: row.name as string,
    shortName: (row.short_name as string) ?? (row.name as string),
    icon: (row.icon as string) ?? 'Wrench',
    description: (row.description as string) ?? '',
    categories: (row.categories as DeviceCategory[]) ?? [],
    frequency: Number(row.frequency ?? 50),
    urgent: Boolean(row.urgent),
  };
}

export async function saveSymptom(s: Symptom): Promise<{ ok: boolean; mode: string; error?: string }> {
  if (isSupabaseConfigured()) {
    const supabase = getServerSupabase();
    if (!supabase) return { ok: false, mode: 'supabase', error: 'Supabase 未設定' };
    const { error } = await supabase.from('device_symptoms').upsert({
      id: s.id,
      name: s.name,
      short_name: s.shortName,
      icon: s.icon,
      description: s.description,
      categories: s.categories,
      frequency: s.frequency,
      urgent: Boolean(s.urgent),
      updated_at: new Date().toISOString(),
    });
    if (error) return { ok: false, mode: 'supabase', error: error.message };
    // 聯動：依故障適用機型補齊 repair_pricing 缺漏的價格行
    await ensurePricingForSymptom(s.id, s.categories);
    return { ok: true, mode: 'supabase' };
  }
  const list = readLS<Symptom>(LS_SYMPTOMS);
  const idx = list.findIndex((x) => x.id === s.id);
  if (idx >= 0) list[idx] = s;
  else list.push(s);
  writeLS(LS_SYMPTOMS, list);
  return { ok: true, mode: 'local' };
}

export async function deleteSymptom(id: string): Promise<{ ok: boolean; mode: string; error?: string }> {
  if (isSupabaseConfigured()) {
    const supabase = getServerSupabase();
    if (!supabase) return { ok: false, mode: 'supabase', error: 'Supabase 未設定' };
    // 先聯動清理該故障的所有關聯價格行，避免孤兒資料
    await deletePricingBySymptom(id);
    const { error } = await supabase.from('device_symptoms').delete().eq('id', id);
    if (error) return { ok: false, mode: 'supabase', error: error.message };
    return { ok: true, mode: 'supabase' };
  }
  const list = readLS<Symptom>(LS_SYMPTOMS).filter((x) => x.id !== id);
  writeLS(LS_SYMPTOMS, list);
  return { ok: true, mode: 'local' };
}

/* ── 動態查詢（供全站前端 / 報價 / 建單即時取用） ──────── */
export function modelCategories(): { value: DeviceCategory; label: string }[] {
  return deviceGroups.map((g) => ({ value: g.id, label: g.name }));
}

export function findModel(list: DeviceModel[], id: string): DeviceModel | undefined {
  return list.find((m) => m.id === id);
}
export function modelsByCategory(list: DeviceModel[], category: DeviceCategory): DeviceModel[] {
  return list.filter((m) => m.category === category);
}
export function symptomsByCategory(list: Symptom[], category: DeviceCategory): Symptom[] {
  return list
    .filter((s) => s.categories.includes(category))
    .sort((a, b) => b.frequency - a.frequency);
}
export function findSymptom(list: Symptom[], id: string): Symptom | undefined {
  return list.find((s) => s.id === id);
}
