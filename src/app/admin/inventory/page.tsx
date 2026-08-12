import { getRepository } from '../../../lib/repositories';
import { AdminPageHeader } from '../../../components/admin/page-header';
import LazyAdmin from '../../../components/admin/lazy-admin';
import { computeInventoryAlerts, loadInventory } from '../../../lib/inventory-store';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryPage() {
  const inventory = await loadInventory();
  const alerts = computeInventoryAlerts(inventory);
  const counterparties = await getRepository().listCounterparties();
  const categories = await getRepository().listCategories();
  const supplierOptions = counterparties.filter(
    (c) => c.type === 'supplier' || c.type === 'both',
  );

  return (
    <>
      <AdminPageHeader
        title="庫存管理"
        titleEn="Inventory"
        description="維修配件庫存與低庫存預警。調整庫存後會同步至師傅工作台的「選用配件」。"
      />
      <LazyAdmin
        name="inventory"
        props={{
          initialInventory: inventory,
          initialAlerts: alerts,
          supplierOptions,
          categoryOptions: categories,
        }}
      />
    </>
  );
}
