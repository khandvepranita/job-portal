import api from './axios';

export const analyticsApi = {
  getAdminStats: async () => {
    const res = await api.get('/analytics/admin-stats');
    return res.data;
  }
};
