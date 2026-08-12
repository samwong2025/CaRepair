-- ============================================================
-- CathyRepair 凱西維修 · 機型級距係數（repair_tier_multipliers）
-- 於 Supabase Dashboard → SQL Editor 貼上執行即可完成建置。
-- 此表存放「旗艦 / 進階 / 標準 / 舊款」四個報價浮動係數，
-- 讓後台「維修價格管理」頁可線上調整，並即時套用於線上報價與後台建單。
-- 採單一列（id = 'default'）儲存全站共用的級距係數。
-- ============================================================

create table if not exists public.repair_tier_multipliers (
  id         text primary key default 'default',   -- 固定單一列
  flagship   numeric(6,3) not null default 1.40,    -- 旗艦機型係數
  premium    numeric(6,3) not null default 1.20,    -- 進階機型係數
  standard   numeric(6,3) not null default 1.00,    -- 標準機型係數
  legacy     numeric(6,3) not null default 0.80,    -- 舊款機型係數
  updated_at timestamptz not null default now()
);

-- 僅 service_role（伺服器端 API / 後台）可存取，避免係數被公開竄改
alter table public.repair_tier_multipliers enable row level security;

drop policy if exists "tier_service_only" on public.repair_tier_multipliers;
create policy "tier_service_only" on public.repair_tier_multipliers
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ─── 初始種子資料（預設級距係數） ───────────────────────
insert into public.repair_tier_multipliers (id, flagship, premium, standard, legacy)
values ('default', 1.40, 1.20, 1.00, 0.80)
on conflict (id) do nothing;

-- ─── 啟用 Realtime（係數變動即時同步） ──────────────────
alter publication supabase_realtime add table public.repair_tier_multipliers;
