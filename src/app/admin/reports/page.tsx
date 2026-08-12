import { getRepository } from '../../../lib/repositories';
import { AdminPageHeader } from '../../../components/admin/page-header';
import LazyAdmin from '../../../components/admin/lazy-admin';
import { buildReports } from '../../../lib/reports';

export const dynamic = 'force-dynamic';

export default async function AdminReportsPage() {
  const repo = getRepository();
  const [repairOrders, shopOrders, customers, afterSales] = await Promise.all([
    repo.listRepairOrders(),
    repo.listShopOrders(),
    repo.listCustomers(),
    repo.listAfterSales(),
  ]);

  const data = buildReports(repairOrders, shopOrders, customers, afterSales, '12m');

  return (
    <>
      <AdminPageHeader
        titleEn="Reports & Analytics"
        title="報表分析"
        description="整合維修、二手商城與售後數據，掌握營收走勢、訂單結構與熱門機型，支援 CSV 匯出。"
      />
      <LazyAdmin name="reports" props={{ initial: data }} />
    </>
  );
}
