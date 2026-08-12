import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { getRepository } from '@/lib/repositories';
import { loadInventory, computeInventoryAlerts } from '@/lib/inventory-store';
import { effectivePrice } from '@/lib/format';
import { isThisWeek, isThisMonth } from '@/lib/format';

export const dynamic = 'force-dynamic';

/**
 * 後台儀表板資料接口。
 * 由瀏覽器端 DashboardClient 呼叫，避免在 serverless 函式內同步 SSR 重型元件與序列化大量資料，
 * 從根源解決公網環境（EdgeOne）下 /admin 頁面在渲染期被函式執行環境中止（白屏 / ERR_CONNECTION_RESET）的問題。
 */
export async function GET() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }
  try {
    const repo = getRepository();
    const [orders, inventory] = await Promise.all([repo.listRepairOrders(), loadInventory()]);
    const alerts = computeInventoryAlerts(inventory);

    const completedOrders = orders.filter((o) => o.status === 'completed');
    const todayProjected = orders
      .filter((o) => o.status !== 'completed' && o.status !== 'cancelled')
      .reduce((sum, o) => sum + effectivePrice(o), 0);
    const weekActual = completedOrders
      .filter((o) => isThisWeek(o.updatedAt))
      .reduce((sum, o) => sum + effectivePrice(o), 0);
    const monthActual = completedOrders
      .filter((o) => isThisMonth(o.updatedAt))
      .reduce((sum, o) => sum + effectivePrice(o), 0);

    return NextResponse.json({
      currentUser,
      orders,
      inventory,
      alerts,
      todayProjected,
      weekActual,
      monthActual,
    });
  } catch (err) {
    console.error('[admin/dashboard] 資料讀取失敗', err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
