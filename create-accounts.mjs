// 用 service_role key 通过 Supabase Auth Admin API 建立後台帳號。
const SUPABASE_URL = 'https://stqqsdlrqfrbwurbrwhg.supabase.co';
const SERVICE_ROLE = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cXFzZGxycWZyYnd1cmJyd2hnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NjQ0MjcwMywiZXhwIjoyMTAyMDE4NzAzfQ.1HFRIYXZV2310TdUe5GJV9mB4YTUd_xCKmdUDHqZ7bI';

const accounts = [
  { email: 'admin@cathyrepair.com', password: 'admin123', role: 'admin', full_name: '店長阿明' },
  { email: 'qiang@cathyrepair.com', password: 'qiang123', role: 'technician', full_name: '維修師傅阿強', technician_name: '阿強' },
  { email: 'jiaming@cathyrepair.com', password: 'jiaming123', role: 'technician', full_name: '維修師傅阿明', technician_name: '阿明' },
];

const meta = (a) => {
  const m = { role: a.role, full_name: a.full_name };
  if (a.technician_name) m.technician_name = a.technician_name;
  return m;
};

for (const a of accounts) {
  const t = Date.now();
  const r = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SERVICE_ROLE,
      Authorization: `Bearer ${SERVICE_ROLE}`,
    },
    body: JSON.stringify({
      email: a.email,
      password: a.password,
      email_confirm: true,
      user_metadata: meta(a),
    }),
  });
  const j = await r.json().catch(() => ({}));
  console.log(`[${a.email}] status=${r.status} time=${Date.now() - t}ms msg=${j.message || j.error?.message || 'ok'}`);
}