import { NextResponse } from 'next/server';
import { serverSignOut } from '../../../../lib/auth';

export const dynamic = 'force-dynamic';

export async function POST() {
  await serverSignOut();
  return NextResponse.json({ ok: true });
}
