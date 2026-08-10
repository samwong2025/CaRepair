import { getRepository } from '../../../lib/repositories';
import { AdminPageHeader } from '../../../components/admin/page-header';
import { AfterSalesManager } from '../../../components/admin/aftersales-manager';

export const dynamic = 'force-dynamic';

export default async function AdminAfterSalesPage() {
  const records = await getRepository().listAfterSales();

  return (
    <div>
      <AdminPageHeader
        titleEn="After-sales"
        title="售後個案管理"
        description="跟進保養、退貨、投訴與諮詢個案，分派處理人、推進狀態並記錄處理結果，守護品牌口碑與客戶信任。"
      />
      <AfterSalesManager records={records} />
    </div>
  );
}
