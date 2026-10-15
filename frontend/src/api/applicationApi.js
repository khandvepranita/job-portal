import api from './axios';

export const applicationApi = {
  apply: async (applicationData, resumeFile) => {
    if (resumeFile) {
      const formData = new FormData();
      formData.append('application', new Blob([JSON.stringify(applicationData)], { type: 'application/json' }));
      formData.append('resumeFile', resumeFile);
      const res = await api.post('/applications', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return res.data;
    } else {
      const res = await api.post('/applications/quick-apply', applicationData);
      return res.data;
    }
  },

  getMyApplications: async () => {
    const res = await api.get('/applications/my');
    return res.data;
  },

  getJobApplications: async (jobId) => {
    const res = await api.get(`/applications/job/${jobId}`);
    return res.data;
  },

  getApplicationById: async (id) => {
    const res = await api.get(`/applications/${id}`);
    return res.data;
  },

  updateStatus: async (id, status, recruiterNotes = '') => {
    const res = await api.patch(`/applications/${id}/status`, { status, recruiterNotes });
    return res.data;
  }
};
