import React, { useState } from 'react';
import Navbar from './Navbar';
import NavigationDrawer from './NavigationDrawer';
import Toast from '../common/Toast';
import ProductModal from '../modals/ProductModal';
import { useInventory } from '../../context/InventoryContext';

export default function Layout({ activePage, setActivePage, onLogout, children }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isQuickAddOpen, setIsQuickAddOpen } = useInventory();

  // Navigation handler that updates active page and immediately closes drawer
  const handleNavigation = (pageId) => {
    setActivePage(pageId);
    setIsMenuOpen(false);
  };

  return (
    <div className="dashboard-layout">
      {/* Slide-out Navigation Drawer with Backdrop */}
      <NavigationDrawer
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        activePage={activePage}
        onNavigate={handleNavigation}
        onLogout={onLogout}
      />

      {/* Full-Width Main Content Wrapper */}
      <div className="dashboard-main-content">
        <Navbar
          activePage={activePage}
          setActivePage={handleNavigation}
          isMenuOpen={isMenuOpen}
          setIsMenuOpen={setIsMenuOpen}
          onLogout={onLogout}
        />

        <main className="dashboard-page-body full-width">
          {children}
        </main>
      </div>

      {/* Global Toast Alerts */}
      <Toast />

      {/* Global Quick Add Product Modal */}
      <ProductModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
    </div>
  );
}
