const SUPABASE_URL = 'https://stqqsdlrqfrbwurbrwhg.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cXFzZGxycWZyYnd1cmJyd2hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0MjcwMywiZXhwIjoyMTAyMDE4NzAzfQ.1HFRIYXZV2310TdUe5GJV9mB4YTUd_xCKmdUDHqZ7bI';
const H = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };

async function getAuthId(email) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, { headers: H });
  const j = await r.json();
  return j.users?.[0];
}

// 1) 看 qiang / jiaming 的 technician_name
const qiang = await getAuthId('qiang@cathyrepair.com');
const jiaming = await getAuthId('jiaming@cathyrepair.com');
console.log('qiang meta:', JSON.stringify(qiang.user_metadata));
console.log('jiaming meta:', JSON.stringify(jiaming.user_metadata));

// 2) 看 technicians 目前狀態
const listR = await fetch(`${SUPABASE_URL}/rest/v1/technicians?select=id,auth_user_id,name`, { headers: H });
console.log('technicians now:', JSON.stringify(await listR.json()));

// 3) 修正：刪掉錯誤的「阿明」記錄(它用錯了 qiang 的 auth id)，重建正確關聯
const del = await fetch(`${SUPABASE_URL}/rest/v1/technicians?name=eq.阿明`, { method: 'DELETE', headers: H });
console.log('del 阿明:', del.status);

// 重建 qiang -> 阿強
const insQ = await fetch(`${SUPABASE_URL}/rest/v1/technicians`, {
  method: 'POST', headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=representation' },
  body: JSON.stringify({ auth_user_id: qiang.id, name: '阿強', extension: '101', active: true }),
});
console.log('ins qiang->阿強:', insQ.status, JSON.stringify(await insQ.json()));
// 重建 jiaming -> 阿明
const insJ = await fetch(`${SUPABASE_URL}/rest/v1/technicians`, {
  method: 'POST', headers: { ...H, 'Content-Type': 'application/json', Prefer: 'return=representation' },
  body: JSON.stringify({ auth_user_id: jiaming.id, name: '阿明', extension: '102', active: true }),
});
console.log('ins jiaming->阿明:', insJ.status, JSON.stringify(await insJ.json()));

// 最終
const finalR = await fetch(`${SUPABASE_URL}/rest/v1/technicians?select=id,auth_user_id,name`, { headers: H });
console.log('technicians final:', JSON.stringify(await finalR.json()));