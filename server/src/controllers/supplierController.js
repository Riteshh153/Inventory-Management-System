import { query } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listSuppliers(req, res, next) {
  try {
    const { search, status } = req.query;
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(name LIKE ? OR contact_person LIKE ? OR email LIKE ?)');
      params.push(term, term, term);
    }

    if (status && status !== 'All') {
      conditions.push('status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const suppliers = await query(
      `SELECT id, name, contact_person AS contactPerson, company_name AS companyName,
              email, phone, category, lead_time_days AS leadTimeDays, address, status,
              created_at AS createdAt
       FROM suppliers
       ${whereClause}
       ORDER BY name ASC`,
      params
    );

    res.json({
      success: true,
      data: { items: suppliers }
    });
  } catch (error) {
    next(error);
  }
}

export async function getSupplierById(req, res, next) {
  try {
    const { id } = req.params;

    const rows = await query(
      `SELECT id, name, contact_person AS contactPerson, company_name AS companyName,
              email, phone, category, lead_time_days AS leadTimeDays, address, status,
              created_at AS createdAt
       FROM suppliers
       WHERE id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return next(new AppError(`Supplier with ID "${id}" was not found.`, 404, 'SUPPLIER_NOT_FOUND'));
    }

    // Include recent purchase orders from this supplier
    const orders = await query(
      `SELECT id, order_number, order_date, expected_date, status, total
       FROM purchase_orders
       WHERE supplier_id = ?
       ORDER BY order_date DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        supplier: {
          ...rows[0],
          recentOrders: orders
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createSupplier(req, res, next) {
  try {
    const {
      name,
      contactPerson,
      companyName,
      email,
      phone,
      category,
      leadTimeDays = 3,
      address,
      status = 'Active'
    } = req.body;

    if (!name || !name.trim()) {
      return next(new AppError('Supplier name is required.', 400, 'MISSING_NAME'));
    }

    const id = 'sup-' + Date.now();
    await query(
      `INSERT INTO suppliers 
       (id, name, contact_person, company_name, email, phone, category, lead_time_days, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        contactPerson ? contactPerson.trim() : null,
        companyName ? companyName.trim() : null,
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        category ? category.trim() : null,
        parseInt(leadTimeDays, 10) || 3,
        address ? address.trim() : null,
        status
      ]
    );

    res.status(201).json({
      success: true,
      message: `Supplier "${name}" created successfully.`,
      data: {
        supplier: { id, name, contactPerson, companyName, email, phone, category, leadTimeDays, address, status }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateSupplier(req, res, next) {
  try {
    const { id } = req.params;
    const {
      name,
      contactPerson,
      companyName,
      email,
      phone,
      category,
      leadTimeDays,
      address,
      status
    } = req.body;

    const existing = await query('SELECT id FROM suppliers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return next(new AppError(`Supplier with ID "${id}" was not found.`, 404, 'SUPPLIER_NOT_FOUND'));
    }

    await query(
      `UPDATE suppliers SET
        name = COALESCE(?, name),
        contact_person = COALESCE(?, contact_person),
        company_name = COALESCE(?, company_name),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        category = COALESCE(?, category),
        lead_time_days = COALESCE(?, lead_time_days),
        address = COALESCE(?, address),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        contactPerson !== undefined ? contactPerson : null,
        companyName !== undefined ? companyName : null,
        email !== undefined ? email : null,
        phone !== undefined ? phone : null,
        category !== undefined ? category : null,
        leadTimeDays !== undefined ? parseInt(leadTimeDays, 10) : null,
        address !== undefined ? address : null,
        status !== undefined ? status : null,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Supplier updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteSupplier(req, res, next) {
  try {
    const { id } = req.params;

    // Check if purchase orders or products reference this supplier
    const [poCount] = await query('SELECT COUNT(*) AS count FROM purchase_orders WHERE supplier_id = ?', [id]);
    const [prodCount] = await query('SELECT COUNT(*) AS count FROM products WHERE supplier_id = ?', [id]);

    if ((poCount?.count || 0) > 0 || (prodCount?.count || 0) > 0) {
      // Historical references exist: Soft deactivate
      await query("UPDATE suppliers SET status = 'Inactive' WHERE id = ?", [id]);
      return res.json({
        success: true,
        message: 'Supplier is referenced in products or orders and was deactivated to preserve audit integrity.',
        data: { deactivated: true, id }
      });
    }

    await query('DELETE FROM suppliers WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Supplier deleted successfully.',
      data: { deleted: true, id }
    });
  } catch (error) {
    next(error);
  }
}
