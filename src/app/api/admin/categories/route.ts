import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import type { ProductCategory } from '../../../../types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const list = await getRepository().listCategories();
  return NextResponse.json(list);
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name) {
    return NextResponse.json({ message: '缺少分類名稱' }, { status: 400 });
  }
  const data: ProductCategory = {
    id: body.id || `cat-${Date.now().toString(36)}`,
    name: String(body.name).trim(),
    group: body.group || undefined,
    sortOrder: Number(body.sortOrder ?? 0),
  };
  const saved = await getRepository().upsertCategory(data);
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ message: '缺少 id' }, { status: 400 });
  await getRepository().deleteCategory(id);
  return NextResponse.json({ ok: true });
}
