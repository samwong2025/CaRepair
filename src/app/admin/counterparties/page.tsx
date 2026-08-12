import { getRepository } from '../../../lib/repositories';
import { AdminPageHeader } from '../../../components/admin/page-header';
import { CounterpartiesManager } from '../../../components/admin/counterparties-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCounterpartiesPage() {
  const counterparties = await getRepository().listCounterparties();

  return (
    <>
      <AdminPageHeader
        title="往來單位"
        titleEn="Counterparties"
        description="供應商與客戶檔案：聯絡方式、地址、稅號與結算條件。庫存進貨可關聯供應商，二手商城與維修客戶可對應客戶檔案。"
      />
      <CounterpartiesManager initialCounterparties={counterparties} />
    </>
  );
}
