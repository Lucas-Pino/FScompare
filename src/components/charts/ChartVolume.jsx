import React from 'react';
import VisxPieChart from './VisxPieChart';
import { formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

export default function ChartVolume({ data, unitVolLabel, t }) {
  return (
    <div className="flex flex-col md:flex-row h-full min-h-[450px]">
      <div className="flex-[3] relative">
        <VisxPieChart
          data={data}
          unitLabel={unitVolLabel}
        />
      </div>
      <div className="flex-[2] flex flex-col justify-center space-y-3 pl-4 border-l border-slate-100">
        <h4 className="text-slate-800 font-bold border-b pb-3 mb-3 text-lg">{t('dist_vol')}</h4>
        {data.map(item => (
          <div key={item.name} className="flex justify-between items-center text-sm p-2 hover:bg-slate-50 rounded-lg transition-colors">
            <div className="flex items-center">
              <span className="w-4 h-4 rounded-full mr-3 shadow-sm" style={{backgroundColor: COLORS[item.name]}}></span>
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
