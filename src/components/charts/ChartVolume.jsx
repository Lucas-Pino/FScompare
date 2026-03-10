import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

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
                                return (
                                    <g>
                                        <text x={x} y={y - 8} fill={fill} textAnchor={textAnchor} dominantBaseline="central" fontSize={12} fontWeight="bold">
                                            {name}
                                        </text>
                                        <text x={x} y={y + 8} fill="#64748b" textAnchor={textAnchor} dominantBaseline="central" fontSize={10}>
                                            {varieties.length > 35 ? varieties.substring(0, 35) + '...' : varieties}
                                        </text>
                                    </g>
                                );
                            }}
                        >
                            {data.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[entry.name]} stroke="transparent" />)}
                        </Pie>
                        <Tooltip
                            formatter={(value, name, props) => {
                                const vars = props.payload.varieties;
                                const cajas = props.payload.cajas;
                                return [
                                    <div key={name}>
                                        <div className="font-black text-slate-800">
                                            {formatNumber(value)} {unitVolLabel} | <span className="text-blue-600 font-bold">{formatNumber(cajas)} Cjs</span>
                                        </div>
                                        {vars && <div className="text-[10px] text-slate-400 font-medium mt-0.5 leading-tight max-w-[200px]">{vars}</div>}
                                    </div>,
                                    <span className="font-bold text-slate-500">{name}</span>
                                ];
                            }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        />
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
