import api from './axios';

export const jobApi = {
  getJobs: async (params = {}) => {
    const { page = 0, size = 6, search = '', sortBy = 'id', sortDir = 'desc' } = params;
    const response = await api.get('/jobs', {
      params: { page, size, search, sortBy, sortDir }
    });
    return response.data;
  },

  getJobById: async (id) => {
    const response = await api.get(`/jobs/${id}`);
    return response.data;
  },

  createJob: async (jobData) => {
    const response = await api.post('/jobs', jobData);
    return response.data;
  },

  updateJob: async (id, jobData) => {
    const response = await api.put(`/jobs/${id}`, jobData);
    return response.data;
  },

  deleteJob: async (id) => {
    const response = await api.delete(`/jobs/${id}`);
    return response.data;
  },
};
