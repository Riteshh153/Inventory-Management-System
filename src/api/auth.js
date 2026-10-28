import apiClient from './client';

export const authApi = {
  login: async (credentials) => {
    return apiClient.post('/auth/login', credentials);
  },
  getMe: async () => {
    return apiClient.get('/auth/me');
  },
  register: async (userData) => {
    return apiClient.post('/auth/register', userData);
  }
};
