import React, { useEffect } from 'react';
import {
  LayoutDashboard,
  Package,
  Tags,
  Boxes,
  Truck,
  Users,
  FileText,
  TrendingUp,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  X
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function NavigationDrawer({
  isOpen,
  onClose,
  activePage,
  onNavigate,
  onLogout
}) {
  const { notifications } = useInventory();
  const unreadNotifsCount = notifications.filter((n) => !n.read).length;

  const currentUser = React.useMemo(() => {
    try {
      const saved = localStorage.getItem('stockwise_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { name: 'Arya Singh', email: 'arya.singh@stockwise.io', role: 'admin' };
  }, []);

  const initials = (currentUser?.name || 'AS')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const roleTitle = currentUser?.title || (
    currentUser?.role === 'admin'
      ? 'System Admin'
      : currentUser?.role === 'manager'
      ? 'Inventory Manager'
      : 'Warehouse Staff'
  );

  // 12 Navigation items requested by the user
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: Tags },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'suppliers', label: 'Suppliers', icon: Truck },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'purchase-orders', label: 'Purchase Orders', icon: FileText },
    { id: 'sales', label: 'Sales', icon: TrendingUp },
    { id: 'reports', label: 'Reports & Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'logout', label: 'Logout', icon: LogOut, isLogout: true }
  ];

  // Prevent background scrolling when the drawer is open
  useEffect(() => {
    if (isOpen) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isOpen]);

  // Close drawer on Escape key press
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  // Handle menu item click: AUTOMATICALLY CLOSE DRAWER IMMEDIATELY
  const handleItemClick = (item) => {
    // 1. Immediately close the drawer
    onClose();

    // 2. Perform navigation or logout
    if (item.isLogout) {
      if (onLogout) onLogout();
    } else {
      if (onNavigate) {
        onNavigate(item.id);
      }
    }
  };

  return (
    <>
      {/* Backdrop overlay behind the drawer with fade transition */}
      <div
        className={`drawer-backdrop ${isOpen ? 'open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-out Navigation Drawer */}
      <aside
        className={`navigation-drawer ${isOpen ? 'open' : ''}`}
        aria-label="Stockwise Navigation Drawer"
        aria-hidden={!isOpen}
      >
        {/* Drawer Header with Brand & Close Button */}
        <div className="drawer-header">
          <button
            className="drawer-brand"
            onClick={() => handleItemClick({ id: 'dashboard' })}
            aria-label="Go to Dashboard"
          >
            <div className="drawer-logo-badge">S</div>
            <div className="drawer-brand-text">
              <span className="drawer-brand-title">Stockwise</span>
              <span className="drawer-brand-sub">Inventory OS</span>
            </div>
          </button>

          <button
            className="drawer-close-btn"
            onClick={onClose}
            aria-label="Close navigation drawer"
            title="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation Menu Links (12 options) */}
        <nav className="drawer-nav" role="navigation">
          <div className="drawer-nav-section-title">Navigation Menu</div>
          <div className="drawer-nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activePage === item.id;
              const isLogoutItem = item.isLogout;

              return (
                <button
                  key={item.id}
                  className={`drawer-nav-item ${isActive ? 'active' : ''} ${isLogoutItem ? 'logout-item' : ''}`}
                  onClick={() => handleItemClick(item)}
                  role="menuitem"
                  aria-current={isActive ? 'page' : undefined}
                >
                  <Icon
                    size={18}
                    strokeWidth={isActive ? 2.4 : 2}
                    className="drawer-nav-icon"
                  />
                  <span className="drawer-nav-label">{item.label}</span>
                  {item.badge > 0 && (
                    <span className="drawer-nav-badge" aria-label={`${item.badge} unread notifications`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>

        {/* Drawer Footer with User Profile and direct Logout */}
        <div className="drawer-footer">
          <div className="drawer-user-card">
            <div className="drawer-avatar">{initials}</div>
            <div className="drawer-user-info">
              <div className="drawer-user-name">{currentUser.name}</div>
              <div className="drawer-user-role">{roleTitle}</div>
            </div>
          </div>

          <button
            className="drawer-footer-logout-btn"
            onClick={() => handleItemClick({ id: 'logout', isLogout: true })}
            aria-label="Sign out of Stockwise"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
