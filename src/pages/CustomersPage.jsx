import React, { useState } from 'react';
import { Plus, Users, Mail, Phone, MapPin, X, Check } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function CustomersPage() {
  const { customers, addCustomer } = useInventory();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Customer name is required.');
      return;
    }
    if (!email.trim()) {
      setError('Email address is required.');
      return;
    }

    addCustomer({
      name,
      contactPerson,
      email,
      phone,
      address
    });
    setIsModalOpen(false);
  };

  return (
    <div>
      <div className="page-filter-bar">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Corporate & Wholesale Customers</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Client database, shipping destinations, and lifetime transaction value
          </p>
        </div>

        <button className="topbar-primary-btn" onClick={() => { setError(''); setIsModalOpen(true); }}>
          <Plus size={16} strokeWidth={2.5} />
          <span>Add Customer</span>
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
        {customers.map((cust) => (
          <div key={cust.id} className="dashboard-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div className="kpi-icon-wrap">
                  <Users size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>{cust.name}</h3>
                  <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>{cust.contactPerson}</span>
                </div>
              </div>
              <span className="status-badge active">{cust.status}</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '13px', color: 'var(--color-text-muted)', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Mail size={14} />
                <span>{cust.email}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Phone size={14} />
                <span>{cust.phone}</span>
              </div>
              {cust.address && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin size={14} />
                  <span>{cust.address}</span>
                </div>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
                padding: '12px',
                backgroundColor: 'var(--color-bg)',
                borderRadius: '8px',
                fontSize: '12.5px'
              }}
            >
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>ORDERS FULFILLED</div>
                <div style={{ fontWeight: 700, fontSize: '15px' }}>{cust.totalOrders} orders</div>
              </div>
              <div>
                <div style={{ color: 'var(--color-text-muted)', fontSize: '11px' }}>TOTAL SPENT</div>
                <div style={{ fontWeight: 700, fontSize: '15px', color: 'var(--color-primary)' }}>
                  ${(cust.totalSpent || 0).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Customer Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)} role="dialog" aria-modal="true">
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Register New Customer Account</h2>
              <button className="modal-close-btn" onClick={() => setIsModalOpen(false)}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="modal-form-group">
                  <label className="modal-form-label">Client Company Name *</label>
                  <input
                    type="text"
                    className="modal-form-input"
                    placeholder="e.g. OmniCorp Solutions"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                  {error && <span style={{ color: '#D32F2F', fontSize: '12px' }}>{error}</span>}
                </div>

                <div className="modal-row-2">
                  <div className="modal-form-group">
                    <label className="modal-form-label">Contact Person</label>
                    <input
                      type="text"
                      className="modal-form-input"
                      placeholder="e.g. Rachel Adams"
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                    />
                  </div>

                  <div className="modal-form-group">
                    <label className="modal-form-label">Email Address *</label>
                    <input
                      type="email"
                      className="modal-form-input"
                      placeholder="rachel@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="modal-row-2">
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

                  <div className="modal-form-group">
                    <label className="modal-form-label">Location / City</label>
                    <input
                      type="text"
                      className="modal-form-input"
                      placeholder="New York, NY"
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
                  <span>Register Customer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
