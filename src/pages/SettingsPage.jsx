import React, { useState } from 'react';
import { Save, Building, DollarSign, BellRing, ShieldCheck } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function SettingsPage() {
  const { settings, saveSettings, setSettings, showToast } = useInventory();

  const [formData, setFormData] = useState({ ...settings });

  const currencySymbols = {
    USD: '$',
    EUR: '€',
    INR: '₹',
    GBP: '£'
  };

  const handleCurrencyChange = (curr) => {
    setFormData({
      ...formData,
      currency: curr,
      currencySymbol: currencySymbols[curr] || '$'
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (saveSettings) {
      await saveSettings(formData);
    } else {
      setSettings(formData);
      showToast('System configuration & business preferences saved successfully.');
    }
  };

  return (
    <div style={{ maxWidth: '880px' }}>
      <form onSubmit={handleSave}>
        {/* Business Profile */}
        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Building size={20} color="var(--color-primary)" />
            <h2 className="card-heading">Organization & Facility Profile</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="modal-form-group">
              <label className="modal-form-label">Company / Legal Business Name</label>
              <input
                type="text"
                className="modal-form-input"
                value={formData.businessName}
                onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
              />
            </div>

            <div className="modal-row-2">
              <div className="modal-form-group">
                <label className="modal-form-label">Operations Contact Email</label>
                <input
                  type="email"
                  className="modal-form-input"
                  value={formData.companyEmail}
                  onChange={(e) => setFormData({ ...formData, companyEmail: e.target.value })}
                />
              </div>

              <div className="modal-form-group">
                <label className="modal-form-label">Primary Warehouse Facility</label>
                <input
                  type="text"
                  className="modal-form-input"
                  value={formData.warehouseLocation}
                  onChange={(e) => setFormData({ ...formData, warehouseLocation: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Currency & Financial Preferences */}
        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <DollarSign size={20} color="var(--color-primary)" />
            <h2 className="card-heading">Currency & Valuation Preferences</h2>
          </div>

          <div className="modal-row-2">
            <div className="modal-form-group">
              <label className="modal-form-label">Operating Currency</label>
              <select
                className="modal-form-select"
                value={formData.currency}
                onChange={(e) => handleCurrencyChange(e.target.value)}
              >
                <option value="USD">USD ($) — United States Dollar</option>
                <option value="EUR">EUR (€) — Euro</option>
                <option value="INR">INR (₹) — Indian Rupee</option>
                <option value="GBP">GBP (£) — British Pound</option>
              </select>
            </div>

            <div className="modal-form-group">
              <label className="modal-form-label">Fiscal Year Start Month</label>
              <select
                className="modal-form-select"
                value={formData.fiscalYearStart}
                onChange={(e) => setFormData({ ...formData, fiscalYearStart: e.target.value })}
              >
                <option value="January">January</option>
                <option value="April">April</option>
                <option value="July">July</option>
                <option value="October">October</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inventory Automation & Alerts */}
        <div className="dashboard-card" style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <BellRing size={20} color="var(--color-primary)" />
            <h2 className="card-heading">Inventory Thresholds & Automation</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div className="modal-form-group">
              <label className="modal-form-label">Default Global Low-Stock Threshold (Units)</label>
              <input
                type="number"
                min="1"
                className="modal-form-input"
                value={formData.lowStockThreshold}
                onChange={(e) => setFormData({ ...formData, lowStockThreshold: parseInt(e.target.value, 10) || 10 })}
              />
              <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                Products with available quantity at or below this value will trigger dashboard warnings.
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '6px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.enableEmailAlerts}
                  onChange={(e) => setFormData({ ...formData, enableEmailAlerts: e.target.checked })}
                />
                <span>Send automated email notifications when safety stock points are breached</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '13.5px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.autoReorderSuggestions}
                  onChange={(e) => setFormData({ ...formData, autoReorderSuggestions: e.target.checked })}
                />
                <span>Generate draft purchase order recommendations during low-stock events</span>
              </label>
            </div>
          </div>
        </div>

        {/* Backend Integration Info Banner */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '16px 20px',
            backgroundColor: '#EAF7EE',
            borderRadius: '8px',
            border: '1px solid #B8E4C7',
            marginBottom: '24px',
            fontSize: '13px',
            color: '#145A32'
          }}
        >
          <ShieldCheck size={22} style={{ flexShrink: 0 }} />
          <span>
            <strong>Architecture Readiness:</strong> Frontend data models and DTO structures are designed for seamless integration with a Java Spring Boot REST API and MySQL database.
          </span>
        </div>

        <button type="submit" className="topbar-primary-btn" style={{ height: '44px', padding: '0 24px', fontSize: '14px' }}>
          <Save size={16} />
          <span>Save System Preferences</span>
        </button>
      </form>
    </div>
  );
}
