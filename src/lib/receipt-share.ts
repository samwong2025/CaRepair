/**
 * 售後收據電子單分享工具：
 * 1. 產生可傳給客戶的文字訊息（WhatsApp / Email 內文）
 * 2. 開新視窗渲染收據為可列印 HTML（瀏覽器原生「另存為 PDF」即可下載 PDF）
 * 3. 提供一鍵打開 WhatsApp / Email 的 helper
 *
 * 不引入 PDF 函式庫，跨平台、零依賴，列印品質與官方收據一致。
 */
import { siteConfig } from '../config/site';
import { effectivePrice, formatDateTime, formatFullDate, formatHKD, isDiscounted } from './format';
import { formatDuration } from './quote-engine';
import { buildWhatsappUrl } from './utils';
import type { RepairOrder } from '../types';

const SERVICE_MODE_LABEL: Record<string, string> = {
  walk_in: '到店維修',
  pickup: '順豐寄修',
  mail_in: '自行寄件',
};

function warrantyUntil(order: RepairOrder): Date {
  const base = new Date(order.updatedAt || order.createdAt);
  base.setDate(base.getDate() + (order.quote?.warrantyDays ?? 0));
  return base;
}

function shopOf(order: RepairOrder) {
  return siteConfig.shops.find((item) => item.name === order.shopName) ?? siteConfig.shops[0];
}

/** 產生 WhatsApp / Email 共用的純文字訊息（給客戶看的精簡版） */
export function buildReceiptMessage(order: RepairOrder): string {
  const shop = shopOf(order);
  const total = effectivePrice(order);
  const sys = order.quote?.total ?? total;
  const warranty = formatFullDate(warrantyUntil(order));
  const lines: string[] = [
    `【CathyRepair 維修服務收據】`,
    ``,
    `訂單編號：${order.orderNo}`,
    `客戶姓名：${order.customerName}`,
    `聯絡電話：${order.customerPhone}`,
    `維修機型：${order.deviceModelName}`,
    `服務方式：${SERVICE_MODE_LABEL[order.serviceMode] ?? order.serviceMode}`,
    `主理技師：${order.technician ?? '—'}`,
    `收機時間：${formatDateTime(order.createdAt)}`,
    `完成時間：${formatDateTime(order.updatedAt)}`,
    ``,
    `維修項目：`,
    ...order.quote.items.map(
      (item, i) =>
        `  ${i + 1}. ${item.name}（${item.partName}・工時 ${formatDuration(item.durationMinutes)}・保養 ${item.warrantyDays} 日）`,
    ),
    ``,
    `配件費小計：${formatHKD(order.quote.partsTotal)}`,
    `人工費小計：${formatHKD(order.quote.laborTotal)}`,
    ...(order.quote.bundleDiscount > 0 ? [`套餐折扣：−${formatHKD(order.quote.bundleDiscount)}`] : []),
    `實收總額：${formatHKD(total)}`,
    ...(isDiscounted(order)
      ? [
          `（講價優惠 HK$${(sys - total).toLocaleString()}，原價 ${formatHKD(sys)}）`,
          ...(order.priceNote ? [`改價說明：${order.priceNote}`] : []),
        ]
      : []),
    ``,
    `保養到期：${warranty}`,
    ``,
    `門市：${shop.name}`,
    `地址：${shop.address}`,
    `如有查詢請致電 ${siteConfig.hotline} 或 WhatsApp ${siteConfig.whatsapp}。`,
    ``,
    `感謝您的信任與支持 🙏`,
    `— CathyRepair`,
  ];
  return lines.join('\n');
}

/** 收據主旨（Email 用） */
export function buildReceiptSubject(order: RepairOrder): string {
  return `CathyRepair 維修服務收據 — ${order.orderNo}（${order.customerName}）`;
}

/** 開啟 WhatsApp 並帶入收據訊息 */
export function openReceiptWhatsapp(order: RepairOrder): void {
  const text = buildReceiptMessage(order);
  const url = buildWhatsappUrl(order.customerPhone, text);
  window.open(url, '_blank', 'noopener,noreferrer');
}

/** 開啟 Email 並帶入收據主旨與內文 */
export function openReceiptEmail(order: RepairOrder): void {
  const subject = buildReceiptSubject(order);
  const body = buildReceiptMessage(order);
  const params = new URLSearchParams({ subject, body });
  window.location.href = `mailto:${siteConfig.email}?${params.toString()}`;
}

/* -------------------------------------------------------------------------- */
/*  獨立可列印 HTML（給新視窗用，瀏覽器「另存為 PDF」即可得到 PDF 附件）   */
/* -------------------------------------------------------------------------- */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/** 與 Barcode 元件視覺一致的條碼 HTML（純 CSS 條紋 + 等寬字編號） */
function barcodeHtml(value: string, height: number): string {
  const chars = value.replace(/[^A-Za-z0-9]/g, '').split('');
  const bars = chars.flatMap((char, index) => {
    const code = char.charCodeAt(0) + index;
    return [
      { width: (code % 3) + 1, filled: true },
      { width: (code % 2) + 1, filled: false },
      { width: ((code >> 2) % 3) + 1, filled: true },
      { width: 1, filled: false },
    ];
  });
  const barsHtml = bars
    .map(
      (bar) =>
        `<span style="display:inline-block;width:${bar.width}px;height:${height}px;background:${
          bar.filled ? '#0f172a' : 'transparent'
        };"></span>`,
    )
    .join('');
  return `<div style="margin-top:8px;"><div style="display:flex;align-items:flex-end;gap:1px;height:${height}px;">${barsHtml}</div><p style="margin-top:4px;text-align:center;font-family:Menlo,Consolas,monospace;font-size:10px;letter-spacing:0.28em;color:#334155;">${escapeHtml(value)}</p></div>`;
}

const PRINT_CSS = `
  @page { size: A4; margin: 12mm; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang TC", "Microsoft JhengHei", "Noto Sans TC", sans-serif; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  .sheet { width: 190mm; margin: 0 auto; padding: 12mm; }
  header.top { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #0f172a; padding-bottom: 14px; gap: 16px; }
  .brand { display: flex; gap: 10px; align-items: flex-start; }
  .brand .logo { width: 40px; height: 40px; border-radius: 8px; background: linear-gradient(135deg,#2563eb,#0ea5e9); color: #fff; font-weight: 800; display: flex; align-items: center; justify-content: center; font-size: 14px; letter-spacing: -0.5px; }
  .brand .name { font-size: 18px; font-weight: 800; line-height: 1; }
  .brand .slogan { font-size: 11px; color: #475569; margin-top: 6px; }
  .brand .meta { font-size: 10px; line-height: 1.5; color: #475569; margin-top: 8px; }
  .title { text-align: right; }
  .title h1 { font-size: 16px; font-weight: 800; margin: 0; }
  .title small { font-size: 10px; color: #64748b; letter-spacing: 0.1em; }
  .grid2 { display: grid; grid-template-columns: 1fr 1fr; column-gap: 24px; row-gap: 6px; margin-top: 18px; font-size: 11px; }
  .grid2 .row { display: flex; gap: 8px; }
  .grid2 .row .k { width: 70px; flex-shrink: 0; color: #64748b; }
  .grid2 .row .v { font-weight: 700; }
  table { width: 100%; border-collapse: collapse; margin-top: 18px; font-size: 11px; }
  thead tr { background: #f1f5f9; border-top: 1px solid #0f172a; border-bottom: 1px solid #0f172a; }
  thead th { padding: 6px 8px; text-align: left; font-weight: 700; }
  thead th.r { text-align: right; }
  tbody td { padding: 8px; border-bottom: 1px solid #e2e8f0; }
  tbody td.r { text-align: right; }
  tbody td.bold { font-weight: 700; }
  tbody td small { display: block; font-size: 9px; color: #64748b; margin-top: 2px; }
  .totals { display: flex; justify-content: flex-end; margin-top: 14px; }
  .totals dl { width: 230px; font-size: 11px; }
  .totals dl .row { display: flex; justify-content: space-between; padding: 2px 0; color: #475569; }
  .totals dl .row.grand { border-top: 2px solid #0f172a; padding-top: 6px; margin-top: 4px; font-size: 14px; font-weight: 800; color: #0f172a; }
  .totals dl .row.discount { color: #047857; }
  .totals dl .row.note { color: #64748b; }
  .terms { margin-top: 22px; border-top: 1px dashed #94a3b8; padding-top: 12px; font-size: 10px; line-height: 1.6; color: #475569; }
  .terms h3 { font-size: 11px; font-weight: 800; color: #0f172a; margin: 0 0 6px; }
  .terms ol { margin: 0; padding-left: 18px; }
  .terms li { margin-bottom: 2px; }
  footer.sig { display: flex; justify-content: space-between; margin-top: 28px; font-size: 10px; color: #64748b; }
  footer.sig .box { width: 160px; }
  footer.sig .line { margin-top: 32px; border-bottom: 1px solid #0f172a; }
  @media print { .no-print { display: none !important; } }
`;

/** 產生獨立可列印 HTML（給 window.open 使用，瀏覽器可「另存為 PDF」） */
export function buildPrintableReceiptHtml(order: RepairOrder): string {
  const shop = shopOf(order);
  const total = effectivePrice(order);
  const sys = order.quote?.total ?? total;
  const warranty = formatFullDate(warrantyUntil(order));

  const itemsRows = order.quote.items
    .map(
      (item) => `
      <tr>
        <td>
          <div class="bold">${escapeHtml(item.name)}</div>
          <small>${escapeHtml(item.partName)}・工時 ${escapeHtml(formatDuration(item.durationMinutes))}・保養 ${item.warrantyDays} 日</small>
        </td>
        <td class="r">${escapeHtml(formatHKD(item.partFee))}</td>
        <td class="r">${escapeHtml(formatHKD(item.laborFee))}</td>
        <td class="r bold">${escapeHtml(formatHKD(item.subtotal))}</td>
      </tr>`,
    )
    .join('');

  const bundleRow =
    order.quote.bundleDiscount > 0
      ? `<div class="row"><dt>套餐折扣</dt><dd>−${escapeHtml(formatHKD(order.quote.bundleDiscount))}</dd></div>`
      : '';

  const discountRow = isDiscounted(order)
    ? `<div class="row discount"><dt>講價優惠</dt><dd>−${escapeHtml(formatHKD(sys - total))}</dd></div>`
    : '';

  const priceNoteRow = order.priceNote
    ? `<div class="row note"><dt>改價說明</dt><dd style="text-align:right;">${escapeHtml(order.priceNote)}</dd></div>`
    : '';

  const body = `
    <div class="sheet">
      <header class="top">
        <div class="brand">
          <div class="logo">CR</div>
          <div>
            <div class="name">${escapeHtml(siteConfig.name)}</div>
            <div class="slogan">${escapeHtml(siteConfig.slogan)}</div>
            <div class="meta">
              ${escapeHtml(shop.name)}｜${escapeHtml(shop.address)}<br />
              電話 ${escapeHtml(siteConfig.hotline)}｜WhatsApp ${escapeHtml(siteConfig.whatsapp)}｜${escapeHtml(siteConfig.email)}
            </div>
          </div>
        </div>
        <div class="title">
          <h1>維修服務收據</h1>
          <small>SERVICE RECEIPT</small>
          ${barcodeHtml(order.orderNo, 36)}
        </div>
      </header>

      <section class="grid2">
        <div class="row"><span class="k">客戶姓名</span><span class="v">${escapeHtml(order.customerName)}</span></div>
        <div class="row"><span class="k">聯絡電話</span><span class="v">${escapeHtml(order.customerPhone)}</span></div>
        <div class="row"><span class="k">維修機型</span><span class="v">${escapeHtml(order.deviceModelName)}</span></div>
        <div class="row"><span class="k">服務方式</span><span class="v">${escapeHtml(SERVICE_MODE_LABEL[order.serviceMode] ?? order.serviceMode)}</span></div>
        <div class="row"><span class="k">收機時間</span><span>${escapeHtml(formatDateTime(order.createdAt))}</span></div>
        <div class="row"><span class="k">完成時間</span><span>${escapeHtml(formatDateTime(order.updatedAt))}</span></div>
        <div class="row"><span class="k">主理技師</span><span class="v">${escapeHtml(order.technician ?? '—')}</span></div>
        <div class="row"><span class="k">保養到期</span><span class="v">${escapeHtml(warranty)}</span></div>
      </section>

      <table>
        <thead>
          <tr>
            <th>維修項目 / 使用配件</th>
            <th class="r" style="width:70px;">配件費</th>
            <th class="r" style="width:70px;">人工費</th>
            <th class="r" style="width:80px;">小計</th>
          </tr>
        </thead>
        <tbody>${itemsRows}</tbody>
      </table>

      <section class="totals">
        <dl>
          <div class="row"><dt>配件費小計</dt><dd>${escapeHtml(formatHKD(order.quote.partsTotal))}</dd></div>
          <div class="row"><dt>人工費小計</dt><dd>${escapeHtml(formatHKD(order.quote.laborTotal))}</dd></div>
          ${bundleRow}
          <div class="row grand"><dt>實收總額</dt><dd>${escapeHtml(formatHKD(total))}</dd></div>
          ${discountRow}
          ${priceNoteRow}
        </dl>
      </section>

      <section class="terms">
        <h3>保養條款</h3>
        <ol>
          <li>本收據為保養憑證，請妥善保存；保養期內同類故障免工費及配件費重新處理。</li>
          <li>人為損壞（跌撞、入水、自行拆機）、電池自然損耗及軟件問題不在保養範圍。</li>
          <li>取機時請即場檢查機身外觀及各項功能，離店後恕不受理外觀爭議。</li>
          <li>如有任何爭議，可於 30 日內致電門市查詢及跟進。</li>
        </ol>
      </section>

      <footer class="sig">
        <div class="box">
          <div>客戶簽收</div>
          <div class="line"></div>
        </div>
        <div class="box">
          <div>門市蓋章</div>
          <div class="line"></div>
        </div>
      </footer>
    </div>
  `;

  return `<!doctype html><html lang="zh-Hant"><head><meta charset="utf-8"><title>CathyRepair 收據 ${escapeHtml(order.orderNo)}</title><style>${PRINT_CSS}</style></head><body>${body}</body></html>`;
}

/**
 * 開新視窗顯示收據可列印 HTML，並自動叫用列印對話框（瀏覽器內建「另存為 PDF」）。
 * 使用者關閉列印對話框後即可把產出的 PDF 附件至 Email / WhatsApp。
 */
export function triggerReceiptPdf(order: RepairOrder): void {
  const html = buildPrintableReceiptHtml(order);
  const win = window.open('', '_blank', 'width=900,height=1200');
  if (!win) {
    alert('瀏覽器封鎖了彈出視窗，請允許彈出頁後再試。');
    return;
  }
  win.document.open();
  win.document.write(html);
  win.document.close();
  // 等資源（圖片、字型）載入後再列印
  const trigger = () => {
    try {
      win.focus();
      win.print();
    } catch (error) {
      console.error('triggerReceiptPdf 列印失敗', error);
    }
  };
  if (win.document.readyState === 'complete') {
    setTimeout(trigger, 200);
  } else {
    win.addEventListener('load', () => setTimeout(trigger, 200), { once: true });
  }
}

/** 同時下載 PDF（透過列印對話）並打開 WhatsApp，讓使用者把 PDF 附件出去 */
export function shareReceiptViaWhatsapp(order: RepairOrder): void {
  triggerReceiptPdf(order);
  // 延遲打開 WhatsApp，避免列印對話框被搶焦點
  setTimeout(() => openReceiptWhatsapp(order), 400);
}

/** 同時下載 PDF（透過列印對話）並打開 Email 草稿 */
export function shareReceiptViaEmail(order: RepairOrder): void {
  triggerReceiptPdf(order);
  setTimeout(() => openReceiptEmail(order), 400);
}