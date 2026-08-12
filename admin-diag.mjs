import { chromium } from 'playwright';

const browser = await chromium.launch();

async function diag(path) {
  const page = await browser.newPage();
  const consoleErr = [];
  const pageErr = [];
  const failedReq = [];
  page.on('console', (m) => { if (m.type() === 'error') consoleErr.push(m.text()); });
  page.on('pageerror', (e) => pageErr.push(e.message + '\n' + (e.stack || '')));
  page.on('requestfailed', (r) => failedReq.push(r.url() + ' :: ' + (r.failure()?.errorText || '')));

  const resp = await page.goto('https://carepair.edgeone.dev' + path, { waitUntil: 'networkidle', timeout: 30000 }).catch((e) => ({ __err: e.message }));
  let finalUrl = '';
  let bodyText = '';
  let bodyLen = 0;
  if (resp && !resp.__err) {
    finalUrl = page.url();
    bodyText = (await page.evaluate(() => document.body?.innerText || '')).trim();
    bodyLen = (await page.evaluate(() => (document.body?.innerHTML || '').length));
    await page.screenshot({ path: `C:/Users/HOME/CodeBuddy/Claw/admin-diag${path.replace(/\//g, '_')}.png`, fullPage: false });
  }
  console.log(`\n===== ${path} =====`);
  console.log('status:', resp.__err ? 'GOTO-ERR ' + resp.__err : resp.status());
  console.log('finalUrl:', finalUrl || '(n/a)');
  console.log('bodyLen:', bodyLen, 'bodyText(first120):', JSON.stringify(bodyText.slice(0, 120)));
  console.log('console.errors:', consoleErr.length);
  consoleErr.slice(0, 12).forEach((e) => console.log('  CE:', e.slice(0, 300)));
  console.log('pageerrors:', pageErr.length);
  pageErr.slice(0, 5).forEach((e) => console.log('  PE:', e.slice(0, 400)));
  console.log('failedRequests:', failedReq.length);
  failedReq.slice(0, 10).forEach((e) => console.log('  FR:', e.slice(0, 200)));
  await page.close();
}

await diag('/admin');
await diag('/admin/login');
await browser.close();
console.log('\nDONE');
