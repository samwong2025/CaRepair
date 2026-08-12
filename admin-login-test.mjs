import { chromium } from 'playwright';

const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const serverLog = [];
page.on('console', (m) => { if (m.type() === 'error') serverLog.push(m.text()); });
page.on('response', async (r) => {
  if (r.url().includes('/api/admin') || r.url().includes('/admin')) {
    console.log('RESP', r.status(), r.url().slice(0, 80));
  }
});

// 1) 尝试登录 API
const loginResp = await page.evaluate(async () => {
  const r = await fetch('https://carepair.edgeone.dev/api/admin/login', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ email: 'admin@cathyrepair.com', password: 'admin123' }),
  });
  const t = await r.text();
  return { status: r.status, body: t.slice(0, 400) };
});
console.log('LOGIN API:', JSON.stringify(loginResp));

await page.goto('https://carepair.edgeone.dev/admin', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch((e) => console.log('GOTO ERR:', e.message));
await page.waitForTimeout(2500);
console.log('AFTER /admin finalUrl:', page.url());
const body = await page.evaluate(() => document.body?.innerText?.slice(0, 300) || '(empty)');
console.log('BODY:', JSON.stringify(body));
await page.screenshot({ path: 'C:/Users/HOME/CodeBuddy/Claw/admin-after-login.png' });
console.log('serverLog errors:', serverLog.length);
serverLog.slice(0, 8).forEach((e) => console.log('  ', e.slice(0, 300)));
await browser.close();
console.log('DONE');
