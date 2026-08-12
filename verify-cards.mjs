import { chromium } from 'playwright';
const BASE = 'http://localhost:3100';
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 390, height: 780 } });
await page.goto(BASE + '/admin/login', { waitUntil: 'networkidle' });
await page.fill('input[type=email]', 'admin@cathyrepair.com');
await page.fill('input[type=password]', 'admin123');
await page.click('button[type=submit]');
await page.waitForTimeout(3000);
const info = await page.evaluate(() => {
  const main = document.querySelector('main');
  return {
    url: location.href,
    mainExists: !!main,
    mainHtmlLen: main ? main.innerHTML.length : 0,
    mainText: main ? main.innerText.slice(0, 400) : '(no main)',
    anchorsInMain: main ? [...main.querySelectorAll('a')].map(a => a.getAttribute('href')).filter(Boolean) : [],
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
