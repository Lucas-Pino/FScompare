import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { Scale } from 'lucide-react';
import { formatUSD, formatRMB, formatNumber } from '../utils/formatters';
import { VALID_CLIENTS, COLORS } from '../utils/constants';

const VsRow = ({ label, valA, valB, formatFn }) => {
    const aWins = valA > valB;
    const bWins = valB > valA;
    return (
        <div className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-2 rounded-lg">
            <div className={`w-1/3 text-center text-lg md:text-xl font-bold ${aWins ? 'text-emerald-600' : 'text-slate-500'}`}>
                {formatFn(valA)}
                {aWins && <span className="ml-2 text-xs text-emerald-500">▲</span>}
            </div>
            <div className="w-1/3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">
                {label}
            </div>
            <div className={`w-1/3 text-center text-lg md:text-xl font-bold ${bWins ? 'text-emerald-600' : 'text-slate-500'}`}>
                {bWins && <span className="mr-2 text-xs text-emerald-500">▲</span>}
                {formatFn(valB)}
            </div>
        </div>
    );
};

export default function HeadToHead({
    clientA, setClientA,
    clientB, setClientB,
    h2hStats
}) {
    return (
        <div className="space-y-6">
            {/* Selectores Head to Head */}
            <div className="flex items-center justify-between space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
                <div className="flex-1">
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center">
                        <span className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[clientA] }}></span> Cliente A
                    </label>
                    <select
                        value={clientA}
                        onChange={e => setClientA(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 shadow-sm"
                    >
                        {VALID_CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>

                <div className="flex flex-col items-center justify-center px-4">
                    <Scale className="w-8 h-8 text-slate-300 mb-1" />
                    <span className="font-black text-slate-400 text-sm tracking-widest">VS</span>
                </div>

                <div className="flex-1">
                    <label className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center justify-end">
                        Cliente B <span className="w-3 h-3 rounded-full ml-2" style={{ backgroundColor: COLORS[clientB] }}></span>
                    </label>
                    <select
                        value={clientB}
                        onChange={e => setClientB(e.target.value)}
                        className="w-full bg-white border border-slate-300 text-slate-900 font-bold text-right rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-3 shadow-sm"
                        dir="rtl"
                    >
                        {VALID_CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                </div>
            </div>

            {/* Tarjeta de Estadísticas Cara a Cara */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <h4 className="text-center font-bold text-slate-800 mb-6 uppercase tracking-wider text-sm border-b pb-4">Desempeño Ponderado</h4>
                <div className="space-y-2">
                    <VsRow label="Volumen (Cajas)" valA={h2hStats.statsA.cajas} valB={h2hStats.statsB.cajas} formatFn={formatNumber} />
                    <VsRow label="Venta Bruta (RMB/caja)" valA={h2hStats.statsA.avgRMB} valB={h2hStats.statsB.avgRMB} formatFn={formatRMB} />
                    <VsRow label="FOB Neto (USD/caja)" valA={h2hStats.statsA.avgUSD} valB={h2hStats.statsB.avgUSD} formatFn={formatUSD} />
                </div>
            </div>

            {/* Gráfico Exclusivo H2H */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <h4 className="font-bold text-slate-800 mb-4 text-center text-sm uppercase tracking-wider">Comparativa por Calibre (FOB USD)</h4>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={h2hStats.chartH2H} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                            <XAxis dataKey="Calibre" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                            <YAxis width={60} tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                            <Tooltip formatter={(value, name) => [formatUSD(value), name]} cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
                            <Bar dataKey={clientA} fill={COLORS[clientA]} radius={[4, 4, 0, 0]} maxBarSize={50} />
                            <Bar dataKey={clientB} fill={COLORS[clientB]} radius={[4, 4, 0, 0]} maxBarSize={50} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
