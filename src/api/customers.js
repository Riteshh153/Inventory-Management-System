import apiClient from './client';

export const customersApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/customers', { params });
  },
  getById: async (id) => {
    return apiClient.get(`/customers/${id}`);
  },
  create: async (data) => {
    return apiClient.post('/customers', data);
  },
  update: async (id, data) => {
    return apiClient.put(`/customers/${id}`, data);
  },
  delete: async (id) => {
    return apiClient.delete(`/customers/${id}`);
  }
};
