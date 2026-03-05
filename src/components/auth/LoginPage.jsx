import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogIn, AlertCircle, TrendingUp } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const result = login(email, password);
    if (result.success) {
      navigate('/');
    } else {
      setError(result.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="text-center mb-8">
          <div className="bg-blue-50 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
            <TrendingUp className="w-10 h-10 text-blue-600" />
          </div>
          <h1 className="text-2xl font-black text-slate-800">Pura Vida Analytics</h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">Panel Comercial Wholesalers</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm border border-red-100 flex items-center">
            <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0" />
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
            <input
              type="email"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-medium"
              placeholder="nombre@puravida.cl"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div>
            <label className="text-xs font-bold text-slate-500 uppercase ml-1">Contraseña</label>
            <input
              type="password"
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-blue-500 outline-none mt-1 font-medium"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-md shadow-blue-200 flex items-center justify-center mt-6"
          >
            <LogIn className="w-5 h-5 mr-2" />
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-400 font-medium">© 2024 Pura Vida Analytics</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
