import { chromium } from 'playwright';

const BASE = 'http://localhost:3100';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', e => errors.push(String(e)));

// login
await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
await page.fill('input[name=email], input[type=email]', 'admin@cathyrepair.com');
await page.fill('input[name=password], input[type=password]', 'admin1234');
await page.click('button[type=submit]');
await page.waitForURL('**/admin', { timeout: 10000 }).catch(()=>{});
await page.waitForTimeout(1500);

// check top nav is horizontal (scrollWidth > clientWidth on nav)
const navInfo = await page.evaluate(() => {
  const nav = document.querySelector('nav[aria-label="後台導航"]');
  if (!nav) return { found:false };
  const r = nav.getBoundingClientRect();
  return { found:true, scrollW: nav.scrollWidth, clientW: nav.clientWidth, top: r.top, height: r.height, horizontal: nav.scrollWidth > nav.clientWidth + 4 };
});

// go to orders (維修工單)
await page.goto(BASE + '/admin/orders', { waitUntil: 'networkidle' });
await page.waitForTimeout(1500);
const content = await page.evaluate(() => {
  const main = document.querySelector('main');
  const r = main.getBoundingClientRect();
  // find first heading/text indicating workbench
  const h = [...document.querySelectorAll('main h1, main h2, main h3')].map(e=>e.textContent.trim()).slice(0,5);
  return { mainTop: r.top, mainHeight: r.height, headings: h, scrollY: window.scrollY };
});

console.log(JSON.stringify({ navInfo, content, errors }, null, 2));
await browser.close();
