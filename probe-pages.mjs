import { chromium } from 'playwright';

const BASE = 'http://localhost:3000';
const pages = [
  '/admin', '/admin/orders', '/admin/customers', '/admin/aftersales',
  '/admin/reports', '/admin/models', '/admin/symptoms', '/admin/pricing',
  '/admin/products', '/admin/shop-orders', '/admin/inventory', '/admin/inventory-report',
];

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const consoleErrors = [];
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text()); });
page.on('pageerror', (e) => consoleErrors.push('PAGEERROR: ' + e.message));

// 用 evaluate 發起 fetch 登入，並讀取 document.cookie
await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
const loginInfo = await page.evaluate(async () => {
  const res = await fetch('/api/admin/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@cathyrepair.com', password: 'admin123' }),
  });
  const data = await res.json();
  return { ok: res.ok, data, cookie: document.cookie };
});
console.log('LOGIN via fetch:', JSON.stringify(loginInfo));

// 等待客戶端處理
await page.waitForTimeout(1500);

const results = [];
for (const p of pages) {
  const errorsBefore = consoleErrors.length;
  let status = 'ok', detail = '';
  try {
    const resp = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 20000 });
    const code = resp ? resp.status() : -1;
    await page.waitForTimeout(700);
    const bodyText = (await page.textContent('body'))?.trim() || '';
    const visibleLen = bodyText.length;
    const isLoginPage = bodyText.includes('請登入以管理維修訂單');
    if (isLoginPage) status = 'REDIRECT_LOGIN';
    else if (code >= 500) status = 'HTTP_' + code;
    else if (visibleLen < 30) status = 'BLANK';
    detail = `code=${code} visibleLen=${visibleLen}`;
    const safe = p.replace(/\//g, '_');
    await page.screenshot({ path: `probe_${safe}.png` });
  } catch (e) { status = 'ERROR'; detail = e.message.split('\n')[0]; }
  const pageErrs = consoleErrors.slice(errorsBefore);
  results.push({ page: p, status, detail, errs: pageErrs });
  console.log(`[${status}] ${p}  ${detail}${pageErrs.length ? '  errs=' + JSON.stringify(pageErrs) : ''}`);
}

const bad = results.filter(r => r.status !== 'ok');
console.log('--- SUMMARY: total=' + results.length + ' bad=' + bad.length);
bad.forEach(r => console.log('  BAD:', r.page, r.status, r.detail));
console.log('--- TOTAL console errors:', consoleErrors.length);
await browser.close();
