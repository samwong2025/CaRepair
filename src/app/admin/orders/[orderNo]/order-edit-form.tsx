'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Save } from 'lucide-react';
import { Badge } from '../../../../components/ui/badge';
import { Button } from '../../../../components/ui/button';
import { Input, Select, Textarea } from '../../../../components/ui/input';
import { PartsPicker } from '../../../../components/admin/parts-picker';
import { statusMeta } from '../../../../data/seed';
import { formatDateTime, formatHKD } from '../../../../lib/format';
import { cn } from '../../../../lib/utils';
import type { CurrentUser } from '../../../../lib/auth';
import type {
  DeviceCategory,
  DeviceModel,
  Part,
  RepairOrder,
  Symptom,
  UsedPart,
} from '../../../../types';

interface EditFormProps {
  order: RepairOrder;
  currentUser: CurrentUser | null;
  allModels: DeviceModel[];
  symptomsInCategory: Symptom[];
  allSymptoms: Symptom[];
  technicianOptions: string[];
  currentModel: DeviceModel | null;
  inventory: Part[];
}

const CATEGORY_LABEL: Record<DeviceCategory, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  watch: 'Apple Watch',
  macbook: 'Mac',
};

export function OrderEditForm({
  order,
  currentUser,
  allModels,
  symptomsInCategory,
  allSymptoms,
  technicianOptions,
  currentModel,
  inventory,
}: EditFormProps) {
  const router = useRouter();

  const [category, setCategory] = React.useState<DeviceCategory>(
    currentModel?.category ?? order.deviceCategory,
  );
  const [modelId, setModelId] = React.useState(order.deviceModelId);
  const [symptomIds, setSymptomIds] = React.useState<string[]>([...order.symptomIds]);
  const [technician, setTechnician] = React.useState<string>(order.technician ?? '待分派');
  const [partsUsed, setPartsUsed] = React.useState<UsedPart[]>([...(order.partsUsed ?? [])]);
  const [customerName, setCustomerName] = React.useState(order.customerName);
  const [customerPhone, setCustomerPhone] = React.useState(order.customerPhone);
  const [appointmentAt, setAppointmentAt] = React.useState(order.appointmentAt.slice(0, 16));
  const [remark, setRemark] = React.useState(order.remark ?? '');
  const [extraNote, setExtraNote] = React.useState('');

  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const modelsInCategory = React.useMemo(
    () => allModels.filter((m) => m.category === category),
    [allModels, category],
  );

  const symptomsForCurrentCategory = React.useMemo(
    () => allSymptoms.filter((s) => s.categories.includes(category)),
    [allSymptoms, category],
  );

  function handleCategoryChange(next: DeviceCategory) {
    setCategory(next);
    const firstModel = allModels.find((m) => m.category === next);
    setModelId(firstModel?.id ?? '');
    setSymptomIds([]);
  }

  function toggleSymptom(id: string) {
    setSymptomIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  const dirty =
    modelId !== order.deviceModelId ||
    JSON.stringify(symptomIds) !== JSON.stringify(order.symptomIds) ||
    technician !== (order.technician ?? '待分派') ||
    customerName !== order.customerName ||
    customerPhone !== order.customerPhone ||
    appointmentAt !== order.appointmentAt.slice(0, 16) ||
    (remark || '') !== (order.remark ?? '') ||
    JSON.stringify(partsUsed) !== JSON.stringify(order.partsUsed ?? []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dirty) return;
    setError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(order.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceModelId: modelId,
          symptomIds,
          technician,
          customerName,
          customerPhone,
          appointmentAt: new Date(appointmentAt).toISOString(),
          remark: remark || null,
          partsUsed,
          operator: currentUser?.name ?? '後台管理員',
          note: extraNote.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message ?? `儲存失敗（${res.status}）`);
        return;
      }
      router.push('/admin/orders');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('儲存時發生錯誤，請稍後重試');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* 基本資訊 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">基本資訊</h2>
        <p className="mt-1 text-xs text-ink-faint">
          目前狀態
          <Badge variant={statusMeta[order.status].tone} size="sm" className="mx-1">
            {statusMeta[order.status].label}
          </Badge>
          ・單號 <span className="font-mono">{order.orderNo}</span>
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="客戶姓名">
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              required
            />
          </Field>
          <Field label="客戶電話">
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              required
            />
          </Field>
          <Field label="預約時間">
            <Input
              type="datetime-local"
              value={appointmentAt}
              onChange={(e) => setAppointmentAt(e.target.value)}
            />
          </Field>
          <Field label="分派師傅">
            <Select value={technician} onChange={(e) => setTechnician(e.target.value)}>
              {technicianOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </section>

      {/* 機型 / 故障 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">機型與故障</h2>
        <p className="mt-1 text-xs text-ink-faint">
          變更後儲存時會自動重算報價並寫入歷程。
        </p>

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="產品類別">
            <Select
              value={category}
              onChange={(e) => handleCategoryChange(e.target.value as DeviceCategory)}
            >
              {(Object.keys(CATEGORY_LABEL) as DeviceCategory[]).map((key) => (
                <option key={key} value={key}>
                  {CATEGORY_LABEL[key]}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="機型">
            <Select value={modelId} onChange={(e) => setModelId(e.target.value)}>
              {modelsInCategory.length === 0 ? (
                <option value="">尚無資料</option>
              ) : (
                modelsInCategory.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))
              )}
            </Select>
          </Field>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-xs font-semibold text-ink-faint">
            故障項目（可多選）
          </p>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {symptomsForCurrentCategory.length === 0 ? (
              <p className="text-xs text-ink-muted">該類別尚無故障項目</p>
            ) : (
              symptomsForCurrentCategory.map((s) => {
                const checked = symptomIds.includes(s.id);
                return (
                  <label
                    key={s.id}
                    className={cn(
                      'flex cursor-pointer items-start gap-2 rounded-xl border px-3 py-2 text-xs transition-colors',
                      checked
                        ? 'border-brand-400 bg-brand-50 text-ink'
                        : 'border-slate-200 bg-white text-ink-muted hover:bg-slate-50',
                    )}
                  >
                    <input
                      type="checkbox"
                      className="mt-0.5 h-3.5 w-3.5 accent-brand-600"
                      checked={checked}
                      onChange={() => toggleSymptom(s.id)}
                    />
                    <span>
                      <span className="font-semibold text-ink">{s.shortName}</span>
                      <span className="block text-[0.7rem] text-ink-faint">{s.name}</span>
                    </span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      </section>

      {/* 選擇庫存配件 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">選擇庫存配件</h2>
        <p className="mt-1 text-xs text-ink-faint">
          依機型與故障自動篩選適用配件，庫存不足會即時提示。選定後提交寫入工單。
        </p>
        <div className="mt-4">
          <PartsPicker
            inventory={inventory}
            selected={partsUsed}
            onChange={setPartsUsed}
            deviceCategory={category}
            symptomIds={symptomIds}
          />
        </div>
      </section>

      {/* 備註 */}
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">備註</h2>
        <div className="mt-3 grid gap-4 sm:grid-cols-2">
          <Field label="客戶備註">
            <Textarea
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="客戶在預約時留下的備註"
            />
          </Field>
          <Field label="本次變更備註（寫入歷程，可選）">
            <Textarea
              rows={3}
              value={extraNote}
              onChange={(e) => setExtraNote(e.target.value)}
              placeholder="例：客戶到店後改用 iPhone 16 Pro Max、並更換電池"
            />
          </Field>
        </div>
      </section>

      {/* 預覽 + 儲存 */}
      <section className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-ink-faint">
              目前報價（變更機型 / 故障後將依新報價為準）
            </p>
            <p className="mt-1 text-2xl font-extrabold text-brand-700">
              {formatHKD(order.quote.total)}
            </p>
            <p className="mt-1 text-xs text-ink-muted">
              建立：{formatDateTime(order.createdAt)} ・最近更新：
              {formatDateTime(order.updatedAt)}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            ) : null}
            <Button type="submit" variant="cta" size="lg" disabled={saving || !dirty}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {dirty ? '儲存變更' : '沒有變更'}
            </Button>
          </div>
        </div>
      </section>
    </form>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold text-ink-faint">{label}</span>
      {children}
    </label>
  );
}