const base = 'http://127.0.0.1:3000';
function pickCookie(headers) {
  const list = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [];
  const all = list.length ? list : (headers.get('set-cookie') ? [headers.get('set-cookie')] : []);
  for (const header of all) { const pairs = header.split(/,(?=[^;]*=)/); for (const p of pairs) if (p.trim().startsWith('cathy_admin_session=')) return p.split(';')[0]; }
  return null;
}
async function login() {
  const res = await fetch(`${base}/api/admin/login`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ email: 'admin@cathyrepair.com', password: 'admin123' }) });
  return pickCookie(res.headers);
}
async function getText(url, cookie) { const res = await fetch(url, { headers: { cookie } }); return { status: res.status, text: await res.text() }; }
const cookie = await login();
const list = await getText(`${base}/admin/orders`, cookie);
const i = list.text.indexOf('CR-20260810-Q12A');
console.log(JSON.stringify(list.text.slice(i - 60, i + 200)));
