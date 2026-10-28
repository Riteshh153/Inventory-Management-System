import React, { useState } from 'react';
import { Plus, Calendar, Truck } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';
import StatusBadge from '../components/common/StatusBadge';
import CreatePOModal from '../components/modals/CreatePOModal';

export default function PurchaseOrdersPage() {
  const { purchaseOrders, receivePurchaseOrder } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="page-filter-bar">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Inbound Purchase Orders</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Track procurement cycles, expected dock deliveries, and supplier order fulfillment
          </p>
        </div>

        <button className="topbar-primary-btn" onClick={() => setIsModalOpen(true)}>
          <Plus size={16} strokeWidth={2.5} />
          <span>New Purchase Order</span>
        </button>
      </div>

      <div className="dashboard-card" style={{ padding: 0 }}>
        <div className="table-responsive-container">
          <table className="stockwise-table">
            <thead>
              <tr>
                <th>PO Number</th>
                <th>Supplier / Vendor</th>
                <th>Order Date</th>
                <th>Estimated Arrival</th>
                <th>Line Items</th>
                <th>Order Total</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {purchaseOrders.map((po) => (
                <tr key={po.id}>
                  <td style={{ fontFamily: 'monospace', fontWeight: 700, color: 'var(--color-primary-light)' }}>
                    {po.orderNumber || po.id}
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{po.supplier}</div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar size={13} />
                      <span>{po.orderDate}</span>
                    </div>
                  </td>
                  <td style={{ color: 'var(--color-text-muted)', fontSize: '13px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Truck size={13} />
                      <span>{po.expectedDelivery}</span>
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{po.itemsCount} items</td>
                  <td style={{ fontWeight: 700, color: 'var(--color-primary)' }}>
                    ${Number(po.totalAmount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </td>
                  <td>
                    <StatusBadge status={po.status} />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    {po.status !== 'Received' && po.status !== 'Cancelled' ? (
                      <button
                        className="table-action-btn"
                        onClick={() => receivePurchaseOrder(po.id)}
                        title="Receive and restock order"
                      >
                        <span>Receive Stock</span>
                      </button>
                    ) : (
                      <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>Completed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreatePOModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
}
