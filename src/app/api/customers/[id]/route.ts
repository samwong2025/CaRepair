import { NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import type { MemberLevel } from '../../../../types';

const VALID_LEVELS: MemberLevel[] = ['regular', 'silver', 'gold', 'vip'];
const PHONE_REGEX = /^[\d\s\-+()]{8,20}$/;

function normalizeTags(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null;
  const cleaned = value
    .filter((item): item is string => typeof item === 'string')
    .map((item) => item.trim())
    .filter((item) => item.length > 0 && item.length <= 20);
  // 去重，保留出现顺序
  const seen = new Set<string>();
  const unique = cleaned.filter((tag) => (seen.has(tag) ? false : (seen.add(tag), true)));
  return unique.slice(0, 12);
}

/** PATCH /api/customers/:id 更新會員資料（備註、等級、姓名、電話、郵箱、區、地址、標籤） */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } },
) {
  const body = (await request.json().catch((error: unknown) => {
    console.error('解析會員更新失敗', error);
    return null;
  })) as Record<string, unknown> | null;

  if (!body) {
    return NextResponse.json({ message: '請求內容格式不正確' }, { status: 400 });
  }

  const patch: {
    note?: string;
    level?: MemberLevel;
    name?: string;
    phone?: string;
    email?: string;
    district?: string;
    address?: string;
    tags?: string[];
  } = {};

  if (typeof body.note === 'string') {
    patch.note = body.note.trim().slice(0, 500);
  }
  if (body.level && VALID_LEVELS.includes(body.level as MemberLevel)) {
    patch.level = body.level as MemberLevel;
  }
  if (typeof body.name === 'string') {
    const name = body.name.trim();
    if (name.length === 0) {
      return NextResponse.json({ message: '姓名不可為空' }, { status: 400 });
    }
    patch.name = name.slice(0, 60);
  }
  if (typeof body.phone === 'string') {
    const phone = body.phone.trim();
    if (phone.length === 0) {
      return NextResponse.json({ message: '電話不可為空' }, { status: 400 });
    }
    if (!PHONE_REGEX.test(phone)) {
      return NextResponse.json({ message: '電話格式不正確' }, { status: 400 });
    }
    patch.phone = phone;
  }
  if (body.email === null || body.email === '') {
    patch.email = '';
  } else if (typeof body.email === 'string') {
    const email = body.email.trim();
    if (email.length > 0 && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ message: '電郵格式不正確' }, { status: 400 });
    }
    patch.email = email.slice(0, 120);
  }
  if (body.district === null || body.district === '') {
    patch.district = '';
  } else if (typeof body.district === 'string') {
    patch.district = body.district.trim().slice(0, 40);
  }
  if (body.address === null || body.address === '') {
    patch.address = '';
  } else if (typeof body.address === 'string') {
    patch.address = body.address.trim().slice(0, 200);
  }
  const normalizedTags = normalizeTags(body.tags);
  if (normalizedTags !== null) {
    patch.tags = normalizedTags;
  }

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