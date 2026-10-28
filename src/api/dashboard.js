import apiClient from './client';

export const dashboardApi = {
  getSummary: async () => {
    return apiClient.get('/dashboard/summary');
  },
  getSalesTrend: async (range = '7days') => {
    return apiClient.get('/dashboard/sales-trend', { params: { range } });
  },
  getCategoriesBreakdown: async () => {
    return apiClient.get('/dashboard/categories-breakdown');
  },
  getStockAlerts: async () => {
    return apiClient.get('/dashboard/stock-alerts');
  },
  getRecentOrders: async () => {
    return apiClient.get('/dashboard/recent-orders');
  }
};
