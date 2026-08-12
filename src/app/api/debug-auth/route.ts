import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  const info: Record<string, unknown> = {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? 'SET' : 'MISSING',
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'SET' : 'MISSING',
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'SET' : 'MISSING',
  };
  try {
    const u = await getCurrentUser();
    info.user = u ? { id: u.id, email: u.email, name: u.name, role: u.role } : null;
    info.result = 'getCurrentUser OK';
  } catch (e) {
    info.result = 'getCurrentUser THREW';
    info.error = e instanceof Error ? e.message : String(e);
    info.stack = e instanceof Error ? e.stack : undefined;
  }
  return NextResponse.json(info);
}
