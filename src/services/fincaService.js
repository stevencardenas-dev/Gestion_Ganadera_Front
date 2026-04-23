import api from './api';

const fincaService = {
  // Get all fincas
  getAll: async () => {
    const response = await api.get('/api/fincas');
    return response.data;
  },

  // Get finca by ID
  getById: async (id) => {
    const response = await api.get(`/api/fincas/${id}`);
    return response.data;
  },

  // Create new finca
  create: async (fincaData) => {
    const response = await api.post('/api/fincas', fincaData);
    return response.data;
  },

  // Update finca
  update: async (id, fincaData) => {
    const response = await api.put(`/api/fincas/${id}`, fincaData);
    return response.data;
  },

  // Delete finca
  delete: async (id) => {
    const response = await api.delete(`/api/fincas/${id}`);
    return response.data;
  },

  // Get finca statistics
  getStats: async (id) => {
    const response = await api.get(`/api/fincas/${id}/stats`);
    return response.data;
  },
};

export default fincaService;
