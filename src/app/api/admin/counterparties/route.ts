import { NextRequest, NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import type { Counterparty } from '../../../../types';

export const dynamic = 'force-dynamic';

export async function GET() {
  const list = await getRepository().listCounterparties();
  return NextResponse.json(list);
}

const TYPES: Counterparty['type'][] = ['supplier', 'customer', 'both'];

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !body.name) {
    return NextResponse.json({ message: '缺少單位名稱' }, { status: 400 });
  }
  const type: Counterparty['type'] = TYPES.includes(body.type) ? body.type : 'supplier';
  const data: Counterparty = {
    id: body.id || `cp-${Date.now().toString(36)}`,
    name: String(body.name).trim(),
    type,
    contact: body.contact?.toString().trim() || undefined,
    phone: body.phone?.toString().trim() || undefined,
    email: body.email?.toString().trim() || undefined,
    address: body.address?.toString().trim() || undefined,
    taxNo: body.taxNo?.toString().trim() || undefined,
    settlement: body.settlement?.toString().trim() || undefined,
    note: body.note?.toString().trim() || undefined,
  };
  const saved = await getRepository().upsertCounterparty(data);
  return NextResponse.json(saved);
}

export async function DELETE(req: NextRequest) {
  const id = new URL(req.url).searchParams.get('id');
  if (!id) return NextResponse.json({ message: '缺少 id' }, { status: 400 });
  await getRepository().deleteCounterparty(id);
  return NextResponse.json({ ok: true });
}
