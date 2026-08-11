import { NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import type { OrderStatus, RepairOrderEditPatch } from '../../../../types';

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
  /* 編輯欄位（任何一項存在即視為 edit，與 status 互斥） */
  deviceModelId?: string;
  symptomIds?: string[];
  technician?: string;
  remark?: string | null;
  customerName?: string;
  customerPhone?: string;
  shopName?: string | null;
  appointmentAt?: string;
  partsUsed?: import('../../../../types').UsedPart[];
  manualPrice?: number | null;
  priceNote?: string | null;
}

/** PATCH /api/orders/[id] 後台更新維修訂單（狀態推進 或 編輯欄位） */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const body = (await request.json().catch((error: unknown) => {
    console.error('解析更新請求失敗', error);
    return null;
  })) as PatchBody | null;

  if (!body) {
    return NextResponse.json({ message: '請求內容不正確' }, { status: 400 });
  }

  const repo = getRepository();

  /* 模式 A：編輯欄位 */
  const editKeys: (keyof RepairOrderEditPatch)[] = [
    'deviceModelId',
    'symptomIds',
    'technician',
    'remark',
    'customerName',
    'customerPhone',
    'shopName',
    'appointmentAt',
    'partsUsed',
    'manualPrice',
    'priceNote',
  ];
  const hasEdit = editKeys.some((k) => body[k] !== undefined);
  if (hasEdit) {
    if (body.symptomIds && !Array.isArray(body.symptomIds)) {
      return NextResponse.json({ message: 'symptomIds 必須是陣列' }, { status: 400 });
    }
    const patch: RepairOrderEditPatch = {
      deviceModelId: body.deviceModelId,
      symptomIds: body.symptomIds,
      technician: body.technician,
      remark: body.remark,
      customerName: body.customerName,
      customerPhone: body.customerPhone,
      shopName: body.shopName,
      appointmentAt: body.appointmentAt,
      partsUsed: body.partsUsed,
      manualPrice: body.manualPrice,
      priceNote: body.priceNote,
      operator: body.operator,
      note: body.note,
    };

    const order = await repo.updateRepairOrder(params.id, patch).catch((error: unknown) => {
      console.error('編輯訂單失敗', error);
      return null;
    });

    if (!order) {
      return NextResponse.json({ message: '找不到指定訂單' }, { status: 404 });
    }

    return NextResponse.json({ order });
  }

  /* 模式 B：狀態推進 */
  if (!body.status || !VALID_STATUS.includes(body.status)) {
    return NextResponse.json({ message: '狀態值不正確' }, { status: 400 });
  }

  const order = await repo
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