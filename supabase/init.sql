-- ============================================================
-- CathyRepair 凱西維修 · 整合建表腳本（一次性跑通）
-- 執行方式：Supabase Dashboard → SQL Editor → 貼上全部 → Run
-- 已解決 schema.sql 與 store.sql 重複定義 products / shop_orders
-- 的衝突（以 store.sql 版本為準，二手商城 UI 實際使用此結構）。
-- ============================================================

create extension if not exists "pgcrypto";

-- ═══════════════════════════════════════════════════════════
-- 1. 客戶（會員檔案 / CRM）
-- ═══════════════════════════════════════════════════════════
create table if not exists public.customers (
  id            uuid primary key default gen_random_uuid(),
  member_no     text not null unique,
  name          text not null,
  phone         text not null,
  phone_digits  text not null unique,
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

-- ═══════════════════════════════════════════════════════════
-- 2. 維修訂單（引用 customers）
-- ═══════════════════════════════════════════════════════════
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
  quote             jsonb not null,
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
  manual_price      numeric(12,2),
  price_note        text,
  source            text not null default 'manual'
                    check (source in ('online','manual')),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists idx_orders_phone   on public.repair_orders (phone_digits);
create index if not exists idx_orders_status  on public.repair_orders (status);
create index if not exists idx_orders_created on public.repair_orders (created_at desc);

-- ═══════════════════════════════════════════════════════════
-- 3. 維修工單（引用 repair_orders）
-- ═══════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════
-- 4. 售後服務個案
-- ═══════════════════════════════════════════════════════════
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

-- ═══════════════════════════════════════════════════════════
-- 5. 機型 / 故障目錄
-- ═══════════════════════════════════════════════════════════
create table if not exists public.device_models (
  id        text primary key,
  category  text not null check (category in ('iphone','ipad','watch','macbook')),
  name      text not null,
  series    text not null default '',
  year      integer not null default 2025,
  tier      text not null default 'standard'
            check (tier in ('flagship','premium','standard','legacy')),
  hot       boolean not null default false,
  image     text,
  updated_at timestamptz not null default now()
);
create table if not exists public.device_symptoms (
  id          text primary key,
  name        text not null,
  short_name  text not null default '',
  icon        text not null default 'Wrench',
  description text not null default '',
  categories  text[] not null default '{}',
  frequency   integer not null default 50,
  urgent      boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════
-- 6. 維修價格表
-- ═══════════════════════════════════════════════════════════
create table if not exists public.repair_pricing (
  id               uuid primary key default gen_random_uuid(),
  category         text not null check (category in ('iphone','ipad','watch','macbook')),
  symptom_id       text not null,
  part_name        text not null,
  base_part_fee    numeric(12,2) not null default 0,
  base_labor_fee   numeric(12,2) not null default 0,
  duration_minutes integer not null default 30,
  warranty_days    integer not null default 90,
  requires_lab     boolean not null default false,
  updated_at       timestamptz not null default now(),
  unique (category, symptom_id)
);
create index if not exists idx_pricing_category on public.repair_pricing (category);

-- ═══════════════════════════════════════════════════════════
-- 7. 機型級距係數
-- ═══════════════════════════════════════════════════════════
create table if not exists public.repair_tier_multipliers (
  id         text primary key default 'default',
  flagship   numeric(6,3) not null default 1.40,
  premium    numeric(6,3) not null default 1.20,
  standard   numeric(6,3) not null default 1.00,
  legacy     numeric(6,3) not null default 0.80,
  updated_at timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════
-- 8. 二手商店：商品 / 訂單（以 store.sql 版本為準）
-- ═══════════════════════════════════════════════════════════
create table if not exists public.products (
  id             text primary key,
  name           text not null,
  category       text not null default 'watch',
  storage        text default '',
  color          text default '',
  grade          text default 'A',
  battery_health integer not null default 90,
  price          numeric(10,2) not null default 0,
  original_price numeric(10,2) not null default 0,
  stock          integer not null default 0,
  warranty_days  integer not null default 90,
  image          text default '',
  highlights     text[] default '{}',
  description    text default '',
  accessories    text[] default '{}',
  services       text[] not null default '{}',
  hot            boolean not null default false,
  category_id    text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
create table if not exists public.shop_orders (
  id               text primary key,
  order_no         text not null unique,
  product_id       text not null references public.products(id),
  product_name     text not null,
  price            numeric(10,2) not null default 0,
  qty              integer not null default 1,
  fulfillment      text not null default 'delivery',
  delivery_address text default '',
  pickup_shop      text default '',
  pickup_at        text default '',
  customer_name    text not null,
  customer_phone   text not null,
  phone_digits     text default '',
  remark           text default '',
  status           text not null default 'pending',
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
create index if not exists shop_orders_phone_idx on public.shop_orders (phone_digits);
create index if not exists shop_orders_status_idx on public.shop_orders (status);

-- ═══════════════════════════════════════════════════════════
-- 9. 師傅資料表
-- ═══════════════════════════════════════════════════════════
create table if not exists public.technicians (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique,
  name          text not null,
  extension     text,
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);
create index if not exists idx_technicians_name on public.technicians (name);

-- ═══════════════════════════════════════════════════════════
-- 10. 倉庫進銷存
-- ═══════════════════════════════════════════════════════════
create table if not exists public.inventory_parts (
  id                 text primary key,
  name               text not null,
  category           text not null default 'other',
  device_category    text,
  symptom_id         text,
  sku                text,
  stock              integer not null default 0,
  low_stock_threshold integer not null default 5,
  unit_cost          numeric(10,2) not null default 0,
  unit_price         numeric(10,2),
  supplier           text,
  supplier_id        text,
  category_id        text,
  updated_at         timestamptz not null default now()
);
create table if not exists public.inventory_movements (
  id           text primary key,
  part_id      text not null references public.inventory_parts(id),
  part_name    text not null,
  type         text not null check (type in ('inbound','outbound','adjust')),
  qty          integer not null default 0,
  balance      integer not null default 0,
  unit_cost    numeric(10,2),
  note         text,
  ref_order_no text,
  created_at   timestamptz not null default now()
);
create index if not exists inventory_movements_part_idx on public.inventory_movements (part_id);
create index if not exists inventory_movements_created_idx on public.inventory_movements (created_at);

-- ═══════════════════════════════════════════════════════════
-- 10b. 商品分類（庫存與二手商城共用）
-- ═══════════════════════════════════════════════════════════
create table if not exists public.product_categories (
  id          text primary key,
  name        text not null,
  group_      text,
  sort_order  integer not null default 0,
  updated_at  timestamptz not null default now()
);

-- ═══════════════════════════════════════════════════════════
-- 10c. 往來單位（供應商 / 客戶）檔案
-- ═══════════════════════════════════════════════════════════
create table if not exists public.counterparties (
  id          text primary key,
  name        text not null,
  type        text not null default 'supplier' check (type in ('supplier','customer','both')),
  contact     text,
  phone       text,
  email       text,
  address     text,
  tax_no      text,
  settlement  text,
  note        text,
  updated_at  timestamptz not null default now()
);
create index if not exists counterparties_type_idx on public.counterparties (type);

-- ═══════════════════════════════════════════════════════════
-- 11. Row Level Security（public 表）
-- ═══════════════════════════════════════════════════════════
alter table public.customers      enable row level security;
alter table public.repair_orders  enable row level security;
alter table public.repair_tickets enable row level security;
alter table public.after_sales    enable row level security;
alter table public.products       enable row level security;
alter table public.shop_orders    enable row level security;
alter table public.device_models   enable row level security;
alter table public.device_symptoms enable row level security;
alter table public.repair_pricing  enable row level security;
alter table public.repair_tier_multipliers enable row level security;
alter table public.technicians     enable row level security;
alter table public.inventory_parts enable row level security;
alter table public.inventory_movements enable row level security;
alter table public.product_categories enable row level security;
alter table public.counterparties enable row level security;

-- 公開可讀：商品目錄、訂單狀態追蹤、價格/級距/機型/庫存（前台與報表用 anon）
drop policy if exists "products_public_read" on public.products;
create policy "products_public_read" on public.products for select using (true);

drop policy if exists "orders_realtime_read" on public.repair_orders;
create policy "orders_realtime_read" on public.repair_orders for select using (true);

drop policy if exists "shop_orders_public_read" on public.shop_orders;
create policy "shop_orders_public_read" on public.shop_orders for select using (true);

drop policy if exists "models_public_read" on public.device_models;
create policy "models_public_read" on public.device_models for select using (true);

drop policy if exists "symptoms_public_read" on public.device_symptoms;
create policy "symptoms_public_read" on public.device_symptoms for select using (true);

drop policy if exists "pricing_public_read" on public.repair_pricing;
create policy "pricing_public_read" on public.repair_pricing for select using (true);

drop policy if exists "tier_public_read" on public.repair_tier_multipliers;
create policy "tier_public_read" on public.repair_tier_multipliers for select using (true);

drop policy if exists "inventory_parts_read" on public.inventory_parts;
create policy "inventory_parts_read" on public.inventory_parts for select using (true);

drop policy if exists "inventory_movements_read" on public.inventory_movements;
create policy "inventory_movements_read" on public.inventory_movements for select using (true);

drop policy if exists "product_categories_public_read" on public.product_categories;
create policy "product_categories_public_read" on public.product_categories for select using (true);

drop policy if exists "counterparties_public_read" on public.counterparties;
create policy "counterparties_public_read" on public.counterparties for select using (true);

-- 僅 service_role（伺服器端 API）可寫入敏感資料
drop policy if exists "customers_service_only" on public.customers;
create policy "customers_service_only" on public.customers
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "orders_service_only" on public.repair_orders;
create policy "orders_service_only" on public.repair_orders
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "tickets_service_only" on public.repair_tickets;
create policy "tickets_service_only" on public.repair_tickets
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "aftersales_service_only" on public.after_sales;
create policy "aftersales_service_only" on public.after_sales
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "products_service_write" on public.products;
create policy "products_service_write" on public.products
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "shop_orders_service_write" on public.shop_orders;
create policy "shop_orders_service_write" on public.shop_orders
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "models_service_only" on public.device_models;
create policy "models_service_only" on public.device_models
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "symptoms_service_only" on public.device_symptoms;
create policy "symptoms_service_only" on public.device_symptoms
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "pricing_service_only" on public.repair_pricing;
create policy "pricing_service_only" on public.repair_pricing
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "tier_service_only" on public.repair_tier_multipliers;
create policy "tier_service_only" on public.repair_tier_multipliers
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "technicians_service_only" on public.technicians;
create policy "technicians_service_only" on public.technicians
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "inventory_parts_service_write" on public.inventory_parts;
create policy "inventory_parts_service_write" on public.inventory_parts
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "inventory_movements_service_write" on public.inventory_movements;
create policy "inventory_movements_service_write" on public.inventory_movements
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "product_categories_service_write" on public.product_categories;
create policy "product_categories_service_write" on public.product_categories
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "counterparties_service_write" on public.counterparties;
create policy "counterparties_service_write" on public.counterparties
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ═══════════════════════════════════════════════════════════
-- 12. Realtime 發布
-- ═══════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.repair_orders;
alter publication supabase_realtime add table public.products;
alter publication supabase_realtime add table public.shop_orders;
alter publication supabase_realtime add table public.device_models;
alter publication supabase_realtime add table public.device_symptoms;
alter publication supabase_realtime add table public.repair_pricing;
alter publication supabase_realtime add table public.repair_tier_multipliers;
alter publication supabase_realtime add table public.technicians;
alter publication supabase_realtime add table public.inventory_parts;
alter publication supabase_realtime add table public.inventory_movements;
alter publication supabase_realtime add table public.product_categories;
alter publication supabase_realtime add table public.counterparties;

-- ═══════════════════════════════════════════════════════════
-- 13. 初始種子資料
-- ═══════════════════════════════════════════════════════════

-- 二手商品範例
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

-- 維修價格表（節錄常用項目；如需完整清單請參考 pricing.sql）
insert into public.repair_pricing (
  category, symptom_id, part_name, base_part_fee, base_labor_fee,
  duration_minutes, warranty_days, requires_lab
) values
  ('iphone',  'screen_crack',     '原裝級 OLED 屏幕總成', 850,  300, 60,  180, false),
  ('iphone',  'battery_aging',    '原廠規格電池',         380,  150, 30,  365, false),
  ('iphone',  'water_damage',     '入水清洗除鏽套餐',     450,  500, 90,  90,  true),
  ('iphone',  'camera_fault',     '後置鏡頭模組',         520,  250, 45,  120, false),
  ('iphone',  'charging_port',    '充電尾插排線',         280,  200, 40,  120, false),
  ('iphone',  'no_power',         '電源管理維修',         400,  400, 75,  90,  true),
  ('iphone',  'back_glass',       '後蓋玻璃',             420,  250, 50,  120, false),
  ('iphone',  'speaker_mic',      '聽筒喇叭模組',         300,  200, 40,  120, false),
  ('iphone',  'face_id',          '原深感鏡頭模組',       650,  450, 80,  90,  true),
  ('iphone',  'button_fault',     '側鍵排線',             220,  180, 35,  90,  false),
  ('iphone',  'signal_wifi',      '天線 / 基帶維修',      380,  350, 70,  90,  true),
  ('iphone',  'overheat',         '散熱 / 主板檢測',      350,  320, 60,  90,  false),
  ('iphone',  'logic_board',      '主板晶片級維修',       700,  700, 120, 90,  true),
  ('iphone',  'data_recovery',    '資料救援服務',         600,  600, 120, 0,   true),
  ('iphone',  'software_system',  '系統還原修復',         200,  250, 45,  30,  false),
  ('ipad',    'screen_crack',     '原裝級 LCD 屏幕總成', 700,  300, 60,  180, false),
  ('ipad',    'battery_aging',    '原廠規格電池',         350,  150, 30,  365, false),
  ('ipad',    'water_damage',     '入水清洗除鏽套餐',     420,  450, 90,  90,  true),
  ('ipad',    'camera_fault',     '鏡頭模組',             420,  220, 45,  120, false),
  ('ipad',    'charging_port',    '充電尾插排線',         260,  180, 40,  120, false),
  ('ipad',    'no_power',         '電源管理維修',         380,  350, 75,  90,  true),
  ('ipad',    'back_glass',       '後蓋玻璃',             380,  220, 50,  120, false),
  ('ipad',    'speaker_mic',      '喇叭模組',             280,  180, 40,  120, false),
  ('ipad',    'face_id',          '解鎖模組維修',         520,  380, 70,  90,  true),
  ('ipad',    'button_fault',     '按鍵排線',            200,  160, 35,  90,  false),
  ('ipad',    'signal_wifi',      'Wi-Fi / 天線維修',     320,  300, 60,  90,  true),
  ('ipad',    'overheat',         '散熱 / 主板檢測',      320,  300, 60,  90,  false),
  ('ipad',    'logic_board',      '主板晶片級維修',       620,  620, 120, 90,  true),
  ('ipad',    'data_recovery',    '資料救援服務',         520,  520, 120, 0,   true),
  ('ipad',    'software_system',  '系統還原修復',         180,  220, 45,  30,  false),
  ('watch',   'screen_crack',     '原裝級屏幕總成',       680,  350, 60,  180, false),
  ('watch',   'battery_aging',    '原廠規格電池',         320,  200, 35,  365, false),
  ('watch',   'water_damage',     '入水清洗除鏽套餐',     400,  450, 90,  90,  true),
  ('watch',   'no_power',         '電源管理維修',         350,  380, 75,  90,  true),
  ('watch',   'back_glass',       '後蓋玻璃',             360,  250, 50,  120, false),
  ('watch',   'speaker_mic',      '喇叭模組',             280,  200, 40,  120, false),
  ('watch',   'button_fault',     '錶冠 / 按鍵',          260,  220, 40,  90,  false),
  ('watch',   'crown_strap',      '錶冠 / 錶帶機構',      300,  250, 45,  120, false),
  ('watch',   'signal_wifi',      '天線 / 通訊維修',      320,  300, 60,  90,  true),
  ('watch',   'logic_board',      '主板晶片級維修',       580,  600, 120, 90,  true),
  ('watch',   'data_recovery',    '資料救援服務',         500,  520, 120, 0,   true),
  ('watch',   'software_system',  '系統還原修復',         180,  220, 45,  30,  false),
  ('macbook', 'screen_crack',     '原裝級屏幕總成',       1200, 450, 75,  180, false),
  ('macbook', 'battery_aging',    '原廠規格電池',         650,  250, 45,  365, false),
  ('macbook', 'water_damage',     '入水清洗除鏽套餐',     600,  700, 120, 90,  true),
  ('macbook', 'camera_fault',     '鏡頭模組',             480,  280, 50,  120, false),
  ('macbook', 'charging_port',    'USB-C / 充電電路',     450,  350, 60,  120, false),
  ('macbook', 'no_power',         '電源管理維修',         550,  500, 90,  90,  true),
  ('macbook', 'speaker_mic',      '喇叭 / 麥克風模組',    420,  280, 50,  120, false),
  ('macbook', 'face_id',          'Touch ID 維修',         520, 450, 80,  90,  true),
  ('macbook', 'button_fault',     '電源 / 鍵盤排線',      380,  250, 45,  90,  false),
  ('macbook', 'signal_wifi',      'Wi-Fi / 藍牙模組',     420,  320, 60,  90,  true),
  ('macbook', 'overheat',         '散熱 / 風扇維修',      450,  350, 60,  90,  false),
  ('macbook', 'keyboard_fault',   '蝴蝶 / 剪刀式鍵盤',    520,  400, 70,  120, false),
  ('macbook', 'trackpad_fault',   '觸控板模組',           480,  350, 60,  120, false),
  ('macbook', 'storage_upgrade',  'SSD 容量升級',         800,  450, 90,  90,  false),
  ('macbook', 'logic_board',      '主板晶片級維修',       1000,900, 150, 90,  true),
  ('macbook', 'data_recovery',    '資料救援服務',         800,  700, 150, 0,   true),
  ('macbook', 'software_system',  '系統還原修復',         300,  350, 60,  30,  false)
on conflict (category, symptom_id) do nothing;

-- 級距係數
insert into public.repair_tier_multipliers (id, flagship, premium, standard, legacy)
values ('default', 1.40, 1.20, 1.00, 0.80)
on conflict (id) do nothing;
