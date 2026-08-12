'use client';

import * as React from 'react';
import { CheckCircle2, Headphones, LifeBuoy, Loader2, Search } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { FieldError, Input, Label, Select, Textarea } from '../ui/input';
import { formatDateTime } from '../../lib/format';
import type { AfterSalesRecord, AfterSalesType } from '../../types';

// 僅支援香港 8 位手提號碼
const HK_PHONE = /^[2-9]\d{7}$/;

const typeOptions: { value: AfterSalesType; label: string }[] = [
  { value: 'warranty', label: '保養期內再維修' },
  { value: 'complaint', label: '服務投訴' },
  { value: 'consult', label: '使用查詢' },
  { value: 'return', label: '退換貨申請' },
];

const typeLabel: Record<AfterSalesType, string> = {
  warranty: '保養跟進',
  complaint: '服務投訴',
  consult: '使用查詢',
  return: '退換貨',
};

const statusMeta: Record<
  AfterSalesRecord['status'],
  { label: string; tone: 'brand' | 'accent' | 'success' | 'danger' }
> = {
  pending: { label: '待處理', tone: 'accent' },
  processing: { label: '處理中', tone: 'brand' },
  resolved: { label: '已解決', tone: 'success' },
  rejected: { label: '未受理', tone: 'danger' },
};

interface FormState {
  orderNo: string;
  customerName: string;
  customerPhone: string;
  type: AfterSalesType;
  subject: string;
  detail: string;
}

const initialForm: FormState = {
  orderNo: '',
  customerName: '',
  customerPhone: '',
  type: 'warranty',
  subject: '',
  detail: '',
};

/** 售後服務：查詢既有個案 + 提交新申請 */
export function AfterSalesPanel() {
  const [phone, setPhone] = React.useState('');
  const [records, setRecords] = React.useState<AfterSalesRecord[]>([]);
  const [searched, setSearched] = React.useState(false);
  const [searching, setSearching] = React.useState(false);

  const [form, setForm] = React.useState<FormState>(initialForm);
  const [errors, setErrors] = React.useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [createdCaseNo, setCreatedCaseNo] = React.useState('');

  const handleSearch = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!HK_PHONE.test(phone.trim())) {
      setErrors((prev) => ({ ...prev, customerPhone: '請輸入 8 位香港手提號碼' }));
      return;
    }
    setErrors((prev) => ({ ...prev, customerPhone: undefined }));
    setSearching(true);

    const response = await fetch(`/api/aftersales?phone=${encodeURIComponent(phone.trim())}`).catch(
      (error: unknown) => {
        console.error('查詢售後個案失敗', error);
        return null;
      },
    );

    if (response?.ok) {
      const data = (await response.json()) as { records: AfterSalesRecord[] };
      setRecords(data.records ?? []);
    } else {
      setRecords([]);
    }

    setSearched(true);
    setSearching(false);
  };

  const updateForm = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    const next: Partial<Record<keyof FormState, string>> = {};
    if (!form.orderNo.trim()) next.orderNo = '請填寫維修訂單編號';
    if (form.customerName.trim().length < 2) next.customerName = '請填寫稱呼';
    if (!HK_PHONE.test(form.customerPhone.trim())) next.customerPhone = '請填寫 8 位香港手提號碼';
    if (!form.subject.trim()) next.subject = '請填寫主題';
    if (form.detail.trim().length < 10) next.detail = '請詳述問題（不少於 10 個字）';

    setErrors(next);
    if (Object.keys(next).length > 0) return;

    setSubmitting(true);
    const response = await fetch('/api/aftersales', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, customerPhone: form.customerPhone.trim() }),
    }).catch((error: unknown) => {
      console.error('提交售後申請失敗', error);
      return null;
    });

    if (response?.ok) {
      const data = (await response.json()) as { record: AfterSalesRecord };
      setCreatedCaseNo(data.record.caseNo);
      setRecords((prev) => [data.record, ...prev]);
      setSearched(true);
      setForm(initialForm);
    } else {
      const message = await response?.json().then(
        (data: { message?: string }) => data.message,
        () => undefined,
      );
      setErrors({ detail: message ?? '提交失敗，請稍後再試。' });
    }

    setSubmitting(false);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_1fr] lg:gap-8">
      {/* 查詢個案 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-gradient text-white">
            <Headphones className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-ink">查詢售後個案</h3>
            <p className="text-xs text-ink-muted">輸入落單時使用的手提號碼</p>
          </div>
        </div>

        <form onSubmit={handleSearch} className="mt-5 flex gap-2.5">
          <Input
            value={phone}
            onChange={(event) => {
              setPhone(event.target.value);
              setErrors((prev) => ({ ...prev, customerPhone: undefined }));
            }}
            placeholder="輸入 8 位香港手提號碼"
            inputMode="numeric"
            maxLength={8}
            aria-label="售後查詢手提號碼"
          />
          <Button type="submit" variant="primary" size="lg" disabled={searching}>
            {searching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            查詢
          </Button>
        </form>

        <div className="mt-5 space-y-3">
          {records.map((record) => {
            const meta = statusMeta[record.status];
            return (
              <article key={record.id} className="glow-card rounded-xl border border-slate-200 px-4 py-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-extrabold text-ink">{record.caseNo}</p>
                  <Badge variant={meta.tone} size="sm">
                    {meta.label}
                  </Badge>
                  <Badge variant="neutral" size="sm">
                    {typeLabel[record.type]}
                  </Badge>
                </div>
                <p className="mt-2 text-sm font-bold text-ink">{record.subject}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-muted">{record.detail}</p>
                {record.resolution ? (
                  <p className="mt-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-800">
                    處理結果：{record.resolution}
                  </p>
                ) : null}
                <p className="mt-2 text-[0.7rem] text-ink-faint">
                  關聯訂單 {record.orderNo}・更新於 {formatDateTime(record.updatedAt)}
                  {record.handler ? `・跟進：${record.handler}` : ''}
                </p>
              </article>
            );
          })}

          {searched && records.length === 0 ? (
            <p className="rounded-xl border border-dashed border-slate-300 bg-surface-soft px-4 py-8 text-center text-sm text-ink-muted">
              呢個號碼暫時未有售後個案記錄。
            </p>
          ) : null}
        </div>
      </div>

      {/* 提交申請 */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-card sm:p-7">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-cta-gradient text-white">
            <LifeBuoy className="h-5 w-5" strokeWidth={2} />
          </span>
          <div>
            <h3 className="text-lg font-extrabold text-ink">提交售後申請</h3>
            <p className="text-xs text-ink-muted">保養期內同類故障免費再修</p>
          </div>
        </div>

        {createdCaseNo ? (
          <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3.5">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-xs leading-relaxed text-emerald-800">
              已收到你的申請，個案編號 <strong>{createdCaseNo}</strong>。
              售後專員會於一個工作天內以 WhatsApp 聯絡你。
            </p>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="as-orderNo" required>
                維修訂單編號
              </Label>
              <Input
                id="as-orderNo"
                value={form.orderNo}
                onChange={(event) => updateForm('orderNo', event.target.value.toUpperCase())}
                placeholder="CR-20260810-XXXX"
                invalid={Boolean(errors.orderNo)}
              />
              <FieldError>{errors.orderNo}</FieldError>
            </div>
            <div>
              <Label htmlFor="as-type" required>
                售後類別
              </Label>
              <Select
                id="as-type"
                value={form.type}
                onChange={(event) => updateForm('type', event.target.value as AfterSalesType)}
              >
                {typeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
            <div>
              <Label htmlFor="as-name" required>
                稱呼
              </Label>
              <Input
                id="as-name"
                value={form.customerName}
                onChange={(event) => updateForm('customerName', event.target.value)}
                placeholder="例如：李小姐"
                invalid={Boolean(errors.customerName)}
              />
              <FieldError>{errors.customerName}</FieldError>
            </div>
            <div>
              <Label htmlFor="as-phone" required>
                手提電話
              </Label>
              <Input
                id="as-phone"
                value={form.customerPhone}
                onChange={(event) => updateForm('customerPhone', event.target.value)}
                placeholder="輸入 8 位香港手提號碼"
                inputMode="numeric"
                maxLength={8}
                invalid={Boolean(errors.customerPhone)}
              />
              <FieldError>{errors.customerPhone}</FieldError>
            </div>
          </div>

          <div>
            <Label htmlFor="as-subject" required>
              主題
            </Label>
            <Input
              id="as-subject"
              value={form.subject}
              onChange={(event) => updateForm('subject', event.target.value)}
              placeholder="例如：換屏後底部觸控偶爾冇反應"
              invalid={Boolean(errors.subject)}
            />
            <FieldError>{errors.subject}</FieldError>
          </div>

          <div>
            <Label htmlFor="as-detail" required>
              詳細描述
            </Label>
            <Textarea
              id="as-detail"
              value={form.detail}
              onChange={(event) => updateForm('detail', event.target.value)}
              placeholder="請描述問題出現的時間、頻率與情境，方便師傅預先判斷。"
              rows={4}
              invalid={Boolean(errors.detail)}
            />
            <FieldError>{errors.detail}</FieldError>
          </div>

          <Button type="submit" variant="cta" size="lg" block disabled={submitting}>
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                提交緊…
              </>
            ) : (
              '提交售後申請'
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
