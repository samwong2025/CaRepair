import { getRepository } from '../../../lib/repositories';
import { AdminPageHeader } from '../../../components/admin/page-header';
import { CategoriesManager } from '../../../components/admin/categories-manager';

export const dynamic = 'force-dynamic';

export default async function AdminCategoriesPage() {
  const categories = await getRepository().listCategories();

  return (
    <>
      <AdminPageHeader
        title="商品分類"
        titleEn="Categories"
        description="統一管理二手商城與庫存共用的商品分類。維修配件與二手整機都可在分類下歸檔。"
      />
      <CategoriesManager initialCategories={categories} />
    </>
  );
}
