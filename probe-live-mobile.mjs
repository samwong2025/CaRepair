import { chromium, devices } from 'playwright';
const BASE = 'https://carepair.edgeone.dev';
const browser = await chromium.launch();
const ctx = await browser.newContext({ ...devices['iPhone 13'] });
const page = await ctx.newPage();
const errs = [];
page.on('console', (m) => { if (m.type() === 'error') errs.push('CONSOLE: ' + m.text()); });
page.on('pageerror', (e) => errs.push('PAGEERROR: ' + e.stack));

await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
await page.evaluate(async () => {
  await fetch('/api/admin/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email:'admin@cathyrepair.com',password:'admin123'}) });
});
await page.waitForTimeout(1500);
await page.goto(BASE + '/admin', { waitUntil: 'networkidle' });
await page.waitForTimeout(1200);
await page.screenshot({ path: 'mobile-admin-live.png', fullPage: false });

const navInfo = await page.evaluate(() => {
  const nav = document.querySelector('aside.admin-sidebar nav');
  if (!nav) return { error: 'no nav' };
  const links = Array.from(nav.querySelectorAll('a'));
  return { linkCount: links.length, sample: links.slice(0,3).map(a => a.textContent?.trim()) };
});
console.log('NAV:', JSON.stringify(navInfo));
console.log('ERR COUNT:', errs.length);
await browser.close();