import { NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import { normalizePhone } from '../../../../lib/format';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface BatchItem {
  productId: string;
  qty: number;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => null)) as {
      items?: BatchItem[];
      customerName?: string;
      customerPhone?: string;
      fulfillment?: 'pickup' | 'delivery';
      deliveryAddress?: string;
      pickupShop?: string;
      pickupAt?: string;
      remark?: string;
    } | null;

    if (!body) {
      return NextResponse.json({ ok: false, message: '請求格式錯誤。' }, { status: 400 });
    }

    const {
      items,
      customerName,
      customerPhone,
      fulfillment,
      deliveryAddress,
      pickupShop,
      pickupAt,
      remark,
    } = body;

    // 基本欄位驗證
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ ok: false, message: '購物車沒有選取任何商品。' }, { status: 400 });
    }
    if (!customerName || customerName.trim().length < 2) {
      return NextResponse.json({ ok: false, message: '請填寫聯絡人姓名。' }, { status: 400 });
    }
    const phone = normalizePhone(customerPhone ?? '');
    if (phone.length < 8) {
      return NextResponse.json({ ok: false, message: '請填寫正確的聯絡電話。' }, { status: 400 });
    }
    if (fulfillment !== 'pickup' && fulfillment !== 'delivery') {
      return NextResponse.json({ ok: false, message: '請選擇交收方式。' }, { status: 400 });
    }
    if (fulfillment === 'delivery' && (!deliveryAddress || deliveryAddress.trim().length < 6)) {
      return NextResponse.json({ ok: false, message: '請填寫完整送貨地址。' }, { status: 400 });
    }
    if (fulfillment === 'pickup' && !pickupShop) {
      return NextResponse.json({ ok: false, message: '請選擇自取門市。' }, { status: 400 });
    }

    // 合併相同商品並檢查數量
    const merged = new Map<string, number>();
    for (const it of items) {
      const id = String(it?.productId ?? '');
      const qty = Math.max(1, Math.floor(Number(it?.qty) || 1));
      if (!id) {
        return NextResponse.json({ ok: false, message: '商品資料有誤。' }, { status: 400 });
      }
      merged.set(id, (merged.get(id) ?? 0) + qty);
    }

    const repo = getRepository();
    const products = await repo.listProducts();
    const productMap = new Map(products.map((p) => [p.id, p]));

    const lines: BatchItem[] = [];
    for (const [id, qty] of merged) {
      const product = productMap.get(id);
      if (!product) {
        return NextResponse.json(
          { ok: false, message: `部分商品已下架或不存在（${id}）。` },
          { status: 400 },
        );
      }
      if (product.stock <= 0) {
        return NextResponse.json(
          { ok: false, message: `「${product.name}」已售罄。` },
          { status: 400 },
        );
      }
      if (qty > product.stock) {
        return NextResponse.json(
          { ok: false, message: `「${product.name}」庫存不足（剩 ${product.stock} 件）。` },
          { status: 400 },
        );
      }
      lines.push({ productId: id, qty });
    }

    // 逐件建單（共用同一份聯絡資料與交收方式）
    const created: { orderNo: string; productName: string }[] = [];
    for (const line of lines) {
      const order = await repo.createShopOrder({
        productId: line.productId,
        qty: line.qty,
        customerName: customerName.trim(),
        customerPhone: phone,
        fulfillment,
        deliveryAddress: deliveryAddress?.trim() || undefined,
        pickupShop: fulfillment === 'pickup' ? pickupShop?.trim() : undefined,
        pickupAt: pickupAt?.trim() || undefined,
        remark: remark?.trim() || undefined,
      });
      const name = productMap.get(line.productId)?.name ?? '';
      created.push({ orderNo: order.orderNo, productName: name });
    }

    return NextResponse.json({
      ok: true,
      count: created.length,
      orderNos: created.map((c) => c.orderNo),
      message: `成功落 ${created.length} 張訂單，門市會盡快致電確認。`,
    });
  } catch (error) {
    console.error('批量落二手單失敗', error);
    return NextResponse.json({ ok: false, message: '伺服器異常，請稍後再試。' }, { status: 500 });
  }
}
