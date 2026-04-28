import React from 'react';
import { UploadCloud, Globe, RefreshCw, FileSpreadsheet } from 'lucide-react';

const UploadScreen = ({ onUpload, isLoading, error, t, lang, setLang, numFormat, setNumFormat, hideLanguageToggle }) => (
  <div className={`w-full flex flex-col items-center justify-center p-6 font-sans relative ${!hideLanguageToggle ? 'min-h-screen' : ''}`}>
    {!hideLanguageToggle && (
    <div className="absolute top-6 right-6 flex items-center bg-white p-2 rounded-xl shadow-sm border border-slate-100 no-print">
      <Globe className="w-4 h-4 text-slate-400 mr-2" />
      <select
        value={lang}
        onChange={e => setLang(e.target.value)}
        className="bg-transparent border-none text-sm font-semibold text-slate-700 outline-none cursor-pointer"
      >
        <option value="es">Español</option>
        <option value="en">English</option>
      </select>
    </div>
    )}

    <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
      <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
        <UploadCloud className="w-12 h-12 text-blue-600" />
      </div>
      <h2 className="text-3xl font-bold text-slate-800 mb-3">{t('upload_title')}</h2>
      <p className="text-slate-500 mb-8 text-sm">{t('upload_sub')}</p>

      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

      <div className="space-y-4">
        <div className="mb-4 no-print flex flex-col items-center justify-center">
          <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">{t('num_format')}</label>
          <div className="flex bg-slate-100 p-1 rounded-xl shadow-inner border border-slate-200">
            <button
              onClick={() => setNumFormat('EU')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${numFormat === 'EU' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('format_eu')}
            </button>
            <button
              onClick={() => setNumFormat('US')}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${numFormat === 'US' ? 'bg-white text-blue-600 shadow-sm border border-slate-200' : 'text-slate-500 hover:text-slate-700'}`}
            >
              {t('format_us')}
            </button>
          </div>
        </div>

        <label className={`cursor-pointer ${isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-md inline-flex items-center space-x-2 w-full justify-center`}>
          {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
          <span>{isLoading ? t('processing') : t('upload_btn')}</span>
          <input type="file" accept=".csv, .xlsx, .xls" className="hidden" onChange={onUpload} disabled={isLoading} />
        </label>
        <p className="text-xs text-slate-400">{t('upload_help')}</p>
      </div>
    </div>
  </div>
);

export default UploadScreen;
