'use client';

import * as React from 'react';
import Link from 'next/link';
import { Check, Home, Loader2, PackageSearch, Store, Truck } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Input, Label, Select, Textarea } from '../ui/input';
import { DeliveryPaymentSection } from './delivery-payment';
import { formatHKD } from '../../lib/format';
import { cn } from '../../lib/utils';
import { siteConfig } from '../../config/site';
import { useCart } from './cart-context';
import type { FulfillmentMethod, Product } from '../../types';

/** 二手商品下單面板：支援送貨上門與到店自取 */
export function ProductDetail({ product }: { product: Product }) {
  const cart = useCart();
  const [qty, setQty] = React.useState(1);
  const [fulfillment, setFulfillment] = React.useState<FulfillmentMethod>('pickup');
  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [pickupShop, setPickupShop] = React.useState<string>(siteConfig.shops[0].name);
  const [pickupAt, setPickupAt] = React.useState('');
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [remark, setRemark] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{
    orderNo: string;
    message: string;
    fulfillment: FulfillmentMethod;
  } | null>(null);

  const total = product.price * qty;

  const validate = () => {
    const next: Record<string, string> = {};
    if (qty < 1) next.qty = '數量必須大於 0';
    if (fulfillment === 'delivery' && deliveryAddress.trim().length < 6)
      next.deliveryAddress = '請填寫完整送貨地址';
    if (fulfillment === 'pickup' && !pickupShop) next.pickupShop = '請選擇自取門市';
    if (customerName.trim().length < 2) next.customerName = '請填寫聯絡人姓名';
    const phone = customerPhone.replace(/\D/g, '');
    if (!/^[2-9]\d{7}$/.test(phone)) next.customerPhone = '請輸入 8 位香港手提號碼';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);
    const response = await fetch('/api/shop-orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: product.id,
        qty,
        fulfillment,
        deliveryAddress,
        pickupShop,
        pickupAt,
        customerName,
        customerPhone,
        remark,
      }),
    }).catch((error: unknown) => {
      console.error('落二手單失敗', error);
      return null;
    });
    setSubmitting(false);
    if (!response) {
      setErrors({ form: '網絡異常，請稍後再試。' });
      return;
    }
    const data = (await response.json().catch(() => null)) as {
      order?: { orderNo: string };
      message?: string;
    } | null;
    if (response.ok && data?.order) {
      setResult({
        orderNo: data.order.orderNo,
        message: data.message ?? '落單成功。',
        fulfillment,
      });
      return;
    }
    setErrors({ form: data?.message ?? '落單失敗，請檢查資料。' });
  };

  if (result) {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/5 p-6 text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-success text-white">
          <Check className="h-6 w-6" />
        </span>
        <h3 className="mt-3 text-lg font-extrabold text-ink">落單成功！</h3>
        <p className="mt-1 text-sm text-ink-muted">{result.message}</p>
        <p className="mt-3 font-mono text-sm font-bold text-brand-600">
          訂單編號：{result.orderNo}
        </p>
        {result.fulfillment === 'delivery' ? (
          <DeliveryPaymentSection orderNos={[result.orderNo]} />
        ) : (
          <p className="mt-5 text-xs leading-relaxed text-ink-muted">
            自取訂單請於到店時付款，落單後我們會盡快準備貨品。
          </p>
        )}
        <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-center">
          <Link
            href={`/track?q=${encodeURIComponent(result.orderNo)}`}
            className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2.5 text-sm font-bold text-white shadow-brand transition-transform hover:scale-[1.03] active:scale-95"
          >
            <PackageSearch className="h-4 w-4" />
            查看訂單狀態
          </Link>
          <Button variant="outline" onClick={() => setResult(null)}>
            再落一單
          </Button>
        </div>
        <p className="mt-4 text-[0.72rem] text-ink-faint">
          你亦可用訂單編號或聯絡電話在「查訂單」頁查詢二手購買進度。
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-card">
      <div className="flex items-baseline justify-between">
        <span className="text-sm font-bold text-ink-muted">購買數量</span>
        <span className="tabular text-2xl font-extrabold text-brand-600">{formatHKD(total)}</span>
      </div>

      <div className="mt-3 flex items-center gap-3">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => setQty((value) => Math.max(1, value - 1))}
          aria-label="減少數量"
        >
          −
        </Button>
        <Input
          type="number"
          min={1}
          value={qty}
          onChange={(event) => setQty(Math.max(1, Number(event.target.value) || 1))}
          className="w-20 text-center text-lg font-extrabold"
          aria-label="購買數量"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="h-10 w-10"
          onClick={() => setQty((value) => Math.min(product.stock, value + 1))}
          aria-label="增加數量"
        >
          +
        </Button>
        <span className="ml-auto text-xs text-ink-faint">現貨 {product.stock} 部</span>
      </div>

      <p className="mt-5 text-sm font-bold text-ink-muted">交收方式</p>
      <div className="mt-2 grid grid-cols-2 gap-2">
        {(
          [
            { value: 'pickup', label: '到店自取', icon: Store },
            { value: 'delivery', label: '送貨上門', icon: Truck },
          ] as const
        ).map((option) => {
          const Icon = option.icon;
          const active = fulfillment === option.value;
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => setFulfillment(option.value)}
              className={cn(
                'flex items-center gap-2 rounded-xl border p-3 text-sm font-bold transition-all duration-200',
                active
                  ? 'border-brand-600 bg-brand-50 text-brand-700'
                  : 'border-slate-200 bg-white text-ink-muted hover:border-brand-300',
              )}
            >
              <Icon className="h-4 w-4" />
              {option.label}
            </button>
          );
        })}
      </div>

      {fulfillment === 'pickup' ? (
        <div className="mt-3">
          <Label htmlFor="pickupShop">自取門市</Label>
          <Select id="pickupShop" value={pickupShop} onChange={(event) => setPickupShop(event.target.value)}>
            {siteConfig.shops.map((shop) => (
              <option key={shop.name} value={shop.name}>
                {shop.name}（{shop.hours}）
              </option>
            ))}
          </Select>
          <Label className="mt-3" htmlFor="pickupAt">
            預計到店時間
          </Label>
          <Input
            id="pickupAt"
            type="datetime-local"
            value={pickupAt}
            onChange={(event) => setPickupAt(event.target.value)}
            aria-label="預計到店時間"
          />
          <p className="mt-1.5 flex items-center gap-1.5 text-xs text-ink-faint">
            <Home className="h-3.5 w-3.5" />
            {siteConfig.shops.find((shop) => shop.name === pickupShop)?.address}
          </p>
        </div>
      ) : (
        <div className="mt-3">
          <Label htmlFor="deliveryAddress">送貨地址</Label>
          <Textarea
            id="deliveryAddress"
            value={deliveryAddress}
            onChange={(event) => setDeliveryAddress(event.target.value)}
            placeholder="請填寫詳細收貨地址（包括大廈、室號）"
            rows={2}
            aria-label="送貨地址"
          />
          {errors.deliveryAddress ? (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.deliveryAddress}</p>
          ) : null}
        </div>
      )}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div>
          <Label htmlFor="customerName">聯絡人</Label>
          <Input
            id="customerName"
            value={customerName}
            onChange={(event) => setCustomerName(event.target.value)}
            placeholder="您的稱呼"
            aria-label="聯絡人姓名"
          />
          {errors.customerName ? (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.customerName}</p>
          ) : null}
        </div>
        <div>
          <Label htmlFor="customerPhone">聯絡電話</Label>
          <Input
            id="customerPhone"
            value={customerPhone}
            onChange={(event) => setCustomerPhone(event.target.value)}
            placeholder="例：9123 4567"
            inputMode="tel"
            aria-label="聯絡電話"
          />
          {errors.customerPhone ? (
            <p className="mt-1 text-xs font-semibold text-red-600">{errors.customerPhone}</p>
          ) : null}
        </div>
      </div>

      <div className="mt-3">
        <Label htmlFor="remark">備註（選填）</Label>
        <Input
          id="remark"
          value={remark}
          onChange={(event) => setRemark(event.target.value)}
          placeholder="例如：希望傍晚時段送貨"
          aria-label="備註"
        />
      </div>

      {errors.form ? <p className="mt-3 text-sm font-semibold text-red-600">{errors.form}</p> : null}

      <div className="mt-4 flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          disabled={submitting}
          onClick={() => cart.addItem(product, qty)}
        >
          加入購物車
        </Button>
        <Button type="submit" variant="cta" size="lg" block disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? '提交中…' : `立即購買・${formatHKD(total)}`}
        </Button>
      </div>
      <p className="mt-2 text-center text-[0.7rem] text-ink-faint">
        落單後門市會致電確認，{product.warrantyDays} 日本店保養生效。多件可「加入購物車」一併結帳。
      </p>
    </form>
  );
}
