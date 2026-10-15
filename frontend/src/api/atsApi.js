import api from './axios';

export const atsApi = {
  analyzeMatch: async (atsCheckData) => {
    const res = await api.post('/ats/analyze', atsCheckData);
    return res.data;
  }
};
