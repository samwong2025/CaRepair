const SUPABASE_URL = 'https://stqqsdlrqfrbwurbrwhg.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cXFzZGxycWZyYnd1cmJyd2hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0MjcwMywiZXhwIjoyMTAyMDE4NzAzfQ.1HFRIYXZV2310TdUe5GJV9mB4YTUd_xCKmdUDHqZ7bI';
const H = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };

// 清空 technicians（目前只有錯誤的 1 條）
const del = await fetch(`${SUPABASE_URL}/rest/v1/technicians?select=id`, { method: 'DELETE', headers: H });
console.log('清空 technicians:', del.status);

// 重新建正確關聯
const rows = [
  { auth_user_id: 'bb2b69ee-89a9-487d-8627-615a63a03000', name: '阿強', extension: '101' },
  { auth_user_id: 'afcc812e-4abc-414a-a79b-811a86fae888', name: '阿明', extension: '102' },
];
for (const row of rows) {
  const r = await fetch(`${SUPABASE_URL}/rest/v1/technicians`, {
    method: 'POST',
    headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=representation' },
    body: JSON.stringify({ ...row, active: true }),
  });
  console.log(`ins ${row.name} (${row.auth_user_id.slice(0,8)}):`, r.status, JSON.stringify(await r.json()));
}

const finalR = await fetch(`${SUPABASE_URL}/rest/v1/technicians?select=id,auth_user_id,name,extension`, { headers: H });
console.log('technicians final:', JSON.stringify(await finalR.json()));