import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getRepository } from '../../../../lib/repositories';
import { getCurrentUser } from '../../../../lib/auth';
import { loadModels, loadSymptoms, findModel, findSymptom } from '../../../../lib/catalog-store';
import { getTechnicianOptions } from '../../../../lib/technician-options';
import { OrderEditForm } from './order-edit-form';

export default async function OrderDetailPage({
  params,
}: {
  params: { orderNo: string };
}) {
  const orderNo = decodeURIComponent(params.orderNo);
  const repo = getRepository();
  const order = await repo.getRepairOrderByNo(orderNo);
  if (!order) notFound();

  const [currentUser, allModels, allSymptoms] = await Promise.all([
    getCurrentUser(),
    loadModels(),
    loadSymptoms(),
  ]);

  const techOptions = await getTechnicianOptions();

  /* 預填：現有機型 / 故障分類（用於表單預設顯示） */
  const currentModel = findModel(allModels, order.deviceModelId) ?? null;
  const currentCategory = currentModel?.category ?? order.deviceCategory;
  const symptomsInCategory = allSymptoms.filter((s) => s.categories.includes(currentCategory));

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
        <h1 className="mt-2 text-2xl font-extrabold text-ink">
          編輯工單 <span className="font-mono text-brand-600">{order.orderNo}</span>
        </h1>
        <p className="mt-1 text-sm text-ink-muted">
          可在這裡修正客戶選錯的機型、故障項目、師傅分派與備註。型號或故障變更時會自動重算報價並寫入歷程。
        </p>
      </div>

      <OrderEditForm
        order={order}
        currentUser={currentUser}
        allModels={allModels}
        symptomsInCategory={symptomsInCategory}
        allSymptoms={allSymptoms}
        technicianOptions={techOptions}
        currentModel={currentModel}
      />
    </div>
  );
}