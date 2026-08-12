'use client';

import * as React from 'react';
import dynamic from 'next/dynamic';

const Loading = () => (
  <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center text-sm text-ink-muted">
    載入中…
  </div>
);

/**
 * 通用後台管理元件懶載入器。
 * 各後台子頁面（訂單、會員、庫存、報表…）皆為「服務端取數 + 重型客戶端元件 SSR」，
 * 在 EdgeOne serverless 執行環境會因同步渲染大型元件（含 recharts）而被函式執行環境中止（白屏）。
 * 這裡統一以 next/dynamic(ssr:false) 僅在瀏覽器載入管理元件，服務端只渲染輕量載入骨架，
 * 從根源避免白屏。資料由服務端頁面取回後以 props 傳入（皆為純資料，RSC 可序列化）。
 */
const registry: Record<string, () => Promise<React.ComponentType<any>>> = {
  orders: () => import('@/components/admin/orders-manager').then((m) => m.OrdersManager),
  customers: () => import('@/components/admin/customers-manager').then((m) => m.CustomersManager),
  aftersales: () => import('@/components/admin/aftersales-manager').then((m) => m.AfterSalesManager),
  reports: () => import('@/components/admin/reports-manager').then((m) => m.ReportsManager),
  inventory: () => import('@/components/admin/inventory-manager').then((m) => m.InventoryManager),
  models: () => import('@/components/admin/models-manager').then((m) => m.ModelsManager),
  pricing: () => import('@/components/admin/pricing-manager').then((m) => m.PricingManager),
  products: () => import('@/components/admin/products-manager').then((m) => m.ProductsManager),
  symptoms: () => import('@/components/admin/symptoms-manager').then((m) => m.SymptomsManager),
  shopOrders: () => import('@/components/admin/shop-orders-manager').then((m) => m.ShopOrdersManager),
  inventoryReport: () =>
    import('@/components/admin/inventory-report-manager').then((m) => m.InventoryReportManager),
};

const cache = new Map<string, React.ComponentType<any>>();

function getComponent(name: string): React.ComponentType<any> {
  let comp = cache.get(name);
  if (!comp) {
    const loader = registry[name];
    comp =
      loader
        ? dynamic(loader, { ssr: false, loading: Loading })
        : () => <div className="text-red-600">未知管理元件：{name}</div>;
    cache.set(name, comp);
  }
  return comp;
}

export default function LazyAdmin({
  name,
  props,
}: {
  name: string;
  props?: Record<string, unknown>;
}) {
  const Comp = getComponent(name);
  return <Comp {...(props ?? {})} />;
}
