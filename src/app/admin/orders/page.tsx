import { AdminPageHeader } from '../../../components/admin/page-header';
import { OrdersManager } from '../../../components/admin/orders-manager';
import { getRepository } from '../../../lib/repositories';
import { getCurrentUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const [orders, user] = await Promise.all([
    getRepository().listRepairOrders(),
    getCurrentUser(),
  ]);

  return (
    <>
      <AdminPageHeader
        title="維修工單管理"
        titleEn="Repair Tickets"
        description="推進工單狀態、列印維修識別標籤與售後收據。狀態變更會即時同步至客戶追蹤頁。"
      />
      <OrdersManager orders={orders} currentUser={user} />
    </>
  );
}
