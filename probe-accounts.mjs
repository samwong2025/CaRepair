// Probe whether the demo admin account actually exists on Supabase Auth.
// We try admin@cathyrepair.com / admin123 (per .env.local ADMIN_PASSWORD).
const SUPABASE_URL = 'https://stqqsdlrqfrbwurbrwhg.supabase.co';
const ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN0cXFzZGxycWZyYnd1cmJyd2hnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODY0NDI3MDMsImV4cCI6MjEwMjAxODcwM30.atcNu0HPfO1BZ_fW7glf4r2MOySO_Lb9WOPWvb6gArI';

const cands = [
  ['admin@cathyrepair.com', 'admin123'],
  ['qiang@cathyrepair.com', 'qiang123'],
  ['jiaming@cathyrepair.com', 'jiaming123'],
];

for (const [email, pwd] of cands) {
  const t = Date.now();
  const r = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', apikey: ANON, Authorization: `Bearer ${ANON}` },
    body: JSON.stringify({ email, password: pwd }),
  });
  const j = await r.json().catch(() => ({}));
  console.log(`[${email}] status=${r.status} time=${Date.now() - t}ms err=${j.error?.message || j.msg || '-'}`);
}