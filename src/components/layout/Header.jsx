import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TrendingUp, RefreshCw, Download, Settings, Share2, User, LogOut, Shield } from 'lucide-react';
import { exportToHTML } from '../../utils/exportHTML';
import { useAuth } from '../../context/AuthContext';

const Header = ({ onReset, unitPriceLabel, t, lang, setLang, currentData, filters, settings, showReset, clients, colors }) => {
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { user, logout } = useAuth();

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" /> {t('dash_title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('dash_sub')} ({unitPriceLabel})</p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center space-x-3 no-print">
        {showReset && (
        <button onClick={onReset} className="text-sm flex items-center text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-4 py-2 rounded-lg">
          <RefreshCw className="w-4 h-4 mr-2" /> {t('load_other')}
        </button>
        )}

        <button
          onClick={() => window.print()}
          title={t('download_pdf')}
          className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
        >
          <Download className="w-5 h-5" />
        </button>

        <button
          onClick={() => exportToHTML(currentData, filters, settings, t, lang, clients, colors)}
          title="Exportar Vista Interactiva"
          className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
        >
          <Share2 className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            onClick={() => setShowSettings(!showSettings)}
            title={t('language')}
            className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-blue-100 text-blue-600' : 'text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50'}`}
          >
            <Settings className="w-5 h-5" />
          </button>

          {showSettings && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-slate-100 p-4 z-50">
              <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">{t('language')}</label>
              <select
                value={lang}
                onChange={e => { setLang(e.target.value); setShowSettings(false); }}
                className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm font-semibold rounded-lg p-2.5 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="es">🇪🇸 Español</option>
                <option value="en">🇬🇧 English</option>
              </select>
            </div>
          )}
        </div>

        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            id="profile-menu-button"
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${showProfile ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-blue-600'}`}
          >
            <div className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] font-bold">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <span className="text-sm font-bold truncate max-w-[100px]">{user?.name}</span>
          </button>

          {showProfile && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-2 z-50">
              <div className="px-4 py-2 border-b border-slate-50 mb-1">
                <p className="text-xs font-bold text-slate-400 uppercase">{user?.role === 'admin' ? 'Administrador' : 'Observador'}</p>
                <p className="text-sm font-medium text-slate-600 truncate">{user?.email}</p>
              </div>

              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  className="w-full flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 hover:text-blue-600 transition-colors"
                  onClick={() => setShowProfile(false)}
                >
                  <Shield className="w-4 h-4 mr-3 text-slate-400" />
                  Panel de Usuarios
                </Link>
              )}

              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Cerrar Sesión
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Header;
