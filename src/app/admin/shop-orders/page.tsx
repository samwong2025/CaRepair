import { getRepository } from '../../../lib/repositories';
import { AdminPageHeader } from '../../../components/admin/page-header';
import { ShopOrdersManager } from '../../../components/admin/shop-orders-manager';

export const dynamic = 'force-dynamic';

export default async function AdminShopOrdersPage() {
  const orders = await getRepository().listShopOrders();

  return (
    <>
      <AdminPageHeader
        titleEn="Store Orders"
        title="二手商城・訂單管理"
        description="追蹤二手商品訂單的付款、出貨與取貨進度，並推進狀態以同步前台訂單頁。"
      />
      <ShopOrdersManager initialOrders={orders} />
    </>
  );
}
