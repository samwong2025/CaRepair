import { AdminPageHeader } from '../../../components/admin/page-header';
import LazyAdmin from '../../../components/admin/lazy-admin';

export const dynamic = 'force-dynamic';

export default function AdminSymptomsPage() {
  return (
    <div>
      <AdminPageHeader
        titleEn="Repair Symptoms"
        title="故障管理"
        description="維護各類維修故障項目（名稱、簡稱、適用機型、常見度、緊急標記），決定預約流程中顯示哪些維修選項。"
      />
      <LazyAdmin name="symptoms" />
    </div>
  );
}
