import type {
  AfterSalesInput,
  AfterSalesRecord,
  CreateOrderResult,
  Customer,
  OrderStatus,
  Product,
  RepairOrder,
  RepairOrderInput,
  RepairTicket,
  ShopOrder,
  ShopOrderInput,
} from '../../types';

/**
 * 資料存取抽象介面（依賴倒置）
 * 上層頁面與 API 只依賴此介面，底層可為 Mock 或 Supabase，可無痛切換。
 */
export interface DataRepository {
  readonly source: 'mock' | 'supabase';

  /* 客戶（CRM） */
  listCustomers(): Promise<Customer[]>;
  getCustomerById(id: string): Promise<Customer | null>;
  findCustomerByPhone(phone: string): Promise<Customer | null>;
  updateCustomer(id: string, patch: Partial<Customer>): Promise<Customer | null>;

  /* 維修訂單 */
  createRepairOrder(input: RepairOrderInput): Promise<CreateOrderResult>;
  listRepairOrders(): Promise<RepairOrder[]>;
  getRepairOrderByNo(orderNo: string): Promise<RepairOrder | null>;
  findRepairOrdersByPhone(phone: string): Promise<RepairOrder[]>;
  updateRepairOrderStatus(
    id: string,
    status: OrderStatus,
    note?: string,
    operator?: string,
  ): Promise<RepairOrder | null>;
  /** 後台編輯訂單欄位（型號 / 故障變更會自動重算報價並同步工單） */
  updateRepairOrder(
    id: string,
    patch: import('../../types').RepairOrderEditPatch,
  ): Promise<RepairOrder | null>;

  /* 維修工單 */
  listTickets(): Promise<RepairTicket[]>;
  getTicketByOrderNo(orderNo: string): Promise<RepairTicket | null>;
  assignTechnician(ticketId: string, technician: string): Promise<RepairTicket | null>;

  /* 售後服務 */
  listAfterSales(): Promise<AfterSalesRecord[]>;
  createAfterSales(input: AfterSalesInput): Promise<AfterSalesRecord>;
  findAfterSalesByPhone(phone: string): Promise<AfterSalesRecord[]>;
  updateAfterSales(id: string, patch: Partial<AfterSalesRecord>): Promise<AfterSalesRecord | null>;

  /* 二手商店 */
  listProducts(): Promise<Product[]>;
  getProduct(id: string): Promise<Product | null>;
  upsertProduct(product: Product): Promise<Product>;
  createShopOrder(input: ShopOrderInput): Promise<ShopOrder>;
  listShopOrders(): Promise<ShopOrder[]>;
  updateShopOrderStatus(id: string, status: ShopOrder['status']): Promise<ShopOrder | null>;

  /* 商品分類（庫存與二手商城共用） */
  listCategories(): Promise<import('../../types').ProductCategory[]>;
  upsertCategory(data: import('../../types').ProductCategory): Promise<import('../../types').ProductCategory>;
  deleteCategory(id: string): Promise<boolean>;

  /* 往來單位（供應商 / 客戶） */
  listCounterparties(): Promise<import('../../types').Counterparty[]>;
  upsertCounterparty(data: import('../../types').Counterparty): Promise<import('../../types').Counterparty>;
  getCounterparty(id: string): Promise<import('../../types').Counterparty | null>;
  deleteCounterparty(id: string): Promise<boolean>;

  /* 維修價格（後台可編輯，取代寫死的 pricing.ts） */
  listPricing(): Promise<import('../../types').SymptomPricing[]>;
  upsertPricing(rule: import('../../types').SymptomPricing): Promise<import('../../types').SymptomPricing | null>;

  /* 庫存配件 */
  listInventory(): Promise<import('../../types').Part[]>;
  upsertInventory(part: import('../../types').Part): Promise<import('../../types').Part | null>;
  listStockMovements(): Promise<import('../../types').StockMovement[]>;
  addStockMovement(input: {
    part: import('../../types').Part;
    type: import('../../types').StockMovementType;
    qty: number;
    unitCost?: number;
    note?: string;
    refOrderNo?: string;
    supplierId?: string;
  }): Promise<{ movement: import('../../types').StockMovement; part: import('../../types').Part }>;
}
