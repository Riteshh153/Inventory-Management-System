import apiClient from './client';

export const productsApi = {
  getAll: async (params = {}) => {
    return apiClient.get('/products', { params });
  },
  getById: async (id) => {
    return apiClient.get(`/products/${id}`);
  },
  create: async (productData) => {
    return apiClient.post('/products', productData);
  },
  update: async (id, productData) => {
    return apiClient.put(`/products/${id}`, productData);
  },
  delete: async (id) => {
    return apiClient.delete(`/products/${id}`);
  },
  adjustStock: async (id, adjustmentData) => {
    return apiClient.post(`/products/${id}/adjust-stock`, adjustmentData);
  },
  getLowStock: async () => {
    return apiClient.get('/products/low-stock');
  },
  getOutOfStock: async () => {
    return apiClient.get('/products/out-of-stock');
  },
  getMovements: async (id) => {
    return apiClient.get(`/products/${id}/movements`);
  }
};
