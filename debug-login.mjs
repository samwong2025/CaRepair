const BASE = 'http://localhost:3000';
// 1) 直接打登入 API，看回應與 Set-Cookie
const r = await fetch(`${BASE}/api/admin/login`, {
  method: 'POST', headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'admin@cathyrepair.com', password: 'admin123' }),
});
console.log('login status:', r.status);
console.log('login body:', await r.text());
const setCookie = r.headers.get('set-cookie');
console.log('Set-Cookie:', setCookie ? setCookie.slice(0, 200) : '(none)');

// 2) 帶 cookie 打 /admin
if (setCookie) {
  const cookieHeader = setCookie.split(',').map((s) => s.split(';')[0]).join('; ');
  const adminR = await fetch(`${BASE}/admin`, { headers: { cookie: cookieHeader }, redirect: 'manual' });
  console.log('admin status with cookie:', adminR.status, 'loc:', adminR.headers.get('location'));
  const txt = await adminR.text();
  console.log('admin contains 師傅工作台:', txt.includes('師傅工作台'));
  console.log('admin contains 進行中工單:', txt.includes('進行中工單'));
}