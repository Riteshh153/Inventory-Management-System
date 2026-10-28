import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Search,
  Bell,
  Plus,
  ChevronDown,
  Settings,
  LogOut,
  Sliders
} from 'lucide-react';
import { useInventory } from '../../context/InventoryContext';

export default function Navbar({
  activePage,
  setActivePage,
  isMenuOpen,
  setIsMenuOpen,
  onLogout
}) {
  const { globalSearch, setGlobalSearch, setIsQuickAddOpen, notifications } = useInventory();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileDropdownRef = useRef(null);

  const unreadCount = notifications.filter((n) => !n.read).length;

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

  const pageTitles = {
    dashboard: 'Dashboard Overview',
    products: 'Product Catalog',
    categories: 'Product Categories',
    inventory: 'Stock & Inventory Levels',
    suppliers: 'Supplier Management',
    customers: 'Customer Directory',
    'purchase-orders': 'Purchase Orders',
    sales: 'Sales & Transactions',
    reports: 'Reports & Analytics',
    notifications: 'Alerts & Notifications',
    settings: 'System & Business Settings'
  };

  const currentTitle = pageTitles[activePage] || 'Dashboard Overview';

  // Close profile dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }
    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setIsProfileOpen(false);
      }
    }

    if (isProfileOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isProfileOpen]);

  const handleProfileNav = (pageId) => {
    setActivePage(pageId);
    setIsProfileOpen(false);
  };

  return (
    <header className="dashboard-topbar" role="banner">
      {/* Left Section: Hamburger + Brand + Page Title */}
      <div className="topbar-left">
        {/* Hamburger Menu Button */}
        <button
          className="navbar-hamburger-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          aria-expanded={isMenuOpen}
          title="Toggle Navigation Menu"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>

        {/* Stockwise Brand Logo */}
        <button
          className="navbar-brand-btn"
          onClick={() => setActivePage('dashboard')}
          aria-label="Go to Dashboard"
        >
          <div className="navbar-logo-badge">S</div>
          <div className="navbar-brand-text">
            <span className="navbar-brand-title">Stockwise</span>
            <span className="navbar-brand-sub">Inventory OS</span>
          </div>
        </button>

        {/* Divider */}
        <div className="navbar-brand-divider" aria-hidden="true" />

        {/* Breadcrumb & Page Heading */}
        <div className="topbar-breadcrumbs">
          <h1 className="topbar-page-title">{currentTitle}</h1>
          <div className="topbar-breadcrumb-trail">
            <span>Stockwise</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-current">{currentTitle}</span>
          </div>
        </div>
      </div>

      {/* Right Section: Global Search + Quick Add + Notifications + User Profile */}
      <div className="topbar-right">
        {/* Global Search Input */}
        <div className="topbar-search-wrapper" role="search">
          <Search className="topbar-search-icon" size={16} aria-hidden="true" />
          <input
            type="text"
            className="topbar-search-input"
            placeholder="Search products, SKUs, records..."
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            aria-label="Global search"
          />
        </div>

        {/* Quick Add Product Button */}
        <button
          className="topbar-primary-btn"
          onClick={() => setIsQuickAddOpen(true)}
          title="Quick Add Product"
        >
          <Plus size={16} strokeWidth={2.5} />
          <span className="topbar-btn-text">Add Product</span>
        </button>

        {/* Notification Bell */}
        <button
          className="topbar-notif-btn"
          onClick={() => setActivePage('notifications')}
          aria-label="View notifications"
          title={`${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}`}
        >
          <Bell size={18} />
          {unreadCount > 0 && <span className="topbar-notif-badge" aria-hidden="true"></span>}
        </button>

        {/* User Profile Avatar & Dropdown */}
        <div className="topbar-user-profile-container" ref={profileDropdownRef}>
          <button
            className={`topbar-user-profile-btn ${isProfileOpen ? 'active' : ''}`}
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            aria-haspopup="true"
            aria-expanded={isProfileOpen}
            aria-label={`User account menu for ${currentUser.name}`}
          >
            <div className="topbar-avatar" aria-hidden="true">{initials}</div>
            <div className="topbar-user-info">
              <span className="topbar-user-name">{currentUser.name}</span>
              <span className="topbar-user-role">{roleTitle}</span>
            </div>
            <ChevronDown
              size={14}
              className={`profile-chevron ${isProfileOpen ? 'rotate' : ''}`}
              aria-hidden="true"
            />
          </button>

          {/* Profile Dropdown Menu */}
          {isProfileOpen && (
            <div className="topbar-profile-dropdown" role="menu">
              <div className="profile-dropdown-header">
                <div className="profile-dropdown-avatar">{initials}</div>
                <div className="profile-dropdown-user-details">
                  <div className="profile-dropdown-name">{currentUser.name}</div>
                  <div className="profile-dropdown-email">{currentUser.email}</div>
                  <span className="profile-dropdown-badge">{roleTitle}</span>
                </div>
              </div>

              <div className="profile-dropdown-divider" />

              <div className="profile-dropdown-menu">
                <button
                  className="profile-dropdown-item"
                  role="menuitem"
                  onClick={() => handleProfileNav('settings')}
                >
                  <Settings size={15} />
                  <span>Business Settings</span>
                </button>

                <button
                  className="profile-dropdown-item"
                  role="menuitem"
                  onClick={() => handleProfileNav('notifications')}
                >
                  <Bell size={15} />
                  <span>Alerts & Notifications</span>
                  {unreadCount > 0 && (
                    <span className="profile-item-badge">{unreadCount}</span>
                  )}
                </button>

                <button
                  className="profile-dropdown-item"
                  role="menuitem"
                  onClick={() => handleProfileNav('inventory')}
                >
                  <Sliders size={15} />
                  <span>Quick Stock Adjustments</span>
                </button>
              </div>

              <div className="profile-dropdown-divider" />

              <div className="profile-dropdown-footer">
                <button
                  className="profile-dropdown-logout-btn"
                  role="menuitem"
                  onClick={() => {
                    setIsProfileOpen(false);
                    if (onLogout) onLogout();
                  }}
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
