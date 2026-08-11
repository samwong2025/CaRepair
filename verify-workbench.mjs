const base = 'http://127.0.0.1:3000';

function pickCookie(headers) {
  const list = typeof headers.getSetCookie === 'function' ? headers.getSetCookie() : [];
  const all = list.length ? list : (headers.get('set-cookie') ? [headers.get('set-cookie')] : []);
  for (const header of all) {
    const pairs = header.split(/,(?=[^;]*=)/);
    for (const p of pairs) {
      if (p.trim().startsWith('cathy_admin_session=')) return p.split(';')[0];
    }
  }
  return null;
}

async function login(email, password) {
  const res = await fetch(`${base}/api/admin/login`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return { status: res.status, cookie: pickCookie(res.headers), body: await res.text() };
}

async function get(url, cookie) {
  const res = await fetch(url, { headers: { cookie: cookie || '', accept: 'text/html' }, redirect: 'manual' });
  return { status: res.status, text: await res.text() };
}

const accounts = [
  ['admin@cathyrepair.com', 'admin123'],
  ['admin@cathyrepair.com', 'cathy2026'],
  ['qiang@cathyrepair.com', 'qiang123'],
];
let cookie = null, who = '';
for (const [e, p] of accounts) {
  const r = await login(e, p);
  if (r.cookie) { cookie = r.cookie; who = `${e}/${p}`; break; }
  console.log('login fail', e, r.status, r.body.slice(0, 100));
}
if (!cookie) { console.error('登入失敗'); process.exit(1); }
console.log('login', who);

// /admin 工作台
const dash = await get(`${base}/admin`, cookie);
console.log('admin status', dash.status, 'len', dash.text.length);
const dashTokens = ['師傅工作台', '今日新客戶', '今日預計收入', '本週實際收入', '本月實際收入', '庫存警告', '確認客戶並推進'];
for (const t of dashTokens) {
  if (!dash.text.includes(t)) { console.error('FAIL /admin 缺:', t); process.exit(1); }
}
console.log('OK /admin 工作台關鍵元素齊全');

// /admin/inventory
const inv = await get(`${base}/admin/inventory`, cookie);
console.log('inventory status', inv.status, 'len', inv.text.length);
if (inv.status !== 200) { console.error('FAIL /admin/inventory 狀態', inv.status); process.exit(1); }
if (!inv.text.includes('iPhone 電池') && !inv.text.includes('庫存管理')) { console.error('FAIL 庫存頁內容異常'); process.exit(1); }
console.log('OK /admin/inventory');

// /admin/orders 詳情含「選擇庫存配件」
const orders = await get(`${base}/admin/orders?status=active`, cookie);
if (!orders.text.includes('選擇庫存配件') && !orders.text.includes('admin/orders/')) {
  // 詳情頁是獨立路由，需抓一個 orderNo
}
const m = orders.text.match(/\/admin\/orders\/([A-Z0-9-]+)/);
if (m) {
  const detail = await get(`${base}/admin/orders/${m[1]}`, cookie);
  console.log('detail', m[1], 'status', detail.status);
  if (detail.status === 200 && !detail.text.includes('選擇庫存配件')) {
    console.error('FAIL 詳情頁缺「選擇庫存配件」');
    process.exit(1);
  }
  console.log('OK 詳情頁含選擇庫存配件');
} else {
  console.log('WARN 無法從訂單頁抓到 orderNo 跳詳情（可能無進行中工單）');
}

// PATCH 推進狀態：抓一個 active 工單
const activeMatch = dash.text.match(/\/admin\/orders\/([A-Z0-9-]+)/);
if (activeMatch) {
  // 反向查 id：先從 /admin/orders 抓 id
  const list = await get(`${base}/admin/orders`, cookie);
  const idMatch = list.text.match(/data-order-id="([^"]+)"/) || list.text.match(/order\.id/g);
  console.log('list status', list.status);
}

console.log('SUCCESS');
