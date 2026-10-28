import apiClient from './client';

export const purchaseOrdersApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/purchase-orders', { params });
  },
  getById: async (id) => {
    return apiClient.get(`/purchase-orders/${id}`);
  },
  create: async (data) => {
    return apiClient.post('/purchase-orders', data);
  },
  updateStatus: async (id, status) => {
    return apiClient.patch(`/purchase-orders/${id}/status`, { status });
  },
  receive: async (id) => {
    return apiClient.post(`/purchase-orders/${id}/receive`);
  }
};
