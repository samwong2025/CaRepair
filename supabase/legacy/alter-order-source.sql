-- 維修工單來源標記：區分 網上自助預約(online) 與 後台手動代客建單(manual)
-- 用於評估 online marketing 成效（來源統計）
alter table public.repair_orders
  add column if not exists source text not null default 'manual'
  check (source in ('online','manual'));

comment on column public.repair_orders.source is
  '工單來源：online=網上自助預約(含 WhatsApp/表單)，manual=後台手動代客建單';
