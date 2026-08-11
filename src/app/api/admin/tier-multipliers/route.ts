import { NextResponse } from 'next/server';
import {
  fetchTierFromSupabase,
  saveTierToSupabase,
  type TierMultipliers,
} from '../../../../lib/pricing-store';

/**
 * GET /api/admin/tier-multipliers
 * 讀取機型級距係數（旗艦 / 進階 / 標準 / 舊款），來自 Supabase 雲端表，回退預設值。
 */
export async function GET() {
  const tiers = await fetchTierFromSupabase();
  return NextResponse.json({ tiers });
}

/**
 * POST /api/admin/tier-multipliers
 * 寫入機型級距係數，upsert 至 Supabase 雲端表。
 * body: { flagship, premium, standard, legacy }
 */
export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<TierMultipliers> | null;
  if (!body || typeof body.flagship !== 'number' || typeof body.legacy !== 'number') {
    return NextResponse.json({ ok: false, error: '缺少有效的級距係數' }, { status: 400 });
  }
  const payload: TierMultipliers = {
    flagship: Number(body.flagship),
    premium: Number(body.premium ?? 1.2),
    standard: Number(body.standard ?? 1.0),
    legacy: Number(body.legacy),
  };
  const result = await saveTierToSupabase(payload);
  if (!result.ok) {
    return NextResponse.json({ ok: false, error: result.error ?? '寫入失敗' }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
