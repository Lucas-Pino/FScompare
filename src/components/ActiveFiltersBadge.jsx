import React from 'react';
import { Ship, Tag, Box } from 'lucide-react';

const ActiveFiltersBadge = ({ naves, vars, formats, t }) => {
  const nTxt = naves.length === 0 ? t('all') : naves.join(', ');
  const vTxt = vars.length === 0 ? t('all') : vars.join(', ');
  const fTxt = formats.length === 0 ? t('all_f') : formats.map(f => `${f} Kg`).join(', ');
  return (
    <div className="bg-white px-4 py-3 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-center text-xs text-slate-500 gap-x-4 gap-y-2 print:border-none print:px-0">
      <span className="font-bold text-slate-700 uppercase tracking-wider">{t('applied_filters')}:</span>
      <span className="flex items-center bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
        <Ship className="w-3.5 h-3.5 mr-1.5 text-blue-500"/> <span className="truncate max-w-[200px] font-semibold">{nTxt}</span>
      </span>
      <span className="flex items-center bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
        <Tag className="w-3.5 h-3.5 mr-1.5 text-emerald-500"/> <span className="truncate max-w-[200px] font-semibold">{vTxt}</span>
      </span>
      <span className="flex items-center bg-slate-50 px-2.5 py-1.5 rounded-md border border-slate-200">
        <Box className="w-3.5 h-3.5 mr-1.5 text-amber-500"/> <span className="truncate max-w-[200px] font-semibold">{fTxt}</span>
      </span>
    </div>
  );
};

export default ActiveFiltersBadge;
