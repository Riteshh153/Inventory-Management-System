import { query } from '../config/db.js';

/**
 * Inventory valuation & audit report data
 */
export async function getInventoryReport(req, res, next) {
  try {
    const products = await query(`
      SELECT 
        p.id, p.sku, p.name, c.name AS category, s.name AS supplier,
        p.cost_price AS costPrice, p.selling_price AS sellingPrice,
        p.quantity, p.reorder_level AS reorderLevel,
        (p.quantity * p.cost_price) AS inventoryCostValuation,
        (p.quantity * p.selling_price) AS inventoryRetailValuation,
        p.location, p.status
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name ASC
    `);

    const summary = {
      totalProducts: products.length,
      totalUnits: products.reduce((acc, p) => acc + Number(p.quantity), 0),
      totalCostValue: products.reduce((acc, p) => acc + Number(p.inventoryCostValuation), 0),
      totalRetailValue: products.reduce((acc, p) => acc + Number(p.inventoryRetailValuation), 0)
    };

    res.json({
      success: true,
      data: {
        summary,
        items: products
      }
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Export inventory as standard CSV download
 */
export async function exportInventoryCSV(req, res, next) {
  try {
    const products = await query(`
      SELECT 
        p.sku, p.name, c.name AS category, s.name AS supplier,
        p.selling_price, p.cost_price, p.quantity, p.reorder_level,
        p.unit, p.location, p.status, (p.quantity * p.selling_price) AS valuation
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN suppliers s ON p.supplier_id = s.id
      ORDER BY p.name ASC
    `);

    const headers = [
      'SKU',
      'Product Name',
      'Category',
      'Supplier',
      'Selling Price ($)',
      'Cost Price ($)',
      'Quantity',
      'Reorder Level',
      'Unit',
      'Location',
      'Status',
      'Total Valuation ($)'
    ];

    const escapeCsv = (str) => {
      if (str === null || str === undefined) return '""';
      const s = String(str).replace(/"/g, '""');
      return `"${s}"`;
    };

    const rows = products.map((p) => [
      escapeCsv(p.sku),
      escapeCsv(p.name),
      escapeCsv(p.category || 'Uncategorized'),
      escapeCsv(p.supplier || 'N/A'),
      Number(p.selling_price).toFixed(2),
      Number(p.cost_price).toFixed(2),
      p.quantity,
      p.reorder_level,
      escapeCsv(p.unit),
      escapeCsv(p.location),
      escapeCsv(p.status),
      Number(p.valuation).toFixed(2)
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');

    const timestamp = new Date().toISOString().split('T')[0];
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="stockwise_inventory_audit_${timestamp}.csv"`);
    res.status(200).send(csvContent);
  } catch (error) {
    next(error);
  }
}
