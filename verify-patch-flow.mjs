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
const cookie = await login();
if (!cookie) { console.error('無 cookie'); process.exit(1); }

const id = 'ord-011';
const parts = await fetch(`${base}/api/orders/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json', cookie }, body: JSON.stringify({ partsUsed: [{ partId: 'part-iphone-battery', name: 'iPhone 電池（原廠級）', qty: 1, unitCost: 150, category: 'battery' }], operator: 'E2E', note: '選配件測試' }) });
const partsJson = await parts.json();
console.log('parts PATCH status', parts.status, 'partsUsed =', JSON.stringify(partsJson?.order?.partsUsed));

const restore = await fetch(`${base}/api/orders/${id}`, { method: 'PATCH', headers: { 'content-type': 'application/json', cookie }, body: JSON.stringify({ partsUsed: [], operator: 'E2E', note: '復原測試' }) });
console.log('restore status', restore.status);

if (parts.status === 200 && Array.isArray(partsJson?.order?.partsUsed) && partsJson.order.partsUsed.length > 0) {
  console.log('SUCCESS: 選配件寫入成功（已復原）');
} else {
  console.error('FAIL'); process.exit(1);
}
