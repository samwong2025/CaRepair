const SUPABASE_URL = 'https://stqqsdlrqfrbwurbrwhg.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cXFzZGxycWZyYnd1cmJyd2hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0MjcwMywiZXhwIjoyMTAyMDE4NzAzfQ.1HFRIYXZV2310TdUe5GJV9mB4YTUd_xCKmdUDHqZ7bI';
const H = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };

// 1) 列出現有
const listR = await fetch(`${SUPABASE_URL}/rest/v1/technicians?select=id,auth_user_id,name`, { headers: H });
const rows = await listR.json();
console.log('現有:', JSON.stringify(rows));

// 2) 逐條刪除
for (const r of rows) {
  const d = await fetch(`${SUPABASE_URL}/rest/v1/technicians?id=eq.${r.id}`, { method: 'DELETE', headers: H });
  console.log(`del ${r.id}:`, d.status);
}

// 3) 重建正確關聯
const correct = [
  { auth_user_id: 'bb2b69ee-89a9-487d-8627-615a63a03000', name: '阿強', extension: '101' },
  { auth_user_id: 'afcc812e-4abc-414a-a79b-811a86fae888', name: '阿明', extension: '102' },
];
for (const row of correct) {
  const ins = await fetch(`${SUPABASE_URL}/rest/v1/technicians`, {
    method: 'POST',
    headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ ...row, active: true }),
  });
  console.log(`ins ${row.name}:`, ins.status, JSON.stringify(await ins.json()));
}

const finalR = await fetch(`${SUPABASE_URL}/rest/v1/technicians?select=id,auth_user_id,name,extension`, { headers: H });
console.log('technicians final:', JSON.stringify(await finalR.json()));