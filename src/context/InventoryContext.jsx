import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import {
  initialProducts,
  initialCategories,
  initialSuppliers,
  initialCustomers,
  initialPurchaseOrders,
  initialSales,
  initialNotifications,
  initialSettings
} from '../data/mockData';
import { productsApi } from '../api/products';
import { categoriesApi } from '../api/categories';
import { suppliersApi } from '../api/suppliers';
import { customersApi } from '../api/customers';
import { purchaseOrdersApi } from '../api/purchaseOrders';
import { salesApi } from '../api/sales';
import { notificationsApi } from '../api/notifications';
import { settingsApi } from '../api/settings';
import { dashboardApi } from '../api/dashboard';

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [products, setProducts] = useState(initialProducts);
  const [categories, setCategories] = useState(initialCategories);
  const [suppliers, setSuppliers] = useState(initialSuppliers);
  const [customers, setCustomers] = useState(initialCustomers);
  const [purchaseOrders, setPurchaseOrders] = useState(initialPurchaseOrders);
  const [sales, setSales] = useState(initialSales);
  const [notifications, setNotifications] = useState(initialNotifications);
  const [settings, setSettings] = useState(initialSettings);
  const [dashboardMetrics, setDashboardMetrics] = useState(null);

  const [toasts, setToasts] = useState([]);
  const [globalSearch, setGlobalSearch] = useState('');
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [backendConnected, setBackendConnected] = useState(false);

  // Helper for triggering toast messages
  const showToast = (message, type = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  const removeToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Fetch all live data from backend APIs
  const fetchAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [
        prodsRes,
        catsRes,
        supsRes,
        custsRes,
        posRes,
        salesRes,
        notifsRes,
        settingsRes,
        summaryRes
      ] = await Promise.allSettled([
        productsApi.getAll({ limit: 100 }),
        categoriesApi.getAll(),
        suppliersApi.getAll(),
        customersApi.getAll(),
        purchaseOrdersApi.getAll(),
        salesApi.getAll(),
        notificationsApi.getAll(),
        settingsApi.get(),
        dashboardApi.getSummary()
      ]);

      if (prodsRes.status === 'fulfilled' && prodsRes.value?.data?.items) {
        setProducts(prodsRes.value.data.items);
        setBackendConnected(true);
      }
      if (catsRes.status === 'fulfilled' && catsRes.value?.data?.items) {
        setCategories(catsRes.value.data.items);
      }
      if (supsRes.status === 'fulfilled' && supsRes.value?.data?.items) {
        setSuppliers(supsRes.value.data.items);
      }
      if (custsRes.status === 'fulfilled' && custsRes.value?.data?.items) {
        setCustomers(custsRes.value.data.items);
      }
      if (posRes.status === 'fulfilled' && posRes.value?.data?.items) {
        setPurchaseOrders(posRes.value.data.items);
      }
      if (salesRes.status === 'fulfilled' && salesRes.value?.data?.items) {
        setSales(salesRes.value.data.items);
      }
      if (notifsRes.status === 'fulfilled' && notifsRes.value?.data?.items) {
        setNotifications(notifsRes.value.data.items);
      }
      if (settingsRes.status === 'fulfilled' && settingsRes.value?.data?.settings) {
        setSettings((prev) => ({ ...prev, ...settingsRes.value.data.settings }));
      }
      if (summaryRes.status === 'fulfilled' && summaryRes.value?.data) {
        setDashboardMetrics(summaryRes.value.data);
      }
    } catch (err) {
      console.warn('Backend API connection note: using resilient local cache.', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAllData();
  }, [fetchAllData]);

  // Product CRUD
  const addProduct = async (newProduct) => {
    try {
      const res = await productsApi.create(newProduct);
      if (res.data?.product) {
        const item = res.data.product;
        setProducts((prev) => [item, ...prev]);
        showToast(`Product "${item.name}" added successfully.`);
        // Refresh categories to update counts
        categoriesApi.getAll().then((r) => r.data?.items && setCategories(r.data.items)).catch(() => {});
        return item;
      }
    } catch (err) {
      console.error('Failed to create product via API:', err);
      showToast(err.message || 'Failed to create product.', 'error');
      throw err;
    }
  };

  const updateProduct = async (updatedProduct) => {
    try {
      await productsApi.update(updatedProduct.id, updatedProduct);
      setProducts((prev) => prev.map((p) => (p.id === updatedProduct.id ? { ...p, ...updatedProduct } : p)));
      showToast(`Product "${updatedProduct.name}" updated successfully.`);
    } catch (err) {
      console.error('Failed to update product via API:', err);
      showToast(err.message || 'Failed to update product.', 'error');
      throw err;
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await productsApi.delete(id);
      if (res.data?.archived) {
        setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, status: 'Discontinued' } : p)));
        showToast(res.message || 'Product marked as discontinued.', 'info');
      } else {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        showToast('Product deleted successfully.', 'info');
      }
    } catch (err) {
      console.error('Failed to delete product via API:', err);
      showToast(err.message || 'Failed to delete product.', 'error');
    }
  };

  // Stock Adjustment (Stock-In or Stock-Out)
  const adjustStock = async (productId, adjustmentQty, type = 'in', note = '') => {
    try {
      const res = await productsApi.adjustStock(productId, {
        adjustmentQuantity: adjustmentQty,
        type,
        notes: note
      });

      if (res.data) {
        const { newQuantity, status } = res.data;
        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? { ...p, quantity: newQuantity, status } : p))
        );
        showToast(res.message || 'Stock adjusted successfully.');
      }
    } catch (err) {
      console.error('Failed to adjust stock via API:', err);
      showToast(err.message || 'Failed to adjust stock.', 'error');
      throw err;
    }
  };

  // Category Actions
  const addCategory = async (categoryData) => {
    try {
      const res = await categoriesApi.create(categoryData);
      if (res.data?.category) {
        setCategories((prev) => [...prev, res.data.category]);
        showToast(`Category "${categoryData.name}" created successfully.`);
      }
    } catch (err) {
      console.error('Failed to create category via API:', err);
      showToast(err.message || 'Failed to create category.', 'error');
      throw err;
    }
  };

  const updateCategory = async (updatedCat) => {
    try {
      await categoriesApi.update(updatedCat.id, updatedCat);
      setCategories((prev) => prev.map((c) => (c.id === updatedCat.id ? { ...c, ...updatedCat } : c)));
      showToast(`Category "${updatedCat.name}" updated.`);
    } catch (err) {
      console.error('Failed to update category via API:', err);
      showToast(err.message || 'Failed to update category.', 'error');
      throw err;
    }
  };

  const deleteCategory = async (id) => {
    try {
      const cat = categories.find((c) => c.id === id);
      await categoriesApi.delete(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
      showToast(`Category "${cat ? cat.name : id}" deleted.`, 'info');
    } catch (err) {
      console.error('Failed to delete category via API:', err);
      showToast(err.message || 'Failed to delete category.', 'error');
    }
  };

  // Supplier Actions
  const addSupplier = async (supplierData) => {
    try {
      const res = await suppliersApi.create(supplierData);
      if (res.data?.supplier) {
        setSuppliers((prev) => [...prev, res.data.supplier]);
        showToast(`Supplier "${supplierData.name}" added successfully.`);
      }
    } catch (err) {
      console.error('Failed to add supplier via API:', err);
      showToast(err.message || 'Failed to add supplier.', 'error');
      throw err;
    }
  };

  const updateSupplier = async (updatedSup) => {
    try {
      await suppliersApi.update(updatedSup.id, updatedSup);
      setSuppliers((prev) => prev.map((s) => (s.id === updatedSup.id ? updatedSup : s)));
      showToast(`Supplier "${updatedSup.name}" updated.`);
    } catch (err) {
      console.error('Failed to update supplier via API:', err);
      showToast(err.message || 'Failed to update supplier.', 'error');
      throw err;
    }
  };

  // Customer Actions
  const addCustomer = async (customerData) => {
    try {
      const res = await customersApi.create(customerData);
      if (res.data?.customer) {
        setCustomers((prev) => [...prev, res.data.customer]);
        showToast(`Customer "${customerData.name}" added.`);
      }
    } catch (err) {
      console.error('Failed to add customer via API:', err);
      showToast(err.message || 'Failed to add customer.', 'error');
      throw err;
    }
  };

  // Create Purchase Order
  const createPurchaseOrder = async (orderData) => {
    try {
      const res = await purchaseOrdersApi.create(orderData);
      if (res.data?.order) {
        setPurchaseOrders((prev) => [res.data.order, ...prev]);
        showToast(res.message || `Purchase order created.`);
      }
    } catch (err) {
      console.error('Failed to create purchase order via API:', err);
      showToast(err.message || 'Failed to create purchase order.', 'error');
      throw err;
    }
  };

  // Receive Purchase Order (Stocks restocked in real-time)
  const receivePurchaseOrder = async (poId) => {
    try {
      const res = await purchaseOrdersApi.receive(poId);
      showToast(res.message || 'Purchase order received and inventory updated.');
      fetchAllData();
    } catch (err) {
      console.error('Failed to receive purchase order via API:', err);
      showToast(err.message || 'Failed to receive purchase order.', 'error');
      throw err;
    }
  };

  // Create Sale Transaction (decrements stock in real-time!)
  const createSale = async (saleData) => {
    try {
      const res = await salesApi.create(saleData);
      if (res.data?.order) {
        const newOrder = res.data.order;
        setSales((prev) => [newOrder, ...prev]);
        showToast(res.message || `Sale recorded successfully.`);
        // Refresh products to get updated stock balance
        productsApi.getAll().then((r) => r.data?.items && setProducts(r.data.items)).catch(() => {});
      }
    } catch (err) {
      console.error('Failed to record sale via API:', err);
      showToast(err.message || 'Failed to record sale.', 'error');
      throw err;
    }
  };

  // Notifications
  const markNotificationAsRead = async (id) => {
    try {
      await notificationsApi.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    }
  };

  const markAllNotificationsAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      showToast('All notifications marked as read.');
    } catch (err) {
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    }
  };

  // Save Settings
  const saveSettings = async (newSettings) => {
    try {
      await settingsApi.update(newSettings);
      setSettings(newSettings);
      showToast('System configuration saved successfully.');
    } catch (err) {
      console.error('Failed to save settings via API:', err);
      showToast(err.message || 'Failed to save settings.', 'error');
      throw err;
    }
  };

  // Computed KPI Metrics (uses real backend SQL aggregations or computed fallback)
  const kpis = useMemo(() => {
    if (dashboardMetrics) {
      return {
        totalProducts: dashboardMetrics.totalProducts,
        totalUnits: dashboardMetrics.totalUnits,
        totalValue: dashboardMetrics.totalValue,
        lowStockCount: dashboardMetrics.lowStockCount,
        outOfStockCount: dashboardMetrics.outOfStockCount,
        todaySalesAmount: dashboardMetrics.todaySalesAmount || dashboardMetrics.totalSalesRevenue || 0
      };
    }

    const totalProducts = products.length;
    const totalUnits = products.reduce((acc, p) => acc + (Number(p.quantity) || 0), 0);
    const totalValue = products.reduce((acc, p) => acc + (Number(p.quantity) || 0) * (Number(p.price) || 0), 0);
    const lowStockCount = products.filter((p) => p.status === 'Low Stock').length;
    const outOfStockCount = products.filter((p) => p.status === 'Out of Stock').length;
    const todaySalesAmount = sales.reduce((acc, s) => acc + (Number(s.totalAmount) || 0), 0);

    return {
      totalProducts,
      totalUnits,
      totalValue,
      lowStockCount,
      outOfStockCount,
      todaySalesAmount
    };
  }, [products, sales, dashboardMetrics]);

  return (
    <InventoryContext.Provider
      value={{
        products,
        categories,
        suppliers,
        customers,
        purchaseOrders,
        sales,
        notifications,
        settings,
        setSettings,
        saveSettings,
        toasts,
        showToast,
        removeToast,
        globalSearch,
        setGlobalSearch,
        isQuickAddOpen,
        setIsQuickAddOpen,
        addProduct,
        updateProduct,
        deleteProduct,
        adjustStock,
        addCategory,
        updateCategory,
        deleteCategory,
        addSupplier,
        updateSupplier,
        addCustomer,
        createPurchaseOrder,
        receivePurchaseOrder,
        createSale,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        kpis,
        isLoading,
        backendConnected,
        refreshData: fetchAllData
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export function useInventory() {
  const context = useContext(InventoryContext);
  if (!context) {
    throw new Error('useInventory must be used within an InventoryProvider');
  }
  return context;
}
