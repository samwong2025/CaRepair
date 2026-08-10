import { Barcode } from './barcode';
import { statusMeta } from '../../data/seed';
import { siteConfig } from '../../config/site';
import { formatDateTime, formatHKD } from '../../lib/format';
import type { RepairOrder } from '../../types';

/**
 * 維修識別標籤（貼於機身袋 / 維修托盤）
 * 尺寸對應常用 70mm × 100mm 標籤紙，列印時單頁一張。
 */
export function RepairLabel({ order }: { order: RepairOrder }) {
  const meta = statusMeta[order.status];

  return (
    <div className="print-sheet mx-auto w-[70mm] border border-slate-900 bg-white p-3 text-slate-900">
      <div className="flex items-center justify-between border-b border-slate-900 pb-2">
        <div className="flex items-center gap-1.5">
          <img src="/logo-mark.png" alt="CathyRepair" className="h-7 w-7" />
          <div>
            <p className="text-[0.72rem] font-extrabold leading-none">CathyRepair</p>
            <p className="mt-1 text-[0.58rem] leading-none text-slate-600">維修識別標籤 REPAIR TAG</p>
          </div>
        </div>
        <span className="rounded border border-slate-900 px-1.5 py-0.5 text-[0.58rem] font-bold">
          {meta.label}
        </span>
      </div>

      <div className="mt-2">
        <Barcode value={order.orderNo} height={38} />
      </div>

      <dl className="mt-2 space-y-1 text-[0.62rem] leading-tight">
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-slate-500">客戶</dt>
          <dd className="font-bold">
            {order.customerName}・{order.customerPhone}
          </dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-slate-500">機型</dt>
          <dd className="font-bold">{order.deviceModelName}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-slate-500">故障</dt>
          <dd className="font-bold">{order.quote.items.map((item) => item.name).join('、')}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-slate-500">配件</dt>
          <dd>{order.quote.items.map((item) => item.partName).join('、')}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-slate-500">技師</dt>
          <dd className="font-bold">{order.technician ?? '待分派'}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-slate-500">收機</dt>
          <dd>{formatDateTime(order.createdAt)}</dd>
        </div>
        <div className="flex gap-2">
          <dt className="w-14 shrink-0 text-slate-500">約定</dt>
          <dd>{formatDateTime(order.appointmentAt)}</dd>
        </div>
      </dl>

      <div className="mt-2 flex items-end justify-between border-t border-dashed border-slate-400 pt-2">
        <div className="text-[0.58rem] leading-tight text-slate-600">
          <p>{order.shopName ?? siteConfig.shops[0].name}</p>
          <p>{siteConfig.hotline}</p>
        </div>
        <div className="text-right">
          <p className="text-[0.55rem] text-slate-500">應收</p>
          <p className="text-base font-extrabold leading-none">{formatHKD(order.quote.total)}</p>
        </div>
      </div>

      {order.remark ? (
        <p className="mt-2 border-t border-dashed border-slate-400 pt-1.5 text-[0.55rem] leading-snug text-slate-600">
          備註：{order.remark}
        </p>
      ) : null}
    </div>
  );
}
