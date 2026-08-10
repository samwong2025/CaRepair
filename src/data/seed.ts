import { calculateQuote } from '../lib/quote-engine';
import { getModelById } from './devices';
import { getSymptomById } from './symptoms';
import type {
  AfterSalesRecord,
  Customer,
  OrderStatus,
  OrderTimelineEntry,
  RepairOrder,
  RepairTicket,
  ServiceMode,
} from '../types';

/** 以「現在」為基準往前推 N 日／小時，令示範資料永遠保持時效性 */
function daysAgo(days: number, hour = 11, minute = 20): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function hoursAgo(hours: number): string {
  const d = new Date();
  d.setHours(d.getHours() - hours, 0, 0, 0);
  return d.toISOString();
}

function daysLater(days: number, hour = 15): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export const statusFlow: OrderStatus[] = [
  'submitted',
  'confirmed',
  'diagnosing',
  'repairing',
  'quality_check',
  'ready',
  'completed',
];

export const statusMeta: Record<
  OrderStatus,
  { label: string; description: string; tone: 'brand' | 'accent' | 'success' | 'warning' | 'neutral' | 'danger' }
> = {
  submitted: { label: '已落單', description: '訂單已提交，等待客服致電確認故障', tone: 'neutral' },
  confirmed: { label: '已確認', description: '客服已聯絡客戶並確認維修方案', tone: 'brand' },
  diagnosing: { label: '檢測中', description: '技師正進行 27 項入機檢測', tone: 'brand' },
  repairing: { label: '維修中', description: '技師施工中，全程錄影記錄', tone: 'accent' },
  quality_check: { label: '品檢中', description: '維修完成，正進行出機功能檢測', tone: 'accent' },
  ready: { label: '待取機', description: '已完成，可到店取機或安排送遞', tone: 'success' },
  completed: { label: '已完成', description: '客戶已取機，進入保養期', tone: 'success' },
  cancelled: { label: '已取消', description: '訂單已取消', tone: 'danger' },
};

function buildTimeline(status: OrderStatus, createdAt: string, technician?: string): OrderTimelineEntry[] {
  if (status === 'cancelled') {
    return [
      { status: 'submitted', at: createdAt, note: '客戶於網上提交維修申請', operator: '系統' },
      { status: 'cancelled', at: createdAt, note: '客戶來電取消訂單', operator: '客服 Amy' },
    ];
  }

  const index = statusFlow.indexOf(status);
  const base = new Date(createdAt).getTime();
  const notes: Record<OrderStatus, string> = {
    submitted: '客戶於網上提交維修申請，系統即時生成報價單',
    confirmed: '客服致電確認故障描述與維修方案，客戶已同意報價',
    diagnosing: '完成入機 27 項檢測，確認故障範圍與所需配件',
    repairing: `${technician ?? '技師'}開始施工，維修過程全程錄影`,
    quality_check: '維修完成，進行觸控、鏡頭、訊號、防水等出機檢測',
    ready: '全部檢測通過，已清潔消毒並貼上維修識別標籤',
    completed: '客戶已取機並簽收，保養期由今日起計',
    cancelled: '',
  };

  return statusFlow.slice(0, index + 1).map((s, i) => ({
    status: s,
    at: new Date(base + i * 55 * 60 * 1000).toISOString(),
    note: notes[s],
    operator: i <= 1 ? '客服 Amy' : (technician ?? '技師'),
  }));
}

type SeedOrderSpec = {
  orderNo: string;
  customerIndex: number;
  modelId: string;
  symptomIds: string[];
  serviceMode: ServiceMode;
  shopName?: string;
  address?: string;
  status: OrderStatus;
  technician: string;
  createdAt: string;
  appointmentAt: string;
  remark?: string;
};

export const seedCustomers: Customer[] = [
  {
    id: 'cus-001',
    memberNo: 'M-8F31K2',
    name: '陳浩然',
    phone: '9123 4567',
    email: 'howard.chan@example.hk',
    district: '旺角',
    address: '九龍旺角亞皆老街 88 號 12 樓 A 室',
    level: 'gold',
    points: 1860,
    totalSpent: 18620,
    orderCount: 6,
    tags: ['熟客', '換機頻密', '接受 WhatsApp 通知'],
    note: '偏好即場快修，通常午飯時間到店。',
    createdAt: daysAgo(720),
    lastOrderAt: daysAgo(1),
  },
  {
    id: 'cus-002',
    memberNo: 'M-2C7A9L',
    name: '黃詠詩',
    phone: '6288 3391',
    email: 'wing.wong@example.hk',
    district: '觀塘',
    address: '九龍觀塘鴻圖道 26 號 8 樓',
    level: 'vip',
    points: 4280,
    totalSpent: 46800,
    orderCount: 14,
    tags: ['企業客戶', '需要正式發票', '批量維修'],
    note: '公司 IT 主管，每季安排一次員工裝置集體保養。',
    createdAt: daysAgo(980),
    lastOrderAt: daysAgo(3),
  },
  {
    id: 'cus-003',
    memberNo: 'M-5K90XD',
    name: '李嘉豪',
    phone: '5432 7788',
    district: '銅鑼灣',
    level: 'silver',
    points: 620,
    totalSpent: 6240,
    orderCount: 3,
    tags: ['價格敏感', '接受副廠件'],
    createdAt: daysAgo(410),
    lastOrderAt: daysAgo(5),
  },
  {
    id: 'cus-004',
    memberNo: 'M-7J12QP',
    name: '周美玲',
    phone: '9876 5432',
    email: 'mei.chow@example.hk',
    district: '沙田',
    address: '新界沙田大圍積存街 15 號 3 樓',
    level: 'regular',
    points: 180,
    totalSpent: 1820,
    orderCount: 1,
    tags: ['首次光顧', '需要上門收送'],
    createdAt: daysAgo(9),
    lastOrderAt: daysAgo(9),
  },
  {
    id: 'cus-005',
    memberNo: 'M-3D66YT',
    name: '許志明',
    phone: '6120 8899',
    district: '荃灣',
    level: 'silver',
    points: 940,
    totalSpent: 9380,
    orderCount: 4,
    tags: ['Apple Watch 用家', '重視防水處理'],
    createdAt: daysAgo(300),
    lastOrderAt: daysAgo(12),
  },
  {
    id: 'cus-006',
    memberNo: 'M-9P45ZR',
    name: '梁樂怡',
    phone: '9055 1234',
    email: 'joyce.leung@example.hk',
    district: '尖沙咀',
    level: 'gold',
    points: 2140,
    totalSpent: 21400,
    orderCount: 7,
    tags: ['設計師', 'MacBook 重度用家', '要求原廠件'],
    note: '工作檔案極重要，維修前必須確認資料保全方案。',
    createdAt: daysAgo(600),
    lastOrderAt: daysAgo(2),
  },
  {
    id: 'cus-007',
    memberNo: 'M-1A88MN',
    name: '何家俊',
    phone: '5188 6677',
    district: '元朗',
    level: 'regular',
    points: 320,
    totalSpent: 3180,
    orderCount: 2,
    tags: ['二手機買家'],
    createdAt: daysAgo(120),
    lastOrderAt: daysAgo(20),
  },
  {
    id: 'cus-008',
    memberNo: 'M-6H23WB',
    name: '吳雅文',
    phone: '9333 2211',
    email: 'ada.ng@example.hk',
    district: '將軍澳',
    level: 'regular',
    points: 90,
    totalSpent: 980,
    orderCount: 1,
    tags: ['學生優惠'],
    createdAt: daysAgo(30),
    lastOrderAt: daysAgo(30),
  },
];

const orderSpecs: SeedOrderSpec[] = [
  {
    orderNo: 'CR-20260810-A31F',
    customerIndex: 0,
    modelId: 'iphone-16-pro-max',
    symptomIds: ['screen_crack', 'back_glass'],
    serviceMode: 'walk_in',
    shopName: '荔枝角門市',
    status: 'repairing',
    technician: '陳師傅',
    createdAt: hoursAgo(4),
    appointmentAt: hoursAgo(3),
    remark: '正反兩面爆裂，趕住聽日出 trip 用，希望即日取機。',
  },
  {
    orderNo: 'CR-20260810-B72K',
    customerIndex: 5,
    modelId: 'mbp-14-m3',
    symptomIds: ['water_damage', 'no_power'],
    serviceMode: 'pickup',
    address: '九龍尖沙咀廣東道 30 號 21 樓',
    status: 'diagnosing',
    technician: '李師傅',
    createdAt: hoursAgo(9),
    appointmentAt: hoursAgo(7),
    remark: '倒瀉咖啡，入面有極重要設計檔案，務必保全資料。',
  },
  {
    orderNo: 'CR-20260809-C15D',
    customerIndex: 1,
    modelId: 'mba-13-m2',
    symptomIds: ['battery_aging'],
    serviceMode: 'walk_in',
    shopName: '荔枝角門市',
    status: 'ready',
    technician: '周師傅',
    createdAt: daysAgo(1, 10, 15),
    appointmentAt: daysAgo(1, 14, 0),
    remark: '公司機，需要正式發票，抬頭：宏誠科技有限公司。',
  },
  {
    orderNo: 'CR-20260808-D48M',
    customerIndex: 3,
    modelId: 'ipad-air-11-m3',
    symptomIds: ['charging_port'],
    serviceMode: 'pickup',
    address: '新界沙田大圍積存街 15 號 3 樓',
    status: 'completed',
    technician: '周師傅',
    createdAt: daysAgo(2, 9, 30),
    appointmentAt: daysAgo(2, 13, 0),
  },
  {
    orderNo: 'CR-20260807-E93P',
    customerIndex: 4,
    modelId: 'watch-s10-46',
    symptomIds: ['crown_strap', 'water_damage'],
    serviceMode: 'walk_in',
    shopName: '荔枝角門市',
    status: 'quality_check',
    technician: '黃師傅',
    createdAt: daysAgo(3, 15, 45),
    appointmentAt: daysAgo(3, 16, 30),
    remark: '潛水後入水，錶冠轉唔郁，需要重做防水測試。',
  },
  {
    orderNo: 'CR-20260806-F27Q',
    customerIndex: 2,
    modelId: 'iphone-13',
    symptomIds: ['battery_aging'],
    serviceMode: 'walk_in',
    shopName: '荔枝角門市',
    status: 'completed',
    technician: '陳師傅',
    createdAt: daysAgo(4, 12, 10),
    appointmentAt: daysAgo(4, 12, 40),
  },
  {
    orderNo: 'CR-20260805-G64R',
    customerIndex: 7,
    modelId: 'iphone-12',
    symptomIds: ['screen_crack'],
    serviceMode: 'mail_in',
    address: '新界將軍澳唐明街 12 號 7 樓 C 室',
    status: 'completed',
    technician: '陳師傅',
    createdAt: daysAgo(5, 17, 5),
    appointmentAt: daysAgo(5, 18, 0),
    remark: '學生優惠，順豐到付寄修。',
  },
  {
    orderNo: 'CR-20260804-H81T',
    customerIndex: 1,
    modelId: 'ipad-pro-13-m4',
    symptomIds: ['screen_crack', 'battery_aging', 'speaker_mic'],
    serviceMode: 'pickup',
    address: '九龍觀塘鴻圖道 26 號 8 樓',
    status: 'confirmed',
    technician: '李師傅',
    createdAt: hoursAgo(28),
    appointmentAt: daysLater(1, 11),
    remark: '公司會議用機，希望三日內完成。',
  },
  {
    orderNo: 'CR-20260810-J59V',
    customerIndex: 6,
    modelId: 'iphone-15',
    symptomIds: ['camera_fault'],
    serviceMode: 'walk_in',
    shopName: '荔枝角門市',
    status: 'submitted',
    technician: '待分派',
    createdAt: hoursAgo(1),
    appointmentAt: daysLater(1, 15),
    remark: '主鏡頭對焦時有震動聲，拍照模糊。',
  },
  {
    orderNo: 'CR-20260803-K37W',
    customerIndex: 0,
    modelId: 'iphone-16-pro-max',
    symptomIds: ['battery_aging'],
    serviceMode: 'walk_in',
    shopName: '荔枝角門市',
    status: 'completed',
    technician: '陳師傅',
    createdAt: daysAgo(7, 13, 25),
    appointmentAt: daysAgo(7, 14, 0),
  },
];

export function buildSeedOrders(): RepairOrder[] {
  return orderSpecs.map((spec, index) => {
    const customer = seedCustomers[spec.customerIndex];
    const model = getModelById(spec.modelId)!;
    const quote = calculateQuote(spec.modelId, spec.symptomIds);
    const timeline = buildTimeline(spec.status, spec.createdAt, spec.technician);

    return {
      id: `ord-${String(index + 1).padStart(3, '0')}`,
      orderNo: spec.orderNo,
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      deviceCategory: model.category,
      deviceModelId: model.id,
      deviceModelName: model.name,
      symptomIds: spec.symptomIds,
      quote,
      serviceMode: spec.serviceMode,
      shopName: spec.shopName,
      address: spec.address,
      appointmentAt: spec.appointmentAt,
      remark: spec.remark,
      status: spec.status,
      timeline,
      technician: spec.technician,
      createdAt: spec.createdAt,
      updatedAt: timeline[timeline.length - 1]?.at ?? spec.createdAt,
    } satisfies RepairOrder;
  });
}

export function buildSeedTickets(orders: RepairOrder[]): RepairTicket[] {
  return orders
    .filter((o) => o.status !== 'submitted' && o.status !== 'cancelled')
    .map((order, index) => {
      const warrantyUntil = new Date(order.createdAt);
      warrantyUntil.setDate(warrantyUntil.getDate() + (order.quote.warrantyDays || 90));

      return {
        id: `tkt-${String(index + 1).padStart(3, '0')}`,
        ticketNo: order.orderNo.replace('CR-', 'WO-'),
        orderId: order.id,
        orderNo: order.orderNo,
        deviceModelName: order.deviceModelName,
        customerName: order.customerName,
        customerPhone: order.customerPhone,
        symptomSummary: order.symptomIds
          .map((id) => getSymptomById(id)?.shortName ?? id)
          .join('、'),
        technician: order.technician ?? '待分派',
        status: order.status,
        priority: order.quote.requiresLab || order.symptomIds.length >= 3 ? 'urgent' : 'normal',
        partsUsed: order.quote.items.map((item) => ({
          name: item.partName,
          qty: 1,
          cost: item.partFee,
        })),
        laborCost: order.quote.laborTotal,
        totalCost: order.quote.total,
        startedAt: order.timeline.find((t) => t.status === 'repairing')?.at,
        finishedAt: order.timeline.find((t) => t.status === 'ready')?.at,
        warrantyUntil: warrantyUntil.toISOString(),
        createdAt: order.createdAt,
      } satisfies RepairTicket;
    });
}

export const seedAfterSales: AfterSalesRecord[] = [
  {
    id: 'as-001',
    caseNo: 'AS-20260808-3312',
    orderNo: 'CR-20260806-F27Q',
    customerName: '李嘉豪',
    customerPhone: '5432 7788',
    type: 'warranty',
    subject: '換電後兩日再次出現自動關機',
    detail: '換完電池第二日，電量去到 30% 左右就會突然熄機，充返電又可以開返。',
    status: 'resolved',
    handler: '客服 Amy',
    resolution:
      '回廠複檢發現為電源管理排線接觸不良（非電池問題），已免費更換排線並重新校正電池健康度，保養期順延 30 日。',
    createdAt: daysAgo(2, 10, 5),
    updatedAt: daysAgo(1, 16, 40),
  },
  {
    id: 'as-002',
    caseNo: 'AS-20260809-4471',
    orderNo: 'CR-20260805-G64R',
    customerName: '吳雅文',
    customerPhone: '9333 2211',
    type: 'consult',
    subject: '想查詢換咗個芒之後可唔可以再貼保護貼',
    detail: '新換嘅螢幕想貼鋼化膜，會唔會影響保養？有冇推薦型號？',
    status: 'resolved',
    handler: '客服 Ken',
    resolution:
      '已回覆客戶：貼膜不影響保養，並已安排到店免費貼上店內同款鋼化膜（維修客戶首張免費）。',
    createdAt: daysAgo(1, 14, 20),
    updatedAt: daysAgo(1, 15, 10),
  },
  {
    id: 'as-003',
    caseNo: 'AS-20260810-5590',
    orderNo: 'CR-20260808-D48M',
    customerName: '周美玲',
    customerPhone: '9876 5432',
    type: 'warranty',
    subject: '尾插更換後充電偶爾中斷',
    detail: '用原裝火牛充電，有時充充下會斷開，要拔返出嚟再插過。',
    status: 'processing',
    handler: '客服 Amy',
    createdAt: hoursAgo(6),
    updatedAt: hoursAgo(2),
  },
  {
    id: 'as-004',
    caseNo: 'AS-20260810-6612',
    orderNo: 'CR-20260803-K37W',
    customerName: '陳浩然',
    customerPhone: '9123 4567',
    type: 'complaint',
    subject: '等候時間比承諾長',
    detail: '話 30 分鐘，實際等咗 55 分鐘先攞到機。',
    status: 'pending',
    createdAt: hoursAgo(3),
    updatedAt: hoursAgo(3),
  },
];
