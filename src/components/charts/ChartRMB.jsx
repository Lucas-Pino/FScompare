import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { formatRMB, formatNumber } from '../../utils/formatters';
import { VALID_CLIENTS, COLORS } from '../../utils/constants';

export default function ChartRMB({ data, unitPriceLabel }) {
    return (
        <div className="h-[450px]">
            <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="Calibre" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} dy={10} />
                    <YAxis width={80} tickFormatter={(val) => `¥${val}`} axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 13 }} />
                    <Tooltip
                        formatter={(value, name, props) => {
                            const vars = props.payload._varieties?.[name];
                            const vol = props.payload[`${name}_vol`];
                            return [
                                <span>{formatRMB(value)}/{unitPriceLabel} <br/> <span className="text-xs text-slate-400 font-normal">Vol: {formatNumber(vol)}</span></span>,
                                `${name}${vars ? ` (${vars})` : ''}`
                            ];
                        }}
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                    {VALID_CLIENTS.map(client => (
                        <Bar key={client} dataKey={client} fill={COLORS[client]} radius={[4, 4, 0, 0]} maxBarSize={60} />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
}
