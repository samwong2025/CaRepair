-- ============================================================
-- CathyRepair 凱西維修 · 機型 / 故障 目錄表
-- 於 Supabase Dashboard → SQL Editor 貼上執行。
-- 取代原寫死於 src/data/devices.ts 與 src/data/symptoms.ts 的目錄，
-- 讓後台「機型管理」「故障管理」可隨時增刪改（應對每年新機發布）。
-- ============================================================

-- ─── 機型表 ───────────────────────────────────────────────
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

-- ─── 故障症狀表 ───────────────────────────────────────────
create table if not exists public.device_symptoms (
  id          text primary key,
  name        text not null,
  short_name  text not null default '',
  icon        text not null default 'Wrench',
  description text not null default '',
  categories  text[] not null default '{}',   -- 適用機型分類陣列
  frequency   integer not null default 50,
  urgent      boolean not null default false,
  updated_at  timestamptz not null default now()
);

-- ─── 權限：僅 service_role（後台 / API）可存取 ──────────
alter table public.device_models enable row level security;
alter table public.device_symptoms enable row level security;

drop policy if exists "models_service_only" on public.device_models;
create policy "models_service_only" on public.device_models
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

drop policy if exists "symptoms_service_only" on public.device_symptoms;
create policy "symptoms_service_only" on public.device_symptoms
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ─── 啟用 Realtime ──────────────────────────────────────
alter publication supabase_realtime add table public.device_models;
alter publication supabase_realtime add table public.device_symptoms;
