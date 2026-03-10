import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { formatUSD, formatNumber } from '../../utils/formatters';
import { VALID_CLIENTS, COLORS } from '../../utils/constants';

export default function ChartUSD({ data, unitPriceLabel, unitVolLabel }) {
    return (
        <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="Calibre" axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} dy={10} />
                    <YAxis width={80} tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} tick={{ fill: '#64748b' }} />
                    <Tooltip
                        formatter={(value, name, props) => {
                            const vars = props.payload._varieties?.[name];
                            const vol = props.payload._volumes?.[name];
                            const priceStr = `${formatUSD(value)} ${unitPriceLabel}`;
                            const volStr = vol !== undefined ? `${formatNumber(vol)} ${unitVolLabel}` : '';
                            return [
                                <div key={name}>
                                    <div className="font-black text-slate-800">{priceStr} | <span className="text-blue-600 font-bold">Vol: {volStr}</span></div>
                                    {vars && <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight max-w-[200px]">{vars}</div>}
                                </div>,
                                <span className="font-bold text-slate-500">{name}</span>
                            ];
                        }}
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    {VALID_CLIENTS.map(client => (
                        <Bar key={client} dataKey={client} fill={COLORS[client]} radius={[4, 4, 0, 0]} maxBarSize={60} isAnimationActive={false} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
