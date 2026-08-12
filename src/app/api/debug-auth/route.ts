import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRepository } from '@/lib/repositories';
import { loadInventory } from '@/lib/inventory-store';

export const dynamic = 'force-dynamic';

export async function GET() {
  const out: Record<string, unknown> = {};
  const repo = getRepository();
  const steps: Array<[string, () => Promise<unknown>]> = [
    ['getCurrentUser', async () => getCurrentUser()],
    ['listRepairOrders', async () => repo.listRepairOrders()],
    ['listCustomers', async () => repo.listCustomers()],
    ['listShopOrders', async () => repo.listShopOrders()],
    ['listTickets', async () => repo.listTickets()],
    ['listAfterSales', async () => repo.listAfterSales()],
    ['loadInventory', async () => loadInventory()],
  ];
  for (const [name, fn] of steps) {
    try {
      const v = await fn();
      out[name] = Array.isArray(v) ? `OK array len=${v.length}` : `OK ${typeof v}`;
    } catch (e) {
      out[name] = 'THREW: ' + (e instanceof Error ? e.message + ' | ' + (e.stack || '') : String(e));
      break;
    }
  }
  return NextResponse.json(out);
}
