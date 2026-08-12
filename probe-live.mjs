import { chromium } from 'playwright';
const BASE = 'https://carepair.edgeone.dev';
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

// 登入
await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@cathyrepair.com',password:'admin123'}) });
});
await page.waitForTimeout(1200);

const results = [];
for (const p of pages) {
  const eb = consoleErrors.length;
  let status = 'ok', detail = '';
  try {
    const resp = await page.goto(BASE + p, { waitUntil: 'networkidle', timeout: 25000 });
    const code = resp ? resp.status() : -1;
    await page.waitForTimeout(700);
    const bodyText = (await page.textContent('body'))?.trim() || '';
    const visibleLen = bodyText.length;
    const isLoginPage = bodyText.includes('請登入以管理維修訂單');
    if (isLoginPage) status = 'REDIRECT_LOGIN';
    else if (code >= 500) status = 'HTTP_' + code;
    else if (visibleLen < 30) status = 'BLANK';
    detail = `code=${code} visibleLen=${visibleLen}`;
  } catch (e) { status = 'ERROR'; detail = e.message.split('\n')[0]; }
  const pageErrs = consoleErrors.slice(eb);
  results.push({ p, status, detail });
  console.log(`[${status}] ${p}  ${detail}${pageErrs.length ? '  errs=' + JSON.stringify(pageErrs) : ''}`);
}
const bad = results.filter(r => r.status !== 'ok');
console.log('--- SUMMARY total=' + results.length + ' bad=' + bad.length);
bad.forEach(r => console.log('  BAD:', r.p, r.status, r.detail));
console.log('--- TOTAL console errors:', consoleErrors.length);
await browser.close();
