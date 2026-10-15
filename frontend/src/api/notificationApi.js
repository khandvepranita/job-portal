import api from './axios';

export const notificationApi = {
  getNotifications: async () => {
    const res = await api.get('/notifications');
    return res.data;
  },

  getUnreadCount: async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      return res.data.unreadCount || 0;
    } catch {
      return 0;
    }
  },

  markAsRead: async (id) => {
    const res = await api.patch(`/notifications/${id}/read`);
    return res.data;
  },

  markAllAsRead: async () => {
    const res = await api.patch('/notifications/read-all');
    return res.data;
  }
};
