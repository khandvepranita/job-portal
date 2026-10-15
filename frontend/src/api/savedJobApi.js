import api from './axios';

export const savedJobApi = {
  getSavedJobs: async () => {
    const res = await api.get('/saved-jobs');
    return res.data;
  },

  saveJob: async (jobId) => {
    const res = await api.post(`/saved-jobs/${jobId}`);
    return res.data;
  },

  unsaveJob: async (jobId) => {
    const res = await api.delete(`/saved-jobs/${jobId}`);
    return res.data;
  },

  checkIsSaved: async (jobId) => {
    try {
      const res = await api.get(`/saved-jobs/check/${jobId}`);
      return res.data.isSaved;
    } catch {
      return false;
    }
  }
};
