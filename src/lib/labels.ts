import type { DeviceCategory, Product } from '../types';

/** 维修用的四类（与维修机型绑定），前台不会用到，保留向后兼容 */
export const categoryLabel: Record<DeviceCategory, string> = {
  iphone: 'iPhone',
  ipad: 'iPad',
  watch: 'Apple Watch',
  macbook: 'MacBook',
};

/**
 * 后台二手商品分类的可显示中文名称。
 *
 * 兼容两类数据：
 * 1. 老数据：枚举短码（iphone/ipad/watch/macbook） → 映射到中文
 * 2. 新数据：admin 后台直接输入的任意分类名 → 原样返回
 *
 * 这样既保留旧数据兼容，又支持任意自定义分类。
 */
export function resolveProductCategoryLabel(product: Pick<Product, 'category'>): string {
  if (!product.category) return '';
  const trimmed = product.category.trim();
  // 已知枚举 → 翻译
  if (trimmed in categoryLabel) {
    return categoryLabel[trimmed as DeviceCategory];
  }
  // 否则原样返回（这是 admin 在后台自訂的新分类名）
  return trimmed;
}
