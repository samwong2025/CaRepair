-- ============================================================
-- CathyRepair 凱西維修 · 維修價格表（repair_pricing）
-- 於 Supabase Dashboard → SQL Editor 貼上執行即可完成建置。
-- 此表取代原寫死於 src/data/pricing.ts 的定價邏輯，
-- 讓後台「維修價格管理」頁可線上調整配件費 / 人工費 / 工時 / 保養期。
-- ============================================================

create table if not exists public.repair_pricing (
  id               uuid primary key default gen_random_uuid(),
  category         text not null
                   check (category in ('iphone','ipad','watch','macbook')),
  symptom_id       text not null,
  part_name        text not null,
  base_part_fee    numeric(12,2) not null default 0,  -- 配件基準價（未乘級距係數）
  base_labor_fee   numeric(12,2) not null default 0,  -- 人工基準價
  duration_minutes integer not null default 30,        -- 預估工時（分鐘）
  warranty_days    integer not null default 90,        -- 保養期（日）
  requires_lab     boolean not null default false,     -- 是否需要無塵實驗室
  updated_at       timestamptz not null default now(),
  unique (category, symptom_id)
);

create index if not exists idx_pricing_category on public.repair_pricing (category);

-- 僅 service_role（伺服器端 API / 後台）可存取，避免價格被公開爬取
alter table public.repair_pricing enable row level security;

drop policy if exists "pricing_service_only" on public.repair_pricing;
create policy "pricing_service_only" on public.repair_pricing
  for all using (auth.role() = 'service_role') with check (auth.role() = 'service_role');

-- ─── 初始種子資料 ───────────────────────────────────────
-- 若同 (category, symptom_id) 已存在則不覆寫（便於日後手動調整後保留）。
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

-- ─── 啟用 Realtime（價格變動即時同步） ────────────────
alter publication supabase_realtime add table public.repair_pricing;
