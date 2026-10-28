import apiClient from './client';

export const suppliersApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/suppliers', { params });
  },
  getById: async (id) => {
    return apiClient.get(`/suppliers/${id}`);
  },
  create: async (data) => {
    return apiClient.post('/suppliers', data);
  },
  update: async (id, data) => {
    return apiClient.put(`/suppliers/${id}`, data);
  },
  delete: async (id) => {
    return apiClient.delete(`/suppliers/${id}`);
  }
};
