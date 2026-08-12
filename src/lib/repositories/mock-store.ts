import { products as seedProducts } from '../../data/products';
import {
  buildSeedOrders,
  buildSeedTickets,
  seedAfterSales,
  seedCustomers,
} from '../../data/seed';
import type {
  AfterSalesRecord,
  Counterparty,
  Customer,
  Product,
  ProductCategory,
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
  categories: ProductCategory[];
  counterparties: Counterparty[];
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
    categories: [
      { id: 'cat-iphone', name: 'iPhone', group: 'iphone', sortOrder: 1 },
      { id: 'cat-ipad', name: 'iPad', group: 'ipad', sortOrder: 2 },
      { id: 'cat-watch', name: 'Apple Watch', group: 'watch', sortOrder: 3 },
      { id: 'cat-macbook', name: 'Mac', group: 'macbook', sortOrder: 4 },
      { id: 'cat-accessory', name: '配件 / 周邊', sortOrder: 5 },
    ],
    counterparties: [
      {
        id: 'cp-seed-acme',
        name: 'ACME 零件供應商',
        type: 'supplier',
        contact: '李小姐',
        phone: '23456789',
        settlement: '月結 30 天',
      },
    ],
  };
}

export function getStore(): MockStore {
  if (!globalRef.__cathyRepairStore) {
    globalRef.__cathyRepairStore = createStore();
  }
  return globalRef.__cathyRepairStore;
}
