import type { SymptomPricing } from '../types';

/**
 * 報價規則表（標準級距基準價，單位 HK$）
 * 實際報價 = 基準價 × 機型級距係數（tierMultiplier），並取整至 10 元。
 */
export const pricingRules: SymptomPricing[] = [
  /* ── iPhone ───────────────────────────────── */
  { symptomId: 'screen_crack', category: 'iphone', partName: '原廠級 OLED 螢幕總成', basePartFee: 780, baseLaborFee: 180, durationMinutes: 45, warrantyDays: 180 },
  { symptomId: 'battery_aging', category: 'iphone', partName: '高循環鋰聚合物電池（含健康度校正）', basePartFee: 420, baseLaborFee: 100, durationMinutes: 30, warrantyDays: 365 },
  { symptomId: 'water_damage', category: 'iphone', partName: '超聲波清洗劑・除鏽保護鍍層', basePartFee: 380, baseLaborFee: 480, durationMinutes: 180, warrantyDays: 90, requiresLab: true },
  { symptomId: 'camera_fault', category: 'iphone', partName: '後置主鏡頭模組（含鏡片）', basePartFee: 520, baseLaborFee: 180, durationMinutes: 60, warrantyDays: 180 },
  { symptomId: 'charging_port', category: 'iphone', partName: '充電尾插排線總成', basePartFee: 320, baseLaborFee: 220, durationMinutes: 60, warrantyDays: 180 },
  { symptomId: 'no_power', category: 'iphone', partName: '電源管理 IC・供電線路修復料', basePartFee: 480, baseLaborFee: 580, durationMinutes: 240, warrantyDays: 90, requiresLab: true },
  { symptomId: 'back_glass', category: 'iphone', partName: '後蓋玻璃（鐳射分離工藝）', basePartFee: 480, baseLaborFee: 320, durationMinutes: 90, warrantyDays: 180 },
  { symptomId: 'speaker_mic', category: 'iphone', partName: '聽筒 / 揚聲器模組', basePartFee: 260, baseLaborFee: 180, durationMinutes: 45, warrantyDays: 180 },
  { symptomId: 'face_id', category: 'iphone', partName: '原深感鏡頭排線（點陣投影器修復）', basePartFee: 560, baseLaborFee: 620, durationMinutes: 240, warrantyDays: 90, requiresLab: true },
  { symptomId: 'button_fault', category: 'iphone', partName: '側鍵 / 音量鍵排線', basePartFee: 220, baseLaborFee: 180, durationMinutes: 45, warrantyDays: 180 },
  { symptomId: 'signal_wifi', category: 'iphone', partName: '射頻天線模組・基頻焊接料', basePartFee: 380, baseLaborFee: 420, durationMinutes: 180, warrantyDays: 90, requiresLab: true },
  { symptomId: 'overheat', category: 'iphone', partName: '導熱石墨片・散熱結構清潔', basePartFee: 180, baseLaborFee: 280, durationMinutes: 90, warrantyDays: 90 },
  { symptomId: 'logic_board', category: 'iphone', partName: '主機板晶片級焊接（BGA 植球）', basePartFee: 980, baseLaborFee: 880, durationMinutes: 300, warrantyDays: 90, requiresLab: true },
  { symptomId: 'data_recovery', category: 'iphone', partName: '（無需配件）NAND 資料讀取服務', basePartFee: 0, baseLaborFee: 1280, durationMinutes: 480, warrantyDays: 0, requiresLab: true },
  { symptomId: 'software_system', category: 'iphone', partName: '（無需配件）系統重刷與資料保留', basePartFee: 0, baseLaborFee: 280, durationMinutes: 60, warrantyDays: 30 },

  /* ── iPad ─────────────────────────────────── */
  { symptomId: 'screen_crack', category: 'ipad', partName: '原廠級液晶總成（含觸控層）', basePartFee: 1180, baseLaborFee: 320, durationMinutes: 90, warrantyDays: 180 },
  { symptomId: 'battery_aging', category: 'ipad', partName: '大容量鋰聚合物電池', basePartFee: 580, baseLaborFee: 260, durationMinutes: 90, warrantyDays: 365 },
  { symptomId: 'water_damage', category: 'ipad', partName: '超聲波清洗劑・除鏽保護鍍層', basePartFee: 480, baseLaborFee: 680, durationMinutes: 240, warrantyDays: 90, requiresLab: true },
  { symptomId: 'camera_fault', category: 'ipad', partName: '前後鏡頭模組', basePartFee: 480, baseLaborFee: 260, durationMinutes: 75, warrantyDays: 180 },
  { symptomId: 'charging_port', category: 'ipad', partName: 'USB-C / Lightning 尾插總成', basePartFee: 380, baseLaborFee: 320, durationMinutes: 90, warrantyDays: 180 },
  { symptomId: 'no_power', category: 'ipad', partName: '供電線路修復料・電源 IC', basePartFee: 680, baseLaborFee: 780, durationMinutes: 300, warrantyDays: 90, requiresLab: true },
  { symptomId: 'back_glass', category: 'ipad', partName: '鋁合金後殼（含天線貼片）', basePartFee: 680, baseLaborFee: 420, durationMinutes: 120, warrantyDays: 180 },
  { symptomId: 'speaker_mic', category: 'ipad', partName: '四聲道揚聲器模組', basePartFee: 320, baseLaborFee: 220, durationMinutes: 60, warrantyDays: 180 },
  { symptomId: 'face_id', category: 'ipad', partName: 'Touch ID 電源鍵 / 原深感模組', basePartFee: 520, baseLaborFee: 580, durationMinutes: 240, warrantyDays: 90, requiresLab: true },
  { symptomId: 'button_fault', category: 'ipad', partName: '音量鍵 / 電源鍵排線', basePartFee: 260, baseLaborFee: 220, durationMinutes: 60, warrantyDays: 180 },
  { symptomId: 'signal_wifi', category: 'ipad', partName: 'Wi-Fi 天線模組・射頻修復料', basePartFee: 420, baseLaborFee: 480, durationMinutes: 180, warrantyDays: 90, requiresLab: true },
  { symptomId: 'overheat', category: 'ipad', partName: '導熱矽脂・內部積塵清潔', basePartFee: 220, baseLaborFee: 320, durationMinutes: 90, warrantyDays: 90 },
  { symptomId: 'logic_board', category: 'ipad', partName: '主機板晶片級焊接（BGA 植球）', basePartFee: 1280, baseLaborFee: 1080, durationMinutes: 360, warrantyDays: 90, requiresLab: true },
  { symptomId: 'data_recovery', category: 'ipad', partName: '（無需配件）NAND 資料讀取服務', basePartFee: 0, baseLaborFee: 1580, durationMinutes: 480, warrantyDays: 0, requiresLab: true },
  { symptomId: 'software_system', category: 'ipad', partName: '（無需配件）iPadOS 重刷與資料保留', basePartFee: 0, baseLaborFee: 320, durationMinutes: 75, warrantyDays: 30 },

  /* ── Apple Watch ──────────────────────────── */
  { symptomId: 'screen_crack', category: 'watch', partName: 'OLED 錶面總成（含防水膠圈）', basePartFee: 880, baseLaborFee: 380, durationMinutes: 90, warrantyDays: 180 },
  { symptomId: 'battery_aging', category: 'watch', partName: '原容量鋰電池（含防水重貼）', basePartFee: 480, baseLaborFee: 320, durationMinutes: 75, warrantyDays: 365 },
  { symptomId: 'water_damage', category: 'watch', partName: '清洗除鏽料・防水膠圈更換', basePartFee: 380, baseLaborFee: 520, durationMinutes: 180, warrantyDays: 90, requiresLab: true },
  { symptomId: 'no_power', category: 'watch', partName: '供電線路修復料', basePartFee: 580, baseLaborFee: 680, durationMinutes: 240, warrantyDays: 90, requiresLab: true },
  { symptomId: 'back_glass', category: 'watch', partName: '背蓋感應器玻璃（心率模組）', basePartFee: 520, baseLaborFee: 380, durationMinutes: 90, warrantyDays: 180 },
  { symptomId: 'speaker_mic', category: 'watch', partName: '揚聲器 / 麥克風模組', basePartFee: 280, baseLaborFee: 260, durationMinutes: 60, warrantyDays: 180 },
  { symptomId: 'button_fault', category: 'watch', partName: '側鍵排線', basePartFee: 260, baseLaborFee: 240, durationMinutes: 60, warrantyDays: 180 },
  { symptomId: 'crown_strap', category: 'watch', partName: '數碼錶冠總成 / 錶帶卡榫', basePartFee: 320, baseLaborFee: 280, durationMinutes: 60, warrantyDays: 180 },
  { symptomId: 'signal_wifi', category: 'watch', partName: '天線模組・射頻修復料', basePartFee: 360, baseLaborFee: 420, durationMinutes: 150, warrantyDays: 90, requiresLab: true },
  { symptomId: 'logic_board', category: 'watch', partName: '主機板晶片級焊接', basePartFee: 980, baseLaborFee: 880, durationMinutes: 300, warrantyDays: 90, requiresLab: true },
  { symptomId: 'software_system', category: 'watch', partName: '（無需配件）watchOS 重刷配對', basePartFee: 0, baseLaborFee: 260, durationMinutes: 60, warrantyDays: 30 },

  /* ── MacBook ──────────────────────────────── */
  { symptomId: 'screen_crack', category: 'macbook', partName: 'Retina 螢幕總成（含背光模組）', basePartFee: 2680, baseLaborFee: 680, durationMinutes: 150, warrantyDays: 180 },
  { symptomId: 'battery_aging', category: 'macbook', partName: '原容量鋰聚合物電池組', basePartFee: 880, baseLaborFee: 380, durationMinutes: 90, warrantyDays: 365 },
  { symptomId: 'water_damage', category: 'macbook', partName: '主板清洗除鏽料・線路防護鍍層', basePartFee: 680, baseLaborFee: 1280, durationMinutes: 360, warrantyDays: 90, requiresLab: true },
  { symptomId: 'camera_fault', category: 'macbook', partName: 'FaceTime HD 鏡頭模組', basePartFee: 480, baseLaborFee: 420, durationMinutes: 120, warrantyDays: 180 },
  { symptomId: 'charging_port', category: 'macbook', partName: 'MagSafe / USB-C 充電板', basePartFee: 480, baseLaborFee: 420, durationMinutes: 90, warrantyDays: 180 },
  { symptomId: 'no_power', category: 'macbook', partName: '電源管理線路修復料', basePartFee: 1280, baseLaborFee: 1280, durationMinutes: 360, warrantyDays: 90, requiresLab: true },
  { symptomId: 'speaker_mic', category: 'macbook', partName: '立體聲揚聲器組', basePartFee: 420, baseLaborFee: 380, durationMinutes: 90, warrantyDays: 180 },
  { symptomId: 'face_id', category: 'macbook', partName: 'Touch ID 電源鍵模組', basePartFee: 620, baseLaborFee: 580, durationMinutes: 180, warrantyDays: 90, requiresLab: true },
  { symptomId: 'signal_wifi', category: 'macbook', partName: 'Wi-Fi 天線模組・無線卡', basePartFee: 520, baseLaborFee: 580, durationMinutes: 180, warrantyDays: 90, requiresLab: true },
  { symptomId: 'overheat', category: 'macbook', partName: '散熱風扇・日本信越導熱矽脂', basePartFee: 280, baseLaborFee: 480, durationMinutes: 120, warrantyDays: 180 },
  { symptomId: 'keyboard_fault', category: 'macbook', partName: '整組背光鍵盤（含鍵帽）', basePartFee: 980, baseLaborFee: 780, durationMinutes: 240, warrantyDays: 180 },
  { symptomId: 'trackpad_fault', category: 'macbook', partName: 'Force Touch 觸控板總成', basePartFee: 680, baseLaborFee: 420, durationMinutes: 120, warrantyDays: 180 },
  { symptomId: 'storage_upgrade', category: 'macbook', partName: 'NVMe SSD 1TB（含資料完整轉移）', basePartFee: 1080, baseLaborFee: 380, durationMinutes: 150, warrantyDays: 365 },
  { symptomId: 'logic_board', category: 'macbook', partName: '主機板晶片級焊接（BGA 植球）', basePartFee: 2280, baseLaborFee: 1580, durationMinutes: 480, warrantyDays: 90, requiresLab: true },
  { symptomId: 'data_recovery', category: 'macbook', partName: '（無需配件）SSD 資料讀取服務', basePartFee: 0, baseLaborFee: 1880, durationMinutes: 600, warrantyDays: 0, requiresLab: true },
  { symptomId: 'software_system', category: 'macbook', partName: '（無需配件）macOS 重灌與資料遷移', basePartFee: 0, baseLaborFee: 380, durationMinutes: 120, warrantyDays: 30 },
];

/** 多項故障同修的套餐減免比例 */
export const bundleDiscountRates: { minItems: number; rate: number; label: string }[] = [
  { minItems: 4, rate: 0.12, label: '四項或以上同修 88 折' },
  { minItems: 3, rate: 0.08, label: '三項同修 92 折' },
  { minItems: 2, rate: 0.05, label: '兩項同修 95 折' },
];

/** 套餐減免封頂金額 */
export const MAX_BUNDLE_DISCOUNT = 800;

export function findPricingRule(category: string, symptomId: string): SymptomPricing | undefined {
  return pricingRules.find((r) => r.category === category && r.symptomId === symptomId);
}
