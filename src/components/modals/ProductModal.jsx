import React, { useState, useEffect } from 'react';
import { X, PackagePlus, Check } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function ProductModal({ isOpen, onClose, productToEdit = null }) {
  const { categories, suppliers, addProduct, updateProduct } = useInventory();

  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    category: categories[0]?.name || '',
    price: '',
    cost: '',
    quantity: '',
    reorderLevel: '15',
    supplier: suppliers[0]?.name || '',
    location: 'Aisle 1, Rack A-01'
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (productToEdit) {
      setFormData({
        name: productToEdit.name || '',
        sku: productToEdit.sku || '',
        category: productToEdit.category || categories[0]?.name || '',
        price: productToEdit.price || '',
        cost: productToEdit.cost || '',
        quantity: productToEdit.quantity ?? '',
        reorderLevel: productToEdit.reorderLevel ?? '15',
        supplier: productToEdit.supplier || suppliers[0]?.name || '',
        location: productToEdit.location || ''
      });
    } else {
      setFormData({
        name: '',
        sku: `STK-${Math.floor(1000 + Math.random() * 9000)}`,
        category: categories[0]?.name || '',
        price: '',
        cost: '',
        quantity: '25',
        reorderLevel: '10',
        supplier: suppliers[0]?.name || '',
        location: 'Aisle 1, Rack A-01'
      });
    }
    setErrors({});
  }, [productToEdit, isOpen, categories, suppliers]);

  if (!isOpen) return null;

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.sku.trim()) newErrors.sku = 'SKU is required';
    if (!formData.price || parseFloat(formData.price) <= 0) newErrors.price = 'Valid selling price is required';
    if (!formData.cost || parseFloat(formData.cost) <= 0) newErrors.cost = 'Valid cost price is required';
    if (formData.quantity === '' || parseInt(formData.quantity, 10) < 0) newErrors.quantity = 'Quantity must be 0 or more';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    if (productToEdit) {
      updateProduct({ ...productToEdit, ...formData });
    } else {
      addProduct(formData);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <PackagePlus size={20} color="var(--color-primary)" />
            <h2 className="modal-title">{productToEdit ? 'Edit Product' : 'Add New Product'}</h2>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="modal-form-group">
              <label className="modal-form-label">Product Name *</label>
              <input
                type="text"
                className="modal-form-input"
                placeholder="e.g. Smart Environmental Sensor Node"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              {errors.name && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{errors.name}</span>}
            </div>

            <div className="modal-row-2">
              <div className="modal-form-group">
                <label className="modal-form-label">SKU Code *</label>
                <input
                  type="text"
                  className="modal-form-input"
                  placeholder="e.g. STK-ELEC-009"
                  value={formData.sku}
                  onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                />
                {errors.sku && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{errors.sku}</span>}
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Category</label>
                <select
                  className="modal-form-select"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="modal-row-2">
              <div className="modal-form-group">
                <label className="modal-form-label">Selling Price ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="modal-form-input"
                  placeholder="0.00"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
                {errors.price && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{errors.price}</span>}
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Unit Cost ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  className="modal-form-input"
                  placeholder="0.00"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                />
                {errors.cost && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{errors.cost}</span>}
              </div>
            </div>

            <div className="modal-row-2">
              <div className="modal-form-group">
                <label className="modal-form-label">Initial Stock Quantity *</label>
                <input
                  type="number"
                  className="modal-form-input"
                  placeholder="0"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                />
                {errors.quantity && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{errors.quantity}</span>}
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Reorder Level Alert Threshold</label>
                <input
                  type="number"
                  className="modal-form-input"
                  placeholder="10"
                  value={formData.reorderLevel}
                  onChange={(e) => setFormData({ ...formData, reorderLevel: e.target.value })}
                />
              </div>
            </div>

            <div className="modal-row-2">
              <div className="modal-form-group">
                <label className="modal-form-label">Primary Supplier</label>
                <select
                  className="modal-form-select"
                  value={formData.supplier}
                  onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Warehouse Bin / Location</label>
                <input
                  type="text"
                  className="modal-form-input"
                  placeholder="e.g. Aisle 3, Rack B-05"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="modal-btn-cancel" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="modal-btn-submit">
              <Check size={16} />
              <span>{productToEdit ? 'Save Changes' : 'Create Product'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
