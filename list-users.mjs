const SUPABASE_URL = 'https://stqqsdlrqfrbwurbrwhg.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cXFzZGxycWZyYnd1cmJyd2hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0MjcwMywiZXhwIjoyMTAyMDE4NzAzfQ.1HFRIYXZV2310TdUe5GJV9mB4YTUd_xCKmdUDHqZ7bI';
const H = { apikey: SERVICE_ROLE, Authorization: `Bearer ${SERVICE_ROLE}` };

// 列出所有 auth 用戶（不含過濾，逐頁）
let all = [];
let page = 1;
while (true) {
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=${page}&per_page=100`, { headers: H });
  const j = await r.json();
  const users = j.users || [];
  if (users.length === 0) break;
  all = all.concat(users);
  if (users.length < 100) break;
  page++;
}
console.log('總用戶數:', all.length);
for (const u of all) {
  console.log(`- ${u.email} | id=${u.id} | meta=${JSON.stringify(u.user_metadata)}`);
}