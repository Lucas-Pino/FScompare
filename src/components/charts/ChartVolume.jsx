import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

const CustomTooltip = ({ active, payload, unitVolLabel }) => {
    if (active && payload && payload.length) {
        const entry = payload[0];
        const { name, value, varieties, cajas } = entry.payload;
        const fill = entry.payload.fill || entry.color || entry.payload.payload?.fill;
        return (
            <div className="bg-white p-4 rounded-2xl shadow-xl border border-slate-100 min-w-[240px]">
                <div className="flex items-center space-x-2 mb-3 border-b pb-2">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: fill }}></div>
                    <span className="font-black text-slate-600 text-xs uppercase tracking-wider">{name}</span>
                </div>
                <div className="pl-4">
                    <div className="font-black text-slate-800 text-xs">
                        {formatNumber(value)} {unitVolLabel} | <span className="text-blue-600 font-bold">{formatNumber(cajas)} Cjs</span>
                    </div>
                    {varieties && (
                        <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight max-w-[200px]">
                            {varieties}
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return null;
};

export default function ChartVolume({ data, unitVolLabel, t }) {
    return (
        <div className="flex flex-col md:flex-row h-[450px]">
            <div className="flex-[3]">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={70}
                            outerRadius={110}
                            paddingAngle={3}
                            dataKey="value"
                            isAnimationActive={false}
                            labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
                            label={(props) => {
                                const { x, y, name, varieties, textAnchor, fill, percent } = props;
                                if (percent < 0.015) return null;

                                const maxLineLength = 22;
                                const maxLines = 2;
                                let lines = [];
                                
                                if (varieties) {
                                    const words = varieties.split(', ');
                                    let currentLine = '';

                                    for (let i = 0; i < words.length; i++) {
                                        const word = words[i];
                                        if (currentLine.length + word.length + (currentLine.length > 0 ? 2 : 0) <= maxLineLength) {
                                            currentLine += (currentLine.length > 0 ? ', ' : '') + word;
                                        } else {
                                            if (currentLine.length > 0) {
                                                lines.push(currentLine);
                                            }
                                            currentLine = word;
                                        }
                                        
                                        if (lines.length >= maxLines) break;
                                    }
                                    
                                    if (currentLine.length > 0 && lines.length < maxLines) {
                                        lines.push(currentLine);
                                    }
                                    
                                    if (lines.length === maxLines && words.length > 0 && lines.join(', ').length < varieties.length) {
                                         lines[lines.length - 1] += '...';
                                    }
                                }

                                return (
                                    <g>
                                        <text x={x} y={y - 8} fill={fill} textAnchor={textAnchor} dominantBaseline="central" fontSize={12} fontWeight="bold">
                                            {name}
                                        </text>
                                        {lines.map((line, index) => (
                                            <text key={index} x={x} y={y + 8 + (index * 12)} fill="#64748b" textAnchor={textAnchor} dominantBaseline="central" fontSize={9}>
                                                {line}
                                            </text>
                                        ))}
                                    </g>
                                );
                            }}
                        >
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} stroke="transparent" />)}
                        </Pie>
                        <Tooltip content={<CustomTooltip unitVolLabel={unitVolLabel} />} />
                    </PieChart>
                </ResponsiveContainer>
            </div>
            <div className="flex-[2] flex flex-col justify-center space-y-3 pl-4 border-l border-slate-100">
                <h4 className="text-slate-800 font-bold border-b pb-3 mb-3 text-lg">{t('dist_vol')}</h4>
                {data.map(item => (
                    <div key={item.name} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
                        <div className="flex items-center">
                            <span className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{ backgroundColor: COLORS[item.name] }}></span>
                            <span className="text-slate-700 font-semibold">{item.name}</span>
                        </div>
                        <span className="font-bold text-slate-900 bg-white px-2 py-1 rounded shadow-sm border border-slate-100">
                            {formatNumber(item.value)} <span className="text-xs text-slate-400 font-normal">{unitVolLabel}</span>
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
