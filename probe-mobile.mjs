import { chromium, devices } from 'playwright';
const BASE = 'http://localhost:3000';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.stack));
page.on('response', (r) => { if (r.status() >= 400) errs.push('HTTP ' + r.status() + ' ' + r.url()); });

await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@cathyrepair.com',password:'admin123'}) });
});
await page.waitForTimeout(1500);

await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
await page.screenshot({ path: 'mobile-admin.png', fullPage: false });
console.log('ERR COUNT:', errs.length);
errs.forEach(e => console.log(e));
await browser.close();