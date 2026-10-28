import apiClient from './client';

export const reportsApi = {
  getInventoryReport: async () => {
    return apiClient.get('/reports/inventory');
  },
  getExportInventoryCSVUrl: () => {
    const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
    return `${baseURL}/reports/export/inventory-csv`;
  }
};
