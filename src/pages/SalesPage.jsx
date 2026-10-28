import React, { useState } from 'react';
import { Plus, Calendar, CreditCard } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import StatusBadge from '../components/common/StatusBadge';
import CreateSaleModal from '../components/modals/CreateSaleModal';

export default function SalesPage() {
  const { sales, settings } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const totalSalesRevenue = sales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);

  return (
    <div>
      <div className="page-filter-bar">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Sales Orders & Customer Invoices</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Real-time sales tracking with automated inventory unit decrementing
          </p>
        </div>

        <button className="topbar-primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} strokeWidth={2.5} />
          <span>Record New Sale</span>
        </button>
      </div>

      {/* Summary strip */}
      <div className="sales-kpi-grid">
        <div className="dashboard-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>TOTAL ORDERS PROCESSED</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>{sales.length} invoices</div>
        </div>

        <div className="dashboard-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>TOTAL REVENUE</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px', color: 'var(--color-primary)' }}>
            {settings.currencySymbol}{totalSalesRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="dashboard-card" style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>AVG ORDER VALUE</div>
          <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>
            {settings.currencySymbol}{(sales.length > 0 ? totalSalesRevenue / sales.length : 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>
      </div>

      <div className="dashboard-card" style={{ padding: 0 }}>
        <div className="table-responsive-container">
          <table className="stockwise-table">
            <thead>
              <tr>
                <th>Invoice / Order ID</th>
                <th>Client Customer</th>
                <th>Product Purchased</th>
                <th>Units</th>
                <th>Transaction Date</th>
                <th>Payment Method</th>
                <th>Total Paid</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((sale) => (
                <tr key={sale.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                    {sale.orderNumber || sale.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{sale.customer}</div>
                  </td>
                  <td>{sale.product}</td>
                  <td style={{ fontWeight: 600 }}>{sale.quantity} units</td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>{sale.date}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: '12.5px', color: 'var(--color-text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <CreditCard size={13} />
                      <span>{sale.paymentMethod || 'Wire Transfer'}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    {settings.currencySymbol}{Number(sale.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <StatusBadge status={sale.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateSaleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
