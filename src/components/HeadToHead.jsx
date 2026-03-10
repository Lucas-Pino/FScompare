import React, { useState } from 'react';
import { ResponsiveContainer, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, Bar } from 'recharts';
import { Scale } from 'lucide-react';
import { formatUSD, formatRMB, formatNumber } from '../utils/formatters';
import { VALID_CLIENTS, COLORS } from '../utils/constants';
import MultiSelect from './MultiSelect';

const ComparisonCard = ({ clientA, clientB, statsA, statsB, compMode, t }) => {
  const diffAvg = statsA.avgUSD - statsB.avgUSD;
  const absDiffAvg = Math.abs(diffAvg);

  const minVol = Math.min(statsA.displayVol, statsB.displayVol);
  const adjustedDiffTotal = diffAvg * minVol;
  const currentDiffTotal = compMode === 'real' ? (diffAvg * statsB.displayVol) : adjustedDiffTotal;
  const absDiffTotal = Math.abs(currentDiffTotal);

  const isTie = absDiffAvg < 0.0001;
  const winner = isTie ? t('tie') : (diffAvg > 0 ? clientA : clientB);
  const color = isTie ? '#64748b' : (diffAvg > 0 ? COLORS[clientA] : COLORS[clientB]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
      <div className="bg-slate-50 border-b border-slate-100 p-3 flex justify-center items-center space-x-3">
        <span className="font-bold text-blue-600 text-xs">{clientA}</span>
        <span className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">VS</span>
        <span className="font-bold text-xs" style={{ color: COLORS[clientB] }}>{clientB}</span>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-center space-y-6">
        <div className="text-center">
          <p className="text-[10px] text-blue-500 font-bold uppercase mb-2 leading-tight tracking-wider">
            {t('h2h_diff_unit')}
          </p>
          <p className="text-3xl font-black text-slate-800 mb-1">{formatUSD(absDiffAvg)}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            {t('h2h_favor')}: <span className="font-black" style={{ color }}>{winner}</span>
          </p>
        </div>

        <div className="text-center border-t border-slate-100 pt-5">
          <p className="text-[10px] text-blue-500 font-bold uppercase mb-2 leading-tight tracking-wider">
            {t('h2h_diff_total')}
          </p>
          <p className="text-3xl font-black text-slate-800 mb-1">{formatUSD(absDiffTotal)}</p>
          <p className="text-[10px] font-bold text-slate-500 uppercase">
            {t('h2h_favor')}: <span className="font-black" style={{ color }}>{winner}</span>
          </p>
          <p className="text-[9px] text-slate-400 mt-2 font-medium">
            Vol: {formatNumber(statsB.displayVol)} {t('box_eq')}
          </p>
        </div>
      </div>
    </div>
  );
};

const HeadToHead = ({ clientA, setClientA, selectedClientsB, setSelectedClientsB, chartDataH2H, statsA, statsB, unitPriceLabel, unitVolLabel, t }) => {
  const [compMode, setCompMode] = useState('adjusted');

  const clientsB = Object.keys(statsB);
  const colorB = clientsB.length === 1 ? COLORS[clientsB[0]] : '#64748b';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner no-print">
        <div className="flex-1">
          <label className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[clientA]}}></span> {t('h2h_principal_a')}
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
            {t('h2h_compare_b')} <span className="w-3 h-3 rounded-full ml-2" style={{backgroundColor: colorB}}></span>
          </label>
          <MultiSelect
            options={VALID_CLIENTS.filter(c => c !== clientA)}
            selected={selectedClientsB}
            onChange={setSelectedClientsB}
            t={t}
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
        <h4 className="text-center font-bold text-slate-800 mb-6 uppercase tracking-wider text-sm border-b pb-4">{t('h2h_perf')}</h4>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-slate-400 text-[10px] uppercase tracking-widest border-b border-slate-100">
              <th className="py-4 text-left font-bold">{t('h2h_metric')}</th>
              <th className="py-4 text-center font-black" style={{ color: COLORS[clientA] }}>{clientA}</th>
              {clientsB.map(c => (
                <th key={c} className="py-4 text-center font-black" style={{ color: COLORS[c] }}>{c}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            <tr>
              <td className="py-4 font-bold text-slate-500 uppercase text-[10px]">{t('vol_exp')} ({unitVolLabel})</td>
              <td className="py-4 text-center font-black text-blue-600 text-base">{formatNumber(statsA.displayVol)}</td>
              {clientsB.map(c => (
                <td key={c} className="py-4 text-center font-bold text-slate-700">{formatNumber(statsB[c].displayVol)}</td>
              ))}
            </tr>
            <tr>
              <td className="py-4 font-bold text-slate-500 uppercase text-[10px]">💰 {t('tab_rmb')} (RMB/{unitPriceLabel})</td>
              <td className="py-4 text-center font-black text-blue-600 text-base">{formatRMB(statsA.avgRMB)}</td>
              {clientsB.map(c => (
                <td key={c} className="py-4 text-center font-bold text-slate-700">{formatRMB(statsB[c].avgRMB)}</td>
              ))}
            </tr>
            <tr>
              <td className="py-4 font-bold text-slate-500 uppercase text-[10px]">🚢 {t('tab_usd')} (USD/{unitPriceLabel})</td>
              <td className="py-4 text-center font-black text-blue-600 text-base">{formatUSD(statsA.avgUSD)}</td>
              {clientsB.map(c => (
                <td key={c} className="py-4 text-center font-bold text-slate-700">{formatUSD(statsB[c].avgUSD)}</td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-inner p-6">
        <h4 className="text-center font-black text-slate-800 mb-4 uppercase tracking-wider text-sm">{t('h2h_results')}</h4>

        <div className="flex flex-col items-center mb-6 no-print">
          <div className="inline-flex bg-white p-1 rounded-xl border border-slate-200 shadow-sm mb-2">
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
          <p className="text-[10px] italic text-blue-600 font-medium">
            {compMode === 'adjusted' ? t('h2h_adjusted_help') : t('h2h_real_help')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clientsB.map(c => (
            <ComparisonCard
              key={c}
              clientA={clientA}
              clientB={c}
              statsA={statsA}
              statsB={statsB[c]}
              compMode={compMode}
              t={t}
            />
          ))}
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
                  const vol = props.payload[`${name}_vol`];
                  const priceStr = formatUSD(value);
                  const volStr = vol !== undefined ? `${formatNumber(vol)} ${unitVolLabel}` : '';
                  return [`${priceStr}${volStr ? ` | ${volStr}` : ''}`, `${name}${vars ? ` (${vars})` : ''}`];
                }}
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '8px', border: 'none'}}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey={clientA} name={clientA} fill={COLORS[clientA]} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
              {clientsB.map(c => (
                <Bar key={c} dataKey={c} name={c} fill={COLORS[c]} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
              ))}
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
                  const vars = props.payload._varieties?.[name];
                  const price = props.payload[name];
                  const volStr = `${formatNumber(value)} ${unitVolLabel}`;
                  const priceStr = price !== undefined ? formatUSD(price) : '';
                  return [`${volStr}${priceStr ? ` | ${priceStr}` : ''}`, `${name}${vars ? ` (${vars})` : ''}`];
                }}
                cursor={{fill: '#f1f5f9'}}
                contentStyle={{borderRadius: '8px', border: 'none'}}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} iconType="circle" />
              <Bar dataKey={`${clientA}_vol`} name={clientA} fill={COLORS[clientA]} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
              {clientsB.map(c => (
                <Bar key={c} dataKey={`${c}_vol`} name={c} fill={COLORS[c]} radius={[4, 4, 0, 0]} maxBarSize={40} isAnimationActive={false} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HeadToHead;
