import React from 'react';
import { Scale } from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
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

const HeadToHead = ({
    clientA, setClientA,
    selectedClientsB, setSelectedClientsB,
    chartDataH2H, statsA, statsB,
    unitPriceLabel, unitVolLabel, t
}) => {

  // Combine stats of all clients in B for the comparison rows
  const combinedStatsB = Object.values(statsB).reduce((acc, curr) => {
    acc.cajas += curr.cajas || 0;
    acc.kilos += curr.kilos || 0;
    acc.displayVol += curr.displayVol || 0;
    acc.totalUSD += curr.totalUSD || 0;
    // We'll calculate averages later using a weighted sum of RMB
    acc.totalRMB += (curr.avgRMB * (curr.kilos / 1)) || 0;
    return acc;
  }, { cajas: 0, kilos: 0, displayVol: 0, totalUSD: 0, totalRMB: 0 });

  const totalRawRMB_B = Object.values(statsB).reduce((acc, curr) => acc + (curr.totalRMB || 0), 0);
  const totalRawUSD_B = Object.values(statsB).reduce((acc, curr) => acc + (curr.totalUSD || 0), 0);
  const totalPricedKilos_B = Object.values(statsB).reduce((acc, curr) => acc + (curr.pricedKilos || 0), 0);

  // Use the ratio from statsA to determine the multiplier (Kilo vs Box Eq)
  const multiplier = (statsA.totalUSD !== 0 && statsA.pricedKilos !== 0) ? statsA.avgUSD / (statsA.totalUSD / statsA.pricedKilos) : 1;

  const avgRMB_B = totalPricedKilos_B > 0 ? (totalRawRMB_B / totalPricedKilos_B) * multiplier : 0;
  const avgUSD_B = totalPricedKilos_B > 0 ? (totalRawUSD_B / totalPricedKilos_B) * multiplier : 0;

  // Individual Exercise Results
  const individualResults = Object.entries(statsB).map(([name, stat]) => {
    const projUSD = stat.pricedKilos > 0 ? (stat.totalUSD / stat.pricedKilos) * statsA.kilos : 0;
    const diff = statsA.totalUSD - projUSD;
    return { name, projUSD, diff };
  });

  const bClients = selectedClientsB.length > 0 ? selectedClientsB : VALID_CLIENTS.filter(c => c !== clientA);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner no-print">
        <div className="flex-1">
          <label className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center">
            <span className="w-3 h-3 rounded-full mr-2" style={{backgroundColor: COLORS[clientA]}}></span> {t('h2h_principal_a')}
          </label>
          <select value={clientA} onChange={e => setClientA(e.target.value)} className="w-full bg-white border border-slate-300 text-slate-900 font-bold rounded-lg p-3">
            {VALID_CLIENTS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="flex flex-col items-center justify-center px-4">
          <Scale className="w-8 h-8 text-slate-300 mb-1" />
          <span className="font-black text-slate-400 text-sm tracking-widest">{t('h2h_vs')}</span>
        </div>
        <div className="flex-1">
          <label className="text-xs font-black text-slate-400 uppercase mb-2 flex items-center justify-end">
            {t('h2h_compare_b')} <span className="w-3 h-3 rounded-full ml-2" style={{backgroundColor: '#94a3b8'}}></span>
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
          <VsRow label={`${t('vol_exp')} (${unitVolLabel})`} valA={statsA.displayVol} valB={combinedStatsB.displayVol} formatFn={formatNumber} />
          <VsRow label={`${t('tab_rmb')} (RMB/${unitPriceLabel})`} valA={statsA.avgRMB} valB={avgRMB_B} formatFn={formatRMB} />
          <VsRow label={`${t('tab_usd')} (USD/${unitPriceLabel})`} valA={statsA.avgUSD} valB={avgUSD_B} formatFn={formatUSD} />
          <VsRow label={t('h2h_total_real')} valA={statsA.totalUSD} valB={combinedStatsB.totalUSD} formatFn={formatUSD} />
        </div>
      </div>

      <div className="bg-blue-50 rounded-2xl border border-blue-200 shadow-sm p-6">
        <h4 className="text-center font-black text-blue-900 mb-6 uppercase tracking-wider text-sm">{t('h2h_results')}</h4>

        <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 text-center mb-6">
          <p className="text-xs text-blue-500 font-bold uppercase mb-1">{t('h2h_total_real')} (USD)</p>
          <p className="text-3xl font-black text-blue-700">{formatUSD(statsA.totalUSD)}</p>
          <p className="text-sm font-semibold text-slate-500 mt-2">{clientA}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {individualResults.map((res, i) => {
            const pos = res.diff >= 0;
            return (
              <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-blue-100 relative overflow-hidden group">
                <div className={`absolute top-0 right-0 w-2 h-full ${pos ? 'bg-emerald-500' : 'bg-red-500'}`}></div>
                <div className="text-left">
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-3">vs {res.name}</p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">{t('h2h_adjusted')}</p>
                      <p className="text-xl font-bold text-slate-700">{formatUSD(res.projUSD)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-1">Diferencia</p>
                      <p className={`text-2xl font-black ${pos ? 'text-emerald-600' : 'text-red-600'}`}>
                        {pos ? '+' : ''}{formatUSD(res.diff)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
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
              <Bar dataKey={clientA} fill={COLORS[clientA]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              {bClients.map(client => (
                <Bar key={client} dataKey={client} fill={COLORS[client]} radius={[4, 4, 0, 0]} maxBarSize={40} />
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
              <Bar dataKey={`${clientA}_vol`} fill={COLORS[clientA]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              {bClients.map(client => (
                <Bar key={`${client}_vol`} dataKey={`${client}_vol`} fill={COLORS[client]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default HeadToHead;
