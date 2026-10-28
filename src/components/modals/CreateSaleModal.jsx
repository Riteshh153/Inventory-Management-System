import React, { useState } from 'react';
import { X, ShoppingCart, Check } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function CreateSaleModal({ isOpen, onClose }) {
  const { customers, products, createSale } = useInventory();

  const [customer, setCustomer] = useState(customers[0]?.name || '');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState('1');
  const [paymentMethod, setPaymentMethod] = useState('Wire Transfer');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const unitPrice = currentProduct ? Number(currentProduct.price || 0) : 0;
  const numQty = parseInt(quantity, 10) || 0;
  const subtotal = unitPrice * numQty;
  const tax = subtotal * 0.08; // 8% sales tax
  const total = subtotal + tax;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!customer) {
      setError('Please select a customer.');
      return;
    }
    if (!currentProduct) {
      setError('Please select a valid product.');
      return;
    }
    if (numQty <= 0) {
      setError('Quantity must be at least 1.');
      return;
    }
    if (numQty > currentProduct.quantity) {
      setError(`Insufficient stock. Only ${currentProduct.quantity} units are available.`);
      return;
    }

    const selectedCust = customers.find((c) => c.name === customer) || customers[0];

    createSale({
      customer: selectedCust?.name || customer,
      customerId: selectedCust?.id,
      productId: currentProduct.id,
      product: currentProduct.name,
      quantity: numQty,
      totalAmount: total,
      paymentMethod
    });

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <ShoppingCart size={20} color="var(--color-primary)" />
            <h2 className="modal-title">Record New Sale Transaction</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-form-group">
              <label className="modal-form-label">Customer Account *</label>
              <select
                className="modal-form-select"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
              >
                {customers.map((c) => (
                  <option key={c.id} value={c.name}>{c.name} — ({c.contactPerson})</option>
                ))}
              </select>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Select Product to Sell *</label>
              <select
                className="modal-form-select"
                value={selectedProductId}
                onChange={(e) => { setSelectedProductId(e.target.value); setError(''); }}
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id} disabled={p.quantity <= 0}>
                    {p.name} — ${Number(p.price || 0).toFixed(2)} (Available: {p.quantity} units)
                  </option>
                ))}
              </select>
            </div>

            <div className="modal-row-2">
              <div className="modal-form-group">
                <label className="modal-form-label">Quantity *</label>
                <input
                  type="number"
                  min="1"
                  max={currentProduct?.quantity || 9999}
                  className="modal-form-input"
                  value={quantity}
                  onChange={(e) => { setQuantity(e.target.value); setError(''); }}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Payment Terms</label>
                <select
                  className="modal-form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                >
                  <option value="Wire Transfer">Wire Transfer</option>
                  <option value="Corporate Credit">Corporate Credit</option>
                  <option value="Net 30">Net 30 Terms</option>
                  <option value="Debit / ACH">Direct ACH</option>
                </select>
              </div>
            </div>

            {error && <span style={{ color: '#D32F2F', fontSize: '12.5px', fontWeight: 500 }}>{error}</span>}

            {/* Invoice Calculation Summary */}
            <div
              style={{
                backgroundColor: 'var(--color-bg)',
                borderRadius: '8px',
                padding: '14px 16px',
                border: '1px solid var(--color-border)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13.5px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Subtotal ({numQty} units @ ${unitPrice.toFixed(2)}):</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-text-muted)' }}>
                <span>Estimated Tax (8%):</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '16px', borderTop: '1px solid var(--color-border)', paddingTop: '6px' }}>
                <span>Total Amount:</span>
                <span style={{ color: 'var(--color-primary)' }}>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit">
              <Check size={16} />
              <span>Complete Sale & Deduct Stock</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
