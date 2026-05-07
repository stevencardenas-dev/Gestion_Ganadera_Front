import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { getAnimales, getAnimalById, createAnimal, updateAnimal, getRazas, getCategorias, getLotes, getFincas } from '../../api/ganado';
import CatalogModal from '../../components/CatalogModal';

const GanadoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [formData, setFormData] = useState({
    identificadorArete: '',
    nombre: '',
    sexo: 'Hembra',
    fechaNacimiento: '',
    pesoNacimiento: '',
    pesoActual: '',
    estado: 'Activo',
    fotoUrl: '',
    raza: { id: '' },
    categoria: { id: '' },
    lote: { id: '' },
    finca: { id: '' },
    madre: { id: '' },
    padre: { id: '' }
  });

  const [catalogs, setCatalogs] = useState({
    razas: [], categorias: [], lotes: [], fincas: [], madres: [], padres: []
  });

  const [modalType, setModalType] = useState(null);

  const openModal = (type) => setModalType(type);
  const closeModal = () => setModalType(null);

  const handleSaveCatalogItem = (type, newItem) => {
    if (type === 'Raza') {
      setCatalogs(prev => ({ ...prev, razas: [...prev.razas, newItem] }));
      setFormData(prev => ({ ...prev, raza: { id: newItem.id } }));
    } else if (type === 'Categoria') {
      setCatalogs(prev => ({ ...prev, categorias: [...prev.categorias, newItem] }));
      setFormData(prev => ({ ...prev, categoria: { id: newItem.id } }));
    } else if (type === 'Finca') {
      setCatalogs(prev => ({ ...prev, fincas: [...prev.fincas, newItem] }));
      setFormData(prev => ({ ...prev, finca: { id: newItem.id } }));
    } else if (type === 'Lote') {
      setCatalogs(prev => ({ ...prev, lotes: [...prev.lotes, newItem] }));
      setFormData(prev => ({ ...prev, lote: { id: newItem.id } }));
    }
  };

  useEffect(() => {
    const loadCatalogs = async () => {
      try {
        const [razRes, catRes, lotRes, finRes, aniRes] = await Promise.all([
          getRazas().catch(() => []),
          getCategorias().catch(() => []),
          getLotes().catch(() => []),
          getFincas().catch(() => []),
          getAnimales().catch(() => [])
        ]);
        setCatalogs({
          razas: razRes,
          categorias: catRes,
          lotes: lotRes,
          fincas: finRes,
          madres: aniRes.filter(a => a.sexo === 'Hembra' && a.id !== parseInt(id)),
          padres: aniRes.filter(a => a.sexo === 'Macho' && a.id !== parseInt(id))
        });
      } catch (error) {
        console.error('Error cargando catálogos', error);
      }
    };
    loadCatalogs();

    if (isEditing) {
      getAnimalById(id).then(data => {
        setFormData({
          ...data,
          fechaNacimiento: data.fechaNacimiento ? data.fechaNacimiento.split('T')[0] : '',
          raza: data.razaNombre ? catalogs.razas.find(r => r.nombre === data.razaNombre) || {id:''} : {id:''},
          madre: { id: data.madreId || '' },
          padre: { id: data.padreId || '' }
        });
      });
    }
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (['raza', 'categoria', 'lote', 'finca', 'madre', 'padre'].includes(name)) {
      setFormData({ ...formData, [name]: value ? { id: parseInt(value) } : null });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = { ...formData };
      ['raza', 'categoria', 'lote', 'finca', 'madre', 'padre'].forEach(field => {
        if (payload[field] && !payload[field].id) {
          payload[field] = null;
        }
      });
      if (payload.fechaNacimiento === '') payload.fechaNacimiento = null;
      if (payload.pesoActual === '') payload.pesoActual = null;

      if (isEditing) {
        await updateAnimal(id, payload);
      } else {
        await createAnimal(payload);
      }
      navigate('/dashboard/ganado');
    } catch (error) {
      console.error('Error guardando', error);
      const msg = error.response?.data?.message || error.response?.data?.error || 'Error desconocido';
      alert('Error al guardar: ' + msg);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-100">{isEditing ? 'Editar Animal' : 'Nuevo Animal'}</h1>
        <button onClick={() => navigate(-1)} className="text-gray-400 hover:text-gray-100">Volver</button>
      </div>

      <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2">Información Básica</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Arete / Identificador</label>
            <input name="identificadorArete" value={formData.identificadorArete || ''} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Nombre</label>
            <input name="nombre" value={formData.nombre || ''} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Sexo</label>
            <select name="sexo" value={formData.sexo} onChange={handleChange} className="input-field">
              <option value="Hembra">Hembra</option>
              <option value="Macho">Macho</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Fecha de Nacimiento</label>
            <input type="date" name="fechaNacimiento" value={formData.fechaNacimiento || ''} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Peso al Nacer (kg)</label>
            <input type="number" step="0.01" name="pesoNacimiento" value={formData.pesoNacimiento || ''} onChange={handleChange} className="input-field" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Estado</label>
            <select name="estado" value={formData.estado} onChange={handleChange} className="input-field">
              <option value="Activo">Activo</option>
              <option value="En tratamiento">En tratamiento</option>
              <option value="En cuarentena">En cuarentena</option>
              <option value="Vendido">Vendido</option>
              <option value="Fallecido">Fallecido</option>
              <option value="Sacrificado">Sacrificado</option>
            </select>
          </div>
        </div>

        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2 pt-4">Clasificación y Ubicación</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Raza</label>
            <div className="flex items-center gap-2">
              <select name="raza" value={formData.raza?.id || ''} onChange={handleChange} className="input-field flex-1">
                <option value="">Seleccione...</option>
                {catalogs.razas.map(c => <option key={c.id} value={c.id}>{c.nombre || `(Raza ID ${c.id} sin nombre)`}</option>)}
              </select>
              <button type="button" onClick={() => openModal('Raza')} className="btn-primary px-3 py-2 leading-none text-lg">+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Categoría</label>
            <div className="flex items-center gap-2">
              <select name="categoria" value={formData.categoria?.id || ''} onChange={handleChange} className="input-field flex-1">
                <option value="">Seleccione...</option>
                {catalogs.categorias.map(c => <option key={c.id} value={c.id}>{c.nombre || `(Categoría ID ${c.id} sin nombre)`}</option>)}
              </select>
              <button type="button" onClick={() => openModal('Categoria')} className="btn-primary px-3 py-2 leading-none text-lg">+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Finca</label>
            <div className="flex items-center gap-2">
              <select name="finca" value={formData.finca?.id || ''} onChange={handleChange} className="input-field flex-1">
                <option value="">Seleccione...</option>
                {catalogs.fincas.map(c => <option key={c.id} value={c.id}>{c.nombre || `(Finca ID ${c.id} sin nombre)`}</option>)}
              </select>
              <button type="button" onClick={() => openModal('Finca')} className="btn-primary px-3 py-2 leading-none text-lg">+</button>
            </div>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Lote</label>
            <div className="flex items-center gap-2">
              <select name="lote" value={formData.lote?.id || ''} onChange={handleChange} className="input-field flex-1">
                <option value="">Seleccione...</option>
                {catalogs.lotes.map(c => <option key={c.id} value={c.id}>{c.nombre || `(Lote ID ${c.id} sin nombre)`}</option>)}
              </select>
              <button type="button" onClick={() => openModal('Lote')} className="btn-primary px-3 py-2 leading-none text-lg">+</button>
            </div>
          </div>
        </div>

        <h2 className="text-lg font-semibold border-b border-dark-600 pb-2 pt-4">Genealogía</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Madre</label>
            <select name="madre" value={formData.madre?.id || ''} onChange={handleChange} className="input-field">
              <option value="">Desconocido</option>
              {catalogs.madres.map(c => <option key={c.id} value={c.id}>{c.identificadorArete || `ID:${c.id}`} {c.nombre ? `(${c.nombre})` : ''}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Padre</label>
            <select name="padre" value={formData.padre?.id || ''} onChange={handleChange} className="input-field">
              <option value="">Desconocido</option>
              {catalogs.padres.map(c => <option key={c.id} value={c.id}>{c.identificadorArete || `ID:${c.id}`} {c.nombre ? `(${c.nombre})` : ''}</option>)}
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6">
          <button type="button" onClick={() => navigate(-1)} className="px-4 py-2 text-gray-400 hover:text-gray-100">Cancelar</button>
          <button type="submit" className="btn-primary">Guardar Animal</button>
        </div>
      </form>

      <CatalogModal 
        isOpen={!!modalType}
        onClose={closeModal}
        type={modalType}
        onSave={handleSaveCatalogItem}
        fincas={catalogs.fincas}
      />
    </div>
  );
};

export default GanadoForm;
