-- ============================================================
-- CathyRepair 凱西維修 · Supabase 資料庫結構
-- 於 Supabase Dashboard → SQL Editor 貼上執行即可完成建置。
-- ============================================================

create extension if not exists "pgcrypto";

-- ─── 客戶（會員檔案 / CRM） ─────────────────────────────
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  member_no     text not null unique,
  name          text not null,
  phone         text not null,
  phone_digits  text not null unique,          -- 去除空格符號後的號碼，用於精準比對
  email         text,
  district      text,
  address       text,
  level         text not null default 'regular'
                check (level in ('regular','silver','gold','vip')),
  points        integer not null default 0,
  total_spent   numeric(12,2) not null default 0,
  order_count   integer not null default 0,
  tags          text[] not null default '{}',
  note          text,
  created_at    timestamptz not null default now(),
  last_order_at timestamptz
);

create index if not exists idx_customers_phone on public.customers (phone_digits);
create index if not exists idx_customers_level on public.customers (level);

-- ─── 維修訂單 ───────────────────────────────────────────
create table if not exists public.repair_orders (
  id                uuid primary key default gen_random_uuid(),
  order_no          text not null unique,
  customer_id       uuid not null references public.customers (id) on delete cascade,
  customer_name     text not null,
  customer_phone    text not null,
  phone_digits      text not null,
  device_category   text not null check (device_category in ('iphone','ipad','watch','macbook')),
  device_model_id   text not null,
  device_model_name text not null,
  symptom_ids       text[] not null default '{}',
  quote             jsonb not null,             -- 完整報價明細（配件費／人工費逐項）
  service_mode      text not null check (service_mode in ('walk_in','pickup','mail_in')),
  shop_name         text,
  address           text,
  appointment_at    timestamptz not null,
  remark            text,
  status            text not null default 'submitted'
                    check (status in ('submitted','confirmed','diagnosing','repairing',
                                      'quality_check','ready','completed','cancelled')),
  timeline          jsonb not null default '[]'::jsonb,
  technician        text,
  manual_price      numeric(12,2),                    -- 講價後人工最終報價；NULL 表示以系統報價為準
  price_note        text,                             -- 改價說明（如「老客戶優惠」）
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index if not exists idx_orders_phone   on public.repair_orders (phone_digits);
create index if not exists idx_orders_status  on public.repair_orders (status);
create index if not exists idx_orders_created on public.repair_orders (created_at desc);

-- ─── 維修工單（後台維修管理系統） ───────────────────────
create table if not exists public.repair_tickets (
  id                uuid primary key default gen_random_uuid(),
  ticket_no         text not null unique,
  order_id          uuid not null references public.repair_orders (id) on delete cascade,
  order_no          text not null,
  device_model_name text not null,
  customer_name     text not null,
  customer_phone    text not null,
  symptom_summary   text not null,
  technician        text not null default '待分派',
  status            text not null default 'submitted',
  priority          text not null default 'normal' check (priority in ('normal','urgent')),
  parts_used        jsonb not null default '[]'::jsonb,
  labor_cost        numeric(12,2) not null default 0,
  total_cost        numeric(12,2) not null default 0,
  started_at        timestamptz,
  finished_at       timestamptz,
  warranty_until    timestamptz,
  created_at        timestamptz not null default now()
);

create index if not exists idx_tickets_order  on public.repair_tickets (order_id);
create index if not exists idx_tickets_status on public.repair_tickets (status);

-- ─── 售後服務個案 ───────────────────────────────────────
create table if not exists public.after_sales (
  id             uuid primary key default gen_random_uuid(),
  case_no        text not null unique,
  order_no       text not null,
  customer_name  text not null,
  customer_phone text not null,
  phone_digits   text not null,
  type           text not null check (type in ('warranty','complaint','consult','return')),
  subject        text not null,
  detail         text not null,
  status         text not null default 'pending'
                 check (status in ('pending','processing','resolved','rejected')),
  handler        text,
  resolution     text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists idx_aftersales_phone  on public.after_sales (phone_digits);
create index if not exists idx_aftersales_order  on public.after_sales (order_no);

-- ─── 二手商店商品 ───────────────────────────────────────
create table if not exists public.products (
  id             text primary key,
  name           text not null,
  category       text not null check (category in ('iphone','ipad','watch','macbook')),
  storage        text not null,
  color          text not null,
  grade          text not null check (grade in ('S','A','B')),
  battery_health integer not null default 100,
  price          numeric(12,2) not null,
  original_price numeric(12,2) not null,
  stock          integer not null default 0,
  warranty_days  integer not null default 90,
  image          text not null,
  highlights     text[] not null default '{}',
  description    text not null,
  accessories    text[] not null default '{}',
  hot            boolean not null default false,
  created_at     timestamptz not null default now()
);

-- ─── 二手商店訂單 ───────────────────────────────────────
create table if not exists public.shop_orders (
  id               uuid primary key default gen_random_uuid(),
  order_no         text not null unique,
  product_id       text not null references public.products (id),
  product_name     text not null,
  price            numeric(12,2) not null,
  qty              integer not null default 1,
  fulfillment      text not null check (fulfillment in ('delivery','pickup')),
  delivery_address text,
  pickup_shop      text,
  pickup_at        timestamptz,
  customer_name    text not null,
  customer_phone   text not null,
  phone_digits     text not null,
  remark           text,
  status           text not null default 'pending'
                   check (status in ('pending','paid','shipped','picked','completed','cancelled')),
  created_at       timestamptz not null default now()
);

create index if not exists idx_shop_orders_phone on public.shop_orders (phone_digits);

-- ============================================================
-- Row Level Security
-- 前台以 anon key 讀取商品；其餘客戶與訂單資料一律只允許
-- service_role（伺服器端 API）存取，避免個人資料外洩。
-- ============================================================

alter table public.customers      enable row level security;
alter table public.repair_orders  enable row level security;
alter table public.repair_tickets enable row level security;
alter table public.after_sales    enable row level security;
alter table public.products       enable row level security;
alter table public.shop_orders    enable row level security;

-- 商品目錄：任何人可讀
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products
  for select using (true);

-- 訂單狀態即時追蹤：允許 anon 訂閱 realtime（僅 select，
-- 實際查詢一律經伺服器 API 以電話 + 單號雙重驗證後回傳）
drop policy if exists "orders_realtime_read" on public.repair_orders;
create policy "orders_realtime_read" on public.repair_orders
  for select using (true);

-- 其餘敏感表：僅 service_role 可存取
drop policy if exists "customers_service_only" on public.customers;
create policy "customers_service_only" on public.customers
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "tickets_service_only" on public.repair_tickets;
create policy "tickets_service_only" on public.repair_tickets
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "aftersales_service_only" on public.after_sales;
create policy "aftersales_service_only" on public.after_sales
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "shop_orders_service_only" on public.shop_orders;
create policy "shop_orders_service_only" on public.shop_orders
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ─── 啟用 Realtime（訂單狀態即時推送） ──────────────────
alter publication supabase_realtime add table public.repair_orders;
