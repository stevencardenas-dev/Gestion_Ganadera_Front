import api from './api';

const animalService = {
  // Get all animales
  getAll: async () => {
    const response = await api.get('/api/animales');
    return response.data;
  },

  // Get animal by ID
  getById: async (id) => {
    const response = await api.get(`/api/animales/${id}`);
    return response.data;
  },

  // Create new animal
  create: async (animalData) => {
    const response = await api.post('/api/animales', animalData);
    return response.data;
  },

  // Update animal
  update: async (id, animalData) => {
    const response = await api.put(`/api/animales/${id}`, animalData);
    return response.data;
  },

  // Delete animal
  delete: async (id) => {
    const response = await api.delete(`/api/animales/${id}`);
    return response.data;
  },

  // Get animales by lote
  getByLote: async (loteId) => {
    const response = await api.get(`/api/animales/lote/${loteId}`);
    return response.data;
  },

  // Get animales by finca
  getByFinca: async (fincaId) => {
    const response = await api.get(`/api/animales/finca/${fincaId}`);
    return response.data;
  },
};

export default animalService;
