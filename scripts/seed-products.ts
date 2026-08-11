// 以 src/data/products.ts 為單一真相來源，重寫 Supabase products 表（修復亂碼舊數據）
// 用法：npx tsx scripts/seed-products.ts
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { products } from '../src/data/products';

const __dirname = dirname(fileURLToPath(import.meta.url));
void __dirname;

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('缺少 NEXT_PUBLIC_SUPABASE_URL 或 SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

function toRow(p: (typeof products)[number]) {
  return {
    id: p.id,
    name: p.name,
    category: p.category,
    storage: p.storage,
    color: p.color,
    grade: p.grade,
    battery_health: p.batteryHealth,
    price: p.price,
    original_price: p.originalPrice,
    stock: p.stock,
    warranty_days: p.warrantyDays,
    image: p.image,
    highlights: p.highlights,
    description: p.description,
    accessories: p.accessories,
    services: p.services,
    hot: Boolean(p.hot),
  };
}

const headers: Record<string, string> = {
  apikey: SERVICE_ROLE,
  Authorization: `Bearer ${SERVICE_ROLE}`,
  'Content-Type': 'application/json',
};

async function main() {
  const delRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'DELETE',
    headers: { ...headers, Prefer: 'return=minimal' },
  });
  console.log('DELETE status:', delRes.status, delRes.statusText);

  const rows = products.map(toRow);
  const upRes = await fetch(`${SUPABASE_URL}/rest/v1/products`, {
    method: 'POST',
    headers: { ...headers, Prefer: 'return=representation' },
    body: JSON.stringify(rows),
  });
  const text = await upRes.text();
  if (!upRes.ok) {
    console.error('UPSERT failed:', upRes.status, text);
    process.exit(1);
  }
  const saved = JSON.parse(text) as Array<{ id: string; name: string; grade: string; price: number; image: string }>;
  console.log(`UPSERT OK，共寫入 ${saved.length} 筆商品`);
  for (const r of saved) {
    console.log(` - ${r.id} | ${r.name} | grade=${r.grade} | price=$${r.price} | image=${r.image ? 'ok' : 'EMPTY'}`);
  }
}

main().catch((e) => {
  console.error('腳本錯誤:', e);
  process.exit(1);
});
