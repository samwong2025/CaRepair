// 同步 technicians 表：把新建的師傅 auth 帳號對應到 public.technicians。
const SUPABASE_URL = 'https://stqqsdlrqfrbwurbrwhg.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cXFzZGxycWZyYnd1cmJyd2hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0MjcwMywiZXhwIjoyMTAyMDE4NzAzfQ.1HFRIYXZV2310TdUe5GJV9mB4YTUd_xCKmdUDHqZ7bI';

// 先列出現有 technicians
const listR = await fetch(`${SUPABASE_URL}/rest/v1/technicians?select=id,auth_user_id,name`, {
  headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
});
console.log('現有 technicians:', JSON.stringify(await listR.json()));

// 取得剛建好的師傅 auth id
const techs = ['qiang@cathyrepair.com', 'jiaming@cathyrepair.com'];
for (const email of techs) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?email=${encodeURIComponent(email)}`, {
    headers: { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` },
  });
  const list = await r.json();
  const u = list.users?.[0];
  if (!u) { console.log(`找不到 ${email}`); continue; }
  const name = u.user_metadata?.technician_name || email.split('@')[0];
  const ins = await fetch(`${SUPABASE_URL}/rest/v1/technicians`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
      Prefer: 'return=representation',
    },
    body: JSON.stringify({ auth_user_id: u.id, name, extension: '101', active: true }),
  });
  const j = await ins.json().catch(() => ({}));
  console.log(`[technicians] ${name} status=${ins.status} ${JSON.stringify(j)}`);
}