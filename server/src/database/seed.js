import bcrypt from 'bcryptjs';
import { pool, withTransaction } from '../config/db.js';
import { env } from '../config/env.js';

export async function seedDatabase() {
  console.log('--- Stockwise Database Seeding Initiated ---');

  await withTransaction(async (conn) => {
    // 1. Clean existing records in reverse dependency order
    await conn.query('SET FOREIGN_KEY_CHECKS = 0');
    await conn.query('TRUNCATE TABLE audit_logs');
    await conn.query('TRUNCATE TABLE notifications');
    await conn.query('TRUNCATE TABLE stock_movements');
    await conn.query('TRUNCATE TABLE sales_order_items');
    await conn.query('TRUNCATE TABLE sales_orders');
    await conn.query('TRUNCATE TABLE purchase_order_items');
    await conn.query('TRUNCATE TABLE purchase_orders');
    await conn.query('TRUNCATE TABLE products');
    await conn.query('TRUNCATE TABLE customers');
    await conn.query('TRUNCATE TABLE suppliers');
    await conn.query('TRUNCATE TABLE categories');
    await conn.query('TRUNCATE TABLE system_settings');
    await conn.query('TRUNCATE TABLE users');
    await conn.query('SET FOREIGN_KEY_CHECKS = 1');

    console.log('✓ Cleared existing tables.');

    // 2. Seed Users (passwords hashed with bcrypt)
    const adminPasswordHash = await bcrypt.hash('Stockwise2026', env.BCRYPT_ROUNDS);
    const managerPasswordHash = await bcrypt.hash('Manager2026', env.BCRYPT_ROUNDS);
    const staffPasswordHash = await bcrypt.hash('Staff2026', env.BCRYPT_ROUNDS);

    const users = [
      ['usr-admin-1', 'Arya Singh', 'arya.singh@stockwise.io', adminPasswordHash, 'admin', 'active'],
      ['usr-mgr-1', 'Marcus Vance', 'manager@stockwise.io', managerPasswordHash, 'manager', 'active'],
      ['usr-stf-1', 'Sarah Jenkins', 'staff@stockwise.io', staffPasswordHash, 'staff', 'active']
    ];

    for (const u of users) {
      await conn.query(
        'INSERT INTO users (id, name, email, password_hash, role, status) VALUES (?, ?, ?, ?, ?, ?)',
        u
      );
    }
    console.log('✓ Seeded 3 development users with secure bcrypt hashes.');

    // 3. Seed Categories
    const categories = [
      ['cat-1', 'Smart Electronics', 'ELEC', 'Sensors, microcontrollers, smart gateways and modules'],
      ['cat-2', 'Industrial Hardware', 'HDW', 'Mounts, brackets, enclosures, and structural parts'],
      ['cat-3', 'Networking & Cables', 'NET', 'High-speed ethernet, fiber patch cords and connectors'],
      ['cat-4', 'Packaging & Logistics', 'LOG', 'Heavy duty boxes, pallets, RFID labels and tape'],
      ['cat-5', 'Safety Equipment', 'SAF', 'Helmets, ESD gloves, protective goggles, and vests']
    ];

    for (const c of categories) {
      await conn.query(
        'INSERT INTO categories (id, name, code, description) VALUES (?, ?, ?, ?)',
        c
      );
    }
    console.log('✓ Seeded 5 product categories.');

    // 4. Seed Suppliers
    const suppliers = [
      ['sup-1', 'Apex Micro Technologies', 'David Chen', 'Apex Micro Technologies Inc.', 'd.chen@apexmicro.com', '+1 (555) 234-8901', 'Smart Electronics', 5, 'San Jose, CA', 'Active'],
      ['sup-2', 'Vanguard Industrial Supply', 'Elena Rostova', 'Vanguard Industrial Co.', 'elena@vanguardind.com', '+1 (555) 987-6543', 'Industrial Hardware', 7, 'Chicago, IL', 'Active'],
      ['sup-3', 'Global Fiber & Network Co.', 'Marcus Vance', 'Global Fiber Networks Corp.', 'm.vance@globalfiber.net', '+1 (555) 456-7890', 'Networking & Cables', 3, 'Austin, TX', 'Active'],
      ['sup-4', 'EcoPack Logistics Depot', 'Sarah Jenkins', 'EcoPack Logistics Supply LLC', 'sarah@ecopackdepot.com', '+1 (555) 321-7654', 'Packaging & Logistics', 2, 'Seattle, WA', 'Active']
    ];

    for (const s of suppliers) {
      await conn.query(
        'INSERT INTO suppliers (id, name, contact_person, company_name, email, phone, category, lead_time_days, address, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
        s
      );
    }
    console.log('✓ Seeded 4 suppliers.');

    // 5. Seed Customers
    const customers = [
      ['cust-1', 'OmniCorp Solutions', 'Rachel Adams', 'rachel@omnicorp.io', '+1 (555) 111-2233', 'New York, NY', 'Active'],
      ['cust-2', 'HyperScale Data Labs', 'Tom Sterling', 'tsterling@hyperscale.org', '+1 (555) 333-4455', 'Boston, MA', 'Active'],
      ['cust-3', 'Nexis Robotic Systems', 'Kavita Patel', 'kavita@nexisrobotics.com', '+1 (555) 555-6677', 'Denver, CO', 'Active'],
      ['cust-4', 'Zenith Logistics Hub', 'Bradley Cooper', 'bcooper@zenithhub.com', '+1 (555) 777-8899', 'Atlanta, GA', 'Active']
    ];

    for (const cust of customers) {
      await conn.query(
        'INSERT INTO customers (id, name, contact_person, email, phone, address, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        cust
      );
    }
    console.log('✓ Seeded 4 customers.');

    // 6. Seed Products
    const products = [
      ['prod-1', 'STK-ELEC-001', 'Industrial IoT Gateway Pro X5', 'High-performance IoT edge computer', 'cat-1', 'sup-1', 210.00, 349.99, 42, 15, 'units', 'Aisle 3, Rack B-12', 'In Stock'],
      ['prod-2', 'STK-ELEC-002', 'Smart Environmental Sensor Node', 'Temperature, humidity, pressure monitor', 'cat-1', 'sup-1', 45.00, 89.50, 6, 20, 'units', 'Aisle 2, Rack A-04', 'Low Stock'],
      ['prod-3', 'STK-HDW-104', 'Heavy Duty Structural Steel Bracket', 'Zinc-plated heavy structural mounting plate', 'cat-2', 'sup-2', 11.50, 24.00, 180, 50, 'units', 'Aisle 5, Rack D-01', 'In Stock'],
      ['prod-4', 'STK-NET-201', 'Armored Cat6A Shielded Cable 500m', 'Industrial grade foil-shielded Ethernet spool', 'cat-3', 'sup-3', 130.00, 215.00, 0, 10, 'spool', 'Aisle 4, Rack C-09', 'Out of Stock'],
      ['prod-5', 'STK-ELEC-003', 'Precision Laser Barcode Scanner 2D', 'Rugged handheld Bluetooth & 2.4G scanner', 'cat-1', 'sup-1', 95.00, 175.00, 8, 12, 'units', 'Aisle 1, Rack A-02', 'Low Stock'],
      ['prod-6', 'STK-LOG-301', 'Industrial Pallet Wrap Film 20um', 'High-tensile stretch film roll', 'cat-4', 'sup-4', 16.00, 32.50, 95, 30, 'rolls', 'Aisle 6, Rack E-15', 'In Stock'],
      ['prod-7', 'STK-LOG-302', 'RFID Asset Tracking Tags (Roll of 1000)', 'UHF EPC Gen 2 RFID printable adhesive labels', 'cat-4', 'sup-4', 72.00, 145.00, 34, 15, 'rolls', 'Aisle 6, Rack E-03', 'In Stock'],
      ['prod-8', 'STK-ELEC-004', 'High-Temperature Sensor Probe K-Type', 'Armored mineral-insulated thermocouple probe', 'cat-1', 'sup-1', 28.00, 58.00, 3, 15, 'units', 'Aisle 2, Rack B-06', 'Low Stock'],
      ['prod-9', 'STK-NET-202', 'Multi-Gigabit Industrial Switch 8-Port', 'Managed DIN-rail Gigabit switch with PoE+', 'cat-3', 'sup-3', 295.00, 490.00, 19, 8, 'units', 'Aisle 4, Rack C-02', 'In Stock'],
      ['prod-10', 'STK-SAF-401', 'Anti-Static ESD Safety Shoes (Size 10)', 'Dissipative steel-toe warehouse boots', 'cat-5', 'sup-2', 48.00, 85.00, 28, 10, 'pairs', 'Aisle 7, Rack F-05', 'In Stock']
    ];

    for (const p of products) {
      await conn.query(
        `INSERT INTO products (id, sku, name, description, category_id, supplier_id, cost_price, selling_price, quantity, reorder_level, unit, location, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        p
      );

      // Record initial seed stock movement
      await conn.query(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reference_type, notes, created_by)
         VALUES (?, 'in', ?, 0, ?, 'initial_seed', 'Initial inventory baseline', 'usr-admin-1')`,
        [p[0], p[8], p[8]]
      );
    }
    console.log('✓ Seeded 10 products with initial stock movements.');

    // 7. Seed Purchase Orders
    const purchaseOrders = [
      ['PO-2026-089', 'PO-2026-089', 'sup-1', 'usr-admin-1', '2026-10-10', '2026-10-15', 'Completed', 4000.00, 320.00, 4320.00, 'Urgent replenishment for Q4 IoT kits'],
      ['PO-2026-090', 'PO-2026-090', 'sup-3', 'usr-admin-1', '2026-10-12', '2026-10-17', 'In Transit', 1700.00, 150.00, 1850.00, 'Scheduled delivery for Cat6A cables'],
      ['PO-2026-091', 'PO-2026-091', 'sup-4', 'usr-admin-1', '2026-10-14', '2026-10-19', 'Pending', 2450.00, 190.00, 2640.00, 'Packaging materials and pallets'],
      ['PO-2026-092', 'PO-2026-092', 'sup-1', 'usr-admin-1', '2026-10-15', '2026-10-21', 'Processing', 2900.00, 250.00, 3150.00, 'Sensor nodes and laser scanners']
    ];

    for (const po of purchaseOrders) {
      await conn.query(
        `INSERT INTO purchase_orders (id, order_number, supplier_id, created_by, order_date, expected_date, status, subtotal, tax, total, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        po
      );
    }

    // Purchase Order Items
    const poItems = [
      ['PO-2026-089', 'prod-1', 15, 15, 210.00, 3150.00],
      ['PO-2026-089', 'prod-2', 20, 20, 45.00, 900.00],
      ['PO-2026-090', 'prod-4', 13, 0, 130.00, 1690.00],
      ['PO-2026-091', 'prod-6', 50, 0, 16.00, 800.00],
      ['PO-2026-091', 'prod-7', 25, 0, 72.00, 1800.00],
      ['PO-2026-092', 'prod-5', 20, 0, 95.00, 1900.00]
    ];

    for (const poi of poItems) {
      await conn.query(
        `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, received_quantity, unit_cost, subtotal)
         VALUES (?, ?, ?, ?, ?, ?)`,
        poi
      );
    }
    console.log('✓ Seeded 4 purchase orders with line items.');

    // 8. Seed Sales Orders
    const salesOrders = [
      ['INV-2026-1042', 'INV-2026-1042', 'cust-1', 'usr-admin-1', '2026-10-15', 'Paid', 'Wire Transfer', 2099.94, 0.00, 2099.94, 'Warehouse automation roll-out phase 1'],
      ['INV-2026-1041', 'INV-2026-1041', 'cust-2', 'usr-admin-1', '2026-10-15', 'Paid', 'Corporate Credit', 980.00, 0.00, 980.00, 'Server rack expansion'],
      ['INV-2026-1040', 'INV-2026-1040', 'cust-3', 'usr-admin-1', '2026-10-14', 'Paid', 'Net 30', 960.00, 0.00, 960.00, 'Robotic arm mounting hardware'],
      ['INV-2026-1039', 'INV-2026-1039', 'cust-4', 'usr-admin-1', '2026-10-13', 'Pending', 'Net 30', 725.00, 0.00, 725.00, 'Quarterly stock tagging labels'],
      ['INV-2026-1038', 'INV-2026-1038', 'cust-1', 'usr-admin-1', '2026-10-12', 'Paid', 'Wire Transfer', 700.00, 0.00, 700.00, 'Dock inbound scanning stations']
    ];

    for (const so of salesOrders) {
      await conn.query(
        `INSERT INTO sales_orders (id, order_number, customer_id, created_by, order_date, status, payment_method, subtotal, tax, total, notes)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        so
      );
    }

    const salesItems = [
      ['INV-2026-1042', 'prod-1', 6, 349.99, 2099.94],
      ['INV-2026-1041', 'prod-9', 2, 490.00, 980.00],
      ['INV-2026-1040', 'prod-3', 40, 24.00, 960.00],
      ['INV-2026-1039', 'prod-7', 5, 145.00, 725.00],
      ['INV-2026-1038', 'prod-5', 4, 175.00, 700.00]
    ];

    for (const soi of salesItems) {
      await conn.query(
        `INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?)`,
        soi
      );
    }
    console.log('✓ Seeded 5 sales orders with line items.');

    // 9. Seed Notifications
    const notifications = [
      ['notif-1', 'usr-admin-1', 'out_of_stock', 'Product Out of Stock', 'Armored Cat6A Shielded Cable 500m (STK-NET-201) reached 0 units.', false, true],
      ['notif-2', 'usr-admin-1', 'low_stock', 'Low Stock Alert', 'Smart Environmental Sensor Node has only 6 units remaining (Reorder level: 20).', false, true],
      ['notif-3', 'usr-admin-1', 'po_update', 'Purchase Order In Transit', 'PO-2026-090 from Global Fiber is scheduled for arrival tomorrow.', true, false],
      ['notif-4', 'usr-admin-1', 'sale', 'New High-Value Sale', 'OmniCorp Solutions placed an order of $2,099.94 for 6x IoT Gateways.', true, false]
    ];

    for (const n of notifications) {
      await conn.query(
        `INSERT INTO notifications (id, user_id, type, title, message, is_read, urgent)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        n
      );
    }
    console.log('✓ Seeded 4 notifications.');

    // 10. Seed System Settings
    const settings = [
      ['businessName', 'Stockwise Logistics & Inventory Ltd.'],
      ['companyEmail', 'operations@stockwise.io'],
      ['currency', 'USD'],
      ['currencySymbol', '$'],
      ['lowStockThreshold', '15'],
      ['warehouseLocation', 'Main Depot - Bay Area, Warehouse #4'],
      ['enableEmailAlerts', 'true'],
      ['autoReorderSuggestions', 'true'],
      ['fiscalYearStart', 'January']
    ];

    for (const [k, v] of settings) {
      await conn.query(
        `INSERT INTO system_settings (key_name, key_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE key_value = ?`,
        [k, v, v]
      );
    }
    console.log('✓ Seeded system settings.');

    // 11. Record Initial Audit Log
    await conn.query(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
       VALUES ('usr-admin-1', 'SYSTEM_INITIALIZE', 'DATABASE', 'stockwise_db', 'Database seeded with standard baseline dataset')`
    );
    console.log('✓ Seeded initial audit log entry.');
  });

  console.log('--- Stockwise Database Seeding Completed Successfully ---');
}

// Run standalone if invoked directly
if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Seeding failed:', err);
      process.exit(1);
    });
}
