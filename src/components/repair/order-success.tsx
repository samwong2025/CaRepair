'use client';

import Link from 'next/link';
import {
  BadgeCheck,
  CalendarCheck,
  Copy,
  MapPin,
  PartyPopper,
  Search,
  Smartphone,
  Truck,
} from 'lucide-react';
import * as React from 'react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { formatDateTime, formatHKD, maskPhone } from '../../lib/format';
import type { CreateOrderResult } from '../../types';

const serviceModeLabel: Record<string, string> = {
  walk_in: '到店維修',
  pickup: '順豐上門收送',
  mail_in: '自行寄件',
};

/** 落單成功畫面：顯示訂單編號、會員編號與後續指引 */
export function OrderSuccess({ result, onRestart }: { result: CreateOrderResult; onRestart: () => void }) {
  const { order, customer, isNewMember } = result;
  const [copied, setCopied] = React.useState(false);

  const copyOrderNo = async () => {
    if (!navigator.clipboard) return;
    const done = await navigator.clipboard.writeText(order.orderNo).then(
      () => true,
      (error) => {
        console.error('複製訂單編號失敗', error);
        return false;
      },
    );
    if (!done) return;
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="mx-auto max-w-3xl">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lift">
        <div className="relative overflow-hidden bg-brand-gradient px-6 py-10 text-center sm:px-10">
          <span aria-hidden className="absolute inset-0 bg-grid-slate opacity-20" />
          <div className="relative">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/15 text-white ring-4 ring-white/20">
              <PartyPopper className="h-8 w-8" strokeWidth={2} />
            </span>
            <h1 className="mt-5 text-2xl font-extrabold text-white sm:text-3xl">落單成功！</h1>
            <p className="mt-2 text-sm text-white/75">
              客服會於 15 分鐘內以 WhatsApp 同你確認，請留意 {maskPhone(order.customerPhone)}。
            </p>

            <div className="mx-auto mt-6 inline-flex items-center gap-3 rounded-xl bg-white/12 px-4 py-3 backdrop-blur-sm">
              <div className="text-left">
                <p className="text-[0.68rem] uppercase tracking-[0.18em] text-white/60">訂單編號</p>
                <p className="text-lg font-extrabold tracking-wide text-white">{order.orderNo}</p>
              </div>
              <button
                type="button"
                onClick={copyOrderNo}
                className="flex cursor-pointer items-center gap-1.5 rounded-lg bg-white/15 px-3 py-2 text-xs font-bold text-white transition-colors duration-200 hover:bg-white/25"
              >
                <Copy className="h-3.5 w-3.5" />
                {copied ? '已複製' : '複製'}
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6 px-6 py-7 sm:px-10">
          {/* 會員檔案 */}
          <div className="flex flex-col gap-3 rounded-2xl border border-brand-100 bg-brand-50/50 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
                <BadgeCheck className="h-5 w-5" strokeWidth={2} />
              </span>
              <div>
                <p className="flex items-center gap-2 text-[0.95rem] font-extrabold text-ink">
                  {isNewMember ? '已為你自動開立會員檔案' : '已連結你的現有會員檔案'}
                  {isNewMember ? (
                    <Badge variant="accent" size="sm">
                      新會員
                    </Badge>
                  ) : null}
                </p>
                <p className="mt-0.5 text-xs text-ink-muted">
                  會員編號 {customer.memberNo}・累計消費 {formatHKD(customer.totalSpent)}
                </p>
              </div>
            </div>
            <Link href={`/track?q=${encodeURIComponent(order.orderNo)}`} className="shrink-0">
              <Button variant="primary" size="sm">
                <Search className="h-3.5 w-3.5" />
                追蹤維修進度
              </Button>
            </Link>
          </div>

          {/* 訂單摘要 */}
          <dl className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 px-4 py-3.5">
              <dt className="flex items-center gap-1.5 text-xs text-ink-faint">
                <Smartphone className="h-3.5 w-3.5" />
                維修裝置
              </dt>
              <dd className="mt-1 text-[0.95rem] font-bold text-ink">{order.deviceModelName}</dd>
              <dd className="mt-0.5 text-xs text-ink-muted">
                {order.quote.items.map((item) => item.name).join('、')}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-200 px-4 py-3.5">
              <dt className="flex items-center gap-1.5 text-xs text-ink-faint">
                <CalendarCheck className="h-3.5 w-3.5" />
                預約時間
              </dt>
              <dd className="mt-1 text-[0.95rem] font-bold text-ink">
                {formatDateTime(order.appointmentAt)}
              </dd>
              <dd className="mt-0.5 text-xs text-ink-muted">
                {serviceModeLabel[order.serviceMode] ?? order.serviceMode}
              </dd>
            </div>

            <div className="rounded-xl border border-slate-200 px-4 py-3.5">
              <dt className="flex items-center gap-1.5 text-xs text-ink-faint">
                {order.serviceMode === 'walk_in' ? (
                  <MapPin className="h-3.5 w-3.5" />
                ) : (
                  <Truck className="h-3.5 w-3.5" />
                )}
                {order.serviceMode === 'walk_in' ? '維修門市' : '收送地址'}
              </dt>
              <dd className="mt-1 text-[0.95rem] font-bold text-ink">
                {order.serviceMode === 'walk_in' ? order.shopName : order.address}
              </dd>
            </div>

            <div className="rounded-xl border border-accent-100 bg-accent-50/50 px-4 py-3.5">
              <dt className="text-xs text-ink-faint">維修總額</dt>
              <dd className="mt-1 text-2xl font-extrabold leading-none text-accent-600">
                {formatHKD(order.quote.total)}
              </dd>
              <dd className="mt-1 text-xs text-ink-muted">維修完成、驗機滿意後先付款</dd>
            </div>
          </dl>

          {/* 後續指引 */}
          <ol className="space-y-3 rounded-2xl bg-surface-soft px-5 py-5">
            {[
              '客服 WhatsApp 確認機型、故障與時段，並提醒你事前備份資料。',
              '按約定時間到店或等順豐上門收件，收件後即時開立維修工單。',
              '維修全程錄影，完成後通過品檢，你可即場驗機再付款。',
            ].map((text, index) => (
              <li key={text} className="flex items-start gap-3 text-sm leading-relaxed text-ink-muted">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-gradient text-xs font-extrabold text-white">
                  {index + 1}
                </span>
                {text}
              </li>
            ))}
          </ol>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link href="/track" className="flex-1">
              <Button variant="cta" size="lg" block>
                <Search className="h-4 w-4" />
                查詢維修進度
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="flex-1" onClick={onRestart}>
              再落一單
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
