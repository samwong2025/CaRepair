import { getModelById } from '../../data/devices';
import { getSymptomById } from '../../data/symptoms';
import { statusMeta } from '../../data/seed';
import { calculateQuote } from '../quote-engine';
import { generateMemberNo, generateOrderNo } from '../format';
import { getServerSupabase } from '../supabase/server';
import { loadModels, findModel } from '../catalog-store';
import { loadPricing, loadTierMultipliers, savePricing } from '../pricing-store';
import { loadInventory, saveInventory } from '../inventory-store';
import type { DataRepository } from './types';
import type {
  AfterSalesInput,
  AfterSalesRecord,
  CreateOrderResult,
  Customer,
  MemberLevel,
  OrderStatus,
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

const normalizePhone = (phone: string) => phone.replace(/\D/g, '');

function resolveLevel(totalSpent: number): MemberLevel {
  if (totalSpent >= 40000) return 'vip';
  if (totalSpent >= 15000) return 'gold';
  if (totalSpent >= 5000) return 'silver';
  return 'regular';
}

function client() {
  const supabase = getServerSupabase();
  if (!supabase) throw new Error('Supabase 尚未設定，請於 .env.local 填入連線資訊');
  return supabase;
}

/* ─── Row ⇄ 領域模型 映射 ───────────────────────── */

function rowToCustomer(row: Record<string, unknown>): Customer {
  return {
    id: row.id as string,
    memberNo: row.member_no as string,
    name: row.name as string,
    phone: row.phone as string,
    email: (row.email as string) ?? undefined,
    district: (row.district as string) ?? undefined,
    address: (row.address as string) ?? undefined,
    level: row.level as MemberLevel,
    points: Number(row.points ?? 0),
    totalSpent: Number(row.total_spent ?? 0),
    orderCount: Number(row.order_count ?? 0),
    tags: (row.tags as string[]) ?? [],
    note: (row.note as string) ?? undefined,
    createdAt: row.created_at as string,
    lastOrderAt: (row.last_order_at as string) ?? undefined,
  };
}

function rowToOrder(row: Record<string, unknown>): RepairOrder {
  return {
    id: row.id as string,
    orderNo: row.order_no as string,
    customerId: row.customer_id as string,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    deviceCategory: row.device_category as RepairOrder['deviceCategory'],
    deviceModelId: row.device_model_id as string,
    deviceModelName: row.device_model_name as string,
    symptomIds: (row.symptom_ids as string[]) ?? [],
    quote: row.quote as RepairOrder['quote'],
    serviceMode: row.service_mode as RepairOrder['serviceMode'],
    shopName: (row.shop_name as string) ?? undefined,
    address: (row.address as string) ?? undefined,
    appointmentAt: row.appointment_at as string,
    remark: (row.remark as string) ?? undefined,
    status: row.status as OrderStatus,
    timeline: (row.timeline as RepairOrder['timeline']) ?? [],
    technician: (row.technician as string) ?? undefined,
    partsUsed: (row.parts_used as RepairOrder['partsUsed']) ?? undefined,
    manualPrice: row.manual_price != null ? Number(row.manual_price) : undefined,
    priceNote: (row.price_note as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToTicket(row: Record<string, unknown>): RepairTicket {
  return {
    id: row.id as string,
    ticketNo: row.ticket_no as string,
    orderId: row.order_id as string,
    orderNo: row.order_no as string,
    deviceModelName: row.device_model_name as string,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    symptomSummary: row.symptom_summary as string,
    technician: row.technician as string,
    status: row.status as OrderStatus,
    priority: row.priority as RepairTicket['priority'],
    partsUsed: (row.parts_used as RepairTicket['partsUsed']) ?? [],
    laborCost: Number(row.labor_cost ?? 0),
    totalCost: Number(row.total_cost ?? 0),
    startedAt: (row.started_at as string) ?? undefined,
    finishedAt: (row.finished_at as string) ?? undefined,
    warrantyUntil: (row.warranty_until as string) ?? undefined,
    createdAt: row.created_at as string,
  };
}

function rowToAfterSales(row: Record<string, unknown>): AfterSalesRecord {
  return {
    id: row.id as string,
    caseNo: row.case_no as string,
    orderNo: row.order_no as string,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    type: row.type as AfterSalesRecord['type'],
    subject: row.subject as string,
    detail: row.detail as string,
    status: row.status as AfterSalesRecord['status'],
    handler: (row.handler as string) ?? undefined,
    resolution: (row.resolution as string) ?? undefined,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function rowToProduct(row: Record<string, unknown>): Product {
  return {
    id: row.id as string,
    name: row.name as string,
    category: row.category as Product['category'],
    storage: row.storage as string,
    color: row.color as string,
    grade: row.grade as Product['grade'],
    batteryHealth: Number(row.battery_health ?? 0),
    price: Number(row.price ?? 0),
    originalPrice: Number(row.original_price ?? 0),
    stock: Number(row.stock ?? 0),
    warrantyDays: Number(row.warranty_days ?? 0),
    image: row.image as string,
    highlights: (row.highlights as string[]) ?? [],
    description: row.description as string,
    accessories: (row.accessories as string[]) ?? [],
    services: (row.services as string[]) ?? [],
    hot: Boolean(row.hot),
  };
}

function rowToShopOrder(row: Record<string, unknown>): ShopOrder {
  return {
    id: row.id as string,
    orderNo: row.order_no as string,
    productId: row.product_id as string,
    productName: row.product_name as string,
    price: Number(row.price ?? 0),
    qty: Number(row.qty ?? 1),
    fulfillment: row.fulfillment as ShopOrder['fulfillment'],
    deliveryAddress: (row.delivery_address as string) ?? undefined,
    pickupShop: (row.pickup_shop as string) ?? undefined,
    pickupAt: (row.pickup_at as string) ?? undefined,
    customerName: row.customer_name as string,
    customerPhone: row.customer_phone as string,
    remark: (row.remark as string) ?? undefined,
    status: row.status as ShopOrder['status'],
    createdAt: row.created_at as string,
  };
}

/* ─── Supabase 實作 ─────────────────────────────── */

export const supabaseRepository: DataRepository = {
  source: 'supabase',

  async listCustomers() {
    const { data, error } = await client()
      .from('customers')
      .select('*')
      .order('last_order_at', { ascending: false, nullsFirst: false });
    if (error) {
      console.error('[supabase] listCustomers', error.message);
      return [];
    }
    return (data ?? []).map(rowToCustomer);
  },

  async getCustomerById(id) {
    const { data, error } = await client().from('customers').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('[supabase] getCustomerById', error.message);
      return null;
    }
    return data ? rowToCustomer(data) : null;
  },

  async findCustomerByPhone(phone) {
    const { data, error } = await client()
      .from('customers')
      .select('*')
      .eq('phone_digits', normalizePhone(phone))
      .maybeSingle();
    if (error) {
      console.error('[supabase] findCustomerByPhone', error.message);
      return null;
    }
    return data ? rowToCustomer(data) : null;
  },

  async updateCustomer(id, patch) {
    const payload: Record<string, unknown> = {};
    if (patch.name !== undefined) payload.name = patch.name;
    if (patch.phone !== undefined) payload.phone = patch.phone;
    if (patch.email !== undefined) payload.email = patch.email;
    if (patch.district !== undefined) payload.district = patch.district;
    if (patch.address !== undefined) payload.address = patch.address;
    if (patch.tags !== undefined) payload.tags = patch.tags;
    if (patch.note !== undefined) payload.note = patch.note;
    if (patch.level !== undefined) payload.level = patch.level;

    const { data, error } = await client()
      .from('customers')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[supabase] updateCustomer', error.message);
      return null;
    }
    return data ? rowToCustomer(data) : null;
  },

  async createRepairOrder(input: RepairOrderInput): Promise<CreateOrderResult> {
    const supabase = client();
    const models = await loadModels();
    const model = findModel(models, input.deviceModelId) ?? getModelById(input.deviceModelId);
    if (!model) throw new Error('找不到對應的產品型號');

    const pricing = await loadPricing();
    const tiers = await loadTierMultipliers();
    const quote = calculateQuote(model.id, input.symptomIds, pricing, model, tiers);
    if (quote.items.length === 0) throw new Error('未能為所選故障產生報價');

    const now = new Date().toISOString();
    const phoneDigits = normalizePhone(input.customerPhone);

    const { data: existing } = await supabase
      .from('customers')
      .select('*')
      .eq('phone_digits', phoneDigits)
      .maybeSingle();

    let customer: Customer;
    const isNewMember = !existing;

    if (existing) {
      const prev = rowToCustomer(existing);
      const totalSpent = prev.totalSpent + quote.total;
      const tags = prev.tags.includes('回頭客') || prev.orderCount + 1 < 3
        ? prev.tags
        : [...prev.tags, '回頭客'];

      const { data: updated, error } = await supabase
        .from('customers')
        .update({
          name: input.customerName || prev.name,
          email: input.customerEmail ?? prev.email,
          district: input.district ?? prev.district,
          address: input.address ?? prev.address,
          order_count: prev.orderCount + 1,
          total_spent: totalSpent,
          points: prev.points + Math.floor(quote.total / 10),
          level: resolveLevel(totalSpent),
          tags,
          last_order_at: now,
        })
        .eq('id', prev.id)
        .select('*')
        .single();
      if (error) throw new Error(`更新會員檔案失敗：${error.message}`);
      customer = rowToCustomer(updated);
    } else {
      const { data: created, error } = await supabase
        .from('customers')
        .insert({
          member_no: generateMemberNo(),
          name: input.customerName,
          phone: input.customerPhone,
          phone_digits: phoneDigits,
          email: input.customerEmail,
          district: input.district,
          address: input.address,
          level: resolveLevel(quote.total),
          points: Math.floor(quote.total / 10),
          total_spent: quote.total,
          order_count: 1,
          tags: ['網上落單'],
          last_order_at: now,
        })
        .select('*')
        .single();
      if (error) throw new Error(`建立會員檔案失敗：${error.message}`);
      customer = rowToCustomer(created);
    }

    const orderNo = generateOrderNo();
    const { data: orderRow, error: orderError } = await supabase
      .from('repair_orders')
      .insert({
        order_no: orderNo,
        customer_id: customer.id,
        customer_name: customer.name,
        customer_phone: customer.phone,
        phone_digits: phoneDigits,
        device_category: model.category,
        device_model_id: model.id,
        device_model_name: model.name,
        symptom_ids: input.symptomIds,
        quote,
        service_mode: input.serviceMode,
        shop_name: input.shopName,
        address: input.address,
        appointment_at: input.appointmentAt,
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
      })
      .select('*')
      .single();
    if (orderError) throw new Error(`建立維修訂單失敗：${orderError.message}`);

    const order = rowToOrder(orderRow);

    /* 同步開立維修工單，供後台維修管理系統使用 */
    const warrantyUntil = new Date();
    warrantyUntil.setDate(warrantyUntil.getDate() + (quote.warrantyDays || 90));
    const { error: ticketError } = await supabase.from('repair_tickets').insert({
      ticket_no: orderNo.replace('CR-', 'WO-'),
      order_id: order.id,
      order_no: orderNo,
      device_model_name: model.name,
      customer_name: customer.name,
      customer_phone: customer.phone,
      symptom_summary: input.symptomIds.map((id) => getSymptomById(id)?.shortName ?? id).join('、'),
      technician: '待分派',
      status: 'submitted',
      priority: quote.requiresLab || input.symptomIds.length >= 3 ? 'urgent' : 'normal',
      parts_used: quote.items.map((i) => ({ name: i.partName, qty: 1, cost: i.partFee })),
      labor_cost: quote.laborTotal,
      total_cost: quote.total,
      warranty_until: warrantyUntil.toISOString(),
    });
    if (ticketError) console.error('[supabase] createTicket', ticketError.message);

    return { order, customer, isNewMember };
  },

  async listRepairOrders() {
    const { data, error } = await client()
      .from('repair_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[supabase] listRepairOrders', error.message);
      return [];
    }
    return (data ?? []).map(rowToOrder);
  },

  async getRepairOrderByNo(orderNo) {
    const { data, error } = await client()
      .from('repair_orders')
      .select('*')
      .ilike('order_no', orderNo.trim())
      .maybeSingle();
    if (error) {
      console.error('[supabase] getRepairOrderByNo', error.message);
      return null;
    }
    return data ? rowToOrder(data) : null;
  },

  async findRepairOrdersByPhone(phone) {
    const { data, error } = await client()
      .from('repair_orders')
      .select('*')
      .eq('phone_digits', normalizePhone(phone))
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[supabase] findRepairOrdersByPhone', error.message);
      return [];
    }
    return (data ?? []).map(rowToOrder);
  },

  async updateRepairOrderStatus(id, status, note, operator) {
    const supabase = client();
    const { data: current, error: readError } = await supabase
      .from('repair_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (readError || !current) {
      console.error('[supabase] updateRepairOrderStatus read', readError?.message);
      return null;
    }

    const order = rowToOrder(current);
    const now = new Date().toISOString();
    const timeline = [
      ...order.timeline,
      {
        status,
        at: now,
        note: note || statusMeta[status].description,
        operator: operator || '後台管理員',
      },
    ];

    const { data, error } = await supabase
      .from('repair_orders')
      .update({ status, timeline, updated_at: now })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[supabase] updateRepairOrderStatus', error.message);
      return null;
    }

    const ticketPatch: Record<string, unknown> = { status };
    if (status === 'repairing') ticketPatch.started_at = now;
    if (status === 'ready' || status === 'completed') ticketPatch.finished_at = now;
    await supabase.from('repair_tickets').update(ticketPatch).eq('order_id', id);

    return data ? rowToOrder(data) : null;
  },

  async updateRepairOrder(id, patch: RepairOrderEditPatch) {
    const supabase = client();
    const { data: current, error: readError } = await supabase
      .from('repair_orders')
      .select('*')
      .eq('id', id)
      .maybeSingle();
    if (readError || !current) {
      console.error('[supabase] updateRepairOrder read', readError?.message);
      return null;
    }

    const order = rowToOrder(current);
    const now = new Date().toISOString();
    const operator = patch.operator || '後台管理員';
    const timelineAdditions: { status: OrderStatus; at: string; note: string; operator: string }[] = [];

    /* 型號 / 故障變更 → 重算報價 */
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
    }

    if (patch.technician !== undefined && patch.technician !== order.technician) {
      const prev = order.technician ?? '待分派';
      order.technician = patch.technician;
      timelineAdditions.push({ status: order.status, at: now, note: `師傅 ${prev} → ${patch.technician}`, operator });
    }
    if (patch.customerName !== undefined) order.customerName = patch.customerName;
    if (patch.customerPhone !== undefined) order.customerPhone = patch.customerPhone;
    if (patch.shopName !== undefined) order.shopName = patch.shopName ?? undefined;
    if (patch.appointmentAt !== undefined) order.appointmentAt = patch.appointmentAt;
    if (patch.remark !== undefined) order.remark = patch.remark ?? undefined;

    if (patch.partsUsed !== undefined) {
      order.partsUsed = patch.partsUsed.map((p) => ({ ...p }));
      const partsSummary = order.partsUsed.map((p) => `${p.name}×${p.qty}`).join('、') || '（無）';
      timelineAdditions.push({
        status: order.status,
        at: now,
        note: `選用庫存配件：${partsSummary}`,
        operator,
      });
    }

    /* 講價 / 人工改價 */
    if (patch.manualPrice !== undefined || patch.priceNote !== undefined) {
      const systemPrice = order.quote?.total ?? 0;
      if (patch.manualPrice !== undefined) {
        order.manualPrice = patch.manualPrice === null ? undefined : patch.manualPrice;
      }
      if (patch.priceNote !== undefined) {
        order.priceNote = patch.priceNote === null ? undefined : patch.priceNote;
      }
      const finalPrice = order.manualPrice ?? systemPrice;
      const delta = finalPrice - systemPrice;
      let noteText: string;
      if (order.manualPrice === undefined) {
        noteText = `報價復原為系統價 HK$${systemPrice.toLocaleString()}`;
      } else if (delta < 0) {
        noteText = `講價優惠 HK$${finalPrice.toLocaleString()}（原價 HK$${systemPrice.toLocaleString()}，減 HK$${Math.abs(delta).toLocaleString()}）${order.priceNote ? `：${order.priceNote}` : ''}`;
      } else if (delta > 0) {
        noteText = `報價調整為 HK$${finalPrice.toLocaleString()}（原價 HK$${systemPrice.toLocaleString()}，加 HK$${delta.toLocaleString()}）${order.priceNote ? `：${order.priceNote}` : ''}`;
      } else {
        noteText = `報價維持 HK$${finalPrice.toLocaleString()}${order.priceNote ? `：${order.priceNote}` : ''}`;
      }
      timelineAdditions.push({ status: order.status, at: now, note: noteText, operator });
    }

    if (patch.note) {
      timelineAdditions.push({ status: order.status, at: now, note: patch.note, operator });
    }

    const payload: Record<string, unknown> = {
      device_model_id: order.deviceModelId,
      device_category: order.deviceCategory,
      device_model_name: order.deviceModelName,
      symptom_ids: order.symptomIds,
      quote: order.quote,
      technician: order.technician,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      shop_name: order.shopName,
      appointment_at: order.appointmentAt,
      remark: order.remark,
      parts_used: order.partsUsed ?? null,
      manual_price: order.manualPrice ?? null,
      price_note: order.priceNote ?? null,
      timeline: [...order.timeline, ...timelineAdditions],
      updated_at: now,
    };

    const { data, error } = await supabase
      .from('repair_orders')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[supabase] updateRepairOrder', error.message);
      return null;
    }

    /* 同步工單 */
    const ticketPatch: Record<string, unknown> = {
      device_model_name: order.deviceModelName,
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      technician: order.technician ?? '待分派',
    };
    if (quoteChanged) {
      ticketPatch.symptom_summary = order.symptomIds
        .map((sid) => getSymptomById(sid)?.shortName ?? sid)
        .join('、');
      ticketPatch.total_cost = order.quote.total;
      ticketPatch.labor_cost = order.quote.laborTotal;
      ticketPatch.parts_used = order.quote.items.map((i) => ({ name: i.partName, qty: 1, cost: i.partFee }));
    }
    await supabase.from('repair_tickets').update(ticketPatch).eq('order_id', id);

    return data ? rowToOrder(data) : null;
  },

  async listTickets() {
    const { data, error } = await client()
      .from('repair_tickets')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[supabase] listTickets', error.message);
      return [];
    }
    return (data ?? []).map(rowToTicket);
  },

  async getTicketByOrderNo(orderNo) {
    const { data, error } = await client()
      .from('repair_tickets')
      .select('*')
      .ilike('order_no', orderNo.trim())
      .maybeSingle();
    if (error) {
      console.error('[supabase] getTicketByOrderNo', error.message);
      return null;
    }
    return data ? rowToTicket(data) : null;
  },

  async assignTechnician(ticketId, technician) {
    const { data, error } = await client()
      .from('repair_tickets')
      .update({ technician })
      .eq('id', ticketId)
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[supabase] assignTechnician', error.message);
      return null;
    }
    return data ? rowToTicket(data) : null;
  },

  async listAfterSales() {
    const { data, error } = await client()
      .from('after_sales')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[supabase] listAfterSales', error.message);
      return [];
    }
    return (data ?? []).map(rowToAfterSales);
  },

  async createAfterSales(input: AfterSalesInput) {
    const now = new Date();
    const { data, error } = await client()
      .from('after_sales')
      .insert({
        case_no: `AS-${now.toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(1000 + Math.random() * 8999)}`,
        order_no: input.orderNo,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        phone_digits: normalizePhone(input.customerPhone),
        type: input.type,
        subject: input.subject,
        detail: input.detail,
        status: 'pending',
      })
      .select('*')
      .single();
    if (error) throw new Error(`建立售後個案失敗：${error.message}`);
    return rowToAfterSales(data);
  },

  async findAfterSalesByPhone(phone) {
    const { data, error } = await client()
      .from('after_sales')
      .select('*')
      .eq('phone_digits', normalizePhone(phone))
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[supabase] findAfterSalesByPhone', error.message);
      return [];
    }
    return (data ?? []).map(rowToAfterSales);
  },

  async updateAfterSales(id, patch) {
    const payload: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (patch.status !== undefined) payload.status = patch.status;
    if (patch.handler !== undefined) payload.handler = patch.handler;
    if (patch.resolution !== undefined) payload.resolution = patch.resolution;

    const { data, error } = await client()
      .from('after_sales')
      .update(payload)
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[supabase] updateAfterSales', error.message);
      return null;
    }
    return data ? rowToAfterSales(data) : null;
  },

  async listProducts() {
    const { data, error } = await client().from('products').select('*').order('price');
    if (error) {
      console.error('[supabase] listProducts', error.message);
      return [];
    }
    return (data ?? []).map(rowToProduct);
  },

  async getProduct(id) {
    const { data, error } = await client().from('products').select('*').eq('id', id).maybeSingle();
    if (error) {
      console.error('[supabase] getProduct', error.message);
      return null;
    }
    return data ? rowToProduct(data) : null;
  },

  async upsertProduct(product: Product) {
    const { data, error } = await client()
      .from('products')
      .upsert({
        id: product.id,
        name: product.name,
        category: product.category,
        storage: product.storage,
        color: product.color,
        grade: product.grade,
        battery_health: product.batteryHealth,
        price: product.price,
        original_price: product.originalPrice,
        stock: product.stock,
        warranty_days: product.warrantyDays,
        image: product.image,
        highlights: product.highlights,
        description: product.description,
        accessories: product.accessories,
        services: product.services,
        hot: product.hot,
      })
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[supabase] upsertProduct', error.message);
      throw new Error(`儲存商品失敗：${error.message}`);
    }
    return data ? rowToProduct(data) : product;
  },

  async createShopOrder(input: ShopOrderInput) {
    const supabase = client();
    const { data: productRow, error: productError } = await supabase
      .from('products')
      .select('*')
      .eq('id', input.productId)
      .maybeSingle();
    if (productError || !productRow) throw new Error('找不到對應商品');

    const product = rowToProduct(productRow);
    if (product.stock < input.qty) throw new Error('商品庫存不足');

    const { data, error } = await supabase
      .from('shop_orders')
      .insert({
        order_no: generateOrderNo('SH'),
        product_id: product.id,
        product_name: product.name,
        price: product.price,
        qty: input.qty,
        fulfillment: input.fulfillment,
        delivery_address: input.deliveryAddress,
        pickup_shop: input.pickupShop,
        pickup_at: input.pickupAt,
        customer_name: input.customerName,
        customer_phone: input.customerPhone,
        phone_digits: normalizePhone(input.customerPhone),
        remark: input.remark,
        status: 'pending',
      })
      .select('*')
      .single();
    if (error) throw new Error(`建立商店訂單失敗：${error.message}`);

    await supabase
      .from('products')
      .update({ stock: product.stock - input.qty })
      .eq('id', product.id);

    return rowToShopOrder(data);
  },

  async listShopOrders() {
    const { data, error } = await client()
      .from('shop_orders')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[supabase] listShopOrders', error.message);
      return [];
    }
    return (data ?? []).map(rowToShopOrder);
  },

  async updateShopOrderStatus(id, status: ShopOrder['status']) {
    const { data, error } = await client()
      .from('shop_orders')
      .update({ status })
      .eq('id', id)
      .select('*')
      .maybeSingle();
    if (error) {
      console.error('[supabase] updateShopOrderStatus', error.message);
      return null;
    }
    return data ? rowToShopOrder(data) : null;
  },

  async listPricing(): Promise<SymptomPricing[]> {
    return loadPricing();
  },

  async upsertPricing(rule: SymptomPricing): Promise<SymptomPricing | null> {
    const result = await savePricing(rule);
    return result.ok ? rule : null;
  },

  async listInventory(): Promise<Part[]> {
    return loadInventory();
  },

  async upsertInventory(part: Part): Promise<Part | null> {
    const result = await saveInventory(part);
    return result.ok ? part : null;
  },

  async listStockMovements(): Promise<StockMovement[]> {
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
};

function arraysEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  const set = new Set(a);
  return b.every((x) => set.has(x));
}
