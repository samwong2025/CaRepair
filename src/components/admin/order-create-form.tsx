'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Plus, Save } from 'lucide-react';
import { Button } from '../ui/button';
import { Input, Select, Textarea } from '../ui/input';
import { siteConfig } from '../../config/site';
import { cn } from '../../lib/utils';
import type { CurrentUser } from '../../lib/auth';
import type { DeviceCategory, DeviceModel, Symptom } from '../../types';

interface CreateFormProps {
  currentUser: CurrentUser | null;
  allModels: DeviceModel[];
  allSymptoms: Symptom[];
  technicianOptions: string[];
}

const CATEGORY_LABEL: Record<DeviceCategory, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  watch: 'Apple Watch',
  macbook: 'Mac',
};

const SERVICE_MODES: { value: 'walk_in' | 'mail_in' | 'pickup'; label: string }[] = [
  { value: 'walk_in', label: '到店維修' },
  { value: 'mail_in', label: '郵寄送修' },
  { value: 'pickup', label: '上門收件' },
];

const HK_PHONE = /^[2-9]\d{7}$/;

export function OrderCreateForm({
  currentUser,
  allModels,
  allSymptoms,
  technicianOptions,
}: CreateFormProps) {
  const router = useRouter();

  const [category, setCategory] = React.useState<DeviceCategory>('iphone');
  const [modelId, setModelId] = React.useState('');
  const [symptomIds, setSymptomIds] = React.useState<string[]>([]);
  const [serviceMode, setServiceMode] = React.useState<'walk_in' | 'mail_in' | 'pickup'>('walk_in');
  const [shopName, setShopName] = React.useState<string>(siteConfig.shops[0]?.name ?? '');
  const [address, setAddress] = React.useState('');
  const [appointmentAt, setAppointmentAt] = React.useState('');
  const [technician, setTechnician] = React.useState<string>('待分派');
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [remark, setRemark] = React.useState('');

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

  const operatorName =
    currentUser?.name ?? (currentUser?.role === 'technician' ? currentUser?.technicianName ?? '師傅' : '後台管理員');

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

  const phoneValid = HK_PHONE.test(customerPhone.trim());

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!modelId) return setError('請選擇機型');
    if (symptomIds.length === 0) return setError('請至少選擇一項故障');
    if (!customerName.trim() || customerName.trim().length < 2) return setError('請填寫有效稱呼');
    if (!phoneValid) return setError('請填寫有效的香港手提號碼（8 位數字）');
    if (!appointmentAt || Number.isNaN(Date.parse(appointmentAt))) return setError('請選擇預約時間');
    if (serviceMode === 'walk_in' && !shopName) return setError('請揀選門市');
    if (serviceMode !== 'walk_in' && address.trim().length < 6) return setError('請填寫完整收件／寄修地址');

    setSaving(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deviceCategory: category,
          deviceModelId: modelId,
          symptomIds,
          serviceMode,
          shopName: serviceMode === 'walk_in' ? shopName : undefined,
          address: serviceMode !== 'walk_in' ? address.trim() : undefined,
          appointmentAt: new Date(appointmentAt).toISOString(),
          customerName: customerName.trim(),
          customerPhone: customerPhone.trim(),
          remark: remark.trim() || undefined,
          technician: technician,
          operator: operatorName,
          source: 'manual',
        }),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        setError(data?.message ?? `建立失敗（${res.status}）`);
        return;
      }
      router.push('/admin/orders');
      router.refresh();
    } catch (err) {
      console.error(err);
      setError('建立時發生錯誤，請稍後重試');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">客戶與預約資訊</h2>
        <p className="mt-1 text-xs text-ink-faint">
          適用於電話或 WhatsApp 預約的客戶，落單後系統會自動建立／關聯會員檔案並計算報價。
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="客戶姓名 / 稱呼">
            <Input
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="例：陳太、王先生"
              required
            />
          </Field>
          <Field label="客戶電話（8 位）">
            <Input
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
              placeholder="例：96120461"
              inputMode="numeric"
              maxLength={8}
              required
            />
          </Field>
          <Field label="預約時間">
            <Input
              type="datetime-local"
              value={appointmentAt}
              onChange={(e) => setAppointmentAt(e.target.value)}
              required
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">機型與故障</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="產品類別">
            <Select value={category} onChange={(e) => handleCategoryChange(e.target.value as DeviceCategory)}>
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
          <p className="mb-2 text-xs font-semibold text-ink-faint">故障項目（可多選）</p>
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">收件方式</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="服務方式">
            <Select
              value={serviceMode}
              onChange={(e) => setServiceMode(e.target.value as 'walk_in' | 'mail_in' | 'pickup')}
            >
              {SERVICE_MODES.map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </Select>
          </Field>
          {serviceMode === 'walk_in' ? (
            <Field label="門市">
              <Select value={shopName} onChange={(e) => setShopName(e.target.value)}>
                {siteConfig.shops.map((shop) => (
                  <option key={shop.name} value={shop.name}>
                    {shop.name}
                  </option>
                ))}
              </Select>
            </Field>
          ) : (
            <Field label="收件／寄修地址">
              <Input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="例：九龍旺角彌敦道 600 號 A 座 12 樓"
              />
            </Field>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
        <h2 className="text-sm font-bold text-ink">備註</h2>
        <div className="mt-3">
          <Textarea
            rows={3}
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="例：客戶表示充電孔接觸不良，曾自行清潔無效（可留空）"
          />
        </div>
        <p className="mt-2 text-xs text-ink-muted">
          報價會在建立後由系統依機型與故障自動計算，可在工單編輯頁調整最終收費與選用庫存配件。
        </p>
      </section>

      <section className="rounded-2xl border border-brand-200 bg-brand-50/50 p-5 shadow-card">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-ink-faint">建立後自動計算報價並開立會員檔案</p>
            <p className="mt-1 text-sm font-semibold text-brand-700">
              落單操作員：{operatorName}
            </p>
          </div>
          <div className="flex flex-col items-stretch gap-2 sm:items-end">
            {error ? (
              <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
            ) : null}
            <Button type="submit" variant="cta" size="lg" disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
              建立工單
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
