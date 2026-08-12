import { getModelById } from '../../data/devices';
import { getSymptomById } from '../../data/symptoms';
import { statusMeta } from '../../data/seed';
import { loadModels, findModel } from '../catalog-store';
import { loadPricing, loadTierMultipliers } from '../pricing-store';
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
  OrderTimelineEntry,
  Part,
  Product,
  RepairOrder,
  RepairOrderEditPatch,
  RepairOrderInput,
  RepairTicket,
  ShopOrder,
  ShopOrderInput,
  StockMovement,
  StockMovementType,
  SymptomPricing,
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
    const models = await loadModels();
    const model = findModel(models, input.deviceModelId) ?? getModelById(input.deviceModelId);
    if (!model) throw new Error('找不到對應的產品型號');

    const pricing = await loadPricing();
    const tiers = await loadTierMultipliers();
    const quote = calculateQuote(model.id, input.symptomIds, pricing, model, tiers);
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
      source: input.source ?? 'manual',
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

  async updateRepairOrder(id, patch: RepairOrderEditPatch) {
    const store = getStore();
    const order = store.orders.find((o) => o.id === id);
    if (!order) return null;

    const now = new Date().toISOString();
    const operator = patch.operator || '後台管理員';
    const timelineAdditions: OrderTimelineEntry[] = [];

    /* 型號 / 故障變更 → 重算報價（同步工單） */
    let quoteChanged = false;
    if (patch.deviceModelId && patch.deviceModelId !== order.deviceModelId) {
      const models = await loadModels();
      const model = findModel(models, patch.deviceModelId) ?? getModelById(patch.deviceModelId);
      if (!model) throw new Error('找不到對應的產品型號');
      order.deviceModelId = model.id;
      order.deviceCategory = model.category;
      order.deviceModelName = model.name;
      quoteChanged = true;
      timelineAdditions.push({ status: order.status, at: now, note: `型號改為 ${model.name}`, operator });
    }
    if (patch.symptomIds && !arraysEqual(patch.symptomIds, order.symptomIds)) {
      order.symptomIds = [...patch.symptomIds];
      quoteChanged = true;
      const names = order.symptomIds.map((sid) => getSymptomById(sid)?.shortName ?? sid).join('、');
      timelineAdditions.push({ status: order.status, at: now, note: `故障改為 ${names}`, operator });
    }
    if (quoteChanged) {
      const models = await loadModels();
      const pricing = await loadPricing();
      const tiers = await loadTierMultipliers();
      const model = findModel(models, order.deviceModelId) ?? getModelById(order.deviceModelId);
      if (!model) throw new Error('重算報價時找不到對應型號');
      const newQuote = calculateQuote(order.deviceModelId, order.symptomIds, pricing, model, tiers);
      if (newQuote.items.length === 0) throw new Error('所選故障組合無法產生報價');
      order.quote = newQuote;
      const ticket = store.tickets.find((t) => t.orderId === order.id);
      if (ticket) {
        ticket.deviceModelName = order.deviceModelName;
        ticket.symptomSummary = order.symptomIds.map((sid) => getSymptomById(sid)?.shortName ?? sid).join('、');
        ticket.totalCost = newQuote.total;
        ticket.laborCost = newQuote.laborTotal;
        ticket.partsUsed = newQuote.items.map((i) => ({ name: i.partName, qty: 1, cost: i.partFee }));
      }
    }

    if (patch.technician !== undefined && patch.technician !== order.technician) {
      const prev = order.technician ?? '待分派';
      order.technician = patch.technician;
      timelineAdditions.push({ status: order.status, at: now, note: `師傅 ${prev} → ${patch.technician}`, operator });
      const ticket = store.tickets.find((t) => t.orderId === order.id);
      if (ticket) ticket.technician = patch.technician ?? '待分派';
    }

    if (patch.customerName !== undefined && patch.customerName !== order.customerName) {
      order.customerName = patch.customerName;
      timelineAdditions.push({ status: order.status, at: now, note: `客戶姓名更正`, operator });
    }
    if (patch.customerPhone !== undefined && patch.customerPhone !== order.customerPhone) {
      order.customerPhone = patch.customerPhone;
      timelineAdditions.push({ status: order.status, at: now, note: `客戶電話更正`, operator });
    }
    if (patch.shopName !== undefined) order.shopName = patch.shopName ?? undefined;
    if (patch.appointmentAt !== undefined && patch.appointmentAt !== order.appointmentAt) {
      order.appointmentAt = patch.appointmentAt;
      timelineAdditions.push({ status: order.status, at: now, note: `預約時間更正`, operator });
    }
    if (patch.remark !== undefined) order.remark = patch.remark ?? undefined;

    if (patch.partsUsed !== undefined) {
      const prevCount = order.partsUsed?.length ?? 0;
      order.partsUsed = patch.partsUsed.map((p) => ({ ...p }));
      const partsSummary = order.partsUsed.map((p) => `${p.name}×${p.qty}`).join('、') || '（無）';
      timelineAdditions.push({
        status: order.status,
        at: now,
        note: `選用庫存配件：${partsSummary}`,
        operator,
      });
      void prevCount;
    }

    /* 講價 / 人工改價 */
    if (patch.manualPrice !== undefined || patch.priceNote !== undefined) {
      const prevPrice = order.manualPrice;
      const systemPrice = order.quote?.total ?? 0;
      if (patch.manualPrice !== undefined) {
        order.manualPrice = patch.manualPrice === null ? undefined : patch.manualPrice;
      }
      if (patch.priceNote !== undefined) {
        order.priceNote = patch.priceNote === null ? undefined : patch.priceNote;
      }
      const finalPrice = order.manualPrice ?? systemPrice;
      const delta = finalPrice - systemPrice;
      let noteText = '報價調整';
      if (order.manualPrice === undefined) {
        noteText = `報價復原為系統價 HK$${systemPrice.toLocaleString()}`;
      } else if (delta < 0) {
        noteText = `講價優惠 HK$${finalPrice.toLocaleString()}（原價 HK$${systemPrice.toLocaleString()}，減 HK$${Math.abs(delta).toLocaleString()}）${order.priceNote ? `：${order.priceNote}` : ''}`;
      } else if (delta > 0) {
        noteText = `報價調整為 HK$${finalPrice.toLocaleString()}（原價 HK$${systemPrice.toLocaleString()}，加 HK$${delta.toLocaleString()}）${order.priceNote ? `：${order.priceNote}` : ''}`;
      } else {
        noteText = `報價維持 HK$${finalPrice.toLocaleString()}${order.priceNote ? `：${order.priceNote}` : ''}`;
      }
      void prevPrice;
      timelineAdditions.push({ status: order.status, at: now, note: noteText, operator });
    }

    if (patch.note) {
      timelineAdditions.push({ status: order.status, at: now, note: patch.note, operator });
    }

    order.updatedAt = now;
    if (timelineAdditions.length) order.timeline.push(...timelineAdditions);

    return clone(order);
  },

  async deleteRepairOrder(id: string) {
    const store = getStore();
    const idx = store.orders.findIndex((o) => o.id === id);
    if (idx === -1) return false;
    store.orders.splice(idx, 1);
    /* 一併移除關聯工單 */
    store.tickets = store.tickets.filter((t) => t.orderId !== id);
    return true;
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

  async upsertProduct(product: Product) {
    const store = getStore();
    const idx = store.products.findIndex((p) => p.id === product.id);
    if (idx >= 0) {
      store.products[idx] = { ...store.products[idx], ...product };
    } else {
      store.products.push(product);
    }
    return clone(product);
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

  async updateShopOrderStatus(id, status: ShopOrder['status']) {
    const store = getStore();
    const order = store.shopOrders.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    return clone(order);
  },

  async updateShopOrderCustomer(id, patch) {
    const store = getStore();
    const order = store.shopOrders.find((o) => o.id === id);
    if (!order) return null;
    order.customerName = patch.customerName;
    order.customerPhone = patch.customerPhone;
    if (patch.remark !== undefined) order.remark = patch.remark;
    return clone(order);
  },

  async listPricing() {
    const { loadPricing: load } = await import('../pricing-store');
    return load();
  },

  async upsertPricing(rule: SymptomPricing) {
    const { savePricing } = await import('../pricing-store');
    const result = await savePricing(rule);
    return result.ok ? rule : null;
  },

  async listInventory() {
    const { loadInventory } = await import('../inventory-store');
    return loadInventory();
  },

  async upsertInventory(part: Part) {
    const { saveInventory } = await import('../inventory-store');
    const result = await saveInventory(part);
    return result.ok ? part : null;
  },

  async listStockMovements() {
    const { loadMovements } = await import('../inventory-store');
    return loadMovements();
  },

  async addStockMovement(input: {
    part: Part;
    type: StockMovementType;
    qty: number;
    unitCost?: number;
    note?: string;
    refOrderNo?: string;
  }) {
    const { recordMovement } = await import('../inventory-store');
    return recordMovement(input);
  },

  /* 商品分類 */
  async listCategories() {
    return clone(getStore().categories);
  },
  async upsertCategory(data: import('../../types').ProductCategory) {
    const store = getStore();
    const idx = store.categories.findIndex((c) => c.id === data.id);
    const next: import('../../types').ProductCategory = { ...data, updatedAt: new Date().toISOString() };
    if (idx >= 0) store.categories[idx] = next;
    else store.categories.push(next);
    return clone(next);
  },
  async deleteCategory(id: string) {
    const store = getStore();
    store.categories = store.categories.filter((c) => c.id !== id);
    return true;
  },

  /* 往來單位 */
  async listCounterparties() {
    return clone(getStore().counterparties);
  },
  async upsertCounterparty(data: import('../../types').Counterparty) {
    const store = getStore();
    const idx = store.counterparties.findIndex((c) => c.id === data.id);
    const next: import('../../types').Counterparty = { ...data, updatedAt: new Date().toISOString() };
    if (idx >= 0) store.counterparties[idx] = next;
    else store.counterparties.push(next);
    return clone(next);
  },
  async getCounterparty(id: string) {
    const found = getStore().counterparties.find((c) => c.id === id);
    return found ? clone(found) : null;
  },
  async deleteCounterparty(id: string) {
    const store = getStore();
    store.counterparties = store.counterparties.filter((c) => c.id !== id);
    return true;
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

/** 陣列順序無關的相等比對（症狀比較用） */
function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((x) => set.has(x));
}

export type { Product, ShopOrder, Customer };
