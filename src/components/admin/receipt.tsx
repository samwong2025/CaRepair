import { Barcode } from './barcode';
import { siteConfig } from '../../config/site';
import { formatDateTime, formatFullDate, formatHKD, effectivePrice, isDiscounted } from '../../lib/format';
import { formatDuration } from '../../lib/quote-engine';
import type { RepairOrder } from '../../types';

const serviceModeLabel: Record<string, string> = {
  walk_in: '到店維修',
  pickup: '順豐寄修',
  mail_in: '自行寄件',
};

function warrantyUntil(order: RepairOrder): string {
  const base = new Date(order.updatedAt || order.createdAt);
  base.setDate(base.getDate() + order.quote.warrantyDays);
  return formatFullDate(base);
}

/** 售後收據（A4 列印） */
export function Receipt({ order }: { order: RepairOrder }) {
  const shop = siteConfig.shops.find((item) => item.name === order.shopName) ?? siteConfig.shops[0];

  return (
    <div className="print-sheet mx-auto w-full max-w-[190mm] bg-white p-8 text-slate-900">
      <header className="flex items-start justify-between border-b-2 border-slate-900 pb-4">
        <div className="flex items-start gap-2.5">
          <img src="/logo-mark.png" alt="CathyRepair" className="h-10 w-10" />
          <div>
            <p className="text-xl font-extrabold leading-none">CathyRepair</p>
            <p className="mt-1.5 text-xs text-slate-600">{siteConfig.slogan}</p>
            <p className="mt-2 text-[0.7rem] leading-relaxed text-slate-600">
              {shop.name}｜{shop.address}
              <br />
              電話 {siteConfig.hotline}｜WhatsApp {siteConfig.whatsapp}｜{siteConfig.email}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-base font-extrabold">維修服務收據</p>
          <p className="text-[0.7rem] text-slate-500">SERVICE RECEIPT</p>
          <div className="mt-3">
            <Barcode value={order.orderNo} height={36} />
          </div>
        </div>
      </header>

      <section className="mt-5 grid grid-cols-2 gap-x-8 gap-y-2 text-[0.78rem]">
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-slate-500">客戶姓名</span>
          <span className="font-bold">{order.customerName}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-slate-500">聯絡電話</span>
          <span className="font-bold">{order.customerPhone}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-slate-500">維修機型</span>
          <span className="font-bold">{order.deviceModelName}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-slate-500">服務方式</span>
          <span className="font-bold">{serviceModeLabel[order.serviceMode] ?? order.serviceMode}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-slate-500">收機時間</span>
          <span>{formatDateTime(order.createdAt)}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-slate-500">完成時間</span>
          <span>{formatDateTime(order.updatedAt)}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-slate-500">主理技師</span>
          <span className="font-bold">{order.technician ?? '—'}</span>
        </div>
        <div className="flex gap-2">
          <span className="w-20 shrink-0 text-slate-500">保養到期</span>
          <span className="font-bold">{warrantyUntil(order)}</span>
        </div>
      </section>

      <table className="mt-5 w-full border-collapse text-[0.78rem]">
        <thead>
          <tr className="border-y border-slate-900 bg-slate-50">
            <th className="py-2 text-left font-bold">維修項目 / 使用配件</th>
            <th className="w-20 py-2 text-right font-bold">配件費</th>
            <th className="w-20 py-2 text-right font-bold">人工費</th>
            <th className="w-24 py-2 text-right font-bold">小計</th>
          </tr>
        </thead>
        <tbody>
          {order.quote.items.map((item) => (
            <tr key={item.symptomId} className="border-b border-slate-200">
              <td className="py-2.5">
                <p className="font-bold">{item.name}</p>
                <p className="mt-0.5 text-[0.68rem] text-slate-500">
                  {item.partName}・工時 {formatDuration(item.durationMinutes)}・保養{' '}
                  {item.warrantyDays} 日
                </p>
              </td>
              <td className="py-2.5 text-right">{formatHKD(item.partFee)}</td>
              <td className="py-2.5 text-right">{formatHKD(item.laborFee)}</td>
              <td className="py-2.5 text-right font-bold">{formatHKD(item.subtotal)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="mt-4 flex justify-end">
        <dl className="w-64 space-y-1.5 text-[0.78rem]">
          <div className="flex justify-between">
            <dt className="text-slate-600">配件費小計</dt>
            <dd>{formatHKD(order.quote.partsTotal)}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-slate-600">人工費小計</dt>
            <dd>{formatHKD(order.quote.laborTotal)}</dd>
          </div>
          {order.quote.bundleDiscount > 0 ? (
            <div className="flex justify-between">
              <dt className="text-slate-600">套餐折扣</dt>
              <dd>−{formatHKD(order.quote.bundleDiscount)}</dd>
            </div>
          ) : null}
          <div className="flex justify-between border-t-2 border-slate-900 pt-2 text-base font-extrabold">
            <dt>實收總額</dt>
            <dd>{formatHKD(effectivePrice(order))}</dd>
          </div>
          {isDiscounted(order) ? (
            <div className="flex justify-between text-emerald-700">
              <dt>講價優惠</dt>
              <dd>−{formatHKD(order.quote.total - effectivePrice(order))}</dd>
            </div>
          ) : null}
          {order.priceNote ? (
            <div className="flex justify-between text-slate-500">
              <dt>改價說明</dt>
              <dd className="text-right">{order.priceNote}</dd>
            </div>
          ) : null}
        </dl>
      </section>

      <section className="mt-6 border-t border-dashed border-slate-400 pt-4 text-[0.68rem] leading-relaxed text-slate-600">
        <p className="font-bold text-slate-900">保養條款</p>
        <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
          <li>本收據為保養憑證，請妥善保存；保養期內同類故障免工費及配件費重新處理。</li>
          <li>人為損壞（跌撞、入水、自行拆機）、電池自然損耗及軟件問題不在保養範圍。</li>
          <li>取機時請即場檢查機身外觀及各項功能，離店後恕不受理外觀爭議。</li>
          <li>如有任何爭議，可於 30 日內致電門市查詢及跟進。</li>
        </ol>
      </section>

      <footer className="mt-8 flex items-end justify-between text-[0.72rem]">
        <div>
          <p className="text-slate-500">客戶簽收</p>
          <div className="mt-6 w-44 border-b border-slate-900" />
        </div>
        <div>
          <p className="text-slate-500">門市蓋章</p>
          <div className="mt-6 w-44 border-b border-slate-900" />
        </div>
      </footer>
    </div>
  );
}
