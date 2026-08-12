'use client';

import * as React from 'react';
import { MessageCircle } from 'lucide-react';
import { paymentConfig, buildWhatsappLink } from '../../config/site';

/** 收款碼圖片；圖片缺失時顯示佔位提示，避免破圖 */
function PaymentQr({ src, label }: { src: string; label: string }) {
  const [broken, setBroken] = React.useState(false);
  if (broken) {
    return (
      <div className="flex h-32 w-32 items-center justify-center rounded-lg border border-dashed border-slate-300 bg-slate-50 px-2 text-center text-[11px] leading-tight text-ink-faint">
        收款碼待補，請向門市索取
      </div>
    );
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={label}
      className="h-32 w-32 rounded-lg border border-slate-200 object-contain"
      onError={() => setBroken(true)}
    />
  );
}

/** 送貨訂單成功後的付款方式區塊：展示四種收款碼與聯絡客服按鈕 */
export function DeliveryPaymentSection({ orderNos }: { orderNos: string[] }) {
  const text = `你好，我已為送貨訂單 ${orderNos.join('、')} 付款，請協助確認收款，謝謝。`;
  return (
    <div className="mt-5 w-full rounded-2xl border border-brand-100 bg-brand-50/50 p-4 text-left">
      <p className="text-sm font-extrabold text-ink">送貨訂單 · 請先付款</p>
      <p className="mt-1 text-xs leading-relaxed text-ink-muted">
        請使用以下任一方式付款，付款後保留截圖並聯絡客服確認，我們會盡快更新訂單狀態。
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3">
        {paymentConfig.methods.map((m) => (
          <div
            key={m.id}
            className="flex flex-col items-center rounded-xl bg-white p-3 text-center shadow-sm"
          >
            <PaymentQr src={m.qr} label={m.label} />
            <p className="mt-2 text-xs font-bold text-ink">{m.label}</p>
            {m.hint ? <p className="mt-0.5 text-[10px] text-ink-faint">{m.hint}</p> : null}
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-ink-muted">{paymentConfig.note}</p>
      <a
        href={buildWhatsappLink(text)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-success px-4 py-2.5 text-sm font-bold text-white transition-opacity hover:opacity-90"
      >
        <MessageCircle className="h-4 w-4" />
        我已付款，聯絡客服確認
      </a>
    </div>
  );
}
