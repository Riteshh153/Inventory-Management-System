import { query } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listCustomers(req, res, next) {
  try {
    const { search, status } = req.query;
    const conditions = [];
    const params = [];

    if (search && search.trim()) {
      const term = `%${search.trim()}%`;
      conditions.push('(c.name LIKE ? OR c.contact_person LIKE ? OR c.email LIKE ?)');
      params.push(term, term, term);
    }

    if (status && status !== 'All') {
      conditions.push('c.status = ?');
      params.push(status);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const customers = await query(
      `SELECT c.id, c.name, c.contact_person AS contactPerson, c.email, c.phone, c.address, c.status,
              c.created_at AS createdAt,
              COUNT(so.id) AS totalOrders,
              COALESCE(SUM(so.total), 0) AS totalSpent
       FROM customers c
       LEFT JOIN sales_orders so ON c.id = so.customer_id AND so.status != 'Cancelled'
       ${whereClause}
       GROUP BY c.id
       ORDER BY c.name ASC`,
      params
    );

    res.json({
      success: true,
      data: { items: customers }
    });
  } catch (error) {
    next(error);
  }
}

export async function getCustomerById(req, res, next) {
  try {
    const { id } = req.params;

    const rows = await query(
      `SELECT c.id, c.name, c.contact_person AS contactPerson, c.email, c.phone, c.address, c.status,
              c.created_at AS createdAt
       FROM customers c
       WHERE c.id = ?`,
      [id]
    );

    if (rows.length === 0) {
      return next(new AppError(`Customer with ID "${id}" was not found.`, 404, 'CUSTOMER_NOT_FOUND'));
    }

    // Include sales orders history for this customer
    const orders = await query(
      `SELECT id, order_number, order_date, status, payment_method, total
       FROM sales_orders
       WHERE customer_id = ?
       ORDER BY order_date DESC
       LIMIT 10`,
      [id]
    );

    res.json({
      success: true,
      data: {
        customer: {
          ...rows[0],
          recentOrders: orders
        }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function createCustomer(req, res, next) {
  try {
    const { name, contactPerson, email, phone, address, status = 'Active' } = req.body;

    if (!name || !name.trim()) {
      return next(new AppError('Customer name is required.', 400, 'MISSING_NAME'));
    }

    const id = 'cust-' + Date.now();
    await query(
      `INSERT INTO customers (id, name, contact_person, email, phone, address, status)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name.trim(),
        contactPerson ? contactPerson.trim() : null,
        email ? email.trim() : null,
        phone ? phone.trim() : null,
        address ? address.trim() : null,
        status
      ]
    );

    res.status(201).json({
      success: true,
      message: `Customer "${name}" created successfully.`,
      data: {
        customer: { id, name, contactPerson, email, phone, address, status, totalOrders: 0, totalSpent: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const { name, contactPerson, email, phone, address, status } = req.body;

    const existing = await query('SELECT id FROM customers WHERE id = ?', [id]);
    if (existing.length === 0) {
      return next(new AppError(`Customer with ID "${id}" was not found.`, 404, 'CUSTOMER_NOT_FOUND'));
    }

    await query(
      `UPDATE customers SET
        name = COALESCE(?, name),
        contact_person = COALESCE(?, contact_person),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        address = COALESCE(?, address),
        status = COALESCE(?, status)
       WHERE id = ?`,
      [
        name ? name.trim() : null,
        contactPerson !== undefined ? contactPerson : null,
        email !== undefined ? email : null,
        phone !== undefined ? phone : null,
        address !== undefined ? address : null,
        status !== undefined ? status : null,
        id
      ]
    );

    res.json({
      success: true,
      message: 'Customer updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCustomer(req, res, next) {
  try {
    const { id } = req.params;

    const [soCount] = await query('SELECT COUNT(*) AS count FROM sales_orders WHERE customer_id = ?', [id]);
    if ((soCount?.count || 0) > 0) {
      await query("UPDATE customers SET status = 'Inactive' WHERE id = ?", [id]);
      return res.json({
        success: true,
        message: 'Customer has historical invoices and was deactivated to preserve financial audit trail.',
        data: { deactivated: true, id }
      });
    }

    await query('DELETE FROM customers WHERE id = ?', [id]);
    res.json({
      success: true,
      message: 'Customer deleted successfully.',
      data: { deleted: true, id }
    });
  } catch (error) {
    next(error);
  }
}
