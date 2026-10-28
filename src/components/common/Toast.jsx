import React from 'react';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function Toast() {
  const { toasts, removeToast } = useInventory();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <div key={toast.id} className={`toast-item ${toast.type}`}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {toast.type === 'success' && <CheckCircle2 size={18} color="#145A32" />}
            {toast.type === 'error' && <AlertTriangle size={18} color="#B71C1C" />}
            {toast.type === 'info' && <Info size={18} color="#1A5276" />}
            <span>{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7C857F', padding: '2px' }}
            aria-label="Close"
          >
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}
