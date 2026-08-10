import { NextResponse, type NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

const ADMIN_PREFIX = '/admin';
const LOGIN_PATH = '/admin/login';
const MOCK_COOKIE = 'cathy_admin_session';

/**
 * 後台守衛：
 *  - 連上 Supabase：以 Supabase Auth session 為準
 *  - 未連線（mock 模式）：以 ADMIN_PASSWORD 種下的 cookie 為準
 * 兩者皆無效則導向 /admin/login
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith(ADMIN_PREFIX)) return NextResponse.next();
  if (pathname === LOGIN_PATH) return NextResponse.next();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // ── Supabase 模式：檢查 session ──
  if (supabaseUrl && supabaseKey) {
    const response = NextResponse.next();
    const supabase = createServerClient(supabaseUrl, supabaseKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    });
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = LOGIN_PATH;
      return NextResponse.redirect(url);
    }
    return response;
  }

  // ── Mock 模式：檢查密碼 cookie ──
  const session = request.cookies.get(MOCK_COOKIE)?.value;
  if (session === 'ok') return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = LOGIN_PATH;
  return NextResponse.redirect(url);
}

export const config = {
  matcher: ['/admin/:path*'],
};
