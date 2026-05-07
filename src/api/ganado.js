import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  return {
    headers: { Authorization: `Bearer ${token}` }
  };
};

// --- Animales ---
export const getAnimales = async () => {
  const res = await axios.get(`${API_URL}/animales`, getHeaders());
  return res.data;
};

export const getAnimalById = async (id) => {
  const res = await axios.get(`${API_URL}/animales/${id}`, getHeaders());
  return res.data;
};

export const createAnimal = async (animal) => {
  const res = await axios.post(`${API_URL}/animales`, animal, getHeaders());
  return res.data;
};

export const updateAnimal = async (id, animal) => {
  const res = await axios.put(`${API_URL}/animales/${id}`, animal, getHeaders());
  return res.data;
};

export const deleteAnimal = async (id) => {
  const res = await axios.delete(`${API_URL}/animales/${id}`, getHeaders());
  return res.data;
};

// --- Catálogos ---
export const getRazas = async () => {
  const res = await axios.get(`${API_URL}/razas`, getHeaders());
  return res.data;
};

export const createRaza = async (data) => {
  const res = await axios.post(`${API_URL}/razas`, data, getHeaders());
  return res.data;
};

export const getCategorias = async () => {
  const res = await axios.get(`${API_URL}/categorias`, getHeaders());
  return res.data;
};

export const createCategoria = async (data) => {
  const res = await axios.post(`${API_URL}/categorias`, data, getHeaders());
  return res.data;
};

export const getLotes = async () => {
  const res = await axios.get(`${API_URL}/lotes`, getHeaders());
  return res.data;
};

export const createLote = async (data) => {
  const res = await axios.post(`${API_URL}/lotes`, data, getHeaders());
  return res.data;
};

export const getFincas = async () => {
  const res = await axios.get(`${API_URL}/fincas`, getHeaders());
  return res.data;
};

export const createFinca = async (data) => {
  const res = await axios.post(`${API_URL}/fincas`, data, getHeaders());
  return res.data;
};

// --- Historial ---
const createHistorialApi = (endpoint) => ({
  getByAnimal: async (animalId) => {
    const res = await axios.get(`${API_URL}/${endpoint}/animal/${animalId}`, getHeaders());
    return res.data;
  },
  create: async (data) => {
    const res = await axios.post(`${API_URL}/${endpoint}`, data, getHeaders());
    return res.data;
  },
  delete: async (id) => {
    const res = await axios.delete(`${API_URL}/${endpoint}/${id}`, getHeaders());
    return res.data;
  }
});

export const apiAlimentacion = createHistorialApi('alimentaciones');
export const apiProduccion = createHistorialApi('producciones');
export const apiEventos = createHistorialApi('eventos');
export const apiTratamientos = createHistorialApi('tratamientos');
export const apiVacunaciones = createHistorialApi('vacunaciones');
