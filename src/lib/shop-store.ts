import { products as seedProducts } from '../data/products';
import { type Product } from '../types';
import { isSupabaseConfigured } from './supabase/client';
import { getRepository } from './repositories';

const LS_KEY = 'cathayrepair_products';

/* ── localStorage（mock 模式備援） ───────────────────────── */
function readLocalProducts(): Product[] | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as Product[]) : null;
  } catch {
    return null;
  }
}

function writeLocalProducts(products: Product[]): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LS_KEY, JSON.stringify(products));
}

/* ── 主要匯出 ─────────────────────────────────────────── */
export function getProductSeed(): Product[] {
  return seedProducts;
}

/** 取得全部二手商品（Supabase > localStorage > 種子資料） */
export async function loadProducts(): Promise<Product[]> {
  if (isSupabaseConfigured()) {
    try {
      const list = await getRepository().listProducts();
      if (list.length > 0) return list;
    } catch (e) {
      console.error('[shop] loadProducts supabase', e);
    }
  }
  if (typeof window !== 'undefined') {
    const local = readLocalProducts();
    if (local && local.length > 0) return local;
  }
  return seedProducts;
}

/** 新增 / 更新單一商品（Supabase > localStorage 備援） */
export async function saveProduct(product: Product): Promise<Product> {
  if (isSupabaseConfigured()) {
    try {
      return await getRepository().upsertProduct(product);
    } catch (e) {
      console.error('[shop] saveProduct supabase', e);
    }
  }
  // mock 模式：寫入 localStorage
  const local = readLocalProducts() ?? [...seedProducts];
  const idx = local.findIndex((p) => p.id === product.id);
  if (idx >= 0) local[idx] = product;
  else local.push(product);
  writeLocalProducts(local);
  return product;
}

/** 刪除商品（僅 mock 模式支援；Supabase 模式下需在資料庫停用） */
export async function deleteProduct(id: string): Promise<void> {
  if (isSupabaseConfigured()) return;
  if (typeof window === 'undefined') return;
  const local = readLocalProducts() ?? [...seedProducts];
  writeLocalProducts(local.filter((p) => p.id !== id));
}

export function genProductId(): string {
  return `P${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 90 + 10)}`;
}

export const SHOP_CATEGORIES = ['Apple Watch', 'iPhone', 'Android', '配件'] as const;
export const SHOP_GRADES = ['99新', '95新', '9成新', '8成新'] as const;
