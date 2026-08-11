import { AdminPageHeader } from '../../../components/admin/page-header';
import { InventoryManager } from '../../../components/admin/inventory-manager';
import { computeInventoryAlerts, loadInventory } from '../../../lib/inventory-store';
import { getRepository } from '../../../lib/repositories';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const inventory = await loadInventory();
  const alerts = computeInventoryAlerts(inventory);

  return (
    <>
      <AdminPageHeader
        title="庫存管理"
        titleEn="Inventory"
        description="維修配件庫存與低庫存預警。調整庫存後會同步至師傅工作台的「選用配件」。"
      />
      <InventoryManager initialInventory={inventory} initialAlerts={alerts} />
    </>
  );
}
