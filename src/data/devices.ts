import type { DeviceBrandGroup, DeviceModel } from '../types';

/** 裝置分類 —— 覆蓋 Apple 全產品線 */
export const deviceGroups: DeviceBrandGroup[] = [
  {
    id: 'iphone',
    name: 'iPhone',
    nameEn: 'iPhone Repair',
    description: '爆芒、換電、入水、鏡頭、尾插，最快 30 分鐘即場完成',
    icon: 'Smartphone',
    popular: 'iPhone 17 Pro Max・iPhone 16・iPhone 15',
  },
  {
    id: 'ipad',
    name: 'iPad',
    nameEn: 'iPad Repair',
    description: '觸控失靈、爆芒、電池膨脹、尾插鬆脫，原廠級面板供應',
    icon: 'Tablet',
    popular: 'iPad Pro M4・iPad Air M3・iPad mini 7',
  },
  {
    id: 'watch',
    name: 'Apple Watch',
    nameEn: 'Apple Watch Repair',
    description: '錶面爆裂、電池發脹、入水、錶冠失靈，專用防水膠重貼',
    icon: 'Watch',
    popular: 'Series 10・Ultra 2・SE 2',
  },
  {
    id: 'macbook',
    name: 'MacBook',
    nameEn: 'MacBook Repair',
    description: '入水救板、鍵盤更換、電池老化、SSD 升級、散熱翻新',
    icon: 'Laptop',
    popular: 'MacBook Pro M4・MacBook Air M4・MacBook Air M2',
  },
];

/** 機型庫 —— tier 決定報價級距係數 */
export const deviceModels: DeviceModel[] = [
  /* ── iPhone ───────────────────────────────── */
  { id: 'iphone-17-pro-max', category: 'iphone', name: 'iPhone 17 Pro Max', series: 'iPhone 17', year: 2025, tier: 'flagship', hot: true },
  { id: 'iphone-17-pro', category: 'iphone', name: 'iPhone 17 Pro', series: 'iPhone 17', year: 2025, tier: 'flagship', hot: true },
  { id: 'iphone-17-air', category: 'iphone', name: 'iPhone 17 Air', series: 'iPhone 17', year: 2025, tier: 'premium' },
  { id: 'iphone-17', category: 'iphone', name: 'iPhone 17', series: 'iPhone 17', year: 2025, tier: 'premium', hot: true },
  { id: 'iphone-16-pro-max', category: 'iphone', name: 'iPhone 16 Pro Max', series: 'iPhone 16', year: 2024, tier: 'flagship', hot: true },
  { id: 'iphone-16-pro', category: 'iphone', name: 'iPhone 16 Pro', series: 'iPhone 16', year: 2024, tier: 'flagship' },
  { id: 'iphone-16-plus', category: 'iphone', name: 'iPhone 16 Plus', series: 'iPhone 16', year: 2024, tier: 'premium' },
  { id: 'iphone-16', category: 'iphone', name: 'iPhone 16', series: 'iPhone 16', year: 2024, tier: 'premium', hot: true },
  { id: 'iphone-16e', category: 'iphone', name: 'iPhone 16e', series: 'iPhone 16', year: 2025, tier: 'standard' },
  { id: 'iphone-15-pro-max', category: 'iphone', name: 'iPhone 15 Pro Max', series: 'iPhone 15', year: 2023, tier: 'premium', hot: true },
  { id: 'iphone-15-pro', category: 'iphone', name: 'iPhone 15 Pro', series: 'iPhone 15', year: 2023, tier: 'premium' },
  { id: 'iphone-15-plus', category: 'iphone', name: 'iPhone 15 Plus', series: 'iPhone 15', year: 2023, tier: 'standard' },
  { id: 'iphone-15', category: 'iphone', name: 'iPhone 15', series: 'iPhone 15', year: 2023, tier: 'standard', hot: true },
  { id: 'iphone-14-pro-max', category: 'iphone', name: 'iPhone 14 Pro Max', series: 'iPhone 14', year: 2022, tier: 'premium' },
  { id: 'iphone-14-pro', category: 'iphone', name: 'iPhone 14 Pro', series: 'iPhone 14', year: 2022, tier: 'premium' },
  { id: 'iphone-14-plus', category: 'iphone', name: 'iPhone 14 Plus', series: 'iPhone 14', year: 2022, tier: 'standard' },
  { id: 'iphone-14', category: 'iphone', name: 'iPhone 14', series: 'iPhone 14', year: 2022, tier: 'standard' },
  { id: 'iphone-13-pro-max', category: 'iphone', name: 'iPhone 13 Pro Max', series: 'iPhone 13', year: 2021, tier: 'standard' },
  { id: 'iphone-13-pro', category: 'iphone', name: 'iPhone 13 Pro', series: 'iPhone 13', year: 2021, tier: 'standard' },
  { id: 'iphone-13', category: 'iphone', name: 'iPhone 13', series: 'iPhone 13', year: 2021, tier: 'standard', hot: true },
  { id: 'iphone-13-mini', category: 'iphone', name: 'iPhone 13 mini', series: 'iPhone 13', year: 2021, tier: 'standard' },
  { id: 'iphone-12-pro-max', category: 'iphone', name: 'iPhone 12 Pro Max', series: 'iPhone 12', year: 2020, tier: 'standard' },
  { id: 'iphone-12-pro', category: 'iphone', name: 'iPhone 12 Pro', series: 'iPhone 12', year: 2020, tier: 'legacy' },
  { id: 'iphone-12', category: 'iphone', name: 'iPhone 12', series: 'iPhone 12', year: 2020, tier: 'legacy' },
  { id: 'iphone-12-mini', category: 'iphone', name: 'iPhone 12 mini', series: 'iPhone 12', year: 2020, tier: 'legacy' },
  { id: 'iphone-11-pro-max', category: 'iphone', name: 'iPhone 11 Pro Max', series: 'iPhone 11', year: 2019, tier: 'legacy' },
  { id: 'iphone-11-pro', category: 'iphone', name: 'iPhone 11 Pro', series: 'iPhone 11', year: 2019, tier: 'legacy' },
  { id: 'iphone-11', category: 'iphone', name: 'iPhone 11', series: 'iPhone 11', year: 2019, tier: 'legacy' },
  { id: 'iphone-se-3', category: 'iphone', name: 'iPhone SE（第 3 代）', series: 'iPhone SE', year: 2022, tier: 'legacy' },
  { id: 'iphone-xs-max', category: 'iphone', name: 'iPhone XS Max', series: 'iPhone X', year: 2018, tier: 'legacy' },
  { id: 'iphone-xr', category: 'iphone', name: 'iPhone XR', series: 'iPhone X', year: 2018, tier: 'legacy' },

  /* ── iPad ─────────────────────────────────── */
  { id: 'ipad-pro-13-m4', category: 'ipad', name: 'iPad Pro 13 吋（M4）', series: 'iPad Pro', year: 2024, tier: 'flagship', hot: true },
  { id: 'ipad-pro-11-m4', category: 'ipad', name: 'iPad Pro 11 吋（M4）', series: 'iPad Pro', year: 2024, tier: 'flagship' },
  { id: 'ipad-pro-129-m2', category: 'ipad', name: 'iPad Pro 12.9 吋（M2）', series: 'iPad Pro', year: 2022, tier: 'premium' },
  { id: 'ipad-pro-11-m2', category: 'ipad', name: 'iPad Pro 11 吋（M2）', series: 'iPad Pro', year: 2022, tier: 'premium' },
  { id: 'ipad-air-13-m3', category: 'ipad', name: 'iPad Air 13 吋（M3）', series: 'iPad Air', year: 2025, tier: 'premium', hot: true },
  { id: 'ipad-air-11-m3', category: 'ipad', name: 'iPad Air 11 吋（M3）', series: 'iPad Air', year: 2025, tier: 'premium' },
  { id: 'ipad-air-11-m2', category: 'ipad', name: 'iPad Air 11 吋（M2）', series: 'iPad Air', year: 2024, tier: 'standard' },
  { id: 'ipad-air-5', category: 'ipad', name: 'iPad Air（第 5 代）', series: 'iPad Air', year: 2022, tier: 'standard' },
  { id: 'ipad-mini-7', category: 'ipad', name: 'iPad mini（第 7 代）', series: 'iPad mini', year: 2024, tier: 'standard', hot: true },
  { id: 'ipad-mini-6', category: 'ipad', name: 'iPad mini（第 6 代）', series: 'iPad mini', year: 2021, tier: 'standard' },
  { id: 'ipad-11-a16', category: 'ipad', name: 'iPad（第 11 代・A16）', series: 'iPad', year: 2025, tier: 'standard' },
  { id: 'ipad-10', category: 'ipad', name: 'iPad（第 10 代）', series: 'iPad', year: 2022, tier: 'legacy' },
  { id: 'ipad-9', category: 'ipad', name: 'iPad（第 9 代）', series: 'iPad', year: 2021, tier: 'legacy' },

  /* ── Apple Watch ──────────────────────────── */
  { id: 'watch-ultra-2', category: 'watch', name: 'Apple Watch Ultra 2', series: 'Ultra', year: 2023, tier: 'flagship', hot: true },
  { id: 'watch-ultra', category: 'watch', name: 'Apple Watch Ultra', series: 'Ultra', year: 2022, tier: 'flagship' },
  { id: 'watch-s10-46', category: 'watch', name: 'Apple Watch Series 10（46mm）', series: 'Series 10', year: 2024, tier: 'premium', hot: true },
  { id: 'watch-s10-42', category: 'watch', name: 'Apple Watch Series 10（42mm）', series: 'Series 10', year: 2024, tier: 'premium' },
  { id: 'watch-s9-45', category: 'watch', name: 'Apple Watch Series 9（45mm）', series: 'Series 9', year: 2023, tier: 'standard', hot: true },
  { id: 'watch-s9-41', category: 'watch', name: 'Apple Watch Series 9（41mm）', series: 'Series 9', year: 2023, tier: 'standard' },
  { id: 'watch-s8-45', category: 'watch', name: 'Apple Watch Series 8（45mm）', series: 'Series 8', year: 2022, tier: 'standard' },
  { id: 'watch-s8-41', category: 'watch', name: 'Apple Watch Series 8（41mm）', series: 'Series 8', year: 2022, tier: 'standard' },
  { id: 'watch-se-2', category: 'watch', name: 'Apple Watch SE（第 2 代）', series: 'SE', year: 2022, tier: 'legacy' },
  { id: 'watch-s7', category: 'watch', name: 'Apple Watch Series 7', series: 'Series 7', year: 2021, tier: 'legacy' },
  { id: 'watch-s6', category: 'watch', name: 'Apple Watch Series 6', series: 'Series 6', year: 2020, tier: 'legacy' },

  /* ── MacBook ──────────────────────────────── */
  { id: 'mbp-16-m4-max', category: 'macbook', name: 'MacBook Pro 16 吋（M4 Max）', series: 'MacBook Pro', year: 2024, tier: 'flagship', hot: true },
  { id: 'mbp-16-m4-pro', category: 'macbook', name: 'MacBook Pro 16 吋（M4 Pro）', series: 'MacBook Pro', year: 2024, tier: 'flagship' },
  { id: 'mbp-14-m4', category: 'macbook', name: 'MacBook Pro 14 吋（M4）', series: 'MacBook Pro', year: 2024, tier: 'flagship', hot: true },
  { id: 'mbp-14-m3', category: 'macbook', name: 'MacBook Pro 14 吋（M3）', series: 'MacBook Pro', year: 2023, tier: 'premium' },
  { id: 'mbp-16-m2-pro', category: 'macbook', name: 'MacBook Pro 16 吋（M2 Pro）', series: 'MacBook Pro', year: 2023, tier: 'premium' },
  { id: 'mba-15-m4', category: 'macbook', name: 'MacBook Air 15 吋（M4）', series: 'MacBook Air', year: 2025, tier: 'premium', hot: true },
  { id: 'mba-13-m4', category: 'macbook', name: 'MacBook Air 13 吋（M4）', series: 'MacBook Air', year: 2025, tier: 'premium', hot: true },
  { id: 'mba-15-m3', category: 'macbook', name: 'MacBook Air 15 吋（M3）', series: 'MacBook Air', year: 2024, tier: 'standard' },
  { id: 'mba-13-m3', category: 'macbook', name: 'MacBook Air 13 吋（M3）', series: 'MacBook Air', year: 2024, tier: 'standard' },
  { id: 'mba-13-m2', category: 'macbook', name: 'MacBook Air 13 吋（M2）', series: 'MacBook Air', year: 2022, tier: 'standard' },
  { id: 'mba-13-m1', category: 'macbook', name: 'MacBook Air 13 吋（M1）', series: 'MacBook Air', year: 2020, tier: 'legacy' },
  { id: 'mbp-13-m1', category: 'macbook', name: 'MacBook Pro 13 吋（M1）', series: 'MacBook Pro', year: 2020, tier: 'legacy' },
  { id: 'mbp-15-intel', category: 'macbook', name: 'MacBook Pro 15 吋（Intel）', series: 'MacBook Pro', year: 2019, tier: 'legacy' },
];

/** 價格級距係數 */
export const tierMultiplier: Record<DeviceModel['tier'], number> = {
  flagship: 1.35,
  premium: 1.15,
  standard: 1,
  legacy: 0.82,
};

export const tierLabel: Record<DeviceModel['tier'], string> = {
  flagship: '旗艦級',
  premium: '進階級',
  standard: '標準級',
  legacy: '經典款',
};

export function getModelById(id: string): DeviceModel | undefined {
  return deviceModels.find((m) => m.id === id);
}

export function getModelsByCategory(category: DeviceModel['category']): DeviceModel[] {
  return deviceModels.filter((m) => m.category === category);
}
