import { NextResponse } from 'next/server';
import { getRepository } from '../../../lib/repositories';
import { maskPhone, normalizePhone } from '../../../lib/format';

/** GET /api/shop-orders?phone=91234567 或 ?orderNo=SH-... 查詢二手商店訂單 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone')?.trim();
  const orderNo = searchParams.get('orderNo')?.trim().toUpperCase();
  const orders = await getRepository().listShopOrders();

  if (!phone && !orderNo) {
    return NextResponse.json({ orders });
  }

  const normalized = phone ? normalizePhone(phone) : '';
  const matched = orders.filter(
    (order) =>
      (phone ? normalizePhone(order.customerPhone) === normalized : false) ||
      (orderNo ? order.orderNo.toUpperCase() === orderNo : false),
  );
  return NextResponse.json({ orders: matched });
}

/** POST /api/shop-orders 建立二手商店訂單（送貨上門 / 到店自取） */
export async function POST(request: Request) {
  const body = (await request.json().catch((error: unknown) => {
    console.error('解析二手訂單失敗', error);
    return null;
  })) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ message: '請求內容格式不正確' }, { status: 400 });
  }

  const productId = typeof body.productId === 'string' ? body.productId.trim() : '';
  const qty = Number(body.qty);
  const fulfillment = body.fulfillment === 'delivery' || body.fulfillment === 'pickup' ? body.fulfillment : '';
  const customerName = typeof body.customerName === 'string' ? body.customerName.trim() : '';
  const customerPhone = normalizePhone(typeof body.customerPhone === 'string' ? body.customerPhone : '');
  const remark = typeof body.remark === 'string' ? body.remark.trim() : '';
  const deliveryAddress = typeof body.deliveryAddress === 'string' ? body.deliveryAddress.trim() : '';
  const pickupShop = typeof body.pickupShop === 'string' ? body.pickupShop.trim() : '';
  const pickupAt = typeof body.pickupAt === 'string' ? body.pickupAt.trim() : '';

  if (!productId) return NextResponse.json({ message: '請選擇商品' }, { status: 400 });
  if (!Number.isFinite(qty) || qty < 1)
    return NextResponse.json({ message: '購買數量必須大於 0' }, { status: 400 });
  if (!fulfillment) return NextResponse.json({ message: '請選擇交收方式' }, { status: 400 });
  if (fulfillment === 'delivery' && !deliveryAddress)
    return NextResponse.json({ message: '請填寫送貨地址' }, { status: 400 });
  if (fulfillment === 'pickup' && !pickupShop)
    return NextResponse.json({ message: '請選擇自取門市' }, { status: 400 });
  if (customerName.length < 2)
    return NextResponse.json({ message: '請填寫聯絡人姓名' }, { status: 400 });
  if (customerPhone.length < 8)
    return NextResponse.json({ message: '請填寫正確的聯絡電話' }, { status: 400 });

  const order = await getRepository()
    .createShopOrder({
      productId,
      qty: Math.floor(qty),
      fulfillment,
      deliveryAddress: fulfillment === 'delivery' ? deliveryAddress : undefined,
      pickupShop: fulfillment === 'pickup' ? pickupShop : undefined,
      pickupAt: fulfillment === 'pickup' && pickupAt ? pickupAt : undefined,
      customerName,
      customerPhone,
      remark,
    })
    .catch((error: unknown) => {
      console.error('建立二手訂單失敗', error);
      return null;
    });

  if (!order) {
    return NextResponse.json({ message: '商品不存在或落單失敗' }, { status: 400 });
  }

  return NextResponse.json(
    {
      order: { ...order, customerPhone: maskPhone(order.customerPhone) },
      message: fulfillment === 'pickup' ? '落單成功，請於指定時間到店自取。' : '落單成功，我們會盡快安排送貨。',
    },
    { status: 201 },
  );
}
