import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }
    // Simulate API registration success
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900 relative overflow-hidden py-10">
      {/* Decorative background elements */}
      <div className="absolute top-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-brand-900/40 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-earth-900/20 blur-[120px] pointer-events-none"></div>

      <div className="glass-card w-full max-w-md p-8 relative z-10 animate-fade-up">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">Crear una Cuenta</h1>
          <p className="text-gray-400 text-sm">Únete a GestGan para administrar tu granja</p>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Nombre Completo</label>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Juan Pérez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Correo Electrónico</label>
            <input 
              type="email" 
              className="input-field" 
              placeholder="tu@correo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Contraseña</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Confirmar Contraseña</label>
            <input 
              type="password" 
              className="input-field" 
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3 text-base mt-2">
            Registrarse
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-400">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="text-brand-500 hover:text-brand-400 font-semibold transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
