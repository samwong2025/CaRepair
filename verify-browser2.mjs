import { chromium } from 'playwright';
const BASE = 'https://carepair.edgeone.dev';
const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on('console', (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on('pageerror', (e) => logs.push('PAGEERR: ' + e.message));
page.on('response', (r) => { if (r.url().includes('/auth') || r.url().includes('/api')) logs.push(`RESP ${r.status()} ${r.url()}`); });

await page.goto(`${BASE}/admin/login`, { waitUntil: 'networkidle', timeout: 60000 });
// 列印表單結構
const html = await page.locator('form').innerHTML().catch(() => 'NO FORM');
console.log('FORM HTML:', html.slice(0, 600));
await page.fill('input[type="email"]', 'admin@cathyrepair.com');
await page.fill('input[type="password"]', 'admin123');
await page.click('button[type="submit"]');
await page.waitForTimeout(5000);
const url = page.url();
const errText = await page.locator('body').innerText();
console.log('URL after click:', url);
console.log('contains 進行中工單:', errText.includes('進行中工單'));
console.log('contains Invalid:', errText.includes('Invalid'));
console.log('LOGS:', JSON.stringify(logs.slice(0, 30), null, 2));
await browser.close();