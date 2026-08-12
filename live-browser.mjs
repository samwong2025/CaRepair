import { chromium } from 'playwright';
const BASE = 'https://carepair.edgeone.dev';
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
await page.waitForTimeout(20000);
const name = await page.locator('text=店長阿明').count();
const ordersLink = await page.locator('a:has-text("維修工單")').count();
const ongoing = await page.locator('text=進行中工單').count();
console.log('after login: 店長阿明 visible:', name > 0, '維修工單 link:', ordersLink > 0, '進行中工單 visible:', ongoing > 0);

// 進入訂單頁
await page.click('a:has-text("維修工單")');
await page.waitForTimeout(8000);
console.log('after click 維修工單: URL:', page.url(), 'orders table:', await page.locator('table').count());

// 進入報表頁
await page.click('a:has-text("報表分析")');
await page.waitForTimeout(8000);
console.log('after click 報表: URL:', page.url(), 'recharts svg:', await page.locator('svg').count());

console.log('total console errors:', JSON.stringify(errors));
await browser.close();