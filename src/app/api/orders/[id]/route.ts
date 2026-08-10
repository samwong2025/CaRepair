import { NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import type { OrderStatus } from '../../../../types';

const VALID_STATUS: OrderStatus[] = [
  'submitted',
  'confirmed',
  'diagnosing',
  'repairing',
  'quality_check',
  'ready',
  'completed',
  'cancelled',
];

interface PatchBody {
  status?: OrderStatus;
  note?: string;
  operator?: string;
}

/** PATCH /api/orders/[id] 後台更新維修訂單狀態並追加時間軸節點 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch((error: unknown) => {
    console.error('解析狀態更新請求失敗', error);
    return null;
  })) as PatchBody | null;

  if (!body?.status || !VALID_STATUS.includes(body.status)) {
    return NextResponse.json({ message: '狀態值不正確' }, { status: 400 });
  }

  const order = await getRepository()
    .updateRepairOrderStatus(params.id, body.status, body.note, body.operator ?? '後台管理員')
    .catch((error: unknown) => {
      console.error('更新訂單狀態失敗', error);
      return null;
    });

  if (!order) {
    return NextResponse.json({ message: '找不到指定訂單' }, { status: 404 });
  }

  return NextResponse.json({ order });
}
