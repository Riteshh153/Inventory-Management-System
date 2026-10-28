import { query, withTransaction } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * List purchase orders with line items count and supplier details
 */
export async function listPurchaseOrders(req, res, next) {
  try {
    const { status, supplierId } = req.query;
    const conditions = [];
    const params = [];

    if (status && status !== 'All') {
      conditions.push('po.status = ?');
      params.push(status);
    }

    if (supplierId) {
      conditions.push('po.supplier_id = ?');
      params.push(supplierId);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const orders = await query(
      `SELECT 
        po.id,
        po.order_number AS orderNumber,
        po.supplier_id AS supplierId,
        s.name AS supplier,
        po.order_date AS orderDate,
        po.expected_date AS expectedDelivery,
        po.status,
        po.subtotal,
        po.tax,
        po.total AS totalAmount,
        po.notes,
        po.created_at AS createdAt,
        COUNT(poi.id) AS itemsCount
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN purchase_order_items poi ON po.id = poi.purchase_order_id
      ${whereClause}
      GROUP BY po.id
      ORDER BY po.order_date DESC, po.created_at DESC`,
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
 * Get single purchase order with all line items
 */
export async function getPurchaseOrderById(req, res, next) {
  try {
    const { id } = req.params;

    const orders = await query(
      `SELECT 
        po.id,
        po.order_number AS orderNumber,
        po.supplier_id AS supplierId,
        s.name AS supplier,
        s.email AS supplierEmail,
        s.phone AS supplierPhone,
        po.order_date AS orderDate,
        po.expected_date AS expectedDelivery,
        po.status,
        po.subtotal,
        po.tax,
        po.total AS totalAmount,
        po.notes,
        po.created_at AS createdAt,
        u.name AS createdByName
      FROM purchase_orders po
      LEFT JOIN suppliers s ON po.supplier_id = s.id
      LEFT JOIN users u ON po.created_by = u.id
      WHERE po.id = ?`,
      [id]
    );

    if (orders.length === 0) {
      return next(new AppError(`Purchase order "${id}" was not found.`, 404, 'ORDER_NOT_FOUND'));
    }

    const items = await query(
      `SELECT 
        poi.id,
        poi.product_id AS productId,
        p.name AS productName,
        p.sku,
        poi.quantity,
        poi.received_quantity AS receivedQuantity,
        poi.unit_cost AS unitCost,
        poi.subtotal
      FROM purchase_order_items poi
      LEFT JOIN products p ON poi.product_id = p.id
      WHERE poi.purchase_order_id = ?`,
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
 * Create a new purchase order with multiple items (server-calculated totals)
 */
export async function createPurchaseOrder(req, res, next) {
  try {
    const {
      supplier,
      supplierId,
      expectedDelivery,
      notes = '',
      items = []
    } = req.body;

    // Resolve supplier ID
    let resolvedSupplierId = supplierId || null;
    let resolvedSupplierName = supplier || '';
    if (!resolvedSupplierId && supplier) {
      let supRows = await query('SELECT id, name FROM suppliers WHERE name = ?', [supplier.trim()]);
      if (supRows.length === 0) {
        supRows = await query('SELECT id, name FROM suppliers WHERE name LIKE ?', [`%${supplier.trim()}%`]);
      }
      if (supRows.length > 0) {
        resolvedSupplierId = supRows[0].id;
        resolvedSupplierName = supRows[0].name;
      }
    }

    if (!resolvedSupplierId) {
      const anySup = await query('SELECT id, name FROM suppliers LIMIT 1');
      if (anySup.length > 0) {
        resolvedSupplierId = anySup[0].id;
        resolvedSupplierName = anySup[0].name;
      }
    }

    if (!resolvedSupplierId) {
      return next(new AppError('A valid supplier is required for purchase orders.', 400, 'INVALID_SUPPLIER'));
    }

    if (!Array.isArray(items) || items.length === 0) {
      if (req.body.product || req.body.productId) {
        const prodId = req.body.productId;
        const prodName = req.body.product;
        const [prod] = await query('SELECT id, cost_price FROM products WHERE id = ? OR name = ?', [prodId, prodName]);
        if (prod) {
          items.push({
            productId: prod.id,
            quantity: parseInt(req.body.quantity, 10) || 1,
            unitCost: parseFloat(req.body.unitCost) || prod.cost_price || 10
          });
        }
      } else {
        // Fallback: Pick a product associated with this supplier, or first active product
        const supProducts = await query(
          'SELECT id, cost_price FROM products WHERE supplier_id = ? OR 1=1 ORDER BY (supplier_id = ?) DESC LIMIT 1',
          [resolvedSupplierId, resolvedSupplierId]
        );
        if (supProducts.length > 0) {
          const qty = parseInt(req.body.itemsCount, 10) || 1;
          const cost = parseFloat(req.body.totalAmount)
            ? Number((parseFloat(req.body.totalAmount) / qty).toFixed(2))
            : (supProducts[0].cost_price || 25);
          items.push({
            productId: supProducts[0].id,
            quantity: qty,
            unitCost: cost
          });
        }
      }
    }

    if (items.length === 0) {
      return next(new AppError('Purchase order must contain at least one line item.', 400, 'NO_ITEMS'));
    }

    // Server-calculated totals
    let calculatedSubtotal = 0;
    const validatedItems = [];

    for (const item of items) {
      const qty = parseInt(item.quantity, 10);
      if (!qty || qty <= 0) {
        return next(new AppError(`Quantity for product ${item.productId || item.product} must be > 0.`, 400, 'INVALID_ITEM_QTY'));
      }

      // Fetch official product cost if not provided
      let unitCost = parseFloat(item.unitCost);
      let prodId = item.productId;
      if (!prodId && item.product) {
        const [p] = await query('SELECT id, cost_price FROM products WHERE name = ?', [item.product]);
        if (p) {
          prodId = p.id;
          if (isNaN(unitCost)) unitCost = p.cost_price;
        }
      }

      if (!prodId) {
        return next(new AppError('Each item must have a valid product reference.', 400, 'INVALID_PRODUCT'));
      }

      const lineTotal = Number((qty * (unitCost || 0)).toFixed(2));
      calculatedSubtotal += lineTotal;
      validatedItems.push({
        productId: prodId,
        quantity: qty,
        unitCost: unitCost || 0,
        subtotal: lineTotal
      });
    }

    const calculatedTax = Number((calculatedSubtotal * 0.08).toFixed(2)); // standard 8% procurement tax
    const calculatedTotal = Number((calculatedSubtotal + calculatedTax).toFixed(2));

    const poCount = await query('SELECT COUNT(*) AS total FROM purchase_orders');
    const orderNumber = `PO-2026-${String(poCount[0].total + 93).padStart(3, '0')}`;
    const id = orderNumber;
    const userId = req.user?.id || null;
    const today = new Date().toISOString().split('T')[0];

    await withTransaction(async (conn) => {
      await conn.query(
        `INSERT INTO purchase_orders 
         (id, order_number, supplier_id, created_by, order_date, expected_date, status, subtotal, tax, total, notes)
         VALUES (?, ?, ?, ?, ?, ?, 'Pending', ?, ?, ?, ?)`,
        [id, orderNumber, resolvedSupplierId, userId, today, expectedDelivery || null, calculatedSubtotal, calculatedTax, calculatedTotal, notes]
      );

      for (const vi of validatedItems) {
        await conn.query(
          `INSERT INTO purchase_order_items (purchase_order_id, product_id, quantity, received_quantity, unit_cost, subtotal)
           VALUES (?, ?, ?, 0, ?, ?)`,
          [id, vi.productId, vi.quantity, vi.unitCost, vi.subtotal]
        );
      }

      // Record audit log
      await conn.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (?, 'PURCHASE_ORDER_CREATE', 'PURCHASE_ORDER', ?, ?)`,
        [userId, id, JSON.stringify({ supplierId: resolvedSupplierId, total: calculatedTotal, itemsCount: validatedItems.length })]
      );
    });

    res.status(201).json({
      success: true,
      message: `Purchase Order ${orderNumber} created successfully.`,
      data: {
        order: {
          id,
          orderNumber,
          supplier: resolvedSupplierName,
          supplierId: resolvedSupplierId,
          orderDate: today,
          expectedDelivery,
          status: 'Pending',
          itemsCount: validatedItems.length,
          totalAmount: calculatedTotal
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update purchase order status (Approve, Process, In Transit, Cancel)
 */
export async function updatePurchaseOrderStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['Pending', 'Approved', 'Processing', 'In Transit', 'Cancelled'];
    if (!validStatuses.includes(status)) {
      return next(new AppError(`Invalid status "${status}". Use receive endpoint to receive stock.`, 400, 'INVALID_STATUS'));
    }

    const [existing] = await query('SELECT id, status FROM purchase_orders WHERE id = ?', [id]);
    if (!existing) {
      return next(new AppError(`Purchase order "${id}" was not found.`, 404, 'ORDER_NOT_FOUND'));
    }

    if (existing.status === 'Completed' || existing.status === 'Received') {
      return next(new AppError('Cannot alter status of an already completed/received purchase order.', 400, 'ORDER_FINALIZED'));
    }

    await query('UPDATE purchase_orders SET status = ? WHERE id = ?', [status, id]);

    res.json({
      success: true,
      message: `Purchase order ${id} status updated to ${status}.`
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Receive Purchase Order stock into inventory (Transaction + prevents duplicate receipt)
 */
export async function receivePurchaseOrder(req, res, next) {
  try {
    const { id } = req.params;
    const userId = req.user?.id || null;

    const result = await withTransaction(async (conn) => {
      // 1. Lock and check PO
      const [orders] = await conn.query(
        'SELECT id, order_number, status, supplier_id FROM purchase_orders WHERE id = ? FOR UPDATE',
        [id]
      );

      if (!orders || orders.length === 0) {
        throw new AppError(`Purchase order "${id}" was not found.`, 404, 'ORDER_NOT_FOUND');
      }

      const order = orders[0];

      // PREVENT DUPLICATE STOCK RECEIPT
      if (order.status === 'Received' || order.status === 'Completed') {
        throw new AppError(`Purchase order ${order.order_number} has already been received into inventory. Duplicate receipt prevented.`, 400, 'DUPLICATE_RECEIPT');
      }

      if (order.status === 'Cancelled') {
        throw new AppError(`Cannot receive cancelled purchase order ${order.order_number}.`, 400, 'ORDER_CANCELLED');
      }

      // 2. Fetch line items
      const [items] = await conn.query(
        'SELECT id, product_id, quantity, received_quantity FROM purchase_order_items WHERE purchase_order_id = ?',
        [id]
      );

      if (!items || items.length === 0) {
        throw new AppError('Purchase order has no items to receive.', 400, 'NO_ITEMS');
      }

      // 3. For each item, update product inventory and insert stock movement
      for (const item of items) {
        // Lock product row
        const [prods] = await conn.query(
          'SELECT id, name, sku, quantity, reorder_level FROM products WHERE id = ? FOR UPDATE',
          [item.product_id]
        );

        if (prods && prods.length > 0) {
          const product = prods[0];
          const previousQty = product.quantity;
          const newQty = previousQty + item.quantity;

          let newStatus = 'In Stock';
          if (newQty === 0) newStatus = 'Out of Stock';
          else if (newQty <= product.reorder_level) newStatus = 'Low Stock';

          // Update product stock and status
          await conn.query(
            'UPDATE products SET quantity = ?, status = ? WHERE id = ?',
            [newQty, newStatus, product.id]
          );

          // Update received quantity on PO item
          await conn.query(
            'UPDATE purchase_order_items SET received_quantity = quantity WHERE id = ?',
            [item.id]
          );

          // Create stock movement record
          await conn.query(
            `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reference_type, reference_id, notes, created_by)
             VALUES (?, 'in', ?, ?, ?, 'purchase_order', ?, ?, ?)`,
            [product.id, item.quantity, previousQty, newQty, order.order_number, `Stock received from ${order.order_number}`, userId]
          );
        }
      }

      // 4. Mark purchase order as Completed
      await conn.query(
        "UPDATE purchase_orders SET status = 'Completed' WHERE id = ?",
        [id]
      );

      // 5. Create notification & audit log
      const notifId = 'notif-' + Date.now();
      await conn.query(
        `INSERT INTO notifications (id, user_id, type, title, message, is_read, urgent)
         VALUES (?, ?, 'po_update', 'Purchase Order Received', ?, false, false)`,
        [notifId, userId, `PO ${order.order_number} has been received into inventory. Items restocked.`]
      );

      await conn.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (?, 'PURCHASE_ORDER_RECEIVE', 'PURCHASE_ORDER', ?, ?)`,
        [userId, id, JSON.stringify({ orderNumber: order.order_number, itemsReceived: items.length })]
      );

      return { orderNumber: order.order_number, itemsCount: items.length };
    });

    res.json({
      success: true,
      message: `Purchase order ${result.orderNumber} successfully received. Inventory stock levels updated.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}
