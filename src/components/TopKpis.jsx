import React from 'react';
import { Award, Trophy, DollarSign } from 'lucide-react';
import { formatRMB, formatUSD } from '../utils/formatters';

const TopKpis = ({ winnerRMB, winnerUSD, unitPriceLabel, t }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 p-5 rounded-2xl shadow-sm flex items-center relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10"><Award className="w-32 h-32 text-amber-500" /></div>
      <div className="bg-amber-100 p-3 rounded-xl mr-5 z-10"><Trophy className="w-8 h-8 text-amber-600" /></div>
      <div className="z-10">
        <p className="text-xs font-bold text-amber-600 uppercase tracking-wider mb-1">{t('best_gross')} ({unitPriceLabel})</p>
        <p className="text-xl font-extrabold text-slate-800 mb-0.5">{winnerRMB?.name || 'N/A'}</p>
        <p className="text-sm font-medium text-slate-600">{t('weighted_global')}: <span className="font-bold text-amber-700">{formatRMB(winnerRMB?.val || 0)}</span></p>
      </div>
    </div>
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200 p-5 rounded-2xl shadow-sm flex items-center relative overflow-hidden">
      <div className="absolute -right-4 -top-4 opacity-10"><DollarSign className="w-32 h-32 text-emerald-500" /></div>
      <div className="bg-emerald-100 p-3 rounded-xl mr-5 z-10"><Award className="w-8 h-8 text-emerald-600" /></div>
      <div className="z-10">
        <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">{t('best_fob')} ({unitPriceLabel})</p>
        <p className="text-xl font-extrabold text-slate-800 mb-0.5">{winnerUSD?.name || 'N/A'}</p>
        <p className="text-sm font-medium text-slate-600">{t('weighted_global')}: <span className="font-bold text-emerald-700">{formatUSD(winnerUSD?.val || 0)}</span></p>
      </div>
    </div>
  </div>
);

export default TopKpis;
