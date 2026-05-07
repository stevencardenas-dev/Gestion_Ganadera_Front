import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Register from './pages/Register';
import Home from './pages/Home';

// Ganado Module
import GanadoList from './pages/Ganado/GanadoList';
import GanadoForm from './pages/Ganado/GanadoForm';
import GanadoDetail from './pages/Ganado/GanadoDetail';

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        
        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Application Routes */}
        <Route path="/dashboard" element={<Layout />}>
          <Route index element={<Dashboard />} />
          
          {/* Ganado Module */}
          <Route path="ganado" element={<GanadoList />} />
          <Route path="ganado/nuevo" element={<GanadoForm />} />
          <Route path="ganado/editar/:id" element={<GanadoForm />} />
          <Route path="ganado/:id" element={<GanadoDetail />} />

          <Route path="fincas" element={<div className="p-8"><h1 className="text-2xl font-bold">Fincas y Lotes</h1></div>} />
          <Route path="reproduccion" element={<div className="p-8"><h1 className="text-2xl font-bold">Reproducción</h1></div>} />
          <Route path="sanidad" element={<div className="p-8"><h1 className="text-2xl font-bold">Sanidad</h1></div>} />
          <Route path="produccion" element={<div className="p-8"><h1 className="text-2xl font-bold">Producción</h1></div>} />
          <Route path="movimientos" element={<div className="p-8"><h1 className="text-2xl font-bold">Movimientos</h1></div>} />
          <Route path="reportes" element={<div className="p-8"><h1 className="text-2xl font-bold">Reportes</h1></div>} />
          <Route path="configuracion" element={<div className="p-8"><h1 className="text-2xl font-bold">Configuración</h1></div>} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
