import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import ProductsPage from './pages/ProductsPage';
import CategoriesPage from './pages/CategoriesPage';
import InventoryPage from './pages/InventoryPage';
import SuppliersPage from './pages/SuppliersPage';
import CustomersPage from './pages/CustomersPage';
import PurchaseOrdersPage from './pages/PurchaseOrdersPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';
import NotificationsPage from './pages/NotificationsPage';
import SettingsPage from './pages/SettingsPage';
import './styles/dashboard.css';

export default function App() {
  // Session authentication state (restores from localStorage if token exists)
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('stockwise_token');
  });
  const [activePage, setActivePage] = useState('dashboard');

  const handleLogin = () => {
    setIsAuthenticated(true);
    setActivePage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('stockwise_token');
    localStorage.removeItem('stockwise_user');
    setIsAuthenticated(false);
  };

  // If not authenticated, show the Stockwise Login Page
  if (!isAuthenticated) {
    return <LoginPage onLoginSuccess={handleLogin} />;
  }

  // Active page component router
  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <DashboardOverview setActivePage={setActivePage} />;
      case 'products':
        return <ProductsPage />;
      case 'categories':
        return <CategoriesPage />;
      case 'inventory':
        return <InventoryPage />;
      case 'suppliers':
        return <SuppliersPage />;
      case 'customers':
        return <CustomersPage />;
      case 'purchase-orders':
        return <PurchaseOrdersPage />;
      case 'sales':
        return <SalesPage />;
      case 'reports':
        return <ReportsPage />;
      case 'notifications':
        return <NotificationsPage />;
      case 'settings':
        return <SettingsPage />;
      default:
        return <DashboardOverview setActivePage={setActivePage} />;
    }
  };

  return (
    <InventoryProvider>
      <Layout
        activePage={activePage}
        setActivePage={setActivePage}
        onLogout={handleLogout}
      >
        {renderActivePage()}
      </Layout>
    </InventoryProvider>
  );
}
