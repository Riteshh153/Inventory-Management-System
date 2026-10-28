import apiClient from './client';

export const notificationsApi = {
  getAll: async () => {
    return apiClient.get('/notifications');
  },
  markAsRead: async (id) => {
    return apiClient.patch(`/notifications/${id}/read`);
  },
  markAllAsRead: async () => {
    return apiClient.patch('/notifications/read-all');
  }
};
