import api from './axios';

export const profileApi = {
  getProfile: async () => {
    const res = await api.get('/profile/me');
    return res.data;
  },

  updateProfile: async (profileData) => {
    const res = await api.put('/profile/me', profileData);
    return res.data;
  },

  uploadResume: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post('/profile/resume', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return res.data;
  },

  getResumeDownloadUrl: (userId) => {
    return `/api/profile/resume/${userId}`;
  }
};
