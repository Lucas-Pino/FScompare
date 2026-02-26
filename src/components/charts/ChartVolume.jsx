import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

export default function ChartVolume({ data }) {
    return (
        <div className="flex flex-col md:flex-row h-[450px]">
            <div className="flex-1">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie data={data} cx="50%" cy="50%" innerRadius={90} outerRadius={150} paddingAngle={3} dataKey="value">
                            {data.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[entry.name]} stroke="transparent" />
                            ))}
                        </Pie>
                        <Tooltip formatter={(value) => [`${formatNumber(value)} cajas`, 'Volumen']} contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex-1 flex flex-col justify-center space-y-3 pl-4 border-l border-slate-100">
                <h4 className="text-slate-800 font-bold border-b pb-3 mb-3 text-lg">Distribución de Volumen</h4>
                {data.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex items-center">
                            <span className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{ backgroundColor: COLORS[item.name] }}></span>
                            <span className="text-slate-700 font-semibold">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                            {formatNumber(item.value)} <span className="text-xs text-slate-400 font-normal">cjs</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
