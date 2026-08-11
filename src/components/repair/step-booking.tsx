'use client';

import * as React from 'react';
import { Check, Home, Store } from 'lucide-react';
import { FieldError, Input, Label, Textarea } from '../ui/input';
import { siteConfig } from '../../config/site';
import { cn } from '../../lib/utils';
import type { ServiceMode } from '../../types';

export interface BookingForm {
  serviceMode: ServiceMode;
  shopName: string;
  address: string;
  district: string;
  appointmentDate: string;
  appointmentTime: string;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  remark: string;
}

export type BookingErrors = Partial<Record<keyof BookingForm, string>>;

const serviceModes: {
  id: ServiceMode;
  name: string;
  description: string;
  icon: typeof Store;
  tag?: string;
}[] = [
  {
    id: 'walk_in',
    name: '到店維修',
    description: '揀定門市同時段，到場即檢即修，大部分項目 30 分鐘取機。',
    icon: Store,
    tag: '最快',
  },
  {
    id: 'mail_in',
    name: '自行寄件',
    description: '自行寄到荔枝角門市，收件後即時通知，可於網站即時追蹤進度。',
    icon: Home,
    tag: '免運費',
  },
];

/** 產生未來 14 日可選日期 */
function buildDateOptions() {
  const today = new Date();
  return Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + index);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
      date.getDate(),
    ).padStart(2, '0')}`;
    const weekday = ['日', '一', '二', '三', '四', '五', '六'][date.getDay()];
    return {
      value: iso,
      label: `${date.getMonth() + 1}/${date.getDate()}`,
      weekday: index === 0 ? '今日' : index === 1 ? '聽日' : `週${weekday}`,
    };
  });
}

const timeSlots = [
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
];

/** 步驟 4：選擇服務方式、預約時段並填寫聯絡資料 */
export function StepBooking({
  form,
  errors,
  onChange,
}: {
  form: BookingForm;
  errors: BookingErrors;
  onChange: <K extends keyof BookingForm>(key: K, value: BookingForm[K]) => void;
}) {
  const dateOptions = React.useMemo(buildDateOptions, []);

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-ink sm:text-2xl">最後一步，約定時間</h2>
        <p className="mt-1.5 text-sm text-ink-muted">
          提交後我哋會於 15 分鐘內 WhatsApp 同你確認，並自動為你開立會員檔案。
        </p>
      </div>

      {/* 服務方式 */}
      <div>
        <Label className="mb-3 block">服務方式</Label>
        <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 lg:grid-cols-3">
          {serviceModes.map((mode) => {
            const Icon = mode.icon;
            const selected = form.serviceMode === mode.id;
            return (
              <button
                key={mode.id}
                type="button"
                onClick={() => onChange('serviceMode', mode.id)}
                aria-pressed={selected}
                className={cn(
                  'relative flex cursor-pointer flex-col gap-2 rounded-2xl border p-3.5 text-left transition-all duration-200 ease-smooth sm:p-4',
                  selected
                    ? 'border-brand-500 bg-brand-50/60 shadow-card'
                    : 'border-slate-200 bg-white hover:border-brand-200 hover:shadow-card',
                )}
              >
                {mode.tag ? (
                  <span className="absolute right-3 top-3 rounded-full bg-accent-500 px-2 py-0.5 text-[0.62rem] font-bold text-white">
                    {mode.tag}
                  </span>
                ) : null}
                <span
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200',
                    selected ? 'bg-brand-gradient text-white' : 'bg-slate-100 text-ink-muted',
                  )}
                >
                  <Icon className="h-5 w-5" strokeWidth={2} />
                </span>
                <span className="text-[0.95rem] font-bold text-ink">{mode.name}</span>
                <span className="text-xs leading-relaxed text-ink-muted">{mode.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 門市 or 地址 */}
      {form.serviceMode === 'walk_in' ? (
        <div>
          <Label className="mb-3 block" required>
            揀選門市
          </Label>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {siteConfig.shops.map((shop) => {
              const selected = form.shopName === shop.name;
              return (
                <button
                  key={shop.name}
                  type="button"
                  onClick={() => onChange('shopName', shop.name)}
                  aria-pressed={selected}
                  className={cn(
                    'flex cursor-pointer items-start justify-between gap-3 rounded-xl border px-4 py-3.5 text-left transition-all duration-200',
                    selected
                      ? 'border-brand-500 bg-brand-50/70'
                      : 'border-slate-200 bg-white hover:border-brand-300',
                  )}
                >
                  <span className="min-w-0">
                    <span className="block text-[0.92rem] font-bold text-ink">{shop.name}</span>
                    <span className="mt-0.5 block line-clamp-1 text-xs text-ink-faint">
                      {shop.mtr}
                    </span>
                  </span>
                  <span
                    className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2',
                      selected ? 'border-brand-500 bg-brand-500 text-white' : 'border-slate-300',
                    )}
                  >
                    {selected ? <Check className="h-3 w-3" strokeWidth={3.5} /> : null}
                  </span>
                </button>
              );
            })}
          </div>
          <FieldError>{errors.shopName}</FieldError>
        </div>
      ) : (
        <div>
          <Label htmlFor="address" required>
            回郵地址
          </Label>
          <Input
            id="address"
            value={form.address}
            onChange={(event) => onChange('address', event.target.value)}
            placeholder="請填寫完整地址，包括地區、大廈、樓層及單位"
            invalid={Boolean(errors.address)}
          />
          <FieldError>{errors.address}</FieldError>
        </div>
      )}

      {/* 預約日期時段 */}
      <div>
        <Label className="mb-3 block" required>
          {form.serviceMode === 'walk_in' ? '到店日期' : '收件日期'}
        </Label>
        <div className="flex flex-wrap gap-2">
          {dateOptions.map((option) => {
            const selected = form.appointmentDate === option.value;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange('appointmentDate', option.value)}
                aria-pressed={selected}
                className={cn(
                  'flex w-[3.75rem] shrink-0 cursor-pointer flex-col items-center rounded-xl border py-2.5 transition-all duration-200 sm:w-[4.5rem]',
                  selected
                    ? 'border-transparent bg-brand-gradient text-white shadow-brand'
                    : 'border-slate-200 bg-white text-ink hover:border-brand-300 hover:bg-brand-50/50',
                )}
              >
                <span className={cn('text-[0.68rem]', selected ? 'text-white/80' : 'text-ink-faint')}>
                  {option.weekday}
                </span>
                <span className="mt-0.5 text-sm font-extrabold">{option.label}</span>
              </button>
            );
          })}
        </div>
        <FieldError>{errors.appointmentDate}</FieldError>

        <Label className="mb-2.5 mt-5 block" required>
          時段
        </Label>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
          {timeSlots.map((slot) => {
            const selected = form.appointmentTime === slot;
            return (
              <button
                key={slot}
                type="button"
                onClick={() => onChange('appointmentTime', slot)}
                aria-pressed={selected}
                className={cn(
                  'cursor-pointer rounded-xl border py-2.5 text-sm font-bold transition-all duration-200',
                  selected
                    ? 'border-transparent bg-brand-gradient text-white shadow-brand'
                    : 'border-slate-200 bg-white text-ink hover:border-brand-300 hover:bg-brand-50/50',
                )}
              >
                {slot}
              </button>
            );
          })}
        </div>
        <FieldError>{errors.appointmentTime}</FieldError>
      </div>

      {/* 聯絡資料 */}
      <div>
        <Label className="mb-3 block">聯絡資料</Label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="customerName" required>
              稱呼
            </Label>
            <Input
              id="customerName"
              value={form.customerName}
              onChange={(event) => onChange('customerName', event.target.value)}
              placeholder="例如：陳先生"
              autoComplete="name"
              invalid={Boolean(errors.customerName)}
            />
            <FieldError>{errors.customerName}</FieldError>
          </div>
          <div>
            <Label htmlFor="customerPhone" required>
              手提電話（WhatsApp）
            </Label>
            <Input
              id="customerPhone"
              value={form.customerPhone}
              onChange={(event) => onChange('customerPhone', event.target.value)}
              placeholder="8 位數字香港號碼"
              inputMode="numeric"
              maxLength={12}
              autoComplete="tel"
              invalid={Boolean(errors.customerPhone)}
            />
            <FieldError>{errors.customerPhone}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="customerEmail" required>
              電郵（用於接收電子收據）
            </Label>
            <Input
              id="customerEmail"
              type="email"
              value={form.customerEmail}
              onChange={(event) => onChange('customerEmail', event.target.value)}
              placeholder="name@example.com"
              autoComplete="email"
              invalid={Boolean(errors.customerEmail)}
            />
            <FieldError>{errors.customerEmail}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="remark">故障補充說明（選填）</Label>
            <Textarea
              id="remark"
              value={form.remark}
              onChange={(event) => onChange('remark', event.target.value)}
              placeholder="例如：跌落地後左上角有裂痕，觸控偶爾冇反應；機內有重要相片需要保留。"
              rows={3}
            />
          </div>
        </div>
      </div>

      <p className="rounded-xl border border-slate-200 bg-surface-soft px-4 py-3 text-xs leading-relaxed text-ink-muted">
        提交即表示同意《維修服務條款》及《私隱政策》。我哋只會用你的聯絡資料處理是次維修及售後跟進，
        絕不會轉售或作其他用途。
      </p>
    </div>
  );
}
