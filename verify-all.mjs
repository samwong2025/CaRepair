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
// 等待登录按钮 spinner 消失（说明 router.refresh 完成）
await page.waitForTimeout(15000);
const url = page.url();
console.log('final URL:', url);
const sidebar = await page.locator('text=店長阿明').count();
const workbench = await page.locator('text=師傅工作台').count();
const ongoing = await page.locator('text=進行中工單').count();
console.log('店長阿明 visible:', sidebar > 0);
console.log('師傅工作台 visible:', workbench > 0);
console.log('進行中工單 visible:', ongoing > 0);
console.log('console errors:', JSON.stringify(errors));

// 點擊側邊欄「維修工單」進訂單頁
await page.click('text=維修工單');
await page.waitForTimeout(6000);
console.log('after click 維修工單 URL:', page.url());
const ordersTitle = await page.locator('text=維修工單管理').count();
console.log('維修工單管理 visible:', ordersTitle > 0);

// 點擊「報表分析」
await page.click('text=報表分析');
await page.waitForTimeout(8000);
console.log('after click 報表分析 URL:', page.url());
const reportContent = await page.locator('text=營收').count();
console.log('營收 visible:', reportContent > 0);
console.log('total console errors:', JSON.stringify(errors));
await browser.close();