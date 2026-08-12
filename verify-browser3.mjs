import { chromium } from 'playwright';
const BASE = 'http://localhost:3000';
const browser = await chromium.launch();
const ctx = await browser.newContext();
const page = await ctx.newPage();
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push('PAGEERR: ' + e.message));

await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle', timeout: 60000 });
await page.fill('input[type="email"]', 'admin@cathyrepair.com');
await page.fill('input[type="password"]', 'admin123');
await page.click('button[type="submit"]');
await page.waitForTimeout(7000);
const url = page.url();
const hasWorkbench = await page.locator('text=師傅工作台').count();
const hasOrders = await page.locator('text=進行中工單').count();
console.log('URL after login:', url);
console.log('師傅工作台 visible:', hasWorkbench > 0);
console.log('進行中工單 visible:', hasOrders > 0);
console.log('console errors:', JSON.stringify(errors));
// 截圖存檔
await page.screenshot({ path: 'login-ok.png', fullPage: false });
console.log('screenshot saved: login-ok.png');
await browser.close();