'use client';

import * as React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Loader2,
  Minus,
  Plus,
  ShoppingCart,
  Store,
  Trash2,
  Truck,
  X,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input, Label, Select, Textarea, FieldError } from '../ui/input';
import { formatHKD } from '../../lib/format';
import { cn } from '../../lib/utils';
import { siteConfig } from '../../config/site';
import type { FulfillmentMethod, Product } from '../../types';

/* ───────────────────────── 類型 ───────────────────────── */

interface ProductSnapshot {
  name: string;
  price: number;
  image: string;
  grade: Product['grade'];
  stock: number;
  color: string;
  storage: string;
  category: Product['category'];
}

export interface CartItem {
  productId: string;
  qty: number;
  snapshot: ProductSnapshot;
}

interface CartContextValue {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  addItem: (product: Product, qty?: number) => void;
  removeItem: (productId: string) => void;
  updateQty: (productId: string, qty: number) => void;
  clear: () => void;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = React.createContext<CartContextValue | null>(null);

export function useCart(): CartContextValue {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error('useCart 必須在 CartProvider 內使用');
  return ctx;
}

/* ───────────────────────── 工具 ───────────────────────── */

function toSnapshot(product: Product): ProductSnapshot {
  return {
    name: product.name,
    price: product.price,
    image: product.image,
    grade: product.grade,
    stock: product.stock,
    color: product.color,
    storage: product.storage,
    category: product.category,
  };
}

const STORAGE_KEY = 'carepair-cart';

/* ───────────────────────── Provider ───────────────────────── */

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      return parsed.filter(
        (it: CartItem) => it && typeof it.productId === 'string' && it.snapshot,
      );
    } catch {
      return [];
    }
  });
  const [isOpen, setIsOpen] = React.useState(false);
  const [toast, setToast] = React.useState<string | null>(null);

  // 持久化
  React.useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* 忽略儲存失敗（隱私模式等） */
    }
  }, [items]);

  // 打開抽屜時鎖定背景滾動
  React.useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Toast 自動消失
  React.useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 1800);
    return () => clearTimeout(t);
  }, [toast]);

  const addItem = React.useCallback((product: Product, qty = 1) => {
    setItems((prev) => {
      const clamped = Math.max(1, Math.min(qty, product.stock));
      const existing = prev.find((it) => it.productId === product.id);
      if (existing) {
        return prev.map((it) =>
          it.productId === product.id
            ? { ...it, qty: Math.min(it.qty + clamped, product.stock), snapshot: toSnapshot(product) }
            : it,
        );
      }
      return [...prev, { productId: product.id, qty: clamped, snapshot: toSnapshot(product) }];
    });
    setToast('已加入購物車');
  }, []);

  const removeItem = React.useCallback((productId: string) => {
    setItems((prev) => prev.filter((it) => it.productId !== productId));
  }, []);

  const updateQty = React.useCallback((productId: string, qty: number) => {
    setItems((prev) =>
      prev
        .map((it) =>
          it.productId === productId
            ? { ...it, qty: Math.max(1, Math.min(Math.round(qty), it.snapshot.stock)) }
            : it,
        )
        .filter((it) => it.qty >= 1),
    );
  }, []);

  const clear = React.useCallback(() => setItems([]), []);
  const openCart = React.useCallback(() => setIsOpen(true), []);
  const closeCart = React.useCallback(() => setIsOpen(false), []);

  const count = React.useMemo(() => items.reduce((sum, it) => sum + it.qty, 0), [items]);
  const total = React.useMemo(
    () => items.reduce((sum, it) => sum + it.qty * it.snapshot.price, 0),
    [items],
  );

  const value = React.useMemo<CartContextValue>(
    () => ({
      items,
      count,
      total,
      isOpen,
      addItem,
      removeItem,
      updateQty,
      clear,
      openCart,
      closeCart,
    }),
    [items, count, total, isOpen, addItem, removeItem, updateQty, clear, openCart, closeCart],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartFab count={count} onClick={openCart} />
      <CartDrawer />
      {toast ? (
        <div className="pointer-events-none fixed left-1/2 top-20 z-[100] -translate-x-1/2">
          <div className="flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-sm font-bold text-white shadow-lift">
            <CheckCircle2 className="h-4 w-4 text-success" />
            {toast}
          </div>
        </div>
      ) : null}
    </CartContext.Provider>
  );
}

/* ───────────────────────── 浮動購物車按鈕 ───────────────────────── */

function CartFab({ count, onClick }: { count: number; onClick: () => void }) {
  const pathname = usePathname();
  if (pathname.startsWith('/admin') || pathname.startsWith('/repair')) return null;

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="開啟購物車"
      className="fixed bottom-20 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-brand-gradient text-white shadow-brand transition-transform duration-200 hover:scale-105 active:scale-95 lg:bottom-6 lg:right-6"
    >
      <ShoppingCart className="h-6 w-6" />
      {count > 0 ? (
        <span className="absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full bg-cta px-1.5 text-[0.7rem] font-extrabold text-white ring-2 ring-white">
          {count > 99 ? '99+' : count}
        </span>
      ) : null}
    </button>
  );
}

/* ───────────────────────── 購物車抽屜 ───────────────────────── */

type Step = 'cart' | 'checkout' | 'success';

function CartDrawer() {
  const cart = useCart();
  const [step, setStep] = React.useState<Step>('cart');
  const [result, setResult] = React.useState<{ orderNos: string[]; message: string } | null>(null);

  // 每次打開重置到購物車步驟
  React.useEffect(() => {
    if (cart.isOpen) {
      setStep('cart');
      setResult(null);
    }
  }, [cart.isOpen]);

  if (!cart.isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[80] bg-ink/40 backdrop-blur-sm"
        onClick={cart.closeCart}
        aria-hidden="true"
      />
      <aside
        className="fixed inset-x-0 bottom-0 z-[90] flex max-h-[90vh] flex-col rounded-t-3xl bg-white shadow-lift lg:inset-y-0 lg:right-0 lg:left-auto lg:max-h-none lg:w-full lg:max-w-md lg:rounded-none"
        role="dialog"
        aria-modal="true"
        aria-label="購物車"
      >
        {/* 頂部標題列 */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5 text-brand-600" />
            <h2 className="text-base font-extrabold text-ink">
              {step === 'checkout' ? '確認結帳' : step === 'success' ? '落單成功' : '購物車'}
            </h2>
            {step === 'cart' && cart.count > 0 ? (
              <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-bold text-brand-700">
                {cart.count} 件
              </span>
            ) : null}
          </div>
          <button
            type="button"
            onClick={cart.closeCart}
            aria-label="關閉"
            className="flex h-9 w-9 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-slate-100 hover:text-ink"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {step === 'cart' ? (
          <CartList onCheckout={() => setStep('checkout')} />
        ) : null}
        {step === 'checkout' ? (
          <CheckoutForm
            onBack={() => setStep('cart')}
            onSuccess={(data) => {
              setResult(data);
              setStep('success');
              cart.clear();
            }}
          />
        ) : null}
        {step === 'success' && result ? <SuccessView result={result} onClose={cart.closeCart} /> : null}
      </aside>
    </>
  );
}

/* ───────────────────────── 商品清單 ───────────────────────── */

function CartList({ onCheckout }: { onCheckout: () => void }) {
  const cart = useCart();

  if (cart.items.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-16 text-center">
        <ShoppingCart className="h-12 w-12 text-ink-faint" />
        <p className="mt-4 text-sm font-bold text-ink">購物車仲係空嘅</p>
        <p className="mt-1 text-xs text-ink-faint">去二手商城揀啲心水機吧～</p>
        <Button variant="outline" className="mt-5" onClick={cart.closeCart}>
          繼續睇嘢
        </Button>
      </div>
    );
  }

  return (
    <>
      <div className="flex-1 space-y-3 overflow-y-auto touch-pan-y px-4 py-4">
        {cart.items.map((it) => (
          <div
            key={it.productId}
            className="flex gap-3 rounded-2xl border border-slate-200 bg-white p-3"
          >
            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-slate-100">
              {it.snapshot.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={it.snapshot.image}
                  alt={it.snapshot.name}
                  className="h-full w-full object-cover"
                />
              ) : null}
            </div>
            <div className="flex min-w-0 flex-1 flex-col">
              <p className="line-clamp-2 text-sm font-bold leading-snug text-ink">
                {it.snapshot.name}
              </p>
              <p className="mt-0.5 text-[0.7rem] text-ink-faint">
                {it.snapshot.storage}・{it.snapshot.color}・庫存 {it.snapshot.stock}
              </p>
              <div className="mt-auto flex items-center justify-between pt-2">
                <div className="flex items-center gap-2 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => cart.updateQty(it.productId, it.qty - 1)}
                    aria-label="減少"
                    className="flex h-7 w-7 items-center justify-center text-ink-muted hover:text-brand-600"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="min-w-5 text-center text-sm font-bold tabular">{it.qty}</span>
                  <button
                    type="button"
                    onClick={() => cart.updateQty(it.productId, it.qty + 1)}
                    disabled={it.qty >= it.snapshot.stock}
                    aria-label="增加"
                    className="flex h-7 w-7 items-center justify-center text-ink-muted hover:text-brand-600 disabled:opacity-30"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => cart.removeItem(it.productId)}
                  aria-label="移除"
                  className="flex items-center gap-1 text-[0.7rem] font-semibold text-ink-faint hover:text-state-danger"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  刪除
                </button>
              </div>
            </div>
            <div className="flex shrink-0 flex-col items-end justify-between">
              <p className="text-sm font-extrabold text-brand-600">
                {formatHKD(it.snapshot.price * it.qty)}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="border-t border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">合計</span>
          <span className="tabular text-xl font-extrabold text-brand-600">{formatHKD(cart.total)}</span>
        </div>
        <p className="mt-1 text-[0.7rem] text-ink-faint">
          一次過填寫地址同聯絡方式，多件一併落單，亦可選擇到店領取。
        </p>
        <Button variant="cta" size="lg" block className="mt-3" onClick={onCheckout}>
          去結帳（{cart.count} 件）
        </Button>
      </div>
    </>
  );
}

/* ───────────────────────── 結帳表單 ───────────────────────── */

function CheckoutForm({
  onBack,
  onSuccess,
}: {
  onBack: () => void;
  onSuccess: (data: { orderNos: string[]; message: string }) => void;
}) {
  const cart = useCart();
  const [customerName, setCustomerName] = React.useState('');
  const [customerPhone, setCustomerPhone] = React.useState('');
  const [fulfillment, setFulfillment] = React.useState<FulfillmentMethod>('pickup');
  const [pickupShop, setPickupShop] = React.useState<string>(siteConfig.shops[0]?.name ?? '');
  const [pickupAt, setPickupAt] = React.useState('');
  const [deliveryAddress, setDeliveryAddress] = React.useState('');
  const [remark, setRemark] = React.useState('');
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [submitting, setSubmitting] = React.useState(false);

  const validate = () => {
    const next: Record<string, string> = {};
    if (customerName.trim().length < 2) next.customerName = '請填寫聯絡人姓名';
    if (customerPhone.replace(/\D/g, '').length < 8) next.customerPhone = '請填寫正確的聯絡電話';
    if (fulfillment === 'delivery' && deliveryAddress.trim().length < 6)
      next.deliveryAddress = '請填寫完整送貨地址';
    if (fulfillment === 'pickup' && !pickupShop) next.pickupShop = '請選擇自取門市';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (submitting) return;
    if (!validate()) return;
    setSubmitting(true);

    const payload = {
      items: cart.items.map((it) => ({ productId: it.productId, qty: it.qty })),
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      fulfillment,
      deliveryAddress: deliveryAddress.trim() || undefined,
      pickupShop: fulfillment === 'pickup' ? pickupShop : undefined,
      pickupAt: pickupAt.trim() || undefined,
      remark: remark.trim() || undefined,
    };

    try {
      const res = await fetch('/api/shop-orders/batch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
        orderNos?: string[];
        message?: string;
      } | null;
      if (res.ok && data?.orderNos) {
        onSuccess({ orderNos: data.orderNos, message: data.message ?? '多件訂單已落單成功。' });
        return;
      }
      setErrors({ form: data?.message ?? '落單失敗，請檢查資料後再試。' });
    } catch {
      setErrors({ form: '網絡異常，請稍後再試。' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-1 flex-col overflow-hidden">
      <div className="flex-1 space-y-4 overflow-y-auto touch-pan-y px-5 py-4">
        <div className="rounded-xl bg-slate-50 p-3 text-sm text-ink-muted">
          共 <span className="font-bold text-brand-600">{cart.count}</span> 件商品，合計{' '}
          <span className="font-bold text-brand-600">{formatHKD(cart.total)}</span>
          <br />
          以下資料只需填一次，適用於購物車內全部商品。
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="co-name" required>
              聯絡人
            </Label>
            <Input
              id="co-name"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="您的稱呼"
              invalid={!!errors.customerName}
            />
            <FieldError>{errors.customerName}</FieldError>
          </div>
          <div>
            <Label htmlFor="co-phone" required>
              聯絡電話
            </Label>
            <Input
              id="co-phone"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              placeholder="例：9123 4567"
              inputMode="tel"
              invalid={!!errors.customerPhone}
            />
            <FieldError>{errors.customerPhone}</FieldError>
          </div>
        </div>

        <div>
          <Label required>交收方式</Label>
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                { value: 'pickup', label: '到店領取', icon: Store },
                { value: 'delivery', label: '送貨上門', icon: Truck },
              ] as const
            ).map((opt) => {
              const Icon = opt.icon;
              const active = fulfillment === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setFulfillment(opt.value)}
                  className={cn(
                    'flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-bold transition-all duration-200',
                    active
                      ? 'border-brand-600 bg-brand-50 text-brand-700'
                      : 'border-slate-200 bg-white text-ink-muted hover:border-brand-300',
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {opt.label}
                </button>
              );
            })}
          </div>
        </div>

        {fulfillment === 'pickup' ? (
          <div>
            <Label htmlFor="co-shop" required>
              領取門市
            </Label>
            <Select
              id="co-shop"
              value={pickupShop}
              onChange={(e) => setPickupShop(e.target.value)}
              invalid={!!errors.pickupShop}
            >
              {siteConfig.shops.map((shop) => (
                <option key={shop.name} value={shop.name}>
                  {shop.name}（{shop.hours}）
                </option>
              ))}
            </Select>
            <Label className="mt-3" htmlFor="co-pickup-at">
              預計到店時間（選填）
            </Label>
            <Input
              id="co-pickup-at"
              type="datetime-local"
              value={pickupAt}
              onChange={(e) => setPickupAt(e.target.value)}
            />
            <p className="mt-1.5 text-xs text-ink-faint">
              {siteConfig.shops.find((s) => s.name === pickupShop)?.address}
            </p>
            <FieldError>{errors.pickupShop}</FieldError>
          </div>
        ) : (
          <div>
            <Label htmlFor="co-addr" required>
              送貨地址
            </Label>
            <Textarea
              id="co-addr"
              value={deliveryAddress}
              onChange={(e) => setDeliveryAddress(e.target.value)}
              placeholder="請填寫詳細收貨地址（包括大廈、室號）"
              rows={2}
              invalid={!!errors.deliveryAddress}
            />
            <FieldError>{errors.deliveryAddress}</FieldError>
          </div>
        )}

        <div>
          <Label htmlFor="co-remark">備註（選填）</Label>
          <Input
            id="co-remark"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="例如：希望傍晚時段送貨"
          />
        </div>

        {errors.form ? (
          <p className="text-sm font-semibold text-state-danger">{errors.form}</p>
        ) : null}
      </div>

      <div className="flex gap-3 border-t border-slate-100 px-5 py-4">
        <Button type="button" variant="outline" onClick={onBack} disabled={submitting}>
          返回
        </Button>
        <Button type="submit" variant="cta" size="lg" block disabled={submitting}>
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          {submitting ? '提交中…' : `一併落單・${formatHKD(cart.total)}`}
        </Button>
      </div>
    </form>
  );
}

/* ───────────────────────── 成功畫面 ───────────────────────── */

function SuccessView({
  result,
  onClose,
}: {
  result: { orderNos: string[]; message: string };
  onClose: () => void;
}) {
  const router = useRouter();
  const goTrack = () => {
    if (result.orderNos.length === 1) {
      router.push(`/track?q=${encodeURIComponent(result.orderNos[0])}`);
    } else {
      router.push('/track');
    }
  };
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 py-10 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-full bg-success text-white">
        <CheckCircle2 className="h-7 w-7" />
      </span>
      <h3 className="mt-4 text-lg font-extrabold text-ink">落單成功！</h3>
      <p className="mt-1 text-sm text-ink-muted">{result.message}</p>
      <div className="mt-4 w-full rounded-xl bg-slate-50 p-3 text-left">
        <p className="mb-2 text-xs font-bold text-ink-faint">訂單編號（共 {result.orderNos.length} 張）</p>
        <ul className="space-y-1">
          {result.orderNos.map((no) => (
            <li key={no} className="font-mono text-sm font-bold text-brand-600">
              {no}
            </li>
          ))}
        </ul>
        {result.orderNos.length > 1 ? (
          <p className="mt-2 text-xs text-ink-faint">多張訂單？前往查單頁輸入電話即可一次查看全部。</p>
        ) : null}
      </div>
      <div className="mt-5 flex w-full gap-3">
        <Button variant="outline" block onClick={onClose}>
          繼續購物
        </Button>
        <Button variant="primary" block onClick={goTrack}>
          前往查單
        </Button>
      </div>
    </div>
  );
}
