import React from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { Scale } from 'lucide-react';
import { formatUSD, formatRMB, formatNumber } from '../utils/formatters';
import { VALID_CLIENTS, COLORS } from '../utils/constants';

const VsRow = ({ label, valA, valB, formatFn }) => {
  const aWins = valA > valB;
  const bWins = valB > valA;
  return (
    <div className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-2 rounded-lg">
      <div className={`w-1/3 text-center text-lg md:text-xl font-bold ${aWins ? 'text-emerald-600' : 'text-slate-500'}`}>
        {formatFn(valA)}
        {aWins && <span className="ml-2 text-xs text-emerald-500">▲</span>}
      </div>
      <div className="w-1/3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest">{label}</div>
      <div className={`w-1/3 text-center text-lg md:text-xl font-bold ${bWins ? 'text-emerald-600' : 'text-slate-500'}`}>
        {bWins && <span className="mr-2 text-xs text-emerald-500">▲</span>}
        {formatFn(valB)}
      </div>
    </div>
  );
};

const HeadToHead = ({ clientA, setClientA, clientB, setClientB, chartDataH2H, statsA, statsB, unitPriceLabel, unitVolLabel, t }) => {
  const diffAvg = Math.abs(statsA.avgUSD - statsB.avgUSD);
  const diffTotal = Math.abs(statsA.totalUSD - statsB.totalUSD);
  const winnerAvg = statsA.avgUSD > statsB.avgUSD ? clientA : (statsB.avgUSD > statsA.avgUSD ? clientB : t('tie'));
  const winnerTotal = statsA.totalUSD > statsB.totalUSD ? clientA : (statsB.totalUSD > statsA.totalUSD ? clientB : t('tie'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner no-print">
        <div className="flex-1">
          <label className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[clientA]}}></span> Cliente A
          </label>
          <select value={clientA} onChange={e => setClientA(e.target.value)} className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-lg p-3">
            {VALID_CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col items-center justify-center px-4">
          <Scale className="w-8 h-8 text-slate-300 mb-1" />
          <span className="font-black text-slate-400 text-sm tracking-widest">VS</span>
        </div>
        <div className="flex-1">
          <label className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center justify-end">
            Cliente B <span className="w-3 h-3 rounded-full ml-2" style={{backgroundColor: COLORS[clientB]}}></span>
          </label>
          <select value={clientB} onChange={e => setClientB(e.target.value)} className="w-full bg-white border border-slate-300 text-slate-900 font-bold text-right rounded-lg p-3" dir="rtl">
            {VALID_CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h4 className="text-center font-bold text-slate-800 mb-6 uppercase tracking-wider text-sm border-b pb-4">{t('h2h_perf')}</h4>
        <div className="space-y-2">
          <VsRow label={`${t('vol_exp')} (${unitVolLabel})`} valA={statsA.displayVol} valB={statsB.displayVol} formatFn={formatNumber} />
          <VsRow label={`${t('tab_rmb')} (RMB/${unitPriceLabel})`} valA={statsA.avgRMB} valB={statsB.avgRMB} formatFn={formatRMB} />
          <VsRow label={`${t('tab_usd')} (USD/${unitPriceLabel})`} valA={statsA.avgUSD} valB={statsB.avgUSD} formatFn={formatUSD} />
          <VsRow label={t('h2h_diff_total')} valA={statsA.totalUSD} valB={statsB.totalUSD} formatFn={formatUSD} />
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl border border-blue-200 shadow-sm p-6">
        <h4 className="text-center font-black text-blue-900 mb-4 uppercase tracking-wider text-sm">{t('h2h_diff_exact')}</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-center">
            <p className="text-xs text-blue-500 font-bold uppercase mb-1">{t('h2h_diff_unit')} {unitPriceLabel} (USD)</p>
            <p className="text-3xl font-black text-blue-700">{formatUSD(diffAvg)}</p>
            <p className="text-sm font-semibold text-slate-500 mt-2">{t('h2h_favor')}: <span className="text-blue-600 font-bold uppercase">{winnerAvg}</span></p>
          </div>
          <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-center">
            <p className="text-xs text-blue-500 font-bold uppercase mb-1">{t('h2h_diff_total')}</p>
            <p className="text-3xl font-black text-blue-700">{formatUSD(diffTotal)}</p>
            <p className="text-sm font-semibold text-slate-500 mt-2">{t('h2h_favor')}: <span className="text-blue-600 font-bold uppercase">{winnerTotal}</span></p>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-4 text-center text-sm uppercase tracking-wider">{t('h2h_chart')}</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataH2H} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="Calibre" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis width={60} tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip
                formatter={(value, name, props) => {
                  const vars = props.payload._varieties?.[name];
                  return [formatUSD(value), `${name}${vars ? ` (${vars})` : ''}`];
                }}
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '8px', border: 'none'}}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey={clientA} fill={COLORS[clientA]} radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
              <Bar dataKey={clientB} fill={COLORS[clientB]} radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
        <h4 className="font-bold text-slate-800 mb-4 text-center text-sm uppercase tracking-wider">{t('h2h_vol_chart')}</h4>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartDataH2H} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="Calibre" axisLine={false} tickLine={false} tick={{fill: '#64748b'}} dy={10} />
              <YAxis width={60} tickFormatter={(val) => formatNumber(val)} axisLine={false} tickLine={false} tick={{fill: '#64748b'}} />
              <Tooltip
                formatter={(value, name, props) => {
                  const clientName = String(name).replace('_vol', '');
                  const vars = props.payload._varieties?.[clientName];
                  return [`${formatNumber(value)} ${unitVolLabel}`, `${clientName}${vars ? ` (${vars})` : ''}`];
                }}
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '8px', border: 'none'}}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
                formatter={(value) => String(value).replace('_vol', '')}
              />
              <Bar dataKey={`${clientA}_vol`} fill={COLORS[clientA]} radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
              <Bar dataKey={`${clientB}_vol`} fill={COLORS[clientB]} radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HeadToHead;
