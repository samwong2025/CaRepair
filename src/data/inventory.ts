import type { Part } from '../types';

/**
 * 庫存配件種子資料。
 * partName 有意與 pricing.ts / quote-engine 的 partName 對齊，
 * 師傅在工單上選用配件時可自動對應報價項目。
 * deviceCategory / symptomId 用於作業頁篩選「適用配件」。
 */
export const inventorySeed: Part[] = [
  // ── iPhone 電池 ──
  {
    id: 'part-iphone-battery',
    name: 'iPhone 電池（原廠級）',
    category: 'battery',
    deviceCategory: 'iphone',
    symptomId: 'battery_replacement',
    sku: 'BAT-IP-UNIV',
    stock: 28,
    lowStockThreshold: 10,
    unitCost: 150,
    unitPrice: 480,
    supplier: 'Cathy 供應商',
  },
  // ── iPhone 螢幕總成 ──
  {
    id: 'part-iphone-screen',
    name: 'iPhone 螢幕總成（OLED）',
    category: 'screen',
    deviceCategory: 'iphone',
    symptomId: 'screen_replacement',
    sku: 'SCR-IP-OLED',
    stock: 6,
    lowStockThreshold: 8,
    unitCost: 680,
    unitPrice: 980,
    supplier: 'Cathy 供應商',
  },
  // ── iPhone 背玻璃 ──
  {
    id: 'part-iphone-backglass',
    name: 'iPhone 背玻璃（後蓋）',
    category: 'back_glass',
    deviceCategory: 'iphone',
    symptomId: 'back_glass_replacement',
    sku: 'BG-IP-UNIV',
    stock: 0,
    lowStockThreshold: 5,
    unitCost: 220,
    unitPrice: 520,
    supplier: 'Cathy 供應商',
  },
  // ── iPad 電池 ──
  {
    id: 'part-ipad-battery',
    name: 'iPad 電池',
    category: 'battery',
    deviceCategory: 'ipad',
    symptomId: 'battery_replacement',
    sku: 'BAT-IPD-UNIV',
    stock: 12,
    lowStockThreshold: 6,
    unitCost: 240,
    unitPrice: 580,
    supplier: 'Cathy 供應商',
  },
  // ── iPad 螢幕 ──
  {
    id: 'part-ipad-screen',
    name: 'iPad 螢幕總成',
    category: 'screen',
    deviceCategory: 'ipad',
    symptomId: 'screen_replacement',
    sku: 'SCR-IPD-UNIV',
    stock: 4,
    lowStockThreshold: 5,
    unitCost: 520,
    unitPrice: 880,
    supplier: 'Cathy 供應商',
  },
  // ── Apple Watch 電池 ──
  {
    id: 'part-watch-battery',
    name: 'Apple Watch 電池',
    category: 'battery',
    deviceCategory: 'watch',
    symptomId: 'battery_replacement',
    sku: 'BAT-WT-UNIV',
    stock: 3,
    lowStockThreshold: 6,
    unitCost: 120,
    unitPrice: 380,
    supplier: 'Cathy 供應商',
  },
  // ── Apple Watch 螢幕 ──
  {
    id: 'part-watch-screen',
    name: 'Apple Watch 螢幕總成',
    category: 'screen',
    deviceCategory: 'watch',
    symptomId: 'screen_replacement',
    sku: 'SCR-WT-UNIV',
    stock: 2,
    lowStockThreshold: 4,
    unitCost: 360,
    unitPrice: 720,
    supplier: 'Cathy 供應商',
  },
  // ── MacBook 電池 ──
  {
    id: 'part-macbook-battery',
    name: 'MacBook 電池',
    category: 'battery',
    deviceCategory: 'macbook',
    symptomId: 'battery_replacement',
    sku: 'BAT-MB-UNIV',
    stock: 9,
    lowStockThreshold: 5,
    unitCost: 320,
    unitPrice: 680,
    supplier: 'Cathy 供應商',
  },
  // ── MacBook 螢幕 ──
  {
    id: 'part-macbook-screen',
    name: 'MacBook 螢幕總成',
    category: 'screen',
    deviceCategory: 'macbook',
    symptomId: 'screen_replacement',
    sku: 'SCR-MB-UNIV',
    stock: 1,
    lowStockThreshold: 3,
    unitCost: 980,
    unitPrice: 1680,
    supplier: 'Cathy 供應商',
  },
  // ── 通用充電口 ──
  {
    id: 'part-charging-port',
    name: '充電接口排線（通用）',
    category: 'charging',
    symptomId: 'charging_port',
    sku: 'CHG-UNIV',
    stock: 18,
    lowStockThreshold: 8,
    unitCost: 90,
    unitPrice: 280,
    supplier: 'Cathy 供應商',
  },
  // ── 揚聲器 ──
  {
    id: 'part-speaker',
    name: '揚聲器模組',
    category: 'speaker',
    symptomId: 'speaker_replacement',
    sku: 'SPK-UNIV',
    stock: 7,
    lowStockThreshold: 5,
    unitCost: 110,
    unitPrice: 320,
    supplier: 'Cathy 供應商',
  },
  // ── 其他 / 耗材 ──
  {
    id: 'part-misc-tools',
    name: '維修耗材包（膠水 / 螺絲）',
    category: 'other',
    sku: 'MISC-KIT',
    stock: 40,
    lowStockThreshold: 15,
    unitCost: 20,
    unitPrice: 60,
    supplier: 'Cathy 供應商',
  },
];
