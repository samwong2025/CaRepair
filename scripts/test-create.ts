import { getRepository } from '../src/lib/repositories';

(async () => {
  try {
    const repo = getRepository();
    console.log('repo ready');
    const products = await repo.listProducts();
    console.log('products count', products.length);
    const order = await repo.createShopOrder({
      productId: 'p-01',
      qty: 1,
      customerName: 'Test Buyer',
      customerPhone: '91234567',
      fulfillment: 'pickup',
      pickupShop: 'Laichi Kok Shop',
      remark: 'repro test',
    });
    console.log('ORDER CREATED', JSON.stringify(order));
  } catch (e: unknown) {
    const err = e as { message?: string; details?: string; hint?: string; code?: string };
    console.log('ERROR', JSON.stringify({ message: err.message, details: err.details, hint: err.hint, code: err.code }, null, 2));
  }
})();
