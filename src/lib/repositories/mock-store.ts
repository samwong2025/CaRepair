import { products as seedProducts } from '../../data/products';
import {
  buildSeedOrders,
  buildSeedTickets,
  seedAfterSales,
  seedCustomers,
} from '../../data/seed';
import type {
  AfterSalesRecord,
  Customer,
  Product,
  RepairOrder,
  RepairTicket,
  ShopOrder,
} from '../../types';

export interface MockStore {
  customers: Customer[];
  orders: RepairOrder[];
  tickets: RepairTicket[];
  afterSales: AfterSalesRecord[];
  products: Product[];
  shopOrders: ShopOrder[];
}

/**
 * 以 globalThis 保存單例，避免 Next.js 開發模式熱更新時重置資料。
 * 正式環境接上 Supabase 後此 store 不會被使用。
 */
const globalRef = globalThis as unknown as { __cathyRepairStore?: MockStore };

function createStore(): MockStore {
  const orders = buildSeedOrders();
  return {
    customers: seedCustomers.map((c) => ({ ...c })),
    orders,
    tickets: buildSeedTickets(orders),
    afterSales: seedAfterSales.map((a) => ({ ...a })),
    products: seedProducts.map((p) => ({ ...p })),
    shopOrders: [],
  };
}

export function getStore(): MockStore {
  if (!globalRef.__cathyRepairStore) {
    globalRef.__cathyRepairStore = createStore();
  }
  return globalRef.__cathyRepairStore;
}
