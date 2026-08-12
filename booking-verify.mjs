import { chromium } from 'playwright';
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function runAt(VW) {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: VW, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  await page.goto('https://carepair.edgeone.dev/repair?category=iphone', { waitUntil: 'networkidle' });
  await sleep(1200);
  const model = page.locator('button', { hasText: /Pro|Pro Max|Air|Plus|Mini|SE|1[0-9]/ }).filter({ hasNotText: '維修' }).first();
  await model.scrollIntoViewIfNeeded(); await model.click(); await sleep(900);
  const sym = page.locator('button', { hasText: /屏幕|電池|鏡頭|充電|聲音|玻璃|背蓋|指紋|開機|入水|尾插/ }).first();
  if (await sym.count()) { await sym.scrollIntoViewIfNeeded(); await sym.click(); }
  await sleep(500);
  const n1 = page.locator('button', { hasText: '下一步' }).first();
  if (await n1.count()) { await n1.scrollIntoViewIfNeeded(); await n1.click(); }
  await sleep(1000);
  const n2 = page.locator('button', { hasText: '下一步' }).first();
  if (await n2.count()) { await n2.scrollIntoViewIfNeeded(); await n2.click(); }
  await sleep(1000);

  const r = await page.evaluate((vw) => {
    const card = document.querySelector('.mt-6.grid > div');
    const cr = card ? card.getBoundingClientRect() : null;
    let innerMax = 0, innerCls = '';
    if (card) card.querySelectorAll('*').forEach((el) => {
      const b = el.getBoundingClientRect();
      if (b.right > innerMax) { innerMax = b.right; innerCls = (el.className || '').toString().slice(0, 50); }
    });
    return {
      scrollW: document.documentElement.scrollWidth,
      win: window.innerWidth,
      cardRight: cr ? Math.round(cr.right) : null,
      innerMaxRight: Math.round(innerMax),
      innerMaxCls: innerCls,
      pass: (cr ? cr.right <= vw + 0.5 : false) && innerMax <= vw + 0.5,
    };
  }, VW);
  console.log(`[${VW}] scrollW=${r.scrollW} cardRight=${r.cardRight} innerMaxRight=${r.innerMaxRight}(${r.innerMaxCls}) => ${r.pass ? 'PASS' : 'FAIL'}`);
  await page.screenshot({ path: `C:/Users/HOME/CodeBuddy/Claw/verify-${VW}.png` });
  await browser.close();
  return r;
}

for (const w of [390, 360, 320]) {
  const r = await runAt(w);
  if (!r.pass) { console.log(`  -> still overflow at ${w}`); }
}
console.log('VERIFY DONE');
