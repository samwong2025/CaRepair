import { getRepository } from '../../../lib/repositories';
import { AdminPageHeader } from '../../../components/admin/page-header';
import LazyAdmin from '../../../components/admin/lazy-admin';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await getRepository().listProducts();
  const categories = await getRepository().listCategories();

  return (
    <>
      <AdminPageHeader
        titleEn="Pre-owned Store"
        title="二手商城・商品管理"
        description="上架、編輯與下架二手商品，調整價格、庫存與成色評級。變更會即時同步到前台商店頁。"
      />
      <LazyAdmin name="products" props={{ initialProducts: products, initialCategories: categories }} />
    </>
  );
}
