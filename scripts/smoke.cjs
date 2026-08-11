const fs = require('fs');
const body = fs.readFileSync('.smoke.json', 'utf8');

(async () => {
  try {
    const r = await fetch('https://carepair.edgeone.dev/api/shop-orders/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body,
    });
    console.log('BATCH STATUS', r.status);
    console.log('BATCH BODY', await r.text());
  } catch (e) {
    console.log('BATCH ERR', e.message);
  }
  try {
    const h = await fetch('https://carepair.edgeone.dev/shop');
    const t = await h.text();
    console.log('SHOP status', h.status);
    console.log('SHOP has cart btn:', t.includes('開啟購物車'));
    console.log('SHOP has add-to-cart:', t.includes('加入購物車'));
  } catch (e) {
    console.log('SHOP ERR', e.message);
  }
})();
