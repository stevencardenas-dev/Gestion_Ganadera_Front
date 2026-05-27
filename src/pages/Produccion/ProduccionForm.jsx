import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAnimales, getProducciones, apiProduccion, updateProduccion } from '../../api/ganado';

const ProduccionForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    animalId: '',
    litros: '',
    turno: 'Mañana',
    fecha: new Date().toISOString().split('T')[0],
  });

  useEffect(() => {
    const loadData = async () => {
      try {
        const aniData = await getAnimales().catch(() => []);
        setAnimales(aniData);

        if (isEditing) {
          const allProduccion = await getProducciones().catch(() => []);
          const record = allProduccion.find(p => p.id === parseInt(id));
          if (record) {
            setFormData({
              animalId: record.animalId?.toString() || '',
              litros: record.litros?.toString() || '',
              turno: record.turno || 'Mañana',
              fecha: record.fecha || new Date().toISOString().split('T')[0],
            });
          }
        }
      } catch (error) {
        console.error('Error cargando datos', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.animalId || !formData.litros || !formData.fecha) {
      alert('Por favor complete todos los campos obligatorios: Animal, Litros y Fecha');
      return;
    }

    const litros = parseFloat(formData.litros);
    if (isNaN(litros) || litros <= 0) {
      alert('Ingrese una cantidad válida de litros (mayor a 0)');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        animalId: parseInt(formData.animalId),
        litros: litros,
        turno: formData.turno,
        fecha: formData.fecha,
      };

      if (isEditing) {
        await updateProduccion(parseInt(id), payload);
      } else {
        await apiProduccion.create(payload);
      }
      navigate('/dashboard/produccion');
    } catch (error) {
      console.error('Error guardando producción', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error desconocido';
      alert('Error al guardar: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  const selectedAnimal = animales.find(a => a.id === parseInt(formData.animalId));

  const hembras = animales.filter(a => a.sexo === 'Hembra');

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            {isEditing ? 'Editar Registro de Producción' : 'Nuevo Registro de Producción'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Registrar producción de leche por animal y turno
          </p>
        </div>
        <button
          onClick={() => navigate('/dashboard/produccion')}
          className="text-gray-400 hover:text-gray-100"
        >
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2">
          Datos de Producción
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
              {hembras.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
            {selectedAnimal && (
              <p className="text-xs text-gray-500 mt-1">
                🐮 {selectedAnimal.razaNombre || 'Sin raza'} —{' '}
                {selectedAnimal.loteNombre ? `Lote: ${selectedAnimal.loteNombre}` : 'Sin lote'}
              </p>
            )}
            {hembras.length === 0 && (
              <p className="text-xs text-amber-400 mt-1">
                No hay hembras registradas. Debes registrar animales hembra para registrar producción.
              </p>
            )}
          </div>

          {/* Turno */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Turno <span className="text-red-400">*</span>
            </label>
            <select
              name="turno"
              value={formData.turno}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="Mañana">Mañana</option>
              <option value="Tarde">Tarde</option>
            </select>
          </div>

          {/* Litros */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Litros <span className="text-red-400">*</span>
            </label>
            <input
              type="number"
              name="litros"
              value={formData.litros}
              onChange={handleChange}
              className="input-field"
              placeholder="0.0"
              min="0"
              step="0.1"
              required
            />
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

        <div className="flex justify-end gap-3 pt-6 border-t border-dark-600">
          <button
            type="button"
            onClick={() => navigate('/dashboard/produccion')}
            className="px-4 py-2 text-gray-400 hover:text-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting
              ? 'Guardando...'
              : isEditing ? 'Actualizar Registro' : 'Registrar Producción'
            }
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProduccionForm;
