import React from 'react';
import { TrendingUp, RefreshCw } from 'lucide-react';

export default function Header({ onReset }) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
            <div>
                <h1 className="text-2xl font-bold text-slate-900 flex items-center">
                    <TrendingUp className="w-6 h-6 mr-2 text-blue-600" />
                    Dashboard Comercial: Wholesalers
                </h1>
                <p className="text-sm text-slate-500 mt-1">Comparativa de Retorno Real y Desempeño en China</p>
            </div>
            <button
                onClick={onReset}
                className="mt-4 md:mt-0 text-sm flex items-center text-slate-500 hover:text-blue-600 transition-colors bg-slate-100 hover:bg-blue-50 px-4 py-2 rounded-lg"
            >
                <RefreshCw className="w-4 h-4 mr-2" /> Cargar otro archivo
            </button>
        </div>
    );
}
