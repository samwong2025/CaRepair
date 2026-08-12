import { chromium } from 'playwright';
const BASE = 'http://localhost:3000';
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const failed = [];
page.on('response', (r) => {
  if (r.status() >= 400) failed.push(r.status() + ' ' + r.url());
});
// 登入
await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@cathyrepair.com',password:'admin123'}) });
});
await page.waitForTimeout(1000);
// 訪問 /admin 與幾個版面
for (const p of ['/admin','/admin/orders','/admin/customers','/admin/products']) {
  failed.length = 0;
  await page.goto(BASE + p, { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  console.log('=== ' + p + ' ===');
  failed.forEach(f => console.log('  ' + f));
}
await browser.close();
