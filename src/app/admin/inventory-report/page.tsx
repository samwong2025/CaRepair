import { AdminPageHeader } from '../../../components/admin/page-header';
import { InventoryReportManager } from '../../../components/admin/inventory-report-manager';
import { buildInventoryReport } from '../../../lib/inventory-reports';
import { loadInventory, loadMovements } from '../../../lib/inventory-store';

export const dynamic = 'force-dynamic';

export default async function AdminInventoryReportPage() {
  const [parts, movements] = await Promise.all([loadInventory(), loadMovements()]);
  const data = buildInventoryReport(parts, movements);

  return (
    <>
      <AdminPageHeader
        titleEn="Inventory In/Out Report"
        title="倉庫進銷存報表"
        description="追蹤配件入庫、出庫與盤點調整，掌握庫存價值、低庫存預警與異動流水。"
      />
      <InventoryReportManager data={data} />
    </>
  );
}
