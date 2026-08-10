import { NextResponse } from 'next/server';
import { getRepository } from '../../../lib/repositories';
import type { AfterSalesInput, AfterSalesType } from '../../../types';

const HK_PHONE = /^[2-9]\d{7}$/;
const VALID_TYPES: AfterSalesType[] = ['warranty', 'complaint', 'consult', 'return'];

/** GET /api/aftersales?phone=9xxxxxxx 查詢客戶的售後個案 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const phone = searchParams.get('phone')?.trim();

  if (!phone || !HK_PHONE.test(phone)) {
    return NextResponse.json({ message: '請提供有效的香港手提號碼' }, { status: 400 });
  }

  const records = await getRepository()
    .findAfterSalesByPhone(phone)
    .catch((error: unknown) => {
      console.error('查詢售後個案失敗', error);
      return [];
    });

  return NextResponse.json({ records });
}

/** POST /api/aftersales 建立售後服務申請 */
export async function POST(request: Request) {
  const body = (await request.json().catch((error: unknown) => {
    console.error('解析售後申請失敗', error);
    return null;
  })) as AfterSalesInput | null;

  if (!body) {
    return NextResponse.json({ message: '請求內容格式不正確' }, { status: 400 });
  }

  if (!body.orderNo?.trim()) {
    return NextResponse.json({ message: '請填寫維修訂單編號' }, { status: 400 });
  }
  if (!body.customerName?.trim() || body.customerName.trim().length < 2) {
    return NextResponse.json({ message: '請填寫有效稱呼' }, { status: 400 });
  }
  if (!HK_PHONE.test(body.customerPhone ?? '')) {
    return NextResponse.json({ message: '請填寫有效的香港手提號碼' }, { status: 400 });
  }
  if (!VALID_TYPES.includes(body.type)) {
    return NextResponse.json({ message: '售後類別不正確' }, { status: 400 });
  }
  if (!body.subject?.trim() || body.detail?.trim().length < 10) {
    return NextResponse.json({ message: '請填寫主題並詳述問題（不少於 10 個字）' }, { status: 400 });
  }

  const record = await getRepository()
    .createAfterSales({
      orderNo: body.orderNo.trim().toUpperCase(),
      customerName: body.customerName.trim(),
      customerPhone: body.customerPhone,
      type: body.type,
      subject: body.subject.trim(),
      detail: body.detail.trim(),
    })
    .catch((error: unknown) => {
      console.error('建立售後個案失敗', error);
      return null;
    });

  if (!record) {
    return NextResponse.json({ message: '提交失敗，請稍後再試' }, { status: 500 });
  }

  return NextResponse.json({ record }, { status: 201 });
}
