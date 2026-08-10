import type { OrderStatus } from '../../../types';
import { AdminPageHeader } from '../../../components/admin/page-header';
import { OrdersManager } from '../../../components/admin/orders-manager';
import { getRepository } from '../../../lib/repositories';
import { getCurrentUser } from '../../../lib/auth';

export const dynamic = 'force-dynamic';

const VALID_STATUSES: ReadonlyArray<OrderStatus> = [
  'submitted',
  'confirmed',
  'diagnosing',
  'repairing',
  'quality_check',
  'ready',
  'completed',
  'cancelled',
];

type StatusPreset = 'active' | 'completed';

function resolveStatusFilter(raw: string | string[] | undefined): OrderStatus | 'all' {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (!value) return 'all';
  if (value === 'active' || value === 'completed') {
    // 預設會在 OrdersManager 內部比對，這裡僅作為錨值，傳回 'all' 即可
    return 'all';
  }
  if ((VALID_STATUSES as readonly string[]).includes(value)) {
    return value as OrderStatus;
  }
  return 'all';
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const [orders, user] = await Promise.all([
    getRepository().listRepairOrders(),
    getCurrentUser(),
  ]);

  const rawStatus = searchParams?.status;
  const initialStatus = resolveStatusFilter(rawStatus);
  const rawPreset = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus;
  const statusPreset: StatusPreset | null =
    rawPreset === 'active' || rawPreset === 'completed' ? rawPreset : null;

  return (
    <>
      <AdminPageHeader
        title="維修工單管理"
        titleEn="Repair Tickets"
        description="推進工單狀態、列印維修識別標籤與售後收據。狀態變更會即時同步至客戶追蹤頁。"
      />
      <OrdersManager
        orders={orders}
        currentUser={user}
        initialStatus={initialStatus}
        statusPreset={statusPreset}
      />
    </>
  );
}
