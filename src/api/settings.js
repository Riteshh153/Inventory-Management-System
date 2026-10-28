import apiClient from './client';

export const settingsApi = {
  get: async () => {
    return apiClient.get('/settings');
  },
  update: async (settingsData) => {
    return apiClient.put('/settings', settingsData);
  }
};
