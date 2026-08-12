import { NextResponse } from 'next/server';
import { getRepository } from '../../../../../../lib/repositories';
import { getCurrentUser } from '../../../../../../lib/auth';
import { isSupabaseConfigured } from '../../../../../../lib/supabase/client';

/**
 * PATCH /api/admin/shop-orders/[id]/customer
 * 局部更新訂單客戶資料（姓名 / 電話 / 備註）。
 * 故意不開放金額、商品、訂單號等關鍵欄位，避免破壞帳目或客戶履約一致性。
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ ok: false, error: '無權限' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as
    | { customerName?: string; customerPhone?: string; remark?: string }
    | null;
  if (!body) {
    return NextResponse.json({ ok: false, error: '請求格式錯誤' }, { status: 400 });
  }
  const customerName = (body.customerName ?? '').trim();
  const customerPhone = (body.customerPhone ?? '').trim();
  if (!customerName || !customerPhone) {
    return NextResponse.json(
      { ok: false, error: '客戶姓名與電話不可為空' },
      { status: 400 },
    );
  }
  try {
    if (isSupabaseConfigured()) {
      const updated = await getRepository().updateShopOrderCustomer(params.id, {
        customerName,
        customerPhone,
        remark: body.remark,
      });
      if (!updated) {
        return NextResponse.json({ ok: false, error: '找不到該訂單' }, { status: 404 });
      }
      return NextResponse.json({ ok: true, order: updated });
    }
    // mock 模式
    const updated = await getRepository().updateShopOrderCustomer(params.id, {
      customerName,
      customerPhone,
      remark: body.remark,
    });
    if (!updated) {
      return NextResponse.json({ ok: false, error: '找不到該訂單' }, { status: 404 });
    }
    return NextResponse.json({ ok: true, order: updated });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : '更新失敗' },
      { status: 500 },
    );
  }
}
