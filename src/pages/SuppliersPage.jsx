import React, { useState } from 'react';
import { Plus, Truck, Mail, Phone, MapPin, Clock, Edit2, X, Check } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function SuppliersPage() {
  const { suppliers, categories, addSupplier, updateSupplier } = useInventory();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState(categories[0]?.name || 'General');
  const [leadTimeDays, setLeadTimeDays] = useState('5');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const openAddModal = () => {
    setEditingSupplier(null);
    setName('');
    setContactPerson('');
    setEmail('');
    setPhone('');
    setCategory(categories[0]?.name || 'General');
    setLeadTimeDays('5');
    setAddress('');
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sup) => {
    setEditingSupplier(sup);
    setName(sup.name);
    setContactPerson(sup.contactPerson);
    setEmail(sup.email);
    setPhone(sup.phone);
    setCategory(sup.category);
    setLeadTimeDays(String(sup.leadTimeDays || '5'));
    setAddress(sup.address || '');
    setError('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Supplier name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Contact email is required.');
      return;
    }

    const payload = {
      name,
      contactPerson,
      email,
      phone,
      category,
      leadTimeDays: parseInt(leadTimeDays, 10) || 5,
      address
    };

    if (editingSupplier) {
      updateSupplier({ ...editingSupplier, ...payload });
    } else {
      addSupplier(payload);
    }
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-filter-bar">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Vendors & Approved Suppliers</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Manage commercial partnerships, lead times, and fulfillment contacts
          </p>
        </div>

        <button className="topbar-primary-btn" onClick={openAddModal}>
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Supplier</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {suppliers.map((sup) => (
          <div key={sup.id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div className="kpi-icon-wrap">
                    <Truck size={18} />
                  </div>
                  <div>
                    <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{sup.name}</h3>
                    <span style={{ fontSize: '11.5px', color: 'var(--color-text-muted)' }}>{sup.category}</span>
                  </div>
                </div>
                <span className="status-badge active">{sup.status || 'Active'}</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-main)', margin: '14px 0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: 'var(--color-text-muted)' }}>Contact:</span>
                  <span style={{ fontWeight: 600 }}>{sup.contactPerson}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                  <Mail size={14} />
                  <span>{sup.email}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                  <Phone size={14} />
                  <span>{sup.phone}</span>
                </div>
                {sup.address && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-text-muted)' }}>
                    <MapPin size={14} />
                    <span>{sup.address}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--color-primary-light)', fontWeight: 500, marginTop: '4px' }}>
                  <Clock size={14} />
                  <span>Avg Lead Time: {sup.leadTimeDays} business days</span>
                </div>
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--color-border-subtle)', paddingTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button className="table-action-btn" onClick={() => openEditModal(sup)}>
                <Edit2 size={13} />
                <span>Edit Supplier</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add / Edit Supplier Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingSupplier ? 'Edit Supplier' : 'Add New Supplier'}</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label className="modal-form-label">Company / Supplier Name *</label>
                  <input
                    type="text"
                    className="modal-form-input"
                    placeholder="e.g. Apex Micro Technologies"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {error && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{error}</span>}
                </div>

                <div className="modal-row-2">
                  <div className="modal-form-group">
                    <label className="modal-form-label">Contact Person Name</label>
                    <input
                      type="text"
                      className="modal-form-input"
                      placeholder="e.g. David Chen"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Primary Department</label>
                    <select
                      className="modal-form-select"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      {categories.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="modal-row-2">
                  <div className="modal-form-group">
                    <label className="modal-form-label">Email Address *</label>
                    <input
                      type="email"
                      className="modal-form-input"
                      placeholder="d.chen@supplier.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Phone Number</label>
                    <input
                      type="text"
                      className="modal-form-input"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-row-2">
                  <div className="modal-form-group">
                    <label className="modal-form-label">Lead Time (Days)</label>
                    <input
                      type="number"
                      className="modal-form-input"
                      placeholder="5"
                      value={leadTimeDays}
                      onChange={(e) => setLeadTimeDays(e.target.value)}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Location / City</label>
                    <input
                      type="text"
                      className="modal-form-input"
                      placeholder="San Jose, CA"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button type="button" className="modal-btn-cancel" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="modal-btn-submit">
                  <Check size={16} />
                  <span>{editingSupplier ? 'Save Supplier' : 'Register Supplier'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
