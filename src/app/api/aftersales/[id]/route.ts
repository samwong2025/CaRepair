import { NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import type { AfterSalesStatus } from '../../../../types';

const VALID_STATUS: AfterSalesStatus[] = ['pending', 'processing', 'resolved', 'rejected'];

/** PATCH /api/aftersales/:id 推進售後個案狀態、指派處理人或填寫處理結果 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json().catch((error: unknown) => {
    console.error('解析售後更新失敗', error);
    return null;
  })) as { status?: AfterSalesStatus; handler?: string; resolution?: string } | null;

  if (!body) {
    return NextResponse.json({ message: '請求內容格式不正確' }, { status: 400 });
  }

  const patch: { status?: AfterSalesStatus; handler?: string; resolution?: string } = {};
  if (body.status && VALID_STATUS.includes(body.status)) patch.status = body.status;
  if (typeof body.handler === 'string' && body.handler.trim()) patch.handler = body.handler.trim();
  if (typeof body.resolution === 'string' && body.resolution.trim())
    patch.resolution = body.resolution.trim();

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ message: '沒有可更新的欄位' }, { status: 400 });
  }

  const record = await getRepository()
    .updateAfterSales(params.id, patch)
    .catch((error: unknown) => {
      console.error('更新售後個案失敗', error);
      return null;
    });

  if (!record) {
    return NextResponse.json({ message: '個案不存在或更新失敗' }, { status: 404 });
  }

  return NextResponse.json({ record });
}
