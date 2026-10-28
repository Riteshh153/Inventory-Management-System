import { query, withTransaction } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

/**
 * List products with search, filtering, and pagination
 */
export async function listProducts(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 50));
    const offset = (page - 1) * limit;

    const { search, category, status, sortBy = 'created_at', sortOrder = 'DESC' } = req.query;

    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.location LIKE ?)');
      params.push(term, term, term);
    }

    if (category && category !== 'All') {
      conditions.push('(p.category_id = ? OR c.name = ?)');
      params.push(category, category);
    }

    if (status && status !== 'All') {
      conditions.push('p.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Allowed sort columns
    const allowedSortColumns = ['name', 'sku', 'selling_price', 'quantity', 'created_at', 'status'];
    const safeSortBy = allowedSortColumns.includes(sortBy) ? `p.${sortBy}` : 'p.created_at';
    const safeSortOrder = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    // Count total query
    const countSql = `
      SELECT COUNT(*) AS total
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      ${whereClause}
    `;
    const countRows = await query(countSql, params);
    const total = countRows[0]?.total || 0;

    // Fetch data query
    const dataSql = `
      SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.category_id AS categoryId,
        c.name AS category,
        p.supplier_id AS supplierId,
        s.name AS supplier,
        p.cost_price AS cost,
        p.selling_price AS price,
        p.quantity,
        p.reorder_level AS reorderLevel,
        p.unit,
        p.location,
        p.image_url AS imageUrl,
        p.status,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ${whereClause}
      ORDER BY ${safeSortBy} ${safeSortOrder}
      LIMIT ? OFFSET ?
    `;

    const products = await query(dataSql, [...params, limit, offset]);

    res.json({
      success: true,
      data: {
        items: products,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get product details by ID with movements
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    const rows = await query(
      `SELECT 
        p.id,
        p.sku,
        p.name,
        p.description,
        p.category_id AS categoryId,
        c.name AS category,
        p.supplier_id AS supplierId,
        s.name AS supplier,
        p.cost_price AS cost,
        p.selling_price AS price,
        p.quantity,
        p.reorder_level AS reorderLevel,
        p.unit,
        p.location,
        p.image_url AS imageUrl,
        p.status,
        p.created_at AS createdAt,
        p.updated_at AS updatedAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      WHERE p.id = ?`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return next(new AppError(`Product with ID "${id}" was not found.`, 404, 'PRODUCT_NOT_FOUND'));
    }

    const movements = await query(
      `SELECT id, movement_type, quantity, previous_quantity, new_quantity, reference_type, reference_id, notes, created_at
       FROM stock_movements
       WHERE product_id = ?
       ORDER BY created_at DESC
       LIMIT 20`,
      [id]
    );

    res.json({
      success: true,
      data: {
        product: {
          ...rows[0],
          recentMovements: movements
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Create a new product
 */
export async function createProduct(req, res, next) {
  try {
    const {
      name,
      sku,
      category,
      categoryId,
      supplier,
      supplierId,
      price = 0,
      cost = 0,
      quantity = 0,
      reorderLevel = 10,
      unit = 'units',
      location = '',
      description = ''
    } = req.body;

    if (!name || !sku) {
      return next(new AppError('Product name and SKU are required.', 400, 'MISSING_REQUIRED_FIELDS'));
    }

    // Check SKU uniqueness
    const existingSku = await query('SELECT id FROM products WHERE sku = ?', [sku.trim()]);
    if (existingSku.length > 0) {
      return next(new AppError(`A product with SKU "${sku}" already exists.`, 409, 'DUPLICATE_SKU'));
    }

    // Resolve category ID
    let resolvedCategoryId = categoryId || null;
    if (!resolvedCategoryId && category) {
      const catRows = await query('SELECT id FROM categories WHERE name = ?', [category.trim()]);
      if (catRows.length > 0) {
        resolvedCategoryId = catRows[0].id;
      }
    }

    // Resolve supplier ID
    let resolvedSupplierId = supplierId || null;
    if (!resolvedSupplierId && supplier) {
      const supRows = await query('SELECT id FROM suppliers WHERE name = ?', [supplier.trim()]);
      if (supRows.length > 0) {
        resolvedSupplierId = supRows[0].id;
      }
    }

    const qty = Math.max(0, parseInt(quantity, 10) || 0);
    const reorder = Math.max(0, parseInt(reorderLevel, 10) || 10);

    let status = 'In Stock';
    if (qty === 0) status = 'Out of Stock';
    else if (qty <= reorder) status = 'Low Stock';

    const id = 'prod-' + Date.now();
    const userId = req.user?.id || null;

    await withTransaction(async (conn) => {
      await conn.query(
        `INSERT INTO products 
         (id, sku, name, description, category_id, supplier_id, cost_price, selling_price, quantity, reorder_level, unit, location, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, sku.trim(), name.trim(), description.trim(), resolvedCategoryId, resolvedSupplierId, parseFloat(cost) || 0, parseFloat(price) || 0, qty, reorder, unit, location.trim(), status]
      );

      // Record baseline stock movement
      if (qty > 0) {
        await conn.query(
          `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reference_type, notes, created_by)
           VALUES (?, 'in', ?, 0, ?, 'initial_seed', 'Initial inventory creation', ?)`,
          [id, qty, qty, userId]
        );
      }

      // Record audit log
      await conn.query(
        `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
         VALUES (?, 'PRODUCT_CREATE', 'PRODUCT', ?, ?)`,
        [userId, id, JSON.stringify({ name, sku, quantity: qty, price })]
      );
    });

    res.status(201).json({
      success: true,
      message: `Product "${name}" created successfully.`,
      data: {
        product: {
          id,
          sku: sku.trim(),
          name: name.trim(),
          category,
          categoryId: resolvedCategoryId,
          supplier,
          supplierId: resolvedSupplierId,
          price: parseFloat(price) || 0,
          cost: parseFloat(cost) || 0,
          quantity: qty,
          reorderLevel: reorder,
          unit,
          location,
          status
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Update an existing product
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      sku,
      category,
      categoryId,
      supplier,
      supplierId,
      price,
      cost,
      quantity,
      reorderLevel,
      unit,
      location,
      description,
      status: requestedStatus
    } = req.body;

    const existing = await query('SELECT * FROM products WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return next(new AppError(`Product with ID "${id}" was not found.`, 404, 'PRODUCT_NOT_FOUND'));
    }

    const current = existing[0];

    // If SKU is being updated, verify uniqueness
    if (sku && sku !== current.sku) {
      const dup = await query('SELECT id FROM products WHERE sku = ? AND id != ?', [sku.trim(), id]);
      if (dup.length > 0) {
        return next(new AppError(`SKU "${sku}" is already assigned to another product.`, 409, 'DUPLICATE_SKU'));
      }
    }

    let resolvedCategoryId = categoryId !== undefined ? categoryId : current.category_id;
    if (category && categoryId === undefined) {
      const catRows = await query('SELECT id FROM categories WHERE name = ?', [category.trim()]);
      if (catRows.length > 0) resolvedCategoryId = catRows[0].id;
    }

    let resolvedSupplierId = supplierId !== undefined ? supplierId : current.supplier_id;
    if (supplier && supplierId === undefined) {
      const supRows = await query('SELECT id FROM suppliers WHERE name = ?', [supplier.trim()]);
      if (supRows.length > 0) resolvedSupplierId = supRows[0].id;
    }

    const newQty = quantity !== undefined ? Math.max(0, parseInt(quantity, 10)) : current.quantity;
    const newReorder = reorderLevel !== undefined ? Math.max(0, parseInt(reorderLevel, 10)) : current.reorder_level;

    // Recalculate status
    let status = requestedStatus || current.status;
    if (status !== 'Discontinued') {
      if (newQty === 0) status = 'Out of Stock';
      else if (newQty <= newReorder) status = 'Low Stock';
      else status = 'In Stock';
    }

    await query(
      `UPDATE products 
       SET name = ?, sku = ?, description = ?, category_id = ?, supplier_id = ?, cost_price = ?, selling_price = ?, quantity = ?, reorder_level = ?, unit = ?, location = ?, status = ?
       WHERE id = ?`,
      [
        name !== undefined ? name.trim() : current.name,
        sku !== undefined ? sku.trim() : current.sku,
        description !== undefined ? description : current.description,
        resolvedCategoryId,
        resolvedSupplierId,
        price !== undefined ? parseFloat(price) : current.selling_price,
        cost !== undefined ? parseFloat(cost) : current.cost_price,
        newQty,
        newReorder,
        unit !== undefined ? unit : current.unit,
        location !== undefined ? location : current.location,
        status,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Product updated successfully.',
      data: {
        product: {
          id,
          name: name || current.name,
          sku: sku || current.sku,
          price: price !== undefined ? parseFloat(price) : current.selling_price,
          cost: cost !== undefined ? parseFloat(cost) : current.cost_price,
          quantity: newQty,
          reorderLevel: newReorder,
          status
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Delete product or safe archive if referenced by orders
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id, name FROM products WHERE id = ?', [id]);
    if (!existing || existing.length === 0) {
      return next(new AppError(`Product with ID "${id}" was not found.`, 404, 'PRODUCT_NOT_FOUND'));
    }

    // Check references in purchase_order_items or sales_order_items
    const [poRefs] = await query('SELECT COUNT(*) AS count FROM purchase_order_items WHERE product_id = ?', [id]);
    const [soRefs] = await query('SELECT COUNT(*) AS count FROM sales_order_items WHERE product_id = ?', [id]);

    if ((poRefs?.count || 0) > 0 || (soRefs?.count || 0) > 0) {
      // Historical references exist: Archive/deactivate instead of breaking relational integrity
      await query("UPDATE products SET status = 'Discontinued', quantity = 0 WHERE id = ?", [id]);
      return res.json({
        success: true,
        message: `Product "${existing[0].name}" is referenced in historical orders and was archived as Discontinued.`,
        data: { archived: true, id }
      });
    }

    // Safe to delete completely
    await withTransaction(async (conn) => {
      await conn.query('DELETE FROM stock_movements WHERE product_id = ?', [id]);
      await conn.query('DELETE FROM products WHERE id = ?', [id]);
    });

    res.json({
      success: true,
      message: `Product "${existing[0].name}" deleted successfully.`,
      data: { deleted: true, id }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Adjust stock level with audit trail and transaction
 */
export async function adjustStock(req, res, next) {
  try {
    const { id } = req.params;
    const { adjustmentQuantity, type = 'in', notes = '' } = req.body;

    const qty = Math.abs(parseInt(adjustmentQuantity, 10));
    if (!qty || qty <= 0) {
      return next(new AppError('Adjustment quantity must be greater than 0.', 400, 'INVALID_QUANTITY'));
    }

    if (!['in', 'out', 'adjustment'].includes(type)) {
      return next(new AppError("Movement type must be 'in', 'out', or 'adjustment'.", 400, 'INVALID_TYPE'));
    }

    const userId = req.user?.id || null;

    const result = await withTransaction(async (conn) => {
      // Lock row for atomic update
      const [rows] = await conn.query('SELECT id, name, sku, quantity, reorder_level FROM products WHERE id = ? FOR UPDATE', [id]);
      if (!rows || rows.length === 0) {
        throw new AppError(`Product with ID "${id}" was not found.`, 404, 'PRODUCT_NOT_FOUND');
      }

      const product = rows[0];
      const previousQty = product.quantity;

      let newQty = previousQty;
      if (type === 'in') {
        newQty = previousQty + qty;
      } else if (type === 'out') {
        if (previousQty < qty) {
          throw new AppError(`Cannot remove ${qty} units. Only ${previousQty} available in stock.`, 400, 'INSUFFICIENT_STOCK');
        }
        newQty = previousQty - qty;
      } else if (type === 'adjustment') {
        newQty = qty; // direct count override
      }

      let status = 'In Stock';
      if (newQty === 0) status = 'Out of Stock';
      else if (newQty <= product.reorder_level) status = 'Low Stock';

      // Update product
      await conn.query('UPDATE products SET quantity = ?, status = ? WHERE id = ?', [newQty, status, id]);

      // Record stock movement
      await conn.query(
        `INSERT INTO stock_movements (product_id, movement_type, quantity, previous_quantity, new_quantity, reference_type, notes, created_by)
         VALUES (?, ?, ?, ?, ?, 'manual_adjustment', ?, ?)`,
        [id, type === 'in' ? 'in' : 'out', qty, previousQty, newQty, notes || 'Manual inventory adjustment', userId]
      );

      // Generate notification if stock dropped below threshold
      if (newQty <= product.reorder_level) {
        const notifId = 'notif-' + Date.now();
        const notifType = newQty === 0 ? 'out_of_stock' : 'low_stock';
        const notifTitle = newQty === 0 ? 'Product Out of Stock' : 'Low Stock Alert';
        const notifMsg = `${product.name} (${product.sku}) now has ${newQty} units remaining (Threshold: ${product.reorder_level}).`;

        await conn.query(
          `INSERT INTO notifications (id, user_id, type, title, message, is_read, urgent)
           VALUES (?, ?, ?, ?, ?, false, true)`,
          [notifId, userId, notifType, notifTitle, notifMsg]
        );
      }

      return { product: product.name, previousQuantity: previousQty, newQuantity: newQty, status };
    });

    res.json({
      success: true,
      message: `Stock updated successfully for ${result.product}. New balance: ${result.newQuantity} units.`,
      data: result
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get low stock products
 */
export async function getLowStockProducts(req, res, next) {
  try {
    const products = await query(
      `SELECT p.id, p.sku, p.name, p.quantity, p.reorder_level AS reorderLevel, p.unit, p.location, p.status, c.name AS category
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.quantity > 0 AND p.quantity <= p.reorder_level
       ORDER BY p.quantity ASC`
    );

    res.json({
      success: true,
      data: { items: products, count: products.length }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get out of stock products
 */
export async function getOutOfStockProducts(req, res, next) {
  try {
    const products = await query(
      `SELECT p.id, p.sku, p.name, p.quantity, p.reorder_level AS reorderLevel, p.unit, p.location, p.status, c.name AS category
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.quantity = 0
       ORDER BY p.name ASC`
    );

    res.json({
      success: true,
      data: { items: products, count: products.length }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get stock movements for a product
 */
export async function getProductMovements(req, res, next) {
  try {
    const { id } = req.params;

    const movements = await query(
      `SELECT sm.id, sm.movement_type AS movementType, sm.quantity, sm.previous_quantity AS previousQuantity,
              sm.new_quantity AS newQuantity, sm.reference_type AS referenceType, sm.reference_id AS referenceId,
              sm.notes, sm.created_at AS createdAt, u.name AS createdByName
       FROM stock_movements sm
       LEFT JOIN users u ON sm.created_by = u.id
       WHERE sm.product_id = ?
       ORDER BY sm.created_at DESC`,
      [id]
    );

    res.json({
      success: true,
      data: { movements }
    });
  } catch (error) {
    next(error);
  }
}
