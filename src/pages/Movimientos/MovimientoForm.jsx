import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAnimales, getLotes, createMovimiento } from '../../api/ganado';

const MovimientoForm = () => {
  const navigate = useNavigate();

  const [animales, setAnimales] = useState([]);
  const [lotes, setLotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    animalId: '',
    loteOrigenId: '',
    loteDestinoId: '',
    fecha: new Date().toISOString().split('T')[0],
    tipoMovimiento: 'Traslado',
    motivo: '',
  });

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [aniRes, lotRes] = await Promise.all([
          getAnimales().catch(() => []),
          getLotes().catch(() => []),
        ]);
        setAnimales(aniRes);
        setLotes(lotRes);
      } catch (error) {
        console.error('Error cargando datos', error);
      } finally {
        setLoading(false);
      }
    };
    loadCatalogs();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Auto-fill loteOrigenId when selecting an animal
    if (name === 'animalId' && value) {
      const animal = animales.find(a => a.id === parseInt(value));
      if (animal?.loteId) {
        setFormData(prev => ({ ...prev, loteOrigenId: animal.loteId.toString() }));
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animalId || !formData.loteDestinoId || !formData.fecha) {
      alert('Por favor complete los campos obligatorios: Animal, Lote Destino y Fecha');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        animalId: parseInt(formData.animalId),
        loteOrigenId: formData.loteOrigenId ? parseInt(formData.loteOrigenId) : null,
        loteDestinoId: parseInt(formData.loteDestinoId),
        fecha: formData.fecha,
        tipoMovimiento: formData.tipoMovimiento,
        motivo: formData.motivo || null,
      };
      await createMovimiento(payload);
      navigate('/dashboard/movimientos');
    } catch (error) {
      console.error('Error guardando movimiento', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error desconocido';
      alert('Error al guardar: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAnimal = animales.find(a => a.id === parseInt(formData.animalId));

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">Registrar Movimiento</h1>
          <p className="text-gray-400 text-sm mt-1">
            Traslado o transferencia de un animal entre lotes
          </p>
        </div>
        <button onClick={() => navigate('/dashboard/movimientos')} className="text-gray-400 hover:text-gray-100">
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2">
          Datos del Movimiento
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Animal */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Animal <span className="text-red-400">*</span>
            </label>
            <select
              name="animalId"
              value={formData.animalId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Seleccione un animal...</option>
              {animales.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
            {selectedAnimal && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedAnimal.sexo === 'Hembra' ? '🐮 Hembra' : '🐮 Macho'} —
                {selectedAnimal.loteNombre ? ` Lote: ${selectedAnimal.loteNombre}` : ' Sin lote'}
              </p>
            )}
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo de Movimiento</label>
            <select
              name="tipoMovimiento"
              value={formData.tipoMovimiento}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Traslado">Traslado</option>
              <option value="Ingreso">Ingreso</option>
              <option value="Egreso">Egreso</option>
            </select>
          </div>

          {/* Lote Origen */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Lote de Origen</label>
            <select
              name="loteOrigenId"
              value={formData.loteOrigenId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">No especificado</option>
              {lotes.map(l => (
                <option key={l.id} value={l.id}>{l.nombre || `Lote #${l.id}`}</option>
              ))}
            </select>
          </div>

          {/* Lote Destino */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Lote de Destino <span className="text-red-400">*</span>
            </label>
            <select
              name="loteDestinoId"
              value={formData.loteDestinoId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Seleccione un lote...</option>
              {lotes.map(l => (
                <option key={l.id} value={l.id}>{l.nombre || `Lote #${l.id}`}</option>
              ))}
            </select>
          </div>

          {/* Fecha */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Fecha <span className="text-red-400">*</span>
            </label>
            <input
              type="date"
              name="fecha"
              value={formData.fecha}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>
        </div>

        {/* Motivo */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Motivo (opcional)</label>
          <textarea
            name="motivo"
            value={formData.motivo}
            onChange={handleChange}
            className="input-field min-h-[80px] resize-y"
            placeholder="Razón del movimiento, observaciones..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-dark-600">
          <button
            type="button"
            onClick={() => navigate('/dashboard/movimientos')}
            className="px-4 py-2 text-gray-400 hover:text-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : 'Registrar Movimiento'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default MovimientoForm;
