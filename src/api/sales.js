import apiClient from './client';

export const salesApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/sales-orders', { params });
  },
  getById: async (id) => {
    return apiClient.get(`/sales-orders/${id}`);
  },
  create: async (data) => {
    return apiClient.post('/sales-orders', data);
  },
  cancel: async (id) => {
    return apiClient.post(`/sales-orders/${id}/cancel`);
  }
};
