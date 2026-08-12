// 用 node fetch 直接测公网 admin 接口
async function test(name, url, opts) {
  try {
    const r = await fetch(url, opts);
    const t = await r.text();
    console.log(`\n[${name}] status=${r.status} len=${t.length}`);
    console.log('  body:', t.slice(0, 500));
  } catch (e) {
    console.log(`\n[${name}] FETCH ERROR: ${e.message}`);
  }
}

await test('login-POST', 'https://carepair.edgeone.dev/api/admin/login', {
  method: 'POST',
  headers: { 'content-type': 'application/json' },
  body: JSON.stringify({ email: 'admin@cathyrepair.com', password: 'admin123' }),
});

await test('admin-GET', 'https://carepair.edgeone.dev/admin', { redirect: 'manual' });
await test('shop-orders-GET', 'https://carepair.edgeone.dev/api/shop-orders', {});
await test('repair-orders-GET', 'https://carepair.edgeone.dev/api/repair-orders', {});
console.log('\nDONE');
