import assert from 'assert';
import { pool, testConnection } from '../src/config/db.js';

const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  const response = await fetch(url, {
    ...options,
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  const contentType = response.headers.get('content-type') || '';
  let data = null;
  if (contentType.includes('application/json')) {
    data = await response.json();
  } else {
    data = await response.text();
  }

  return { status: response.status, data };
}

async function runTestSuite() {
  console.log('\n=============================================');
  console.log('   STOCKWISE BACKEND AUTOMATED TEST SUITE    ');
  console.log('=============================================\n');

  let passed = 0;
  let failed = 0;

  async function test(name, fn) {
    try {
      await fn();
      console.log(`✓ PASS: ${name}`);
      passed++;
    } catch (err) {
      console.error(`✗ FAIL: ${name}`);
      console.error(`  Error: ${err.message}`);
      failed++;
    }
  }

  let authToken = null;
  let testProductId = null;

  // 1. Database Connection
  await test('Database Connection: successfully connects to stockwise_db', async () => {
    const isConnected = await testConnection();
    assert.strictEqual(isConnected, true, 'Database should connect successfully');
  });

  // 2. Health Check
  await test('API Health Check: returns status ok', async () => {
    const res = await request('/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.status, 'ok');
  });

  // 3. Authentication - Valid Login
  await test('Auth: login works with seeded developer user (arya.singh@stockwise.io)', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'arya.singh@stockwise.io',
        password: 'Stockwise2026'
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.token, 'Token should be returned');
    assert.strictEqual(res.data.data.user.role, 'admin');
    authToken = res.data.data.token;
  });

  // 4. Authentication - Invalid Credentials
  await test('Auth: rejects invalid credentials with 401', async () => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: {
        email: 'arya.singh@stockwise.io',
        password: 'WrongPassword123'
      }
    });

    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
    assert.strictEqual(res.data.error.code, 'INVALID_CREDENTIALS');
  });

  // 5. Protected Route Authorization
  await test('Auth: /auth/me returns current user when valid token provided', async () => {
    const res = await request('/auth/me', {
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.user.email, 'arya.singh@stockwise.io');
  });

  await test('Auth: /auth/me rejects unauthenticated request without token', async () => {
    const res = await request('/auth/me');
    assert.strictEqual(res.status, 401);
    assert.strictEqual(res.data.success, false);
  });

  // 6. Products: Listing and Pagination
  await test('Products: lists products with pagination metadata', async () => {
    const res = await request('/products?page=1&limit=5');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(Array.isArray(res.data.data.items));
    assert.strictEqual(res.data.data.items.length, 5);
    assert.ok(res.data.data.pagination.total >= 10);
  });

  // 7. Products: Search and Category Filtering
  await test('Products: searches by SKU or name and filters by category', async () => {
    const res = await request('/products?search=IoT&category=Smart%20Electronics');
    assert.strictEqual(res.status, 200);
    assert.ok(res.data.data.items.length > 0);
    assert.ok(res.data.data.items[0].name.includes('IoT'));
  });

  // 8. Products: Create new product
  await test('Products: creates a new product and verifies unique SKU constraint', async () => {
    const testSku = 'TEST-SKU-' + Date.now();
    const res = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Automated Test Edge Module',
        sku: testSku,
        category: 'Smart Electronics',
        price: 99.99,
        cost: 50.00,
        quantity: 25,
        reorderLevel: 10,
        location: 'Test Bay 1'
      }
    });

    assert.strictEqual(res.status, 201);
    assert.strictEqual(res.data.success, true);
    testProductId = res.data.data.product.id;
    assert.strictEqual(res.data.data.product.status, 'In Stock');

    // Duplicate SKU attempt must fail with 409
    const dupRes = await request('/products', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        name: 'Duplicate Test',
        sku: testSku,
        price: 10
      }
    });
    assert.strictEqual(dupRes.status, 409);
  });

  // 9. Stock Adjustment and Audit History
  await test('Stock: manual adjustment updates quantity, status, and movement record', async () => {
    assert.ok(testProductId, 'Product must exist');
    
    // Adjust out 20 units -> remaining 5 (which is <= reorderLevel 10) -> Status should become 'Low Stock'
    const res = await request(`/products/${testProductId}/adjust-stock`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        adjustmentQuantity: 20,
        type: 'out',
        notes: 'Test stock deduction'
      }
    });

    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.data.newQuantity, 5);
    assert.strictEqual(res.data.data.status, 'Low Stock');

    // Verify stock movements recorded
    const movRes = await request(`/products/${testProductId}/movements`);
    assert.strictEqual(movRes.status, 200);
    assert.ok(movRes.data.data.movements.length > 0);
  });

  // 10. Low Stock and Out of Stock calculations
  await test('Stock: calculates low-stock and out-of-stock items correctly', async () => {
    const lowRes = await request('/products/low-stock');
    assert.strictEqual(lowRes.status, 200);
    assert.ok(lowRes.data.data.items.length >= 3);
    for (const p of lowRes.data.data.items) {
      assert.ok(p.quantity > 0 && p.quantity <= p.reorderLevel);
    }

    const outRes = await request('/products/out-of-stock');
    assert.strictEqual(outRes.status, 200);
    assert.ok(outRes.data.data.items.length >= 1);
    assert.strictEqual(outRes.data.data.items[0].quantity, 0);
  });

  // 11. Purchase Orders: Creation and Receiving stock
  await test('Purchase Orders: creates PO and receives stock atomically', async () => {
    // 1. Create PO
    const createRes = await request('/purchase-orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        supplier: 'Apex Micro Technologies',
        expectedDelivery: '2026-10-30',
        items: [
          {
            productId: testProductId,
            quantity: 30,
            unitCost: 50.00
          }
        ]
      }
    });

    assert.strictEqual(createRes.status, 201);
    const poId = createRes.data.data.order.id;

    // 2. Receive PO -> stock should increase by 30 (from 5 to 35)
    const receiveRes = await request(`/purchase-orders/${poId}/receive`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    });

    assert.strictEqual(receiveRes.status, 200);

    // 3. Verify product stock updated
    const prodRes = await request(`/products/${testProductId}`);
    assert.strictEqual(prodRes.data.data.product.quantity, 35);
    assert.strictEqual(prodRes.data.data.product.status, 'In Stock');

    // 4. Duplicate receipt must be rejected
    const dupReceive = await request(`/purchase-orders/${poId}/receive`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` }
    });
    assert.strictEqual(dupReceive.status, 400);
    assert.strictEqual(dupReceive.data.error.code, 'DUPLICATE_RECEIPT');
  });

  // 12. Sales Orders: Creation, stock deduction, and overselling prevention
  await test('Sales Orders: validates availability, prevents overselling, and deducts inventory', async () => {
    // Current stock is 35. Attempting to sell 100 must fail with 400
    const failRes = await request('/sales-orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        customer: 'OmniCorp Solutions',
        items: [
          {
            productId: testProductId,
            quantity: 100
          }
        ]
      }
    });

    assert.strictEqual(failRes.status, 400);
    assert.strictEqual(failRes.data.error.code, 'INSUFFICIENT_STOCK');

    // Now valid sale of 10 units -> stock drops from 35 to 25
    const saleRes = await request('/sales-orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${authToken}` },
      body: {
        customer: 'OmniCorp Solutions',
        items: [
          {
            productId: testProductId,
            quantity: 10
          }
        ]
      }
    });

    assert.strictEqual(saleRes.status, 201);

    const prodRes = await request(`/products/${testProductId}`);
    assert.strictEqual(prodRes.data.data.product.quantity, 25);
  });

  // 13. Dashboard Summary Metrics
  await test('Dashboard: computes real SQL aggregated summary values', async () => {
    const res = await request('/dashboard/summary');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.data.success, true);
    assert.ok(res.data.data.totalProducts >= 11);
    assert.ok(res.data.data.totalUnits > 0);
    assert.ok(res.data.data.totalValue > 0);
    assert.ok(res.data.data.totalSalesRevenue > 0);
  });

  // 14. Report CSV Export
  await test('Reports: generates inventory audit CSV with attachment header', async () => {
    const res = await request('/reports/export/inventory-csv');
    assert.strictEqual(res.status, 200);
    assert.ok(typeof res.data === 'string');
    assert.ok(res.data.startsWith('SKU,Product Name,Category'));
  });

  // Clean up test product
  if (testProductId) {
    await request(`/products/${testProductId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${authToken}` }
    });
  }

  console.log('\n=============================================');
  console.log(`TEST RESULTS: ${passed} passed, ${failed} failed`);
  console.log('=============================================\n');

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test runner error:', err);
  process.exit(1);
});
