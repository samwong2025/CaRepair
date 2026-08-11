import { NextResponse } from 'next/server';
import { getRepository } from '../../../../lib/repositories';
import { getCurrentUser } from '../../../../lib/auth';
import { buildReports, type RangeKey } from '../../../../lib/reports';

const VALID: RangeKey[] = ['30d', '90d', '6m', '12m', 'all'];

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') {
    return NextResponse.json({ ok: false, error: '無權限' }, { status: 403 });
  }
  const rangeParam = new URL(request.url).searchParams.get('range') as RangeKey | null;
  const range: RangeKey = rangeParam && VALID.includes(rangeParam) ? rangeParam : '12m';

  const repo = getRepository();
  const [repairOrders, shopOrders, customers, afterSales] = await Promise.all([
    repo.listRepairOrders(),
    repo.listShopOrders(),
    repo.listCustomers(),
    repo.listAfterSales(),
  ]);

  const data = buildReports(repairOrders, shopOrders, customers, afterSales, range);
  return NextResponse.json(data);
}
