import React, { useState } from 'react';
import { TrendingUp, RefreshCw, Download, Settings, Share2 } from 'lucide-react';
import { exportToHTML } from '../../utils/exportHTML';

const Header = ({ onReset, unitPriceLabel, t, lang, setLang, currentData, filters, settings }) => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 flex items-center">
          <TrendingUp className="w-6 h-6 mr-2 text-blue-600" /> {t('dash_title')}
        </h1>
        <p className="text-sm text-slate-500 mt-1">{t('dash_sub')} ({unitPriceLabel})</p>
      </div>
      <div className="mt-4 md:mt-0 flex items-center space-x-3 no-print">
        <button onClick={onReset} className="text-sm flex items-center text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-4 py-2 rounded-lg">
          <RefreshCw className="w-4 h-4 mr-2" /> {t('load_other')}
        </button>

        <button
          onClick={() => window.print()}
          title={t('download_pdf')}
          className="p-2 text-slate-500 hover:text-blue-600 bg-slate-100 hover:bg-blue-50 rounded-lg transition-colors flex items-center"
        >
          <Download className="w-5 h-5" />
        </button>

        <button
          onClick={() => exportToHTML(currentData, filters, settings, t, lang)}
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
      </div>
    </div>
  );
};

export default Header;
