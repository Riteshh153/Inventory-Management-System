import React from 'react';
import { Bell, CheckCheck, AlertTriangle, AlertOctagon, Truck, ShoppingCart } from 'lucide-react';
import { useInventory } from '../context/InventoryContext';

export default function NotificationsPage() {
  const { notifications, markNotificationAsRead, markAllNotificationsAsRead } = useInventory();

  const getIcon = (type) => {
    switch (type) {
      case 'out_of_stock':
        return <AlertOctagon size={18} color="#B71C1C" />;
      case 'low_stock':
        return <AlertTriangle size={18} color="#9E6200" />;
      case 'po_update':
        return <Truck size={18} color="#1A5276" />;
      case 'sale':
        return <ShoppingCart size={18} color="#145A32" />;
      default:
        return <Bell size={18} color="var(--color-primary)" />;
    }
  };

  return (
    <div>
      <div className="page-filter-bar">
        <div>
          <h2 style={{ fontSize: '16px', fontWeight: 700 }}>System Alerts & Activity Feed</h2>
          <p style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            Real-time stock threshold warnings, procurement arrival logs, and transaction notices
          </p>
        </div>

        <button className="modal-btn-cancel" onClick={markAllNotificationsAsRead} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <CheckCheck size={16} />
          <span>Mark All as Read</span>
        </button>
      </div>

      <div className="dashboard-card" style={{ padding: 0 }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '18px 24px',
                borderBottom: '1px solid var(--color-border-subtle)',
                backgroundColor: n.read ? '#FFFFFF' : 'rgba(214, 232, 181, 0.08)',
                transition: 'background-color 0.15s ease'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '8px',
                    backgroundColor: n.urgent ? 'var(--color-badge-red-bg)' : 'var(--color-bg)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    marginTop: '2px'
                  }}
                >
                  {getIcon(n.type)}
                </div>

                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h4 style={{ fontSize: '14.5px', fontWeight: 600, color: 'var(--color-text-main)', margin: 0 }}>
                      {n.title}
                    </h4>
                    {!n.read && (
                      <span style={{ fontSize: '10.5px', fontWeight: 700, backgroundColor: 'var(--color-primary-light)', color: '#FFFFFF', padding: '1px 6px', borderRadius: '4px' }}>
                        NEW
                      </span>
                    )}
                    {n.urgent && (
                      <span style={{ fontSize: '10.5px', fontWeight: 700, backgroundColor: '#FEEEEE', color: '#B71C1C', padding: '1px 6px', borderRadius: '4px' }}>
                        URGENT
                      </span>
                    )}
                  </div>
                  <p style={{ fontSize: '13.5px', color: 'var(--color-text-muted)', margin: '0 0 6px' }}>
                    {n.message}
                  </p>
                  <span style={{ fontSize: '11.5px', color: 'var(--color-text-light)' }}>
                    {n.timestamp}
                  </span>
                </div>
              </div>

              {!n.read && (
                <button
                  className="table-action-btn"
                  onClick={() => markNotificationAsRead(n.id)}
                  style={{ marginLeft: '12px' }}
                >
                  Mark Read
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
