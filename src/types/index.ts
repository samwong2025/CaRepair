/** CathyRepair 領域模型定義 —— 所有跨檔案使用的型別都必須 export */

/* ─── 裝置與機型 ─────────────────────────────────── */

export type DeviceCategory = 'iphone' | 'ipad' | 'watch' | 'macbook';

/** 價格級距：旗艦 / 進階 / 標準 / 舊款 */
export type PriceTier = 'flagship' | 'premium' | 'standard' | 'legacy';

export interface DeviceBrandGroup {
  id: DeviceCategory;
  name: string;
  nameEn: string;
  description: string;
  icon: string;
  popular: string;
}

export interface DeviceModel {
  id: string;
  category: DeviceCategory;
  name: string;
  series: string;
  year: number;
  tier: PriceTier;
  /** 是否為熱門機型，於選單置頂顯示 */
  hot?: boolean;
}

/* ─── 故障症狀 ───────────────────────────────────── */

export interface Symptom {
  id: string;
  name: string;
  shortName: string;
  icon: string;
  description: string;
  /** 適用的裝置分類，未列出者不顯示 */
  categories: DeviceCategory[];
  /** 常見程度，用於排序（數值越大越常見） */
  frequency: number;
  urgent?: boolean;
}

/* ─── 報價 ───────────────────────────────────────── */

export interface SymptomPricing {
  symptomId: string;
  category: DeviceCategory;
  /** 更換／使用的主要配件名稱，顯示於報價明細 */
  partName: string;
  /** 標準級距的配件費基準（HK$） */
  basePartFee: number;
  /** 標準級距的人工費基準（HK$） */
  baseLaborFee: number;
  /** 預估維修時長（分鐘） */
  durationMinutes: number;
  /** 保養日數 */
  warrantyDays: number;
  /** 是否須送廠（不能即場完成） */
  requiresLab?: boolean;
}

export interface QuoteLineItem {
  symptomId: string;
  name: string;
  partName: string;
  partFee: number;
  laborFee: number;
  subtotal: number;
  durationMinutes: number;
  warrantyDays: number;
  requiresLab: boolean;
}

export interface Quote {
  items: QuoteLineItem[];
  partsTotal: number;
  laborTotal: number;
  /** 多項故障同修的減免金額 */
  bundleDiscount: number;
  total: number;
  currency: 'HKD';
  estimatedMinutes: number;
  warrantyDays: number;
  requiresLab: boolean;
}

/* ─── 客戶（會員） ───────────────────────────────── */

export type MemberLevel = 'regular' | 'silver' | 'gold' | 'vip';

export interface Customer {
  id: string;
  memberNo: string;
  name: string;
  phone: string;
  email?: string;
  district?: string;
  address?: string;
  level: MemberLevel;
  points: number;
  totalSpent: number;
  orderCount: number;
  tags: string[];
  note?: string;
  createdAt: string;
  lastOrderAt?: string;
}

/* ─── 維修訂單 ───────────────────────────────────── */

export type ServiceMode = 'walk_in' | 'pickup' | 'mail_in';

export type OrderStatus =
  | 'submitted'
  | 'confirmed'
  | 'diagnosing'
  | 'repairing'
  | 'quality_check'
  | 'ready'
  | 'completed'
  | 'cancelled';

export interface OrderTimelineEntry {
  status: OrderStatus;
  at: string;
  note?: string;
  operator?: string;
}

export interface RepairOrder {
  id: string;
  orderNo: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  deviceCategory: DeviceCategory;
  deviceModelId: string;
  deviceModelName: string;
  symptomIds: string[];
  quote: Quote;
  serviceMode: ServiceMode;
  shopName?: string;
  address?: string;
  appointmentAt: string;
  remark?: string;
  status: OrderStatus;
  timeline: OrderTimelineEntry[];
  technician?: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── 維修工單（後台） ───────────────────────────── */

export interface RepairTicket {
  id: string;
  ticketNo: string;
  orderId: string;
  orderNo: string;
  deviceModelName: string;
  customerName: string;
  customerPhone: string;
  symptomSummary: string;
  technician: string;
  status: OrderStatus;
  priority: 'normal' | 'urgent';
  partsUsed: { name: string; qty: number; cost: number }[];
  laborCost: number;
  totalCost: number;
  startedAt?: string;
  finishedAt?: string;
  warrantyUntil?: string;
  createdAt: string;
}

/* ─── 售後服務 ───────────────────────────────────── */

export type AfterSalesType = 'warranty' | 'complaint' | 'consult' | 'return';
export type AfterSalesStatus = 'pending' | 'processing' | 'resolved' | 'rejected';

export interface AfterSalesRecord {
  id: string;
  caseNo: string;
  orderNo: string;
  customerName: string;
  customerPhone: string;
  type: AfterSalesType;
  subject: string;
  detail: string;
  status: AfterSalesStatus;
  handler?: string;
  resolution?: string;
  createdAt: string;
  updatedAt: string;
}

/* ─── 二手商店 ───────────────────────────────────── */

export type ProductGrade = 'S' | 'A' | 'B';
export type FulfillmentMethod = 'delivery' | 'pickup';

export interface Product {
  id: string;
  name: string;
  category: DeviceCategory;
  storage: string;
  color: string;
  grade: ProductGrade;
  batteryHealth: number;
  price: number;
  originalPrice: number;
  stock: number;
  warrantyDays: number;
  image: string;
  highlights: string[];
  description: string;
  accessories: string[];
  hot?: boolean;
}

export type ShopOrderStatus = 'pending' | 'paid' | 'shipped' | 'picked' | 'completed' | 'cancelled';

export interface ShopOrder {
  id: string;
  orderNo: string;
  productId: string;
  productName: string;
  price: number;
  qty: number;
  fulfillment: FulfillmentMethod;
  /** 送貨地址（送貨上門）或門市名稱（到店自取） */
  deliveryAddress?: string;
  pickupShop?: string;
  pickupAt?: string;
  customerName: string;
  customerPhone: string;
  remark?: string;
  status: ShopOrderStatus;
  createdAt: string;
}

/* ─── 內容：評價、案例、統計 ─────────────────────── */

export interface Review {
  id: string;
  customerName: string;
  date: string;
  rating: number;
  content: string;
  tags: string[];
  deviceModelName: string;
  symptomSummary: string;
  repeatCustomer?: boolean;
  shopName: string;
}

export interface RepairCase {
  id: string;
  title: string;
  deviceModelName: string;
  symptomSummary: string;
  beforeImage: string;
  afterImage: string;
  durationMinutes: number;
  price: number;
  technician: string;
  summary: string;
  date: string;
}

export interface SiteStat {
  id: string;
  label: string;
  labelEn: string;
  value: number;
  suffix: string;
  decimals?: number;
  icon: string;
  description: string;
}

/* ─── 下單表單輸入 ───────────────────────────────── */

export interface RepairOrderInput {
  deviceCategory: DeviceCategory;
  deviceModelId: string;
  symptomIds: string[];
  serviceMode: ServiceMode;
  shopName?: string;
  address?: string;
  appointmentAt: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  district?: string;
  remark?: string;
}

export interface ShopOrderInput {
  productId: string;
  qty: number;
  fulfillment: FulfillmentMethod;
  deliveryAddress?: string;
  pickupShop?: string;
  pickupAt?: string;
  customerName: string;
  customerPhone: string;
  remark?: string;
}

export interface AfterSalesInput {
  orderNo: string;
  customerName: string;
  customerPhone: string;
  type: AfterSalesType;
  subject: string;
  detail: string;
}

/** 下單結果：同時回傳自動建立／關聯的會員檔案 */
export interface CreateOrderResult {
  order: RepairOrder;
  customer: Customer;
  isNewMember: boolean;
}
