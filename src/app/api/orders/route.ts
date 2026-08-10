import { NextResponse } from 'next/server';
import { getModelById } from '../../../data/devices';
import { getSymptomById } from '../../../data/symptoms';
import { getRepository } from '../../../lib/repositories';
import { loadModels, loadSymptoms, findModel, findSymptom } from '../../../lib/catalog-store';
import type { RepairOrderInput } from '../../../types';

const HK_PHONE = /^[2-9]\d{7}$/;

/** 服務端二次校驗，避免前端被繞過 */
async function validate(input: Partial<RepairOrderInput>): Promise<string | null> {
  const models = await loadModels();
  const model = findModel(models, input.deviceModelId ?? '') ?? getModelById(input.deviceModelId ?? '');
  if (!input.deviceModelId || !model) return '型號不存在或未選擇';
  if (!Array.isArray(input.symptomIds) || input.symptomIds.length === 0) return '請至少選擇一項故障';

  const symptoms = await loadSymptoms();
  const unknown = input.symptomIds.filter((id) => !findSymptom(symptoms, id) && !getSymptomById(id));
  if (unknown.length > 0) return `未知的故障項目：${unknown.join('、')}`;

  if (!input.customerName || input.customerName.trim().length < 2) return '請填寫有效稱呼';
  if (!input.customerPhone || !HK_PHONE.test(input.customerPhone)) return '請填寫有效的香港手提號碼';
  if (!input.appointmentAt || Number.isNaN(Date.parse(input.appointmentAt))) return '預約時間格式不正確';

  if (input.serviceMode === 'walk_in') {
    if (!input.shopName) return '請揀選門市';
  } else if (!input.address || input.address.trim().length < 6) {
    return '請填寫完整地址';
  }

  return null;
}

/**
 * POST /api/orders
 * 建立維修訂單；若手機號碼未曾登記，倉儲層會自動開立會員檔案並同步建立維修工單。
 */
export async function POST(request: Request) {
  const body = (await request.json().catch((error: unknown) => {
    console.error('解析落單請求失敗', error);
    return null;
  })) as RepairOrderInput | null;

  if (!body) {
    return NextResponse.json({ message: '請求內容格式不正確' }, { status: 400 });
  }

  const invalidMessage = await validate(body);
  if (invalidMessage) {
    return NextResponse.json({ message: invalidMessage }, { status: 400 });
  }

  const repository = getRepository();
  const result = await repository.createRepairOrder(body).catch((error: unknown) => {
    console.error('建立維修訂單失敗', error);
    return null;
  });

  if (!result) {
    return NextResponse.json({ message: '建立訂單失敗，請稍後再試' }, { status: 500 });
  }

  return NextResponse.json(result, { status: 201 });
}

/**
 * GET /api/orders?orderNo=CR... 或 ?phone=9xxxxxxx
 * 供訂單追蹤頁查詢使用。
 */
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const orderNo = searchParams.get('orderNo')?.trim();
  const phone = searchParams.get('phone')?.trim();

  if (!orderNo && !phone) {
    return NextResponse.json({ message: '請提供 orderNo 或 phone 參數' }, { status: 400 });
  }

  const repository = getRepository();

  if (orderNo) {
    const order = await repository.getRepairOrderByNo(orderNo).catch((error: unknown) => {
      console.error('查詢訂單失敗', error);
      return null;
    });
    return NextResponse.json({ orders: order ? [order] : [] });
  }

  const orders = await repository.findRepairOrdersByPhone(phone as string).catch((error: unknown) => {
    console.error('依電話查詢訂單失敗', error);
    return [];
  });

  return NextResponse.json({ orders });
}
