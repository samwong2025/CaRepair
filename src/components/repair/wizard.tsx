'use client';

import * as React from 'react';
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { QuoteSummary } from './quote-summary';
import { StepBooking, type BookingErrors, type BookingForm } from './step-booking';
import { StepDevice, ModelPicker } from './step-device';
import { StepQuote } from './step-quote';
import { StepSymptoms } from './step-symptoms';
import { WizardProgress } from './wizard-progress';
import { OrderSuccess } from './order-success';
import { getModelById } from '../../data/devices';
import { getSymptomById } from '../../data/symptoms';
import { siteConfig } from '../../config/site';
import { formatHKD } from '../../lib/format';
import { EMPTY_QUOTE, calculateQuote } from '../../lib/quote-engine';
import { loadPricing } from '../../lib/pricing-store';
import type { CreateOrderResult, DeviceCategory, RepairOrderInput } from '../../types';

const HK_PHONE = /^[2-9]\d{7}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const initialForm: BookingForm = {
  serviceMode: 'walk_in',
  shopName: siteConfig.shops[0]?.name ?? '',
  address: '',
  district: '',
  appointmentDate: '',
  appointmentTime: '',
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  remark: '',
};

export function RepairWizard({ initialCategory }: { initialCategory?: DeviceCategory }) {
  const [step, setStep] = React.useState(1);
  const [maxReached, setMaxReached] = React.useState(1);
  const [category, setCategory] = React.useState<DeviceCategory | null>(initialCategory ?? null);
  const [modelId, setModelId] = React.useState<string | null>(null);
  const [symptomIds, setSymptomIds] = React.useState<string[]>([]);
  const [form, setForm] = React.useState<BookingForm>(initialForm);
  const [errors, setErrors] = React.useState<BookingErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [result, setResult] = React.useState<CreateOrderResult | null>(null);

  const topRef = React.useRef<HTMLDivElement>(null);
  const model = modelId ? getModelById(modelId) : undefined;
  const [pricing, setPricing] = React.useState<import('../../types').SymptomPricing[] | undefined>(
    undefined,
  );

  React.useEffect(() => {
    loadPricing().then(setPricing);
  }, []);

  const quote = React.useMemo(() => {
    if (!modelId || symptomIds.length === 0) return EMPTY_QUOTE;
    return calculateQuote(modelId, symptomIds, pricing);
  }, [modelId, symptomIds, pricing]);

  const symptomNames = React.useMemo(
    () => symptomIds.map((id) => getSymptomById(id)?.shortName ?? id),
    [symptomIds],
  );

  const scrollToTop = () => {
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const goStep = (next: number) => {
    setStep(next);
    setMaxReached((prev) => Math.max(prev, next));
    window.setTimeout(scrollToTop, 40);
  };

  const handleSelectCategory = (next: DeviceCategory) => {
    setCategory(next);
    setModelId(null);
    setSymptomIds([]);
    // 同屏顯示分類與型號（mode='full'），揀分類只係展開下方型號清單，唔跳步驟
  };

  // 點選具體型號即直接進入下一步（問題選擇），省去「下一步」按鈕的冗餘操作
  const handleSelectModel = (next: string) => {
    setModelId(next);
    setSymptomIds([]);
    // STEP 1 揀完型號 → 自動跳到 STEP 2（揀故障）
    if (step === 1) {
      goStep(2);
    } else {
      window.setTimeout(scrollToTop, 40);
    }
  };

  const toggleSymptom = (symptomId: string) => {
    setSymptomIds((prev) =>
      prev.includes(symptomId) ? prev.filter((id) => id !== symptomId) : [...prev, symptomId],
    );
  };

  const updateForm = <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const validateBooking = (): boolean => {
    const next: BookingErrors = {};
    if (form.serviceMode === 'walk_in') {
      if (!form.shopName) next.shopName = '請揀選門市';
    } else {
      if (form.address.trim().length < 6) next.address = '請填寫完整地址（不少於 6 個字）';
    }
    if (!form.appointmentDate) next.appointmentDate = '請揀選日期';
    if (!form.appointmentTime) next.appointmentTime = '請揀選時段';
    if (form.customerName.trim().length < 2) next.customerName = '請填寫至少 2 個字的稱呼';
    if (!HK_PHONE.test(form.customerPhone.replace(/\s|-/g, ''))) {
      next.customerPhone = '請填寫有效的 8 位香港手提號碼';
    }
    if (!form.customerEmail.trim()) {
      next.customerEmail = '請填寫電郵以接收電子收據';
    } else if (!EMAIL.test(form.customerEmail.trim())) {
      next.customerEmail = '電郵格式不正確';
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateBooking() || !category || !modelId) return;

    setSubmitting(true);
    setSubmitError('');

    const payload: RepairOrderInput = {
      deviceCategory: category,
      deviceModelId: modelId,
      symptomIds,
      serviceMode: form.serviceMode,
      shopName: form.serviceMode === 'walk_in' ? form.shopName : undefined,
      address: form.serviceMode === 'walk_in' ? undefined : form.address.trim(),
      district: undefined,
      appointmentAt: `${form.appointmentDate}T${form.appointmentTime}:00`,
      customerName: form.customerName.trim(),
      customerPhone: form.customerPhone.replace(/\s|-/g, ''),
      customerEmail: form.customerEmail.trim() || undefined,
      remark: form.remark.trim() || undefined,
    };

    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    }).catch((error: unknown) => {
      console.error('提交維修訂單失敗', error);
      return null;
    });

    if (!response || !response.ok) {
      const message = await response?.json().then(
        (data: { message?: string }) => data.message,
        () => undefined,
      );
      setSubmitError(message ?? '提交失敗，請稍後再試或致電 3188 6688 由客服代辦。');
      setSubmitting(false);
      return;
    }

    const data = (await response.json()) as CreateOrderResult;
    setResult(data);
    setSubmitting(false);
    window.setTimeout(scrollToTop, 40);
  };

  const handleRestart = () => {
    setResult(null);
    setStep(1);
    setMaxReached(1);
    setCategory(initialCategory ?? null);
    setModelId(null);
    setSymptomIds([]);
    setForm(initialForm);
    setErrors({});
    window.setTimeout(scrollToTop, 40);
  };

  if (result) {
    return (
      <div ref={topRef} className="scroll-mt-28">
        <OrderSuccess result={result} onRestart={handleRestart} />
      </div>
    );
  }

  /** 更改產品：清掉舊嘅故障與預約資料，再回到揀機型 */
  const handleChangeProduct = () => {
    setModelId(null);
    setSymptomIds([]);
    setForm(initialForm);
    goStep(1);
  };

  /** 已選產品 chip：任何步驟都可一鍵回到揀機型 */
  const renderSelectedChip = (onBack: () => void) => (
    <div className="mb-6 flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-surface-soft px-4 py-2.5 text-sm">
      <span className="text-ink-muted">已選產品</span>
      <span className="font-bold text-ink">{model?.name ?? '—'}</span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="ml-auto h-7 px-2 text-brand-600 hover:bg-brand-50"
      >
        更改
      </Button>
    </div>
  );

  return (
    <div ref={topRef} className="scroll-mt-28">
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-6">
        <WizardProgress current={step} maxReached={maxReached} onJump={goStep} />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_20rem] lg:gap-8">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card sm:p-7 lg:p-8">
          {/* 步驟 1：揀產品分類（點類別即跳步驟 2） */}
          {step === 1 ? (
            <StepDevice
              category={category}
              modelId={modelId}
              onSelectCategory={handleSelectCategory}
              onSelectModel={handleSelectModel}
              mode="full"
            />
          ) : null}

          {/* 步驟 2：揀機型（具體型號）+ 揀故障 */}
          {step === 2 && category ? (
            <div className="space-y-6">
              {renderSelectedChip(handleChangeProduct)}

              {!modelId ? (
                <div>
                  <p className="text-sm text-ink-muted">
                    下一步：揀選型號 → 揀選故障 → 睇報價 → 約時間。揀錯可隨時返嚟改。
                  </p>
                  <div className="mt-5">
                    <ModelPicker
                      category={category}
                      modelId={modelId}
                      onSelectModel={handleSelectModel}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <StepSymptoms
                    category={category}
                    modelName={model?.name ?? ''}
                    selected={symptomIds}
                    onToggle={toggleSymptom}
                  />

                  <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                    <Button variant="ghost" size="md" onClick={() => goStep(1)}>
                      <ArrowLeft className="h-4 w-4" />
                      上一步
                    </Button>
                    <Button
                      variant="cta"
                      size="lg"
                      onClick={() => goStep(3)}
                      className="ml-auto sm:min-w-[14rem]"
                    >
                      {symptomIds.length > 0 ? '下一步・睇報價' : '跳過・直接睇報價'}
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : null}

          {/* 步驟 3：睇報價 */}
          {step === 3 && category ? (
            <div className="space-y-6">
              {renderSelectedChip(handleChangeProduct)}

              <StepQuote quote={quote} modelName={model?.name ?? ''} />

              <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                <Button variant="ghost" size="md" onClick={() => goStep(2)}>
                  <ArrowLeft className="h-4 w-4" />
                  上一步
                </Button>
                <Button
                  variant="cta"
                  size="lg"
                  onClick={() => goStep(4)}
                  className="ml-auto sm:min-w-[14rem]"
                >
                  下一步・約時間
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : null}

          {/* 步驟 4：約時間並落單 */}
          {step === 4 && category ? (
            <div className="space-y-6">
              {renderSelectedChip(handleChangeProduct)}

              <StepBooking form={form} errors={errors} onChange={updateForm} />

              <div className="flex items-center gap-3 border-t border-slate-100 pt-6">
                <Button variant="ghost" size="md" onClick={() => goStep(3)}>
                  <ArrowLeft className="h-4 w-4" />
                  上一步
                </Button>
                <Button
                  variant="cta"
                  size="lg"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="ml-auto sm:min-w-[15rem]"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      提交緊…
                    </>
                  ) : quote.total > 0 ? (
                    <>
                      確認落單・預估 {formatHKD(quote.total)}
                      <ArrowRight className="h-4 w-4" />
                    </>
                  ) : (
                    <>
                      確認落單（到店報價）
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          ) : null}

          {submitError ? (
            <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
              {submitError}
            </p>
          ) : null}

          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-ink-faint sm:justify-end">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />
              免費檢測・唔修唔收費
            </span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-accent-500" />
              網上落單即減 HK$50
            </span>
          </p>
        </div>

        <QuoteSummary model={model} quote={quote} symptomNames={symptomNames} />
      </div>
    </div>
  );
}
