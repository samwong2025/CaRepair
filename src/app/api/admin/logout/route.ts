import { NextResponse } from 'next/server';
import { serverSignOut } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  const { cookiesToSet } = await serverSignOut();
  const res = NextResponse.json({ ok: true });
  for (const c of cookiesToSet ?? []) {
    res.cookies.set(c.name, c.value, c.options);
  }
  return res;
}
