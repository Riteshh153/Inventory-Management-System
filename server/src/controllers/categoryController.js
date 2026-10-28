import { query } from '../config/db.js';
import { AppError } from '../middleware/errorHandler.js';

export async function listCategories(req, res, next) {
  try {
    const categories = await query(
      `SELECT c.id, c.name, c.code, c.description, c.created_at AS createdAt,
              COUNT(p.id) AS productCount
       FROM categories c
       LEFT JOIN products p ON c.id = p.category_id
       GROUP BY c.id
       ORDER BY c.name ASC`
    );

    res.json({
      success: true,
      data: { items: categories }
    });
  } catch (error) {
    next(error);
  }
}

export async function createCategory(req, res, next) {
  try {
    const { name, code, description = '' } = req.body;

    if (!name || !name.trim()) {
      return next(new AppError('Category name is required.', 400, 'MISSING_NAME'));
    }

    const existing = await query('SELECT id FROM categories WHERE name = ?', [name.trim()]);
    if (existing.length > 0) {
      return next(new AppError(`Category "${name}" already exists.`, 409, 'DUPLICATE_CATEGORY'));
    }

    const id = 'cat-' + Date.now();
    await query(
      'INSERT INTO categories (id, name, code, description) VALUES (?, ?, ?, ?)',
      [id, name.trim(), code ? code.trim() : null, description.trim()]
    );

    res.status(201).json({
      success: true,
      message: `Category "${name}" created successfully.`,
      data: {
        category: { id, name: name.trim(), code, description, productCount: 0 }
      }
    });
  } catch (error) {
    next(error);
  }
}

export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, code, description } = req.body;

    const existing = await query('SELECT id, name FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return next(new AppError(`Category with ID "${id}" was not found.`, 404, 'CATEGORY_NOT_FOUND'));
    }

    if (name && name.trim() !== existing[0].name) {
      const dup = await query('SELECT id FROM categories WHERE name = ? AND id != ?', [name.trim(), id]);
      if (dup.length > 0) {
        return next(new AppError(`A category named "${name}" already exists.`, 409, 'DUPLICATE_CATEGORY'));
      }
    }

    await query(
      'UPDATE categories SET name = COALESCE(?, name), code = COALESCE(?, code), description = COALESCE(?, description) WHERE id = ?',
      [name ? name.trim() : null, code ? code.trim() : null, description !== undefined ? description : null, id]
    );

    res.json({
      success: true,
      message: 'Category updated successfully.'
    });
  } catch (error) {
    next(error);
  }
}

export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    const existing = await query('SELECT id, name FROM categories WHERE id = ?', [id]);
    if (existing.length === 0) {
      return next(new AppError(`Category with ID "${id}" was not found.`, 404, 'CATEGORY_NOT_FOUND'));
    }

    // Unlink products before deleting category
    await query('UPDATE products SET category_id = NULL WHERE category_id = ?', [id]);
    await query('DELETE FROM categories WHERE id = ?', [id]);

    res.json({
      success: true,
      message: `Category "${existing[0].name}" deleted successfully.`
    });
  } catch (error) {
    next(error);
  }
}
