import React from 'react';
import { UploadCloud, RefreshCw, FileSpreadsheet } from 'lucide-react';

export default function UploadScreen({ error, isLoading, handleFileUpload }) {
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">
            <div className="bg-white p-10 rounded-3xl shadow-xl max-w-lg w-full text-center border border-slate-100">
                <div className="bg-blue-50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
                    <UploadCloud className="w-12 h-12 text-blue-600" />
                </div>
                <h2 className="text-3xl font-bold text-slate-800 mb-3">Pura Vida Analytics</h2>
                <p className="text-slate-500 mb-8 text-sm">Sube el archivo Excel (.xlsx) o CSV de la Base de Datos Pura Vida para procesar los retornos por Wholesaler.</p>

                {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg text-sm border border-red-100">{error}</div>}

                <div className="space-y-4">
                    <label className={`cursor-pointer ${isLoading ? 'bg-slate-400' : 'bg-blue-600 hover:bg-blue-700'} text-white font-semibold py-4 px-8 rounded-xl transition-all shadow-md inline-flex items-center space-x-2 w-full justify-center`}>
                        {isLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <FileSpreadsheet className="w-5 h-5" />}
                        <span>{isLoading ? 'Procesando archivo...' : 'Cargar Excel o CSV'}</span>
                        <input
                            type="file"
                            accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel"
                            className="hidden"
                            onChange={handleFileUpload}
                            disabled={isLoading}
                        />
                    </label>
                    <p className="text-xs text-slate-400">Si subes el Excel completo, el sistema detectará automáticamente la pestaña correcta de Base de Datos.</p>
                </div>
            </div>
        </div>
    );
}
