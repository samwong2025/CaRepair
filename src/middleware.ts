import { NextResponse, type NextRequest } from 'next/server';

const ADMIN_PREFIX = '/admin';
const LOGIN_PATH = '/admin/login';
const MOCK_COOKIE = 'cathy_admin_session';

/**
 * 後台守衛（運行於 Edge 執行環境）。
 *
 * 注意：Next.js 中介層固定跑在 Edge runtime，而 @supabase/ssr 的 supabase.auth.getUser()
 * 在部分邊緣執行環境會崩潰（導致連線被重置 / 白屏）。因此這裡只做「輕量」的閘門：
 * 依據是否存在 Supabase session cookie 或本地 mock cookie 決定是否放行，
 * 真正的身分驗證交由 Node runtime 的頁面 / API（getCurrentUser）執行，做到縱深防禦。
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith(ADMIN_PREFIX)) return NextResponse.next();
  if (pathname === LOGIN_PATH) return NextResponse.next();

  const cookies = request.cookies.getAll();
  const hasSupabaseSession = cookies.some((c) => /^sb-.*-auth-token$/.test(c.name));
  const mockSession = request.cookies.get(MOCK_COOKIE)?.value;

  if (!hasSupabaseSession && !mockSession) {
    const url = request.nextUrl.clone();
    url.pathname = LOGIN_PATH;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
