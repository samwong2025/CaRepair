import { getRepository } from '../../../lib/repositories';
import { AdminPageHeader } from '../../../components/admin/page-header';
import { CustomersManager } from '../../../components/admin/customers-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const repository = getRepository();
  const [customers, orders] = await Promise.all([
    repository.listCustomers(),
    repository.listRepairOrders(),
  ]);

  return (
    <div>
      <AdminPageHeader
        titleEn="CRM"
        title="會員客戶管理"
        description="檢視每位會員的等級、消費力與維修歷史，並維護內部備註，善用數據經營回購與轉介紹。"
      />
      <CustomersManager customers={customers} orders={orders} />
    </div>
  );
}
