import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { formatRMB, formatNumber } from '../../utils/formatters';

const CustomTooltip = ({ active, payload, label, unitPriceLabel, unitVolLabel }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[260px]">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3 border-b pb-2">{label}</p>
                <div className="space-y-3">
                    {payload.map((entry, index) => {
                        const name = entry.name;
                        const value = entry.value;
                        const vars = entry.payload._varieties?.[name];
                        const vol = entry.payload._volumes?.[name];
                        const color = entry.color;

                        const priceStr = `${formatRMB(value)} ${unitPriceLabel}`;
                        const volStr = vol !== undefined ? `${formatNumber(vol)} ${unitVolLabel}` : '';

                        return (
                            <div key={index} className="flex flex-col">
                                <div className="flex items-center space-x-2 mb-1">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }}></div>
                                    <span className="font-bold text-slate-600 text-[10px] uppercase tracking-wider">{name}</span>
                                </div>
                                <div className="pl-4">
                                    <div className="font-black text-slate-800 text-xs">
                                        {priceStr} | <span className="text-blue-600">Vol: {volStr}</span>
                                    </div>
                                    {vars && (
                                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight max-w-[220px]">
                                            {vars}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
    return null;
};

export default function ChartRMB({ data, unitPriceLabel, unitVolLabel, clients, colors }) {
    return (
        <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="Calibre" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis width={80} tickFormatter={(val) => `¥${val}`} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip
                        content={<CustomTooltip unitPriceLabel={unitPriceLabel} unitVolLabel={unitVolLabel} />}
                        cursor={{ fill: '#f8fafc' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    {clients.map(client => (
                        <Bar key={client} dataKey={client} fill={colors[client]} radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
