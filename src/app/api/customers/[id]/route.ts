import { NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import type { MemberLevel } from '../../../../types';

const VALID_LEVELS: MemberLevel[] = ['regular', 'silver', 'gold', 'vip'];

/** PATCH /api/customers/:id 更新會員備註與等級 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json().catch((error: unknown) => {
    console.error('解析會員更新失敗', error);
    return null;
  })) as { note?: string; level?: MemberLevel } | null;

  if (!body) {
    return NextResponse.json({ message: '請求內容格式不正確' }, { status: 400 });
  }

  const patch: { note?: string; level?: MemberLevel } = {};
  if (typeof body.note === 'string') patch.note = body.note;
  if (body.level && VALID_LEVELS.includes(body.level)) patch.level = body.level;

  if (Object.keys(patch).length === 0) {
    return NextResponse.json({ message: '沒有可更新的欄位' }, { status: 400 });
  }

  const customer = await getRepository()
    .updateCustomer(params.id, patch)
    .catch((error: unknown) => {
      console.error('更新會員失敗', error);
      return null;
    });

  if (!customer) {
    return NextResponse.json({ message: '會員不存在或更新失敗' }, { status: 404 });
  }

  return NextResponse.json({ customer });
}
