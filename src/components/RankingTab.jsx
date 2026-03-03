import React, { useState, useMemo } from 'react';
import { Trophy, Medal, AlertCircle } from 'lucide-react';
import { formatUSD, formatRMB, formatNumber, formatPercent } from '../utils/formatters';
import { COLORS } from '../utils/constants';

const RankingTab = ({ filteredData, marketDict, priceMultiplier, volDivider, unitPriceLabel, unitVolLabel, t }) => {
  const [sortBy, setSortBy] = useState('market');

  const rankingData = useMemo(() => {
    const clients = {};
    filteredData.forEach(d => {
      if (!clients[d.Cliente]) {
        clients[d.Cliente] = { name: d.Cliente, cajas: 0, kilos: 0, pricedKilos: 0, rmb: 0, usd: 0, expectedUsd: 0 };
      }
      clients[d.Cliente].cajas += d.Cajas;
      clients[d.Cliente].kilos += d.Kilos;
      clients[d.Cliente].pricedKilos += d.pricedKilos;
      clients[d.Cliente].rmb += d.RMB;
      clients[d.Cliente].usd += d.USD;

      const mKey = `${d.Nave}|${d.Variedad}|${d.Calibre}|${d.PesoNeto}`;
      const mAvgUsd = (marketDict[mKey] && marketDict[mKey].kilos > 0) ? (marketDict[mKey].usd / marketDict[mKey].kilos) : 0;
      clients[d.Cliente].expectedUsd += (d.pricedKilos * mAvgUsd);
    });

    return Object.values(clients).map(c => {
      const hasPrice = c.pricedKilos > 0;
      const avgUsd = hasPrice ? (c.usd / c.pricedKilos) * priceMultiplier : 0;
      const avgRmb = hasPrice ? (c.rmb / c.pricedKilos) * priceMultiplier : 0;
      const displayVol = c.kilos / volDivider;

      const diffUsd = c.usd - c.expectedUsd;
      const perfPct = c.expectedUsd > 0 ? (diffUsd / c.expectedUsd) : 0;

      return { ...c, avgUsd, avgRmb, displayVol, perfPct, diffUsd, hasPrice };
    }).filter(c => c.kilos > 0).sort((a, b) => {
      if (sortBy === 'market') return b.perfPct - a.perfPct;
      if (sortBy === 'usd') return b.avgUsd - a.avgUsd;
      if (sortBy === 'rmb') return b.avgRmb - a.avgRmb;
      return b.displayVol - a.displayVol; // vol
    });
  }, [filteredData, marketDict, sortBy, priceMultiplier, volDivider]);

  if (rankingData.length === 0) return null;

  const top3 = rankingData.slice(0, 3);
  const rest = rankingData.slice(3);

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center">
            <Medal className="w-5 h-5 mr-2 text-amber-500" /> {t('tab_ranking')}
          </h3>
          <div className="mt-4 md:mt-0 no-print">
            <label className="text-xs font-semibold text-slate-500 uppercase mr-3">{t('rank_by')}</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="bg-slate-50 border border-slate-200 text-slate-800 text-sm font-bold rounded-lg p-2 outline-none focus:ring-2 focus:ring-blue-500">
              <option value="market">{t('rank_market')}</option>
              <option value="usd">{t('rank_usd')} ({unitPriceLabel})</option>
              <option value="rmb">{t('rank_rmb')} ({unitPriceLabel})</option>
              <option value="vol">{t('rank_vol')} ({unitVolLabel})</option>
            </select>
          </div>
        </div>

        {sortBy === 'market' && (
          <div className="mb-8 p-4 bg-blue-50 text-blue-800 text-sm rounded-xl border border-blue-100 flex items-start">
            <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5 text-blue-600" />
            <p>{t('rank_alert')}</p>
          </div>
        )}

        {/* PODIUM */}
        <div className="flex flex-col md:flex-row justify-center items-end gap-4 mt-12 mb-16 h-48 px-4">
          {/* Segundo Lugar */}
          {top3[1] && (
            <div className="flex-1 max-w-[200px] flex flex-col items-center group relative">
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs p-2 rounded-lg z-10 whitespace-nowrap">
                FOB: {formatUSD(top3[1].avgUsd)} | Vol: {formatNumber(top3[1].displayVol)}
              </div>
              <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center mb-2 shadow-inner border-2 border-slate-300 z-10 text-slate-500 font-bold text-xl">2</div>
              <div className="w-full bg-slate-100 rounded-t-lg border-t-4 border-slate-300 pt-4 pb-2 px-2 text-center h-24 flex flex-col justify-start relative shadow-sm">
                <span className="font-black text-slate-700 truncate w-full text-sm" style={{color: COLORS[top3[1].name]}}>{top3[1].name}</span>
                <span className="font-bold text-slate-600 mt-1">
                  {sortBy === 'market' ? formatPercent(top3[1].perfPct) : sortBy === 'usd' ? formatUSD(top3[1].avgUsd) : sortBy === 'rmb' ? formatRMB(top3[1].avgRmb) : formatNumber(top3[1].displayVol)}
                </span>
              </div>
            </div>
          )}

          {/* Primer Lugar */}
          {top3[0] && (
            <div className="flex-1 max-w-[220px] flex flex-col items-center group relative">
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs p-2 rounded-lg z-10 whitespace-nowrap">
                FOB: {formatUSD(top3[0].avgUsd)} | Vol: {formatNumber(top3[0].displayVol)}
              </div>
              <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-2 shadow-md border-4 border-amber-300 z-10 text-amber-600">
                <Trophy className="w-8 h-8" />
              </div>
              <div className="w-full bg-gradient-to-t from-amber-50 to-white rounded-t-lg border-t-4 border-amber-400 pt-4 pb-2 px-2 text-center h-32 flex flex-col justify-start relative shadow-md">
                <span className="font-black truncate w-full text-base" style={{color: COLORS[top3[0].name]}}>{top3[0].name}</span>
                <span className="font-black text-amber-600 text-lg mt-1">
                  {sortBy === 'market' ? formatPercent(top3[0].perfPct) : sortBy === 'usd' ? formatUSD(top3[0].avgUsd) : sortBy === 'rmb' ? formatRMB(top3[0].avgRmb) : formatNumber(top3[0].displayVol)}
                </span>
              </div>
            </div>
          )}

          {/* Tercer Lugar */}
          {top3[2] && (
            <div className="flex-1 max-w-[200px] flex flex-col items-center group relative">
              <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-opacity bg-slate-800 text-white text-xs p-2 rounded-lg z-10 whitespace-nowrap">
                FOB: {formatUSD(top3[2].avgUsd)} | Vol: {formatNumber(top3[2].displayVol)}
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mb-2 shadow-inner border-2 border-orange-300 z-10 text-orange-700 font-bold text-xl">3</div>
              <div className="w-full bg-slate-50 rounded-t-lg border-t-4 border-orange-300 pt-4 pb-2 px-2 text-center h-20 flex flex-col justify-start relative shadow-sm">
                <span className="font-black text-slate-700 truncate w-full text-sm" style={{color: COLORS[top3[2].name]}}>{top3[2].name}</span>
                <span className="font-bold text-slate-600 mt-1">
                  {sortBy === 'market' ? formatPercent(top3[2].perfPct) : sortBy === 'usd' ? formatUSD(top3[2].avgUsd) : sortBy === 'rmb' ? formatRMB(top3[2].avgRmb) : formatNumber(top3[2].displayVol)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* LISTA DE LOS DEMÁS */}
        {rest.length > 0 && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">{t('rest_ranking')}</h4>
            <div className="space-y-2">
              {rest.map((c, i) => (
                <div key={c.name} className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
                  <div className="flex items-center space-x-4">
                    <span className="text-slate-400 font-bold w-6 text-right">{i + 4}.</span>
                    <span className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[c.name]}}></span>
                    <span className="font-bold text-slate-700 w-32 truncate">{c.name}</span>
                  </div>
                  <div className="flex flex-1 justify-end space-x-8 text-sm">
                    <div className="text-right hidden sm:block">
                      <p className="text-slate-400 text-xs">{t('rank_vol')}</p>
                      <p className="font-semibold text-slate-700">{formatNumber(c.displayVol)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-slate-400 text-xs">{t('tab_usd')}</p>
                      <p className="font-semibold text-slate-700">{c.hasPrice ? formatUSD(c.avgUsd) : '-'}</p>
                    </div>
                    <div className="text-right w-24">
                      <p className="text-slate-400 text-xs">Rendimiento</p>
                      {c.hasPrice ? (
                        <p className={`font-bold ${c.perfPct >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                          {c.perfPct > 0 ? '+' : ''}{formatPercent(c.perfPct)}
                        </p>
                      ) : <p className="text-slate-400">-</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RankingTab;
