const BASE = 'https://carepair.edgeone.dev';
const r = await fetch(`${BASE}/api/admin/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@cathyrepair.com', password: 'admin123' }),
});
console.log('login status:', r.status);
const body = await r.text();
console.log('body:', body.slice(0, 150));
const sc = r.headers.get('set-cookie');
console.log('Set-Cookie:', sc ? sc.slice(0, 80) : '(none)');
if (sc) {
  const cookie = sc.split(',').map((s) => s.split(';')[0]).join('; ');
  const a = await fetch(`${BASE}/admin`, { headers: { cookie }, redirect: 'manual' });
  console.log('/admin status:', a.status, 'loc:', a.headers.get('location'));
  const t = await a.text();
  console.log('contains 師傅工作台:', t.includes('師傅工作台'));
  console.log('contains 進行中工單:', t.includes('進行中工單'));
}