import React, { useState } from 'react';
import { X, FileText, Check } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function CreatePOModal({ isOpen, onClose }) {
  const { suppliers, createPurchaseOrder } = useInventory();

  const [supplier, setSupplier] = useState(suppliers[0]?.name || '');
  const [itemsCount, setItemsCount] = useState('3');
  const [totalAmount, setTotalAmount] = useState('2450.00');
  const [expectedDelivery, setExpectedDelivery] = useState('2026-10-25');

  if (!isOpen) return null;

  const selectedSup = suppliers.find((s) => s.name === supplier) || suppliers[0];

  const handleSubmit = (e) => {
    e.preventDefault();
    createPurchaseOrder({
      supplier: selectedSup?.name || supplier,
      supplierId: selectedSup?.id,
      itemsCount: parseInt(itemsCount, 10) || 1,
      totalAmount: parseFloat(totalAmount) || 0,
      expectedDelivery
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--color-primary)" />
            <h2 className="modal-title">Create Purchase Order</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-form-group">
              <label className="modal-form-label">Select Vendor / Supplier *</label>
              <select
                className="modal-form-select"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
              >
                {suppliers.map((s) => (
                  <option key={s.id} value={s.name}>{s.name} ({s.category})</option>
                ))}
              </select>
            </div>

            <div className="modal-row-2">
              <div className="modal-form-group">
                <label className="modal-form-label">Total Line Items Count *</label>
                <input
                  type="number"
                  min="1"
                  className="modal-form-input"
                  value={itemsCount}
                  onChange={(e) => setItemsCount(e.target.value)}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Estimated PO Total ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="modal-form-input"
                  value={totalAmount}
                  onChange={(e) => setTotalAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Expected Delivery Date</label>
              <input
                type="date"
                className="modal-form-input"
                value={expectedDelivery}
                onChange={(e) => setExpectedDelivery(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit">
              <Check size={16} />
              <span>Issue Purchase Order</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
