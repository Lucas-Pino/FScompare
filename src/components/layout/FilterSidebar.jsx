import React from 'react';
import { Ship, Tag } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';

export default function FilterSidebar({
    naves,
    variedades,
    selectedNave,
    setSelectedNave,
    selectedVariedad,
    setSelectedVariedad,
    totalCajas
}) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
            <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center">
                Filtros Generales
            </h3>

            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                    <Ship className="w-4 h-4 mr-1" /> Nave
                </label>
                <select
                    value={selectedNave}
                    onChange={e => setSelectedNave(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                    {naves.map(n => <option key={n} value={n}>{n}</option>)}
                </select>
            </div>

            <div>
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
                    <Tag className="w-4 h-4 mr-1" /> Variedad
                </label>
                <select
                    value={selectedVariedad}
                    onChange={e => setSelectedVariedad(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2.5"
                >
                    {variedades.map(v => <option key={v} value={v}>{v}</option>)}
                </select>
            </div>

            <div className="pt-4 space-y-4">
                <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
                    <p className="text-xs text-slate-500 font-semibold mb-1 uppercase">Volumen Analizado</p>
                    <p className="text-2xl font-bold text-slate-800">{formatNumber(totalCajas)} <span className="text-sm font-normal text-slate-500">cajas</span></p>
                </div>
            </div>
        </div>
    );
}
