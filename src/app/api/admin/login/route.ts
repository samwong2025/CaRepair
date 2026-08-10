import { NextResponse } from 'next/server';
import { serverSignIn } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  let body: { email?: string; password?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ message: '請求格式錯誤' }, { status: 400 });
  }

  const email = (body.email ?? '').trim();
  const password = body.password ?? '';
  if (!password) return NextResponse.json({ message: '請輸入密碼' }, { status: 400 });

  const result = await serverSignIn(email, password);
  if (!result.ok) {
    return NextResponse.json({ message: result.error ?? '登入失敗' }, { status: 401 });
  }
  return NextResponse.json({ ok: true, role: result.role ?? 'admin' });
}
