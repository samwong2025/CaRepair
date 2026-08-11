import { NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import { getCurrentUser } from '../../../../lib/auth';
import { isSupabaseConfigured } from '../../../../lib/supabase/client';
import type { Product } from '../../../../types';

/**
 * GET /api/admin/products
 * 讀取全部二手商品（Supabase 或本地資料）。
 */
export async function GET() {
  const products = await getRepository().listProducts();
  return NextResponse.json({ products });
}

/**
 * POST /api/admin/products
 * 新增或更新單一商品（upsert）。
 */
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ ok: false, error: '無權限' }, { status: 403 });
  }
  const body = (await request.json().catch(() => null)) as Product | null;
  if (!body || !body.id || !body.name) {
    return NextResponse.json({ ok: false, error: '缺少商品資料' }, { status: 400 });
  }
  try {
    if (isSupabaseConfigured()) {
      const saved = await getRepository().upsertProduct(body);
      return NextResponse.json(saved);
    }
    // mock 模式：暫存於 localStorage 由前端處理；此處直接回傳，讓前端狀態更新
    return NextResponse.json(body);
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : '儲存失敗' },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/admin/products?id=xxx
 * 刪除商品（僅 mock 模式支援；Supabase 模式需於資料庫停用）。
 */
export async function DELETE(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ ok: false, error: '無權限' }, { status: 403 });
  }
  const id = new URL(request.url).searchParams.get('id');
  if (!id) {
    return NextResponse.json({ ok: false, error: '缺少商品 id' }, { status: 400 });
  }
  if (isSupabaseConfigured()) {
    return NextResponse.json({ ok: false, error: '雲端模式不支援刪除' }, { status: 400 });
  }
  try {
    const { deleteProduct } = await import('../../../../lib/shop-store');
    await deleteProduct(id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json(
      { ok: false, error: e instanceof Error ? e.message : '刪除失敗' },
      { status: 500 },
    );
  }
}
