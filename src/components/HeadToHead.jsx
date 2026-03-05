import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { Scale } from 'lucide-react';
import { formatUSD, formatRMB, formatNumber } from '../utils/formatters';
import { VALID_CLIENTS, COLORS } from '../utils/constants';
import MultiSelect from './MultiSelect';

const VsRow = ({ label, valA, valB, formatFn }) => {
  const aWins = valA > valB;
  const bWins = valB > valA;
  return (
    <div className="flex justify-between items-center py-4 border-b border-slate-100 last:border-0 hover:bg-slate-50 transition-colors px-2 rounded-lg">
      <div className={`w-1/3 text-center text-lg md:text-xl font-bold ${aWins ? 'text-emerald-600' : 'text-slate-500'}`}>
        {formatFn(valA)}
        {aWins && <span className="ml-2 text-xs text-emerald-500">▲</span>}
      </div>
      <div className="w-1/3 text-center text-xs font-bold text-slate-400 uppercase tracking-widest leading-tight">{label}</div>
      <div className={`w-1/3 text-center text-lg md:text-xl font-bold ${bWins ? 'text-emerald-600' : 'text-slate-500'}`}>
        {bWins && <span className="mr-2 text-xs text-emerald-500">▲</span>}
        {formatFn(valB)}
      </div>
    </div>
  );
};

const HeadToHead = ({ clientA, setClientA, selectedClientsB, setSelectedClientsB, chartDataH2H, statsA, statsB, unitPriceLabel, unitVolLabel, t }) => {
  const [compMode, setCompMode] = useState('real'); // 'real' | 'adjusted'

  const isMultiB = selectedClientsB.length > 1;
  const labelB = isMultiB ? (selectedClientsB.length === 0 ? t('all') : `${selectedClientsB.length} ${t('selected_items')}`) : (selectedClientsB.length === 0 ? t('all') : selectedClientsB[0]);
  const colorB = isMultiB || selectedClientsB.length === 0 ? '#64748b' : COLORS[selectedClientsB[0]];

  const diffAvg = statsA.avgUSD - statsB.avgUSD;
  const absDiffAvg = Math.abs(diffAvg);

  const minVol = Math.min(statsA.displayVol, statsB.displayVol);
  const adjustedDiffTotal = diffAvg * minVol;
  const realDiffTotal = statsA.totalUSD - statsB.totalUSD;

  const currentDiffTotal = compMode === 'real' ? realDiffTotal : adjustedDiffTotal;
  const absDiffTotal = Math.abs(currentDiffTotal);

  const winnerAvg = diffAvg > 0 ? clientA : (diffAvg < 0 ? labelB : t('tie'));
  const winnerTotal = currentDiffTotal > 0 ? clientA : (currentDiffTotal < 0 ? labelB : t('tie'));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner no-print">
        <div className="flex-1">
          <label className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[clientA]}}></span> Principal (A)
          </label>
          <select value={clientA} onChange={e => setClientA(e.target.value)} className="w-full bg-white border border-slate-200 text-slate-800 text-sm font-bold rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-blue-500">
            {VALID_CLIENTS.map(c => <option key={c} value={c} disabled={selectedClientsB.includes(c)}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col items-center justify-center px-4">
          <Scale className="w-8 h-8 text-slate-300 mb-1" />
          <span className="font-black text-slate-400 text-[10px] tracking-widest">VS</span>
        </div>
        <div className="flex-1">
          <label className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center justify-end">
            Comparar con (B) <span className="w-3 h-3 rounded-full ml-2" style={{backgroundColor: colorB}}></span>
          </label>
          <MultiSelect
            options={VALID_CLIENTS.filter(c => c !== clientA)}
            selected={selectedClientsB}
            onChange={setSelectedClientsB}
            t={t}
          />
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

        <div className="flex justify-center mb-6 no-print">
          <div className="inline-flex bg-white p-1 rounded-xl border border-blue-100 shadow-sm">
            <button
              onClick={() => setCompMode('real')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${compMode === 'real' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600'}`}
            >
              {t('h2h_total_real')}
            </button>
            <button
              onClick={() => setCompMode('adjusted')}
              className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors ${compMode === 'adjusted' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-400 hover:text-blue-600'}`}
            >
              {t('h2h_adjusted')}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 text-center flex flex-col justify-center">
            <p className="text-[10px] md:text-xs text-blue-500 font-bold uppercase mb-2 leading-tight">
              {t('h2h_diff_unit')} {unitPriceLabel} (USD)
            </p>
            <p className="text-3xl md:text-4xl font-black text-blue-700 mb-2">{formatUSD(absDiffAvg)}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t('h2h_favor')}: <span className="font-black" style={{color: diffAvg > 0 ? COLORS[clientA] : colorB}}>{winnerAvg}</span>
            </p>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-blue-100 text-center flex flex-col justify-center">
            <p className="text-[10px] md:text-xs text-blue-500 font-bold uppercase mb-2 leading-tight">
              {t('h2h_diff_total')}
            </p>
            <p className="text-3xl md:text-4xl font-black text-blue-700 mb-2">{formatUSD(absDiffTotal)}</p>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              {t('h2h_favor')}: <span className="font-black" style={{color: currentDiffTotal > 0 ? COLORS[clientA] : colorB}}>{winnerTotal}</span>
            </p>
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
                  const displayName = name === 'sideA' ? clientA : labelB;
                  return [formatUSD(value), `${displayName}${vars ? ` (${vars})` : ''}`];
                }}
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '8px', border: 'none'}}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle"
                formatter={(value) => value === 'sideA' ? clientA : labelB}
              />
              <Bar dataKey="sideA" name="sideA" fill={COLORS[clientA]} radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
              <Bar dataKey="sideB" name="sideB" fill={colorB} radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
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
                  const side = String(name).replace('_vol', '');
                  const displayName = side === 'sideA' ? clientA : labelB;
                  const vars = props.payload._varieties?.[side];
                  return [`${formatNumber(value)} ${unitVolLabel}`, `${displayName}${vars ? ` (${vars})` : ''}`];
                }}
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '8px', border: 'none'}}
              />
              <Legend
                wrapperStyle={{ paddingTop: '10px' }}
                iconType="circle"
                formatter={(value) => value === 'sideA_vol' ? clientA : labelB}
              />
              <Bar dataKey="sideA_vol" name="sideA_vol" fill={COLORS[clientA]} radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
              <Bar dataKey="sideB_vol" name="sideB_vol" fill={colorB} radius={[4, 4, 0, 0]} maxBarSize={50} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HeadToHead;
