import { AdminPageHeader } from '../../../components/admin/page-header';
import { ModelsManager } from '../../../components/admin/models-manager';

export const dynamic = 'force-dynamic';

export default function AdminModelsPage() {
  return (
    <div>
      <AdminPageHeader
        titleEn="Device Models"
        title="機型管理"
        description="維護所有可維修機型（名稱、分類、系列、年份、報價級距、熱門標記），新增明年新機即時上架預約選單。"
      />
      <ModelsManager />
    </div>
  );
}
