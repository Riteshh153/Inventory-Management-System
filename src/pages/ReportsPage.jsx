import React, { useState } from 'react';
import { Download, FileSpreadsheet } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { useInventory } from '../context/InventoryContext';
import { chartDataRanges, categoryBreakdownData } from '../data/mockData';

export default function ReportsPage() {
  const { products, sales, kpis, showToast } = useInventory();
  const [range, setRange] = useState('year');

  const chartData = chartDataRanges[range] || chartDataRanges['year'];

  // Export Inventory CSV
  const handleExportInventoryCSV = () => {
    const headers = ['ID', 'Product Name', 'SKU', 'Category', 'Selling Price', 'Unit Cost', 'Stock Units', 'Reorder Level', 'Status', 'Location'];
    const rows = products.map((p) => [
      p.id,
      `"${p.name.replace(/"/g, '""')}"`,
      p.sku,
      `"${p.category}"`,
      p.price,
      p.cost,
      p.quantity,
      p.reorderLevel,
      p.status,
      `"${p.location || ''}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stockwise_inventory_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Inventory CSV Report downloaded successfully.');
  };

  // Export Sales CSV
  const handleExportSalesCSV = () => {
    const headers = ['Invoice ID', 'Customer', 'Product', 'Units Sold', 'Date', 'Amount', 'Payment Method', 'Status'];
    const rows = sales.map((s) => [
      s.id,
      `"${s.customer.replace(/"/g, '""')}"`,
      `"${s.product.replace(/"/g, '""')}"`,
      s.quantity,
      s.date,
      s.totalAmount,
      `"${s.paymentMethod || 'Wire'}"`,
      s.status
    ]);

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `stockwise_sales_report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Sales Report CSV downloaded successfully.');
  };

  return (
    <div>
      <div className="page-filter-bar">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Executive Reports & Inventory Audits</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Export compliance records, category valuations, and sales turnover summaries
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button className="modal-btn-cancel" onClick={handleExportSalesCSV} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FileSpreadsheet size={15} />
            <span>Export Sales CSV</span>
          </button>
          <button className="topbar-primary-btn" onClick={handleExportInventoryCSV}>
            <Download size={15} />
            <span>Export Inventory CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Audit Summary Cards */}
      <div className="reports-kpi-grid">
        <div className="dashboard-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Total Catalog Valuation</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
            ${kpis.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Across {kpis.totalProducts} active SKUs</div>
        </div>

        <div className="dashboard-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Gross Units In Stock</div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '4px' }}>
            {kpis.totalUnits.toLocaleString()} units
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>Stored in Main Warehouse</div>
        </div>

        <div className="dashboard-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Stock Depletion Risk</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: kpis.lowStockCount > 0 ? '#9E6200' : '#145A32', marginTop: '4px' }}>
            {kpis.lowStockCount + kpis.outOfStockCount} items
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>At or below threshold</div>
        </div>

        <div className="dashboard-card" style={{ padding: '18px' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Sample Sales Volume</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-primary)', marginTop: '4px' }}>
            {sales.length} processed
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', marginTop: '4px' }}>100% fulfillment rate</div>
        </div>
      </div>

      {/* Comparison Chart */}
      <div className="dashboard-card" style={{ marginBottom: '24px' }}>
        <div className="card-header-row">
          <div>
            <h3 className="card-heading">Revenue vs. Cost Turnover Analysis</h3>
            <p className="card-subheading">Financial reconciliation breakdown</p>
          </div>

          <div className="date-range-pills">
            <button className={`date-pill-btn ${range === '7days' ? 'active' : ''}`} onClick={() => setRange('7days')}>7 Days</button>
            <button className={`date-pill-btn ${range === '30days' ? 'active' : ''}`} onClick={() => setRange('30days')}>30 Days</button>
            <button className={`date-pill-btn ${range === 'year' ? 'active' : ''}`} onClick={() => setRange('year')}>This Year</button>
          </div>
        </div>

        <div style={{ width: '100%', height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E8EFEA" />
              <XAxis dataKey="name" stroke="#8CAFA0" fontSize={12} tickLine={false} />
              <YAxis stroke="#8CAFA0" fontSize={12} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '8px',
                  border: '1px solid #E2E8E2'
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '8px' }} />
              <Bar dataKey="revenue" fill="#173D32" radius={[4, 4, 0, 0]} name="Gross Revenue ($)" />
              <Bar dataKey="sales" fill="#5B8C70" radius={[4, 4, 0, 0]} name="Cost of Goods ($)" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Breakdown Table */}
      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ padding: '20px 24px 14px' }}>
          <h3 className="card-heading">Department Inventory Distribution</h3>
          <p className="card-subheading">Stock valuation by product category</p>
        </div>

        <div className="table-responsive-container">
          <table className="stockwise-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Total Value</th>
                <th>Share %</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {categoryBreakdownData.map((cat, idx) => (
                <tr key={idx}>
                  <td style={{ fontWeight: 600 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: cat.color }}></span>
                      <span>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700 }}>${cat.value.toLocaleString()}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ height: '6px', width: '80px', backgroundColor: '#E2E8E2', borderRadius: '3px' }}>
                        <div style={{ height: '100%', width: `${(cat.value / 113300) * 100}%`, backgroundColor: cat.color, borderRadius: '3px' }}></div>
                      </div>
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                        {((cat.value / 113300) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active">Audited</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
