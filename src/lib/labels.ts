import type { DeviceCategory } from '../types';

/** 產品分類中文標籤，供前台與後台共用（server-safe，不含 'use client'） */
export const categoryLabel: Record<DeviceCategory, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  watch: 'Apple Watch',
  macbook: 'MacBook',
};
