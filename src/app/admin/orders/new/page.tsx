import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getRepository } from '../../../../lib/repositories';
import { getCurrentUser } from '../../../../lib/auth';
import { loadModels, loadSymptoms } from '../../../../lib/catalog-store';
import { getTechnicianOptions } from '../../../../lib/technician-options';
import { OrderCreateForm } from '../../../../components/admin/order-create-form';

export const dynamic = 'force-dynamic';

export default async function NewOrderPage() {
  const [currentUser, allModels, allSymptoms] = await Promise.all([
    getCurrentUser(),
    loadModels(),
    loadSymptoms(),
  ]);
  const techOptions = await getTechnicianOptions();

  return (
    <div className="space-y-6">
      <div>
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs text-ink-faint transition-colors hover:text-brand-600"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          返回工單列表
        </Link>
        <h1 className="mt-2 text-2xl font-extrabold text-ink">新增維修工單</h1>
        <p className="mt-1 text-sm text-ink-muted">
          適用於電話或 WhatsApp 預約的客戶，手動建立工單。落單後系統會自動計算報價並開立／關聯會員檔案。
        </p>
      </div>

      <OrderCreateForm
        currentUser={currentUser}
        allModels={allModels}
        allSymptoms={allSymptoms}
        technicianOptions={techOptions}
      />
    </div>
  );
}
