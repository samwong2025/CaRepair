import { NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import { getCurrentUser } from '../../../../lib/auth';
import { isSupabaseConfigured } from '../../../../lib/supabase/client';
import type { ShopOrderStatus } from '../../../../types';

const VALID: ShopOrderStatus[] = [
  'pending',
  'paid',
  'shipped',
  'picked',
  'completed',
  'cancelled',
];

/**
 * PATCH /api/admin/shop-orders
 * 更新二手商城訂單狀態（付款 / 出貨 / 取貨 / 完成 / 取消）。
 * body: { id: string, status: ShopOrderStatus }
 */
export async function PATCH(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ ok: false, error: '無權限' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as
    | { id?: string; status?: ShopOrderStatus }
    | null;
  if (!body || !body.id || !body.status || !VALID.includes(body.status)) {
    return NextResponse.json({ ok: false, error: '缺少有效的訂單或狀態' }, { status: 400 });
  }
  try {
    if (isSupabaseConfigured()) {
      const updated = await getRepository().updateShopOrderStatus(body.id, body.status);
      if (!updated) {
        return NextResponse.json({ ok: false, error: '找不到該訂單' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, order: updated });
    }
    // mock 模式：暫存於本機狀態
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : '更新失敗' },
      { status: 500 },
    );
  }
}
