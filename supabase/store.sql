-- ============================================================
-- CathyRepair 凱西維修 · 二手商城資料表（products / shop_orders）
-- 於 Supabase Dashboard → SQL Editor 貼上執行即可完成建置。
-- 前台二手商店會讀取 products；下單後會寫入 shop_orders；
-- 後台「二手商城・商品管理 / 訂單管理」透過服務端 API 維護這兩張表。
-- ============================================================

-- ─── 二手商品表 ────────────────────────────────────────
create table if not exists public.products (
  id            text primary key,
  name          text not null,
  category      text not null default 'watch',   -- watch / iphone / android / accessory
  storage       text default '',                 -- 容量 / 規格
  color         text default '',                 -- 顏色
  grade         text default 'A',                 -- 99新 / 95新 / 9成新 / 8成新
  battery_health integer not null default 90,    -- 電池健康度 %
  price         numeric(10,2) not null default 0,-- 售價（HK$）
  original_price numeric(10,2) not null default 0,-- 原價（HK$，選填）
  stock         integer not null default 0,      -- 庫存數量
  warranty_days integer not null default 90,     -- 保養天數
  image         text default '',                 -- 商品圖片網址
  highlights    text[] default '{}',             -- 賣點清單
  description   text default '',                 -- 商品描述
  accessories   text[] default '{}',             -- 隨附配件清單
  hot           boolean not null default false,  -- 是否熱賣
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ─── 二手商城訂單表 ────────────────────────────────────
create table if not exists public.shop_orders (
  id               text primary key,
  order_no         text not null unique,          -- SH-YYYYMMDD-XXXX
  product_id       text not null references public.products(id),
  product_name     text not null,
  price            numeric(10,2) not null default 0,
  qty              integer not null default 1,
  fulfillment      text not null default 'delivery', -- delivery / pickup
  delivery_address text default '',
  pickup_shop      text default '',
  pickup_at        text default '',
  customer_name    text not null,
  customer_phone   text not null,
  phone_digits     text default '',               -- 純數字電話，方便查詢
  remark           text default '',
  status           text not null default 'pending', -- pending/paid/shipped/picked/completed/cancelled
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists shop_orders_phone_idx on public.shop_orders (phone_digits);
create index if not exists shop_orders_status_idx on public.shop_orders (status);

-- ─── 權限（RLS） ───────────────────────────────────────
-- 公開讀取：前台商店頁與訂單查詢使用 anon key
-- 寫入：僅 service_role（伺服器端 API）可操作，避免資料被公開竄改
alter table public.products enable row level security;
alter table public.shop_orders enable row level security;

drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (true);

drop policy if exists "products_service_write" on public.products;
create policy "products_service_write" on public.products
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "shop_orders_public_read" on public.shop_orders;
create policy "shop_orders_public_read" on public.shop_orders
  for select using (true);

drop policy if exists "shop_orders_service_write" on public.shop_orders;
create policy "shop_orders_service_write" on public.shop_orders
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ─── 初始種子（二手商品範例） ──────────────────────────
insert into public.products (
  id, name, category, storage, color, grade, battery_health,
  price, original_price, stock, warranty_days, image, highlights, accessories, hot
) values
  ('P1001', 'Apple Watch Series 9（45mm GPS）', 'watch', '64GB', '午夜暗色', '99新', 96,
   1690, 3299, 3, 90, '', array['電池健康度 96%','無花無崩','原裝盒裝'], array['原裝包裝盒','USB-C 磁吸充電線'], true),
  ('P1002', 'Apple Watch SE（40mm GPS）', 'watch', '32GB', '星光色', '95新', 91,
   990, 2199, 5, 90, '', array['成色極佳','功能正常'], array['原裝包裝盒','充電器'], false),
  ('P1003', 'iPhone 13（128GB）', 'iphone', '128GB', '藍色', '9成新', 88,
   2590, 4999, 2, 90, '', array['電池 88%','外觀輕微使用痕跡'], array['原裝充電線'], true),
  ('P1004', 'Samsung Galaxy Watch 6', 'android', '16GB', '石墨黑', '9成新', 90,
   890, 1799, 4, 90, '', array['支援血氧偵測','電池健康'], array['充電座'], false)
on conflict (id) do nothing;

-- ─── 啟用 Realtime ─────────────────────────────────────
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.shop_orders;
