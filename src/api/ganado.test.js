import { vi, describe, it, expect, beforeEach } from 'vitest';

// ── Mock api module using vi.hoisted (required so mocks exist before vi.mock is hoisted) ──
const { mockGet, mockPost, mockPut, mockDelete } = vi.hoisted(() => ({
  mockGet: vi.fn(),
  mockPost: vi.fn(),
  mockPut: vi.fn(),
  mockDelete: vi.fn(),
}));

vi.mock('../services/api', () => ({
  default: {
    get: mockGet,
    post: mockPost,
    put: mockPut,
    delete: mockDelete,
  },
}));

// Import AFTER mock so hoisting works
import {
  getRazas, createRaza,
  getCategorias, createCategoria,
  getLotes, createLote,
  getFincas, createFinca,
  apiAlimentacion, apiProduccion,
  getResumenProduccion,
  getMovimientosRecientes, getMovimientos, getMovimientoById,
  createMovimiento, updateMovimiento, deleteMovimiento,
  getEventosRecientes, getProximosPartos,
  getReproducciones, getReproduccionById,
  createReproduccion, updateReproduccion, deleteReproduccion,
  getPartos, getPartosByReproduccion,
  createParto, updateParto, deleteParto,
  getProducciones, updateProduccion,
  apiEventos, apiTratamientos, apiVacunaciones,
} from './ganado';

beforeEach(() => {
  vi.clearAllMocks();
});

// ── Helpers ──

function mockResolved(data) {
  return { data };
}

function expectGet(url) {
  expect(mockGet).toHaveBeenCalledWith(url);
}

function expectPost(url, body) {
  expect(mockPost).toHaveBeenCalledWith(url, body);
}

function expectPut(url, body) {
  expect(mockPut).toHaveBeenCalledWith(url, body);
}

function expectDelete(url) {
  expect(mockDelete).toHaveBeenCalledWith(url);
}

// ====================================================================
// Catálogos
// ====================================================================
describe('Catálogos', () => {
  describe('getRazas', () => {
    it('calls GET /api/razas and returns data', async () => {
      mockGet.mockResolvedValue(mockResolved(['raza1', 'raza2']));
      const result = await getRazas();
      expectGet('/api/razas');
      expect(result).toEqual(['raza1', 'raza2']);
    });
  });

  describe('createRaza', () => {
    it('calls POST /api/razas with data', async () => {
      const data = { nombre: 'Holstein' };
      mockPost.mockResolvedValue(mockResolved({ id: 1, ...data }));
      const result = await createRaza(data);
      expectPost('/api/razas', data);
      expect(result).toEqual({ id: 1, nombre: 'Holstein' });
    });
  });

  describe('getCategorias', () => {
    it('calls GET /api/categorias', async () => {
      mockGet.mockResolvedValue(mockResolved(['cat1']));
      await getCategorias();
      expectGet('/api/categorias');
    });
  });

  describe('createCategoria', () => {
    it('calls POST /api/categorias', async () => {
      mockPost.mockResolvedValue(mockResolved({ id: 1 }));
      await createCategoria({ nombre: 'Vaquillona' });
      expectPost('/api/categorias', { nombre: 'Vaquillona' });
    });
  });

  describe('getLotes', () => {
    it('calls GET /api/lotes', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getLotes();
      expectGet('/api/lotes');
    });
  });

  describe('createLote', () => {
    it('calls POST /api/lotes', async () => {
      mockPost.mockResolvedValue(mockResolved({ id: 1 }));
      await createLote({ nombre: 'Lote A' });
      expectPost('/api/lotes', { nombre: 'Lote A' });
    });
  });

  describe('getFincas', () => {
    it('calls GET /api/fincas', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getFincas();
      expectGet('/api/fincas');
    });
  });

  describe('createFinca', () => {
    it('calls POST /api/fincas', async () => {
      mockPost.mockResolvedValue(mockResolved({ id: 1 }));
      await createFinca({ nombre: 'Finca 1' });
      expectPost('/api/fincas', { nombre: 'Finca 1' });
    });
  });
});

// ====================================================================
// createHistorialApi factory
// ====================================================================
describe('createHistorialApi factory', () => {
  const factoryApis = [
    { name: 'apiAlimentacion',  endpoint: 'alimentaciones',  obj: apiAlimentacion },
    { name: 'apiProduccion',    endpoint: 'producciones',    obj: apiProduccion },
    { name: 'apiTratamientos',  endpoint: 'tratamientos',    obj: apiTratamientos },
    { name: 'apiVacunaciones',  endpoint: 'vacunaciones',    obj: apiVacunaciones },
    { name: 'apiEventos',       endpoint: 'eventos',         obj: apiEventos },
  ];

  factoryApis.forEach(({ name, endpoint, obj }) => {
    describe(name, () => {
      it('getByAnimal calls GET /api/' + endpoint + '/animal/{id}', async () => {
        mockGet.mockResolvedValue(mockResolved([{ id: 1 }]));
        const result = await obj.getByAnimal(5);
        expectGet(`/api/${endpoint}/animal/5`);
        expect(result).toEqual([{ id: 1 }]);
      });

      it('create calls POST /api/' + endpoint, async () => {
        const payload = { animalId: 5, cantidad: 10 };
        mockPost.mockResolvedValue(mockResolved({ id: 1 }));
        const result = await obj.create(payload);
        expectPost(`/api/${endpoint}`, payload);
        expect(result).toEqual({ id: 1 });
      });

      it('delete calls DELETE /api/' + endpoint + '/{id}', async () => {
        mockDelete.mockResolvedValue(mockResolved({}));
        await obj.delete(3);
        expectDelete(`/api/${endpoint}/3`);
      });
    });
  });
});

// ====================================================================
// Producción
// ====================================================================
describe('Producción', () => {
  describe('getResumenProduccion', () => {
    it('calls GET /api/producciones/resumen with year param', async () => {
      mockGet.mockResolvedValue(mockResolved([{ month: 1, totalLitros: 500 }]));
      const result = await getResumenProduccion(2026);
      expect(mockGet).toHaveBeenCalledWith('/api/producciones/resumen', { params: { year: 2026 } });
      expect(result).toEqual([{ month: 1, totalLitros: 500 }]);
    });
  });

  describe('getProducciones', () => {
    it('calls GET /api/producciones', async () => {
      mockGet.mockResolvedValue(mockResolved([{ id: 1 }]));
      const result = await getProducciones();
      expectGet('/api/producciones');
      expect(result).toEqual([{ id: 1 }]);
    });
  });

  describe('updateProduccion', () => {
    it('calls PUT /api/producciones/{id} with data', async () => {
      const payload = { litros: 200 };
      mockPut.mockResolvedValue(mockResolved({ id: 5, ...payload }));
      const result = await updateProduccion(5, payload);
      expectPut('/api/producciones/5', payload);
      expect(result).toEqual({ id: 5, litros: 200 });
    });
  });
});

// ====================================================================
// Movimientos
// ====================================================================
describe('Movimientos', () => {
  describe('getMovimientosRecientes', () => {
    it('calls GET /api/movimientos/recent', async () => {
      mockGet.mockResolvedValue(mockResolved([{ id: 1 }]));
      await getMovimientosRecientes();
      expectGet('/api/movimientos/recent');
    });
  });

  describe('getMovimientos', () => {
    it('calls GET /api/movimientos', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getMovimientos();
      expectGet('/api/movimientos');
    });
  });

  describe('getMovimientoById', () => {
    it('calls GET /api/movimientos/{id}', async () => {
      mockGet.mockResolvedValue(mockResolved({ id: 3 }));
      const result = await getMovimientoById(3);
      expectGet('/api/movimientos/3');
      expect(result).toEqual({ id: 3 });
    });
  });

  describe('createMovimiento', () => {
    it('calls POST /api/movimientos', async () => {
      const payload = { animalId: 1, tipo: 'ingreso' };
      mockPost.mockResolvedValue(mockResolved({ id: 1, ...payload }));
      const result = await createMovimiento(payload);
      expectPost('/api/movimientos', payload);
      expect(result).toEqual({ id: 1, animalId: 1, tipo: 'ingreso' });
    });
  });

  describe('updateMovimiento', () => {
    it('calls PUT /api/movimientos/{id}', async () => {
      const payload = { tipo: 'egreso' };
      mockPut.mockResolvedValue(mockResolved({ id: 2, ...payload }));
      const result = await updateMovimiento(2, payload);
      expectPut('/api/movimientos/2', payload);
      expect(result).toEqual({ id: 2, tipo: 'egreso' });
    });
  });

  describe('deleteMovimiento', () => {
    it('calls DELETE /api/movimientos/{id}', async () => {
      mockDelete.mockResolvedValue(mockResolved({}));
      await deleteMovimiento(4);
      expectDelete('/api/movimientos/4');
    });
  });
});

// ====================================================================
// Eventos / Partos próximos
// ====================================================================
describe('Eventos', () => {
  describe('getEventosRecientes', () => {
    it('calls GET /api/eventos/recent', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getEventosRecientes();
      expectGet('/api/eventos/recent');
    });
  });

  describe('getProximosPartos', () => {
    it('calls GET /api/reproducciones/proximos-partos', async () => {
      mockGet.mockResolvedValue(mockResolved([]));
      await getProximosPartos();
      expectGet('/api/reproducciones/proximos-partos');
    });
  });
});

// ====================================================================
// Reproducción CRUD
// ====================================================================
describe('Reproducción CRUD', () => {
  it('getReproducciones calls GET /api/reproducciones', async () => {
    mockGet.mockResolvedValue(mockResolved([{ id: 1 }]));
    const result = await getReproducciones();
    expectGet('/api/reproducciones');
    expect(result).toHaveLength(1);
  });

  it('getReproduccionById calls GET /api/reproducciones/{id}', async () => {
    mockGet.mockResolvedValue(mockResolved({ id: 3 }));
    const result = await getReproduccionById(3);
    expectGet('/api/reproducciones/3');
    expect(result.id).toBe(3);
  });

  it('createReproduccion calls POST /api/reproducciones', async () => {
    const payload = { vacaId: 1, toroId: 2 };
    mockPost.mockResolvedValue(mockResolved({ id: 1, ...payload }));
    const result = await createReproduccion(payload);
    expectPost('/api/reproducciones', payload);
    expect(result.id).toBe(1);
  });

  it('updateReproduccion calls PUT /api/reproducciones/{id}', async () => {
    const payload = { resultado: 'Exitoso' };
    mockPut.mockResolvedValue(mockResolved({ id: 5, ...payload }));
    const result = await updateReproduccion(5, payload);
    expectPut('/api/reproducciones/5', payload);
    expect(result.resultado).toBe('Exitoso');
  });

  it('deleteReproduccion calls DELETE /api/reproducciones/{id}', async () => {
    mockDelete.mockResolvedValue(mockResolved({}));
    await deleteReproduccion(7);
    expectDelete('/api/reproducciones/7');
  });
});

// ====================================================================
// Partos CRUD
// ====================================================================
describe('Partos CRUD', () => {
  it('getPartos calls GET /api/partos', async () => {
    mockGet.mockResolvedValue(mockResolved([]));
    await getPartos();
    expectGet('/api/partos');
  });

  it('getPartosByReproduccion calls GET /api/partos/por-reproduccion/{id}', async () => {
    mockGet.mockResolvedValue(mockResolved([]));
    await getPartosByReproduccion(3);
    expectGet('/api/partos/por-reproduccion/3');
  });

  it('createParto calls POST /api/partos', async () => {
    const payload = { reproduccionId: 1, cantidadCrias: 2 };
    mockPost.mockResolvedValue(mockResolved({ id: 1, ...payload }));
    const result = await createParto(payload);
    expectPost('/api/partos', payload);
    expect(result.cantidadCrias).toBe(2);
  });

  it('updateParto calls PUT /api/partos/{id}', async () => {
    const payload = { observaciones: 'Normal' };
    mockPut.mockResolvedValue(mockResolved({ id: 2, ...payload }));
    const result = await updateParto(2, payload);
    expectPut('/api/partos/2', payload);
    expect(result.observaciones).toBe('Normal');
  });

  it('deleteParto calls DELETE /api/partos/{id}', async () => {
    mockDelete.mockResolvedValue(mockResolved({}));
    await deleteParto(4);
    expectDelete('/api/partos/4');
  });
});

// ====================================================================
// Error handling — all functions reject when api call fails
// ====================================================================
describe('Error handling', () => {
  it('propagates API errors', async () => {
    const error = new Error('Network error');
    mockGet.mockRejectedValue(error);
    await expect(getMovimientos()).rejects.toThrow('Network error');
  });

  it('propagates errors from POST', async () => {
    const error = new Error('Bad request');
    mockPost.mockRejectedValue(error);
    await expect(createMovimiento({})).rejects.toThrow('Bad request');
  });

  it('propagates errors from PUT', async () => {
    const error = new Error('Forbidden');
    mockPut.mockRejectedValue(error);
    await expect(updateMovimiento(1, {})).rejects.toThrow('Forbidden');
  });

  it('propagates errors from DELETE', async () => {
    const error = new Error('Not found');
    mockDelete.mockRejectedValue(error);
    await expect(deleteMovimiento(99)).rejects.toThrow('Not found');
  });
});
