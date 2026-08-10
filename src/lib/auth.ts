import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { isSupabaseConfigured } from './supabase/client';

export type AppRole = 'admin' | 'technician';

export interface CurrentUser {
  id: string;
  email: string;
  name: string;
  role: AppRole;
  /** 師傅姓名（對應 RepairTicket.technician）；admin 為空 */
  technicianName?: string;
}

const MOCK_COOKIE = 'cathy_admin_session';

/**
 * 取得當前登入使用者（僅限 server component / route handler 使用）。
 *  - Supabase 模式：從 auth session 讀取 user metadata 中的 role / name
 *  - Mock 模式：固定回傳本機管理員（依賴 middleware 已通過 cookie 驗證）
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isSupabaseConfigured()) {
    const store = await cookies();
    if (store.get(MOCK_COOKIE)?.value !== 'ok') return null;
    return { id: 'local-admin', email: 'admin@local', name: '本機管理員', role: 'admin' };
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll();
        },
        setAll() {
          /* 唯讀取用，不寫入 */
        },
      },
    },
  );
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as {
    role?: AppRole;
    full_name?: string;
    technician_name?: string;
  };
  return {
    id: user.id,
    email: user.email ?? '',
    name: meta.full_name ?? user.email ?? '使用者',
    role: meta.role === 'technician' ? 'technician' : 'admin',
    technicianName: meta.technician_name,
  };
}

/** Server 端登入（mock 模式用密碼比對，Supabase 模式用 Auth） */
export async function serverSignIn(
  email: string,
  password: string,
): Promise<{ ok: boolean; error?: string; role?: AppRole }> {
  if (!isSupabaseConfigured()) {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return { ok: false, error: '尚未設定 ADMIN_PASSWORD 環境變數' };
    }
    if (password !== adminPassword) {
      return { ok: false, error: '密碼錯誤' };
    }
    const store = await cookies();
    store.set(MOCK_COOKIE, 'ok', { httpOnly: true, sameSite: 'lax', path: '/' });
    return { ok: true, role: 'admin' };
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll();
        },
        setAll(cookiesToSet) {
          const store = cookies();
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        },
      },
    },
  );
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { ok: false, error: error.message };
  return { ok: true };
}

/** Server 端登出 */
export async function serverSignOut(): Promise<void> {
  if (!isSupabaseConfigured()) {
    const store = await cookies();
    store.delete(MOCK_COOKIE);
    return;
  }
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookies().getAll();
        },
        setAll(cookiesToSet) {
          const store = cookies();
          cookiesToSet.forEach(({ name, value, options }) => store.set(name, value, options));
        },
      },
    },
  );
  await supabase.auth.signOut();
}
