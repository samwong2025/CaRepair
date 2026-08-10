import { isSupabaseConfigured } from '../supabase/client';
import { mockRepository } from './mock';
import { supabaseRepository } from './supabase';
import type { DataRepository } from './types';

export type { DataRepository } from './types';

/**
 * 依環境變數自動選擇資料來源：
 * 已設定 NEXT_PUBLIC_SUPABASE_URL / ANON_KEY → 使用 Supabase；
 * 否則回退至本地 Mock 資料，確保介面在未連線時仍可完整運作。
 */
export function getRepository(): DataRepository {
  return isSupabaseConfigured() ? supabaseRepository : mockRepository;
}

export const repository = getRepository();
