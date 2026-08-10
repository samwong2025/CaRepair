-- ============================================================
-- CathyRepair 凱西維修 · 認證與師傅帳號
-- 於 Supabase Dashboard → SQL Editor 貼上執行。
-- 配合 src/middleware.ts + src/lib/auth.ts 使用。
-- ============================================================

-- ─── 師傅資料表（對應 RepairTicket.technician 欄位） ──
create table if not exists public.technicians (
  id            uuid primary key default gen_random_uuid(),
  auth_user_id  uuid unique,                       -- 對應 auth.users.id（若有登入帳號）
  name          text not null,                    -- 師傅姓名（如「阿強」），須與工單 technician 字串一致
  extension     text,                              -- 分機 / 聯絡
  active        boolean not null default true,
  created_at    timestamptz not null default now()
);

create index if not exists idx_technicians_name on public.technicians (name);

alter table public.technicians enable row level security;
drop policy if exists "technicians_service_only" on public.technicians;
create policy "technicians_service_only" on public.technicians
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

alter publication supabase_realtime add table public.technicians;

-- ============================================================
-- 建立後台使用者（請在 Supabase Dashboard → Authentication → Users
-- 手動建立，或用下列 SQL 於 SQL Editor 執行）。建立後再到
-- Authentication → 該使用者 → User Metadata 填寫：
--   { "role": "admin", "full_name": "店長阿明" }
--   { "role": "technician", "full_name": "維修師傅阿強", "technician_name": "阿強" }
-- 注意 technician_name 必須與 technicians.name / 工單 technician 完全一致。
-- ============================================================

-- 範例：建立管理員（email 與密碼請自行修改）
-- insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
-- values (
--   gen_random_uuid(),
--   'admin@cathyrepair.com',
--   crypt('你的密碼', gen_salt('bf')),
--   now(),
--   '{"role":"admin","full_name":"店長阿明"}'::jsonb
-- );

-- 範例：建立師傅帳號（並同步 technicians 表）
-- do $$
-- declare new_id uuid;
-- begin
--   insert into auth.users (id, email, encrypted_password, email_confirmed_at, raw_user_meta_data)
--   values (gen_random_uuid(), 'tech@cathyrepair.com', crypt('師傅密碼', gen_salt('bf')), now(),
--           '{"role":"technician","full_name":"維修師傅阿強","technician_name":"阿強"}'::jsonb)
--   returning id into new_id;
--   insert into public.technicians (auth_user_id, name, extension) values (new_id, '阿強', '101');
-- end $$;
