-- ============================================================
-- CathyRepair 凱西維修 · 倉庫進銷存資料表
-- （inventory_parts 配件庫存 + inventory_movements 異動流水）
-- 於 Supabase Dashboard → SQL Editor 貼上執行即可完成建置。
-- 後台「配件庫存」維護庫存與異動，「進銷存報表」讀取這兩張表。
-- ============================================================

-- ─── 配件庫存表 ──────────────────────────────────────
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
  updated_at         timestamptz not null default now()
);

-- ─── 庫存異動流水表（進銷存核心） ────────────────────
create table if not exists public.inventory_movements (
  id           text primary key,
  part_id      text not null references public.inventory_parts(id),
  part_name    text not null,
  type         text not null check (type in ('inbound','outbound','adjust')),
  qty          integer not null default 0,    -- 永遠為正數
  balance      integer not null default 0,    -- 異動後結餘
  unit_cost    numeric(10,2),                -- 入庫成本（HK$）
  note         text,
  ref_order_no text,
  created_at   timestamptz not null default now()
);

create index if not exists inventory_movements_part_idx on public.inventory_movements (part_id);
create index if not exists inventory_movements_created_idx on public.inventory_movements (created_at);

-- ─── 權限（RLS） ─────────────────────────────────────
-- 讀取：服務端與 anon 均可（後台與報表）
-- 寫入：僅 service_role（伺服器端 API）可操作
alter table public.inventory_parts enable row level security;
alter table public.inventory_movements enable row level security;

drop policy if exists "inventory_parts_read" on public.inventory_parts;
create policy "inventory_parts_read" on public.inventory_parts for select using (true);

drop policy if exists "inventory_parts_service_write" on public.inventory_parts;
create policy "inventory_parts_service_write" on public.inventory_parts
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "inventory_movements_read" on public.inventory_movements;
create policy "inventory_movements_read" on public.inventory_movements for select using (true);

drop policy if exists "inventory_movements_service_write" on public.inventory_movements;
create policy "inventory_movements_service_write" on public.inventory_movements
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ─── 啟用 Realtime ─────────────────────────────────────
alter publication supabase_realtime add table public.inventory_parts;
alter publication supabase_realtime add table public.inventory_movements;
