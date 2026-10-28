import apiClient from './client';

export const categoriesApi = {
  getAll: async () => {
    return apiClient.get('/categories');
  },
  create: async (data) => {
    return apiClient.post('/categories', data);
  },
  update: async (id, data) => {
    return apiClient.put(`/categories/${id}`, data);
  },
  delete: async (id) => {
    return apiClient.delete(`/categories/${id}`);
  }
};
