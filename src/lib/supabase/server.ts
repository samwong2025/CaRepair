import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

let serverClient: SupabaseClient | null = null;

/** 伺服器端 client：優先使用 service role key 以繞過 RLS 執行後台操作 */
export function getServerSupabase(): SupabaseClient | null {
  if (!url || !(serviceKey || anonKey)) return null;
  if (!serverClient) {
    serverClient = createClient(url, (serviceKey ?? anonKey) as string, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return serverClient;
}
