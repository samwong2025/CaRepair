'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
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
import { OTHER_MODEL_ID } from './step-device';
import { getSymptomById } from '../../data/symptoms';
import { siteConfig } from '../../config/site';
import { formatHKD } from '../../lib/format';
import { EMPTY_QUOTE, calculateQuote } from '../../lib/quote-engine';
import { loadPricing, loadTierMultipliers, type TierMultipliers } from '../../lib/pricing-store';
import { loadModels, loadSymptoms, findModel, findSymptom } from '../../lib/catalog-store';
import type { CreateOrderResult, DeviceCategory, DeviceModel, RepairOrderInput, Symptom } from '../../types';

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
  const searchParams = useSearchParams();
  const [step, setStep] = React.useState(1);
  const [maxReached, setMaxReached] = React.useState(1);
  const [category, setCategory] = React.useState<DeviceCategory | null>(initialCategory ?? null);
  const [modelId, setModelId] = React.useState<string | null>(null);
  const [customModel, setCustomModel] = React.useState('');
  const [symptomIds, setSymptomIds] = React.useState<string[]>([]);
  const [form, setForm] = React.useState<BookingForm>(initialForm);
  const [errors, setErrors] = React.useState<BookingErrors>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [submitError, setSubmitError] = React.useState('');
  const [result, setResult] = React.useState<CreateOrderResult | null>(null);
  const [allModels, setAllModels] = React.useState<DeviceModel[]>([]);
  const [allSymptoms, setAllSymptoms] = React.useState<Symptom[]>([]);

  const topRef = React.useRef<HTMLDivElement>(null);
  const model = modelId ? findModel(allModels, modelId) ?? getModelById(modelId) : undefined;
  const [pricing, setPricing] = React.useState<import('../../types').SymptomPricing[] | undefined>(
    undefined,
  );
  const [tiers, setTiers] = React.useState<TierMultipliers>({
    flagship: 1.4,
    premium: 1.2,
    standard: 1.0,
    legacy: 0.8,
  });

  React.useEffect(() => {
    loadPricing().then(setPricing);
    loadTierMultipliers().then(setTiers);
    loadModels().then(setAllModels);
    loadSymptoms().then(setAllSymptoms);

    // 由價格管理頁深鏈跳轉：預選機型分類與故障
    const qsCategory = searchParams.get('category');
    const qsSymptom = searchParams.get('symptom');
    const validCategories: DeviceCategory[] = ['iphone', 'ipad', 'watch', 'macbook'];
    if (qsCategory && validCategories.includes(qsCategory as DeviceCategory)) {
      setCategory(qsCategory as DeviceCategory);
    } else if (initialCategory) {
      setCategory(initialCategory);
    }
    if (qsSymptom) {
      setSymptomIds([qsSymptom]);
    }
  }, [searchParams, initialCategory]);

  const quote = React.useMemo(() => {
    if (!modelId || symptomIds.length === 0) return EMPTY_QUOTE;
    return calculateQuote(modelId, symptomIds, pricing, model, tiers);
  }, [modelId, symptomIds, pricing, model, tiers]);

  const symptomNames = React.useMemo(
    () => symptomIds.map((id) => findSymptom(allSymptoms, id)?.shortName ?? getSymptomById(id)?.shortName ?? id),
    [symptomIds, allSymptoms],
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
    // 揀「（其他）」唔自動跳步——要等客戶填完型號名先好繼續
    if (next === OTHER_MODEL_ID) {
      window.setTimeout(scrollToTop, 40);
      return;
    }
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

    // 揀咗「（其他）」：用 sentinel id，型號名由 repository 根據 deviceModelId 推導
    const isOther = modelId === OTHER_MODEL_ID;

    const payload: RepairOrderInput = {
      deviceCategory: category,
      deviceModelId: isOther ? OTHER_MODEL_ID : modelId,
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
      source: 'online',
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
      setSubmitError(message ?? `提交失敗，請稍後再試或致電 ${siteConfig.hotline} 由客服代辦。`);
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
    <div className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 rounded-xl border border-slate-200 bg-surface-soft px-4 py-2.5 text-sm">
      <span className="text-ink-muted shrink-0">已選產品</span>
      <span className="min-w-0 flex-1 truncate font-bold text-ink">
        {modelId === OTHER_MODEL_ID ? (customModel.trim() || '（其他）') : (model?.name ?? '—')}
      </span>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={onBack}
        className="h-7 shrink-0 px-2 text-brand-600 hover:bg-brand-50"
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

      <div className="mt-6 grid min-w-0 gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-8">
        <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 pb-[calc(96px+env(safe-area-inset-bottom))] shadow-card sm:p-7 sm:pb-[calc(112px+env(safe-area-inset-bottom))] lg:p-8 lg:pb-8">
          {/* 步驟 1：揀產品分類（點類別即跳步驟 2） */}
          {step === 1 ? (
            <StepDevice
              category={category}
              modelId={modelId}
              onSelectCategory={handleSelectCategory}
              onSelectModel={handleSelectModel}
              allModels={allModels}
              customModel={customModel}
              onCustomModelChange={setCustomModel}
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
                      allModels={allModels}
                      customModel={customModel}
                      onCustomModelChange={setCustomModel}
                    />
                  </div>
                </div>
              ) : (
                <>
                  <StepSymptoms
                    category={category}
                    modelName={modelId === OTHER_MODEL_ID ? customModel.trim() : (model?.name ?? '')}
                    selected={symptomIds}
                    onToggle={toggleSymptom}
                    allSymptoms={allSymptoms}
                  />

                  <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
                    <Button variant="ghost" size="md" onClick={() => goStep(1)}>
                      <ArrowLeft className="h-4 w-4" />
                      上一步
                    </Button>
                    <Button
                      variant="cta"
                      size="lg"
                      onClick={() => goStep(3)}
                      className="w-full sm:w-auto sm:ml-auto sm:min-w-[14rem]"
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

              <StepQuote quote={quote} modelName={modelId === OTHER_MODEL_ID ? customModel.trim() : (model?.name ?? '')} />

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
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

              <div className="flex flex-col gap-3 border-t border-slate-100 pt-6 sm:flex-row sm:items-center">
                <Button variant="ghost" size="md" onClick={() => goStep(3)}>
                  <ArrowLeft className="h-4 w-4" />
                  上一步
                </Button>
                <Button
                  variant="cta"
                  size="lg"
                  disabled={submitting}
                  onClick={handleSubmit}
                  className="w-full sm:w-auto sm:ml-auto sm:min-w-[15rem]"
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
