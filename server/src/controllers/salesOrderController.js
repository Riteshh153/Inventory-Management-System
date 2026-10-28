import { query, withTransaction } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * List sales orders
 */
export async function listSalesOrders(req, res, next) {
  try {
    const { status, customerId, search } = req.query;
    const conditions = [];
    const params = [];

    if (status && status !== 'All') {
      conditions.push('so.status = ?');
      params.push(status);
    }

    if (customerId) {
      conditions.push('so.customer_id = ?');
      params.push(customerId);
    }

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(so.order_number LIKE ? OR c.name LIKE ?)');
      params.push(term, term);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orders = await query(
      `SELECT 
        so.id,
        so.order_number AS orderNumber,
        so.customer_id AS customerId,
        c.name AS customer,
        so.order_date AS date,
        so.status,
        so.payment_method AS paymentMethod,
        so.subtotal,
        so.tax,
        so.total AS totalAmount,
        so.notes,
        so.created_at AS createdAt,
        COUNT(soi.id) AS itemsCount,
        -- Primary product name for dashboard display compatibility
        (SELECT p2.name FROM sales_order_items soi2 JOIN products p2 ON soi2.product_id = p2.id WHERE soi2.sales_order_id = so.id LIMIT 1) AS product,
        (SELECT soi2.quantity FROM sales_order_items soi2 WHERE soi2.sales_order_id = so.id LIMIT 1) AS quantity
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      LEFT JOIN sales_order_items soi ON so.id = soi.sales_order_id
      ${whereClause}
      GROUP BY so.id
      ORDER BY so.order_date DESC, so.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: { items: orders }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get sales order details with line items
 */
export async function getSalesOrderById(req, res, next) {
  try {
    const { id } = req.params;

    const orders = await query(
      `SELECT 
        so.id,
        so.order_number AS orderNumber,
        so.customer_id AS customerId,
        c.name AS customer,
        c.email AS customerEmail,
        c.phone AS customerPhone,
        so.order_date AS date,
        so.status,
        so.payment_method AS paymentMethod,
        so.subtotal,
        so.tax,
        so.total AS totalAmount,
        so.notes,
        so.created_at AS createdAt
      FROM sales_orders so
      LEFT JOIN customers c ON so.customer_id = c.id
      WHERE so.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return next(new AppError(`Sales order "${id}" was not found.`, 404, 'ORDER_NOT_FOUND'));
    }

    const items = await query(
      `SELECT 
        soi.id,
        soi.product_id AS productId,
        p.name AS productName,
        p.sku,
        soi.quantity,
        soi.unit_price AS unitPrice,
        soi.subtotal
      FROM sales_order_items soi
      LEFT JOIN products p ON soi.product_id = p.id
      WHERE soi.sales_order_id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: {
        order: {
          ...orders[0],
          items
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create sales order with atomic stock deduction and row-level locking
 * (Prevents overselling and concurrent stock race conditions)
 */
export async function createSalesOrder(req, res, next) {
  try {
    const {
      customer,
      customerId,
      paymentMethod = 'Credit Card',
      notes = '',
      items = [],
      product,
      productId,
      quantity,
      totalAmount
    } = req.body;

    // Handle single-item convenience payload from frontend modal
    const orderItems = [...(Array.isArray(items) ? items : [])];
    if (orderItems.length === 0 && (product || productId)) {
      orderItems.push({
        productId,
        product,
        quantity: parseInt(quantity, 10) || 1,
        unitPrice: parseFloat(totalAmount) ? (parseFloat(totalAmount) / (parseInt(quantity, 10) || 1)) : undefined
      });
    }

    if (orderItems.length === 0) {
      return next(new AppError('Sales order must contain at least one product item.', 400, 'NO_ITEMS'));
    }

    // Resolve customer ID
    let resolvedCustomerId = customerId || null;
    let resolvedCustomerName = customer || 'Walk-in Customer';
    if (!resolvedCustomerId && customer) {
      const [cust] = await query('SELECT id, name FROM customers WHERE name = ?', [customer.trim()]);
      if (cust) {
        resolvedCustomerId = cust.id;
        resolvedCustomerName = cust.name;
      }
    }

    const userId = req.user?.id || null;
    const today = new Date().toISOString().split('T')[0];

    const result = await withTransaction(async (conn) => {
      let calculatedSubtotal = 0;
      const validatedItems = [];

      // 1. Validate availability and deduct stock using SELECT FOR UPDATE row locking
      for (const item of orderItems) {
        const qty = parseInt(item.quantity, 10);
        if (!qty || qty <= 0) {
          throw new AppError('Item quantity must be greater than 0.', 400, 'INVALID_QUANTITY');
        }

        // Find product with row lock
        let prodRows;
        if (item.productId) {
          [prodRows] = await conn.query(
            'SELECT id, name, sku, quantity, selling_price, reorder_level FROM products WHERE id = ? FOR UPDATE',
            [item.productId]
          );
        } else if (item.product) {
          [prodRows] = await conn.query(
            'SELECT id, name, sku, quantity, selling_price, reorder_level FROM products WHERE name = ? FOR UPDATE',
            [item.product.trim()]
          );
          if (!prodRows || prodRows.length === 0) {
            [prodRows] = await conn.query(
              'SELECT id, name, sku, quantity, selling_price, reorder_level FROM products WHERE name LIKE ? OR sku LIKE ? FOR UPDATE',
              [`%${item.product.trim()}%`, `%${item.product.trim()}%`]
            );
          }
        }

        if (!prodRows || prodRows.length === 0) {
          [prodRows] = await conn.query(
            'SELECT id, name, sku, quantity, selling_price, reorder_level FROM products WHERE quantity > 0 ORDER BY id ASC LIMIT 1 FOR UPDATE'
          );
        }

        if (!prodRows || prodRows.length === 0) {
          throw new AppError(`Product "${item.product || item.productId}" was not found.`, 404, 'PRODUCT_NOT_FOUND');
        }

        const product = prodRows[0];

        // PREVENT OVERSELLING: Check real inventory availability
        if (product.quantity < qty) {
          throw new AppError(
            `Insufficient stock for "${product.name}" (${product.sku}). Requested: ${qty}, Available: ${product.quantity}.`,
            400,
            'INSUFFICIENT_STOCK'
          );
        }

        const unitPrice = item.unitPrice !== undefined ? parseFloat(item.unitPrice) : product.selling_price;
        const lineTotal = Number((qty * unitPrice).toFixed(2));
        calculatedSubtotal += lineTotal;

        const newStock = product.quantity - qty;
        let newStatus = 'In Stock';
        if (newStock === 0) newStatus = 'Out of Stock';
        else if (newStock <= product.reorder_level) newStatus = 'Low Stock';

        // Deduct inventory
        await conn.query('UPDATE products SET quantity = ?, status = ? WHERE id = ?', [newStock, newStatus, product.id]);

        validatedItems.push({
          productId: product.id,
          productName: product.name,
          sku: product.sku,
          quantity: qty,
          unitPrice,
          subtotal: lineTotal,
          previousQuantity: product.quantity,
          newQuantity: newStock,
          reorderLevel: product.reorder_level
        });
      }

      const calculatedTotal = Number(calculatedSubtotal.toFixed(2));
      const [countRows] = await conn.query('SELECT COUNT(*) AS total FROM sales_orders');
      const orderNumber = `INV-2026-${String(countRows[0].total + 1043)}`;
      const id = orderNumber;

      // 2. Insert sales order
      await conn.query(
        `INSERT INTO sales_orders 
         (id, order_number, customer_id, created_by, order_date, status, payment_method, subtotal, tax, total, notes)
         VALUES (?, ?, ?, ?, ?, 'Paid', ?, ?, 0.00, ?, ?)`,
        [id, orderNumber, resolvedCustomerId, userId, today, paymentMethod, calculatedSubtotal, calculatedTotal, notes]
      );

      // 3. Insert sales order items & stock movements
      for (const vi of validatedItems) {
        await conn.query(
          `INSERT INTO sales_order_items (sales_order_id, product_id, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?)`,
          [id, vi.productId, vi.quantity, vi.unitPrice, vi.subtotal]
        );

        // Record stock movement
        await conn.query(
          `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reference_type, reference_id, notes, created_by)
           VALUES (?, 'out', ?, ?, ?, 'sales_order', ?, ?, ?)`,
          [vi.productId, vi.quantity, vi.previousQuantity, vi.newQuantity, orderNumber, `Sold in ${orderNumber}`, userId]
        );

        // Generate low/out of stock notification if threshold crossed
        if (vi.newQuantity <= vi.reorderLevel) {
          const notifId = 'notif-' + Date.now() + Math.floor(Math.random() * 1000);
          const notifType = vi.newQuantity === 0 ? 'out_of_stock' : 'low_stock';
          const notifTitle = vi.newQuantity === 0 ? 'Product Out of Stock' : 'Low Stock Alert';
          const notifMsg = `${vi.productName} (${vi.sku}) depleted to ${vi.newQuantity} units after Sale ${orderNumber}.`;

          await conn.query(
            `INSERT INTO notifications (id, user_id, type, title, message, is_read, urgent)
             VALUES (?, ?, ?, ?, ?, false, true)`,
            [notifId, userId, notifType, notifTitle, notifMsg]
          );
        }
      }

      // Record high-value sale notification
      if (calculatedTotal >= 1000) {
        const notifId = 'notif-' + Date.now();
        await conn.query(
          `INSERT INTO notifications (id, user_id, type, title, message, is_read, urgent)
           VALUES (?, ?, 'sale', 'High-Value Sale Recorded', ?, false, false)`,
          [notifId, userId, `Order ${orderNumber} for $${calculatedTotal.toFixed(2)} completed for ${resolvedCustomerName}.`]
        );
      }

      return {
        id,
        orderNumber,
        customer: resolvedCustomerName,
        customerId: resolvedCustomerId,
        date: today,
        status: 'Paid',
        paymentMethod,
        product: validatedItems[0]?.productName,
        quantity: validatedItems[0]?.quantity,
        totalAmount: calculatedTotal,
        itemsCount: validatedItems.length
      };
    });

    res.status(201).json({
      success: true,
      message: `Sale recorded successfully: ${result.orderNumber} for $${result.totalAmount.toFixed(2)}.`,
      data: { order: result }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Cancel sales order and restore product stock (Transaction)
 */
export async function cancelSalesOrder(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const result = await withTransaction(async (conn) => {
      const [orders] = await conn.query(
        'SELECT id, order_number, status FROM sales_orders WHERE id = ? FOR UPDATE',
        [id]
      );

      if (!orders || orders.length === 0) {
        throw new AppError(`Sales order "${id}" was not found.`, 404, 'ORDER_NOT_FOUND');
      }

      const order = orders[0];
      if (order.status === 'Cancelled') {
        throw new AppError(`Sales order ${order.order_number} is already cancelled.`, 400, 'ALREADY_CANCELLED');
      }

      // Fetch items to restore
      const [items] = await conn.query(
        'SELECT product_id, quantity FROM sales_order_items WHERE sales_order_id = ?',
        [id]
      );

      for (const item of items) {
        const [prods] = await conn.query(
          'SELECT id, quantity, reorder_level FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );

        if (prods && prods.length > 0) {
          const product = prods[0];
          const restoredQty = product.quantity + item.quantity;

          let status = 'In Stock';
          if (restoredQty <= product.reorder_level) status = 'Low Stock';

          await conn.query('UPDATE products SET quantity = ?, status = ? WHERE id = ?', [restoredQty, status, product.id]);

          await conn.query(
            `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reference_type, reference_id, notes, created_by)
             VALUES (?, 'return', ?, ?, ?, 'sales_order', ?, ?, ?)`,
            [product.id, item.quantity, product.quantity, restoredQty, order.order_number, `Restored from cancelled sale ${order.order_number}`, userId]
          );
        }
      }

      await conn.query("UPDATE sales_orders SET status = 'Cancelled' WHERE id = ?", [id]);

      return { orderNumber: order.order_number };
    });

    res.json({
      success: true,
      message: `Sales order ${result.orderNumber} cancelled and stock inventory restored.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
