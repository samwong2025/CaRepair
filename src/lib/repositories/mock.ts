import { getModelById } from '../../data/devices';
import { getSymptomById } from '../../data/symptoms';
import { statusMeta } from '../../data/seed';
import { calculateQuote } from '../quote-engine';
import { generateMemberNo, generateOrderNo } from '../format';
import { getStore } from './mock-store';
import type { DataRepository } from './types';
import type {
  AfterSalesInput,
  AfterSalesRecord,
  CreateOrderResult,
  Customer,
  MemberLevel,
  OrderStatus,
  Product,
  RepairOrder,
  RepairOrderInput,
  RepairTicket,
  ShopOrder,
  ShopOrderInput,
} from '../../types';

const clone = <T,>(v: T): T => JSON.parse(JSON.stringify(v)) as T;

/** 統一電話比對格式，忽略空格與符號 */
const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

function resolveLevel(totalSpent: number): MemberLevel {
  if (totalSpent >= 40000) return 'vip';
  if (totalSpent >= 15000) return 'gold';
  if (totalSpent >= 5000) return 'silver';
  return 'regular';
}

export const mockRepository: DataRepository = {
  source: 'mock',

  /* ── 客戶 ─────────────────────────────────── */
  async listCustomers() {
    return clone(
      [...getStore().customers].sort(
        (a, b) => new Date(b.lastOrderAt ?? b.createdAt).getTime() - new Date(a.lastOrderAt ?? a.createdAt).getTime(),
      ),
    );
  },

  async getCustomerById(id) {
    return clone(getStore().customers.find((c) => c.id === id) ?? null);
  },

  async findCustomerByPhone(phone) {
    const target = normalizePhone(phone);
    return clone(getStore().customers.find((c) => normalizePhone(c.phone) === target) ?? null);
  },

  async updateCustomer(id, patch) {
    const store = getStore();
    const index = store.customers.findIndex((c) => c.id === id);
    if (index < 0) return null;
    store.customers[index] = { ...store.customers[index], ...patch, id };
    return clone(store.customers[index]);
  },

  /* ── 維修訂單 ─────────────────────────────── */
  async createRepairOrder(input: RepairOrderInput): Promise<CreateOrderResult> {
    const store = getStore();
    const model = getModelById(input.deviceModelId);
    if (!model) throw new Error('找不到對應的產品型號');

    const quote = calculateQuote(input.deviceModelId, input.symptomIds);
    if (quote.items.length === 0) throw new Error('未能為所選故障產生報價');

    const now = new Date().toISOString();
    const targetPhone = normalizePhone(input.customerPhone);

    /* 自動建立或關聯會員檔案 */
    let customer = store.customers.find((c) => normalizePhone(c.phone) === targetPhone);
    const isNewMember = !customer;

    if (!customer) {
      customer = {
        id: `cus-${Date.now().toString(36)}`,
        memberNo: generateMemberNo(),
        name: input.customerName,
        phone: input.customerPhone,
        email: input.customerEmail,
        district: input.district,
        address: input.address,
        level: 'regular',
        points: 0,
        totalSpent: 0,
        orderCount: 0,
        tags: ['網上落單'],
        createdAt: now,
      };
      store.customers.unshift(customer);
    } else {
      customer.name = input.customerName || customer.name;
      customer.email = input.customerEmail || customer.email;
      customer.district = input.district || customer.district;
      customer.address = input.address || customer.address;
    }

    customer.orderCount += 1;
    customer.totalSpent += quote.total;
    customer.points += Math.floor(quote.total / 10);
    customer.level = resolveLevel(customer.totalSpent);
    customer.lastOrderAt = now;
    if (customer.orderCount >= 3 && !customer.tags.includes('回頭客')) {
      customer.tags.push('回頭客');
    }

    const order: RepairOrder = {
      id: `ord-${Date.now().toString(36)}`,
      orderNo: generateOrderNo(),
      customerId: customer.id,
      customerName: customer.name,
      customerPhone: customer.phone,
      deviceCategory: model.category,
      deviceModelId: model.id,
      deviceModelName: model.name,
      symptomIds: input.symptomIds,
      quote,
      serviceMode: input.serviceMode,
      shopName: input.shopName,
      address: input.address,
      appointmentAt: input.appointmentAt,
      remark: input.remark,
      status: 'submitted',
      timeline: [
        {
          status: 'submitted',
          at: now,
          note: '客戶於網上提交維修申請，系統即時生成報價單',
          operator: '系統',
        },
      ],
      technician: '待分派',
      createdAt: now,
      updatedAt: now,
    };

    store.orders.unshift(order);

    return { order: clone(order), customer: clone(customer), isNewMember };
  },

  async listRepairOrders() {
    return clone(
      [...getStore().orders].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  },

  async getRepairOrderByNo(orderNo) {
    const target = orderNo.trim().toUpperCase();
    return clone(getStore().orders.find((o) => o.orderNo.toUpperCase() === target) ?? null);
  },

  async findRepairOrdersByPhone(phone) {
    const target = normalizePhone(phone);
    if (!target) return [];
    return clone(
      getStore()
        .orders.filter((o) => normalizePhone(o.customerPhone) === target)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    );
  },

  async updateRepairOrderStatus(id, status: OrderStatus, note, operator) {
    const store = getStore();
    const order = store.orders.find((o) => o.id === id);
    if (!order) return null;

    const now = new Date().toISOString();
    order.status = status;
    order.updatedAt = now;
    order.timeline.push({
      status,
      at: now,
      note: note || statusMeta[status].description,
      operator: operator || '後台管理員',
    });

    const ticket = store.tickets.find((t) => t.orderId === order.id);
    if (ticket) {
      ticket.status = status;
      if (status === 'repairing' && !ticket.startedAt) ticket.startedAt = now;
      if (status === 'ready' || status === 'completed') ticket.finishedAt = now;
    } else if (status !== 'submitted' && status !== 'cancelled') {
      store.tickets.unshift(buildTicketFromOrder(order));
    }

    return clone(order);
  },

  /* ── 維修工單 ─────────────────────────────── */
  async listTickets() {
    return clone(
      [...getStore().tickets].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  },

  async getTicketByOrderNo(orderNo) {
    const target = orderNo.trim().toUpperCase();
    return clone(getStore().tickets.find((t) => t.orderNo.toUpperCase() === target) ?? null);
  },

  async assignTechnician(ticketId, technician) {
    const store = getStore();
    const ticket = store.tickets.find((t) => t.id === ticketId);
    if (!ticket) return null;
    ticket.technician = technician;
    const order = store.orders.find((o) => o.id === ticket.orderId);
    if (order) order.technician = technician;
    return clone(ticket);
  },

  /* ── 售後 ─────────────────────────────────── */
  async listAfterSales() {
    return clone(
      [...getStore().afterSales].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    );
  },

  async createAfterSales(input: AfterSalesInput) {
    const store = getStore();
    const now = new Date().toISOString();
    const record: AfterSalesRecord = {
      id: `as-${Date.now().toString(36)}`,
      caseNo: `AS-${now.slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 8999)}`,
      orderNo: input.orderNo,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      type: input.type,
      subject: input.subject,
      detail: input.detail,
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };
    store.afterSales.unshift(record);
    return clone(record);
  },

  async findAfterSalesByPhone(phone) {
    const target = normalizePhone(phone);
    if (!target) return [];
    return clone(
      getStore().afterSales.filter((a) => normalizePhone(a.customerPhone) === target),
    );
  },

  async updateAfterSales(id, patch) {
    const store = getStore();
    const index = store.afterSales.findIndex((a) => a.id === id);
    if (index < 0) return null;
    store.afterSales[index] = {
      ...store.afterSales[index],
      ...patch,
      id,
      updatedAt: new Date().toISOString(),
    };
    return clone(store.afterSales[index]);
  },

  /* ── 二手商店 ─────────────────────────────── */
  async listProducts() {
    return clone(getStore().products);
  },

  async getProduct(id) {
    return clone(getStore().products.find((p) => p.id === id) ?? null);
  },

  async createShopOrder(input: ShopOrderInput) {
    const store = getStore();
    const product = store.products.find((p) => p.id === input.productId);
    if (!product) throw new Error('找不到對應商品');
    if (product.stock < input.qty) throw new Error('商品庫存不足');

    product.stock -= input.qty;

    const order: ShopOrder = {
      id: `shp-${Date.now().toString(36)}`,
      orderNo: generateOrderNo('SH'),
      productId: product.id,
      productName: product.name,
      price: product.price,
      qty: input.qty,
      fulfillment: input.fulfillment,
      deliveryAddress: input.deliveryAddress,
      pickupShop: input.pickupShop,
      pickupAt: input.pickupAt,
      customerName: input.customerName,
      customerPhone: input.customerPhone,
      remark: input.remark,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    store.shopOrders.unshift(order);

    /* 二手機購買同樣建立／更新會員檔案 */
    const targetPhone = normalizePhone(input.customerPhone);
    const existing = store.customers.find((c) => normalizePhone(c.phone) === targetPhone);
    if (existing) {
      existing.totalSpent += product.price * input.qty;
      existing.points += Math.floor((product.price * input.qty) / 10);
      existing.level = resolveLevel(existing.totalSpent);
      existing.lastOrderAt = order.createdAt;
      if (!existing.tags.includes('二手機買家')) existing.tags.push('二手機買家');
    } else {
      store.customers.unshift({
        id: `cus-${Date.now().toString(36)}`,
        memberNo: generateMemberNo(),
        name: input.customerName,
        phone: input.customerPhone,
        address: input.deliveryAddress,
        level: 'regular',
        points: Math.floor((product.price * input.qty) / 10),
        totalSpent: product.price * input.qty,
        orderCount: 1,
        tags: ['二手機買家'],
        createdAt: order.createdAt,
        lastOrderAt: order.createdAt,
      });
    }

    return clone(order);
  },

  async listShopOrders() {
    return clone(getStore().shopOrders);
  },
};

function buildTicketFromOrder(order: RepairOrder): RepairTicket {
  const warrantyUntil = new Date();
  warrantyUntil.setDate(warrantyUntil.getDate() + (order.quote.warrantyDays || 90));

  return {
    id: `tkt-${Date.now().toString(36)}`,
    ticketNo: order.orderNo.replace('CR-', 'WO-'),
    orderId: order.id,
    orderNo: order.orderNo,
    deviceModelName: order.deviceModelName,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    symptomSummary: order.symptomIds.map((id) => getSymptomById(id)?.shortName ?? id).join('、'),
    technician: order.technician ?? '待分派',
    status: order.status,
    priority: order.quote.requiresLab || order.symptomIds.length >= 3 ? 'urgent' : 'normal',
    partsUsed: order.quote.items.map((i) => ({ name: i.partName, qty: 1, cost: i.partFee })),
    laborCost: order.quote.laborTotal,
    totalCost: order.quote.total,
    warrantyUntil: warrantyUntil.toISOString(),
    createdAt: order.createdAt,
  };
}

export type { Product, ShopOrder, Customer };
