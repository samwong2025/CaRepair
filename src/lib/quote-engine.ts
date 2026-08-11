import { getModelById } from '../data/devices';
import { effectiveTierMultipliers, type TierMultipliers } from './pricing-store';
import { MAX_BUNDLE_DISCOUNT, bundleDiscountRates, findPricingRule } from '../data/pricing';
import { getSymptomById } from '../data/symptoms';
import type { DeviceCategory, DeviceModel, Quote, QuoteLineItem, SymptomPricing } from '../types';

/** 金額取整至 10 港元，令報價更貼近實際門市標價 */
function roundToTen(value: number): number {
  return Math.round(value / 10) * 10;
}

export const EMPTY_QUOTE: Quote = {
  items: [],
  partsTotal: 0,
  laborTotal: 0,
  bundleDiscount: 0,
  total: 0,
  currency: 'HKD',
  estimatedMinutes: 0,
  warrantyDays: 0,
  requiresLab: false,
};

function resolveRule(
  category: DeviceCategory,
  symptomId: string,
  rules?: SymptomPricing[],
): SymptomPricing | undefined {
  if (rules) return rules.find((r) => r.category === category && r.symptomId === symptomId);
  return findPricingRule(category, symptomId);
}

/**
 * 報價引擎（純函數）
 * 依「機型級距係數 × 故障基準價」逐項計算配件費與人工費，
 * 再套用多項同修減免，輸出完整報價明細。
 * rules 可選：傳入則使用後台自訂價格表，否則回退至預設 pricing.ts。
 */
export function calculateQuote(
  modelId: string,
  symptomIds: string[],
  rules?: SymptomPricing[],
  modelOverride?: DeviceModel,
  tierMultipliers: TierMultipliers = effectiveTierMultipliers(),
): Quote {
  const model = modelOverride ?? getModelById(modelId);
  if (!model || symptomIds.length === 0) return EMPTY_QUOTE;

  const multiplier = tierMultipliers[model.tier];

  const items: QuoteLineItem[] = [];

  symptomIds.forEach((symptomId) => {
    const rule = resolveRule(model.category, symptomId, rules);
    const symptom = getSymptomById(symptomId);
    if (!rule || !symptom) return;

    const partFee = roundToTen(rule.basePartFee * multiplier);
    const laborFee = roundToTen(rule.baseLaborFee * multiplier);

    items.push({
      symptomId,
      name: symptom.name,
      partName: rule.partName,
      partFee,
      laborFee,
      subtotal: partFee + laborFee,
      durationMinutes: rule.durationMinutes,
      warrantyDays: rule.warrantyDays,
      requiresLab: Boolean(rule.requiresLab),
    });
  });

  if (items.length === 0) return EMPTY_QUOTE;

  const partsTotal = items.reduce((sum, i) => sum + i.partFee, 0);
  const laborTotal = items.reduce((sum, i) => sum + i.laborFee, 0);
  const gross = partsTotal + laborTotal;

  const matchedRate = bundleDiscountRates.find((r) => items.length >= r.minItems);
  const bundleDiscount = matchedRate
    ? Math.min(roundToTen(gross * matchedRate.rate), MAX_BUNDLE_DISCOUNT)
    : 0;

  /* 多項故障可同時拆機處理，工時以「最長項 + 其餘項的 55%」估算 */
  const durations = items.map((i) => i.durationMinutes).sort((a, b) => b - a);
  const estimatedMinutes = Math.round(
    durations[0] + durations.slice(1).reduce((sum, d) => sum + d * 0.55, 0),
  );

  /* 保養期以所有項目中最短者為準（資料救援 0 日不計入） */
  const warrantyCandidates = items.map((i) => i.warrantyDays).filter((d) => d > 0);
  const warrantyDays = warrantyCandidates.length ? Math.min(...warrantyCandidates) : 0;

  return {
    items,
    partsTotal,
    laborTotal,
    bundleDiscount,
    total: gross - bundleDiscount,
    currency: 'HKD',
    estimatedMinutes,
    warrantyDays,
    requiresLab: items.some((i) => i.requiresLab),
  };
}

/** 取得目前適用的套餐減免說明文字 */
export function getBundleDiscountLabel(itemCount: number): string | null {
  const matched = bundleDiscountRates.find((r) => itemCount >= r.minItems);
  return matched ? matched.label : null;
}

/** 將分鐘轉換成「1 小時 30 分鐘」樣式 */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return '—';
  if (minutes < 60) return `${minutes} 分鐘`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  if (hours >= 8) return `約 ${Math.ceil(hours / 8)} 個工作天`;
  return rest === 0 ? `${hours} 小時` : `${hours} 小時 ${rest} 分鐘`;
}

/** 由最低價機型推算某故障的「最平由 HK$X 起」，用於首頁引流 */
export function getStartingPrice(category: string, symptomId: string): number {
  const rule = findPricingRule(category, symptomId);
  if (!rule) return 0;
  return roundToTen((rule.basePartFee + rule.baseLaborFee) * effectiveTierMultipliers().legacy);
}
