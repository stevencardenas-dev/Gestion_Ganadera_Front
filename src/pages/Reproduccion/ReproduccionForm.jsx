import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  getAnimales, getReproduccionById, createReproduccion, updateReproduccion,
  getPartosByReproduccion, createParto, updateParto, deleteParto,
} from '../../api/ganado';

const INITIAL_FORM = {
  vacaId: '',
  toroId: '',
  fechaMonta: '',
  tipo: 'Monta Natural',
  resultado: '',
  fechaPartoEstimada: '',
  observaciones: '',
};

export default function ReproduccionForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [animales, setAnimales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState(INITIAL_FORM);

  // Partos sub-section
  const [partos, setPartos] = useState([]);
  const [showPartoForm, setShowPartoForm] = useState(false);
  const [editingPartoId, setEditingPartoId] = useState(null);
  const [partoForm, setPartoForm] = useState({
    fechaParto: '',
    cantidadCrias: 1,
    observaciones: '',
  });
  const [submittingParto, setSubmittingParto] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const aniRes = await getAnimales().catch(() => []);
        setAnimales(aniRes);

        if (isEditing) {
          const r = await getReproduccionById(id);
          setFormData({
            vacaId: r.vacaId?.toString() || '',
            toroId: r.toroId?.toString() || '',
            fechaMonta: r.fechaMonta || '',
            tipo: r.tipo || 'Monta Natural',
            resultado: r.resultado || '',
            fechaPartoEstimada: r.fechaPartoEstimada || '',
            observaciones: r.observaciones || '',
          });

          // Load associated partos
          const partosRes = await getPartosByReproduccion(id).catch(() => []);
          setPartos(partosRes);
        }
      } catch (error) {
        console.error('Error cargando datos', error);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.vacaId) {
      alert('Seleccione una vaca');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        vacaId: parseInt(formData.vacaId),
        toroId: formData.toroId ? parseInt(formData.toroId) : null,
        fechaMonta: formData.fechaMonta || null,
        tipo: formData.tipo || null,
        resultado: formData.resultado || null,
        fechaPartoEstimada: formData.fechaPartoEstimada || null,
        observaciones: formData.observaciones || null,
      };

      if (isEditing) {
        await updateReproduccion(id, payload);
      } else {
        await createReproduccion(payload);
      }
      navigate('/dashboard/reproduccion');
    } catch (error) {
      console.error('Error guardando', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error desconocido';
      alert('Error al guardar: ' + msg);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Parto handlers ──
  const handlePartoChange = (e) => {
    const { name, value } = e.target;
    setPartoForm(prev => ({ ...prev, [name]: value }));
  };

  const resetPartoForm = () => {
    setPartoForm({ fechaParto: '', cantidadCrias: 1, observaciones: '' });
    setEditingPartoId(null);
    setShowPartoForm(false);
  };

  const handleEditParto = (parto) => {
    setPartoForm({
      fechaParto: parto.fechaParto || '',
      cantidadCrias: parto.cantidadCrias ?? 1,
      observaciones: parto.observaciones || '',
    });
    setEditingPartoId(parto.id);
    setShowPartoForm(true);
  };

  const handleSaveParto = async (e) => {
    e.preventDefault();
    if (!partoForm.fechaParto) {
      alert('La fecha de parto es obligatoria');
      return;
    }
    setSubmittingParto(true);
    try {
      if (editingPartoId) {
        const updated = await updateParto(editingPartoId, {
          reproduccionId: parseInt(id),
          fechaParto: partoForm.fechaParto,
          cantidadCrias: parseInt(partoForm.cantidadCrias) || 1,
          observaciones: partoForm.observaciones || null,
        });
        setPartos(prev => prev.map(p => p.id === editingPartoId ? updated : p));
      } else {
        const newParto = await createParto({
          reproduccionId: parseInt(id),
          fechaParto: partoForm.fechaParto,
          cantidadCrias: parseInt(partoForm.cantidadCrias) || 1,
          observaciones: partoForm.observaciones || null,
        });
        setPartos(prev => [...prev, newParto]);
      }
      resetPartoForm();
    } catch (error) {
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error desconocido';
      alert('Error al ' + (editingPartoId ? 'actualizar' : 'registrar') + ' parto: ' + msg);
    } finally {
      setSubmittingParto(false);
    }
  };

  const handleDeleteParto = async (partoId) => {
    if (window.confirm('¿Eliminar este parto?')) {
      try {
        await deleteParto(partoId);
        setPartos(prev => prev.filter(p => p.id !== partoId));
      } catch (error) {
        alert('Error al eliminar parto');
      }
    }
  };

  const vacas = animales.filter(a => a.sexo === 'Hembra');
  const toros = animales.filter(a => a.sexo === 'Macho');

  if (loading) return <div className="p-8 text-center text-gray-400">Cargando...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-100">
            {isEditing ? 'Editar Registro Reproductivo' : 'Nuevo Registro Reproductivo'}
          </h1>
          <p className="text-gray-400 text-sm mt-1">
            Registro de monta, inseminación y control de gestación
          </p>
        </div>
        <button onClick={() => navigate('/dashboard/reproduccion')} className="text-gray-400 hover:text-gray-100">
          Volver
        </button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2">Datos del Servicio</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Vaca */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">
              Vaca <span className="text-red-400">*</span>
            </label>
            <select
              name="vacaId"
              value={formData.vacaId}
              onChange={handleChange}
              className="input-field"
              required
            >
              <option value="">Seleccione una vaca...</option>
              {vacas.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Toro */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Toro</label>
            <select
              name="toroId"
              value={formData.toroId}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Seleccione un toro...</option>
              {toros.map(a => (
                <option key={a.id} value={a.id}>
                  {a.identificadorArete || `ID:${a.id}`}{a.nombre ? ` - ${a.nombre}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Fecha Monta */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha de Monta</label>
            <input
              type="date"
              name="fechaMonta"
              value={formData.fechaMonta}
              onChange={handleChange}
              className="input-field"
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Tipo</label>
            <select
              name="tipo"
              value={formData.tipo}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Monta Natural">Monta Natural</option>
              <option value="Inseminación Artificial">Inseminación Artificial</option>
              <option value="Transferencia de Embriones">Transferencia de Embriones</option>
            </select>
          </div>

          {/* Resultado */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Resultado</label>
            <select
              name="resultado"
              value={formData.resultado}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">—</option>
              <option value="Gestación confirmada">Gestación confirmada</option>
              <option value="No gestada">No gestada</option>
              <option value="Aborto">Aborto</option>
              <option value="Parto exitoso">Parto exitoso</option>
            </select>
          </div>

          {/* Fecha Parto Estimada */}
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha Parto Estimada</label>
            <input
              type="date"
              name="fechaPartoEstimada"
              value={formData.fechaPartoEstimada}
              onChange={handleChange}
              className="input-field"
            />
          </div>
        </div>

        {/* Observaciones */}
        <div>
          <label className="block text-sm text-gray-400 mb-1">Observaciones</label>
          <textarea
            name="observaciones"
            value={formData.observaciones}
            onChange={handleChange}
            className="input-field min-h-[80px] resize-y"
            placeholder="Notas adicionales, detalles del servicio, etc."
          />
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-dark-600">
          <button
            type="button"
            onClick={() => navigate('/dashboard/reproduccion')}
            className="px-4 py-2 text-gray-400 hover:text-gray-100"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary disabled:opacity-50"
          >
            {submitting ? 'Guardando...' : (isEditing ? 'Guardar Cambios' : 'Crear Registro')}
          </button>
        </div>
      </form>

      {/* ── Partos Section (only when editing) ── */}
      {isEditing && (
        <div className="glass-card p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-100">Partos Asociados</h2>
            <button
              type="button"
              onClick={() => {
                if (showPartoForm) resetPartoForm();
                else setShowPartoForm(true);
              }}
              className="btn-primary text-sm"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              {showPartoForm ? 'Cancelar' : 'Registrar Parto'}
            </button>
          </div>

          {showPartoForm && (
            <form onSubmit={handleSaveParto} className="bg-dark-700/50 rounded-lg p-4 space-y-4 border border-dark-500">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-1">
                    Fecha Parto <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="date"
                    name="fechaParto"
                    value={partoForm.fechaParto}
                    onChange={handlePartoChange}
                    className="input-field"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Cant. Crías</label>
                  <input
                    type="number"
                    name="cantidadCrias"
                    value={partoForm.cantidadCrias}
                    onChange={handlePartoChange}
                    className="input-field"
                    min="1"
                    max="5"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={submittingParto}
                    className="btn-primary disabled:opacity-50 w-full"
                  >
                    {submittingParto ? 'Guardando...' : (editingPartoId ? 'Actualizar Parto' : 'Guardar Parto')}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-400 mb-1">Observaciones del Parto</label>
                <textarea
                  name="observaciones"
                  value={partoForm.observaciones}
                  onChange={handlePartoChange}
                  className="input-field min-h-[60px] resize-y"
                  placeholder="Detalles del parto, complicaciones, etc."
                />
              </div>
            </form>
          )}

          {partos.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full data-table">
                <thead>
                  <tr className="bg-dark-800/50">
                    <th className="text-left">Fecha Parto</th>
                    <th className="text-left">Crías</th>
                    <th className="text-left">Observaciones</th>
                    <th className="text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {partos.map(p => (
                    <tr key={p.id} className="hover:bg-dark-600/50 transition-colors">
                      <td className="text-gray-300">{p.fechaParto}</td>
                      <td className="text-gray-300">{p.cantidadCrias ?? '—'}</td>
                      <td className="text-gray-400 text-sm max-w-[300px] truncate">
                        {p.observaciones || '—'}
                      </td>
                      <td className="text-right space-x-3">
                        <button
                          onClick={() => handleEditParto(p)}
                          className="text-sm text-blue-400 hover:underline"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDeleteParto(p.id)}
                          className="text-sm text-red-400 hover:underline"
                        >
                          Eliminar
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay partos registrados para esta reproducción.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
