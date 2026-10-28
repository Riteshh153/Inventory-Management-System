import React, { useState } from 'react';
import { X, ArrowDownRight, ArrowUpRight, Check } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function StockAdjustModal({ isOpen, onClose, product = null }) {
  const { adjustStock } = useInventory();
  const [type, setType] = useState('in'); // 'in' or 'out'
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');

  if (!isOpen || !product) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const adjustment = parseInt(qty, 10);
    if (!adjustment || adjustment <= 0) {
      setError('Please enter a valid quantity greater than 0');
      return;
    }

    if (type === 'out' && adjustment > product.quantity) {
      setError(`Cannot remove ${adjustment} units. Current stock is only ${product.quantity}.`);
      return;
    }

    adjustStock(product.id, adjustment, type, note);
    onClose();
  };

  const resultingStock = type === 'in' 
    ? product.quantity + (parseInt(qty, 10) || 0)
    : Math.max(0, product.quantity - (parseInt(qty, 10) || 0));

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Adjust Inventory Stock</h2>
            <div style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
              {product.name} ({product.sku})
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            {/* Quick Stats Banner */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '12px 16px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '8px',
                border: '1px solid var(--color-border)'
              }}
            >
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>Current Stock</div>
                <div style={{ fontSize: '18px', fontWeight: 700 }}>{product.quantity} units</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--color-text-muted)', textTransform: 'uppercase' }}>New Projected Stock</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--color-primary)' }}>{resultingStock} units</div>
              </div>
            </div>

            {/* Adjustment Type Toggle */}
            <div className="modal-form-group">
              <label className="modal-form-label">Adjustment Type</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <button
                  type="button"
                  style={{
                    height: '42px',
                    borderRadius: '6px',
                    border: type === 'in' ? '2px solid var(--color-primary-light)' : '1px solid var(--color-border)',
                    backgroundColor: type === 'in' ? 'var(--color-badge-green-bg)' : '#FFFFFF',
                    color: type === 'in' ? 'var(--color-badge-green-text)' : 'var(--color-text-main)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  onClick={() => { setType('in'); setError(''); }}
                >
                  <ArrowDownRight size={18} />
                  <span>Stock In (Receive)</span>
                </button>

                <button
                  type="button"
                  style={{
                    height: '42px',
                    borderRadius: '6px',
                    border: type === 'out' ? '2px solid #D32F2F' : '1px solid var(--color-border)',
                    backgroundColor: type === 'out' ? 'var(--color-badge-red-bg)' : '#FFFFFF',
                    color: type === 'out' ? 'var(--color-badge-red-text)' : 'var(--color-text-main)',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    cursor: 'pointer'
                  }}
                  onClick={() => { setType('out'); setError(''); }}
                >
                  <ArrowUpRight size={18} />
                  <span>Stock Out (Deduct)</span>
                </button>
              </div>
            </div>

            {/* Quantity Input */}
            <div className="modal-form-group">
              <label className="modal-form-label">Units to {type === 'in' ? 'Add' : 'Deduct'} *</label>
              <input
                type="number"
                min="1"
                className="modal-form-input"
                placeholder="Enter unit quantity"
                value={qty}
                onChange={(e) => { setQty(e.target.value); setError(''); }}
                autoFocus
              />
              {error && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{error}</span>}
            </div>

            {/* Reason / Note */}
            <div className="modal-form-group">
              <label className="modal-form-label">Reason / Reference Note</label>
              <input
                type="text"
                className="modal-form-input"
                placeholder="e.g. Received from Supplier PO-091, Physical Audit, or Damaged"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit">
              <Check size={16} />
              <span>Confirm Stock Adjustment</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
