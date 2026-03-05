import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { formatUSD } from '../../utils/formatters';
import { VALID_CLIENTS, COLORS } from '../../utils/constants';

export default function ChartUSD({ data, unitPriceLabel }) {
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
                            return [`${formatUSD(value)}/${unitPriceLabel}`, `${name}${vars ? ` (${vars})` : ''}`];
                        }}
                        cursor={{ fill: '#f8fafc' }}
                        contentStyle={{ borderRadius: '12px' }}
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
