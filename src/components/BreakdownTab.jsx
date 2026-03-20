import React, { useMemo } from 'react';
import { User, AlertCircle, ArrowUpRight, ArrowDownRight, Box, DollarSign, TrendingUp, TrendingDown, Package, PieChart } from 'lucide-react';
import { formatUSD, formatRMB, formatNumber, formatPercent } from '../utils/formatters';

const BreakdownTab = ({ client, setClient, filteredData, marketDict, priceMultiplier, volDivider, unitPriceLabel, unitVolLabel, t, clients }) => {
  const clientData = useMemo(() => filteredData.filter(d => d.Cliente === client), [filteredData, client]);

  const stats = useMemo(() => {
    const s = { cajas: 0, kilos: 0, pricedKilos: 0, pricedCajas: 0, vtaRMB: 0, fobUSD: 0, fobRMB: 0, comis: 0, flete: 0, vat: 0, otros: 0 };
    clientData.forEach(d => {
      s.cajas += d.Cajas; s.kilos += d.Kilos;
      s.pricedCajas += d.pricedCajas; s.pricedKilos += d.pricedKilos;
      s.vtaRMB += d.RMB; s.fobUSD += d.USD;
      s.comis += d.Comis; s.flete += d.Flete; s.vat += d.Vat; s.otros += d.Otros;
      s.fobRMB += (d.FinalRMB || (d.RMB - (d.Comis + d.Flete + d.Vat + d.Otros)));
    });
    return s;
  }, [clientData]);

  const contDict = useMemo(() => {
    const dict = {};
    clientData.forEach(d => {
      const c = d.Contenedor || 'S/N';
      if (!dict[c]) dict[c] = {
        id: c, Nave: d.Nave, Fecha: d.Fecha, Formatos: new Set(),
        Cajas: 0, Kilos: 0, pricedKilos: 0, RMB: 0, USD: 0, expectedRMB: 0,
        productores: new Set()
      };
      dict[c].Cajas += d.Cajas;
      dict[c].Kilos += d.Kilos;
      dict[c].pricedKilos += d.pricedKilos;
      dict[c].RMB += d.RMB;
      dict[c].USD += d.USD;
      dict[c].productores.add(d.Productor);
      dict[c].Formatos.add(`${d.PesoNeto}Kg`);

      const mKey = `${d.Nave}|${d.Variedad}|${d.Calibre}|${d.PesoNeto}`;
      const mAvg = (marketDict[mKey] && marketDict[mKey].kilos > 0) ? (marketDict[mKey].rmb / marketDict[mKey].kilos) : 0;
      dict[c].expectedRMB += (d.pricedKilos * mAvg);
    });
    return Object.values(dict).sort((a,b) => b.Kilos - a.Kilos);
  }, [clientData, marketDict]);

  if (clientData.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200">
          <User className="w-5 h-5 text-slate-400" />
          <select value={client} onChange={e => setClient(e.target.value)} className="bg-white border border-slate-300 text-slate-900 font-bold rounded-lg p-2 flex-1">
            {clients.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="py-12 text-center text-slate-400"><AlertCircle className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{t('no_data')}</p></div>
      </div>
    );
  }

  const costTotal = stats.comis + stats.flete + stats.vat + stats.otros;
  const displayVol = stats.kilos / volDivider;
  const avgRmb = stats.pricedKilos > 0 ? (stats.vtaRMB / stats.pricedKilos) * priceMultiplier : 0;
  const avgUsd = stats.pricedKilos > 0 ? (stats.fobUSD / stats.pricedKilos) * priceMultiplier : 0;
  const avgRmbFob = stats.pricedKilos > 0 ? (stats.fobRMB / stats.pricedKilos) * priceMultiplier : 0;

  return (
    <div className="space-y-6 print:space-y-4">
      <div className="flex items-center space-x-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner no-print">
        <label className="text-xs font-black text-slate-500 uppercase flex items-center">
          <User className="w-4 h-4 mr-2" /> {t('breakdown_analyze')}
        </label>
        <select value={client} onChange={e => setClient(e.target.value)} className="bg-white border border-slate-300 text-slate-900 font-bold rounded-lg p-3 max-w-xs shadow-sm">
          {clients.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {stats.kilos > stats.pricedKilos && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl flex items-center shadow-sm">
          <AlertCircle className="w-6 h-6 mr-3 text-amber-600 flex-shrink-0" />
          <div className="text-sm">
            Hay <b>{formatNumber((stats.kilos - stats.pricedKilos) / volDivider)} {unitVolLabel}</b> {t('breakdown_alert')}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('vol_exp')}</p>
          <p className="text-xl font-black text-slate-800">{formatNumber(displayVol)} <span className="text-sm font-normal">{unitVolLabel}</span></p>
          <p className="text-xs text-slate-500">{formatNumber(stats.cajas)} {t('phys_boxes')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('gross_sale_total')}</p>
          <p className="text-xl font-black text-amber-600">{formatRMB(stats.vtaRMB)}</p>
          <p className="text-xs text-slate-500">{t('prom')}: {formatRMB(avgRmb)}/{unitPriceLabel}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('dest_cost')}</p>
          <p className="text-xl font-black text-red-500">-{formatRMB(costTotal)}</p>
          <p className="text-xs text-slate-500">{stats.vtaRMB > 0 ? formatPercent(costTotal/stats.vtaRMB) : '0%'} {t('pct_sale')}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
          <p className="text-xs font-bold text-slate-400 uppercase mb-1">{t('fob_gen')}</p>
          <p className="text-xl font-black text-emerald-600">{formatUSD(stats.fobUSD)}</p>
          <p className="text-xs font-bold text-slate-400">{formatRMB(stats.fobRMB)}</p>
          <p className="text-[10px] text-slate-400 mt-1">{t('prom')}: {formatUSD(avgUsd)}/{unitPriceLabel} ({formatRMB(avgRmbFob)})</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-2xl border border-slate-200 shadow-sm p-6 print:p-2">
        <h4 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-4 border-b pb-2">{t('cost_breakdown')}</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 print:grid-cols-4 gap-4">
          {[
            { label: t('comissions'), val: stats.comis, color: 'text-violet-600' },
            { label: t('freight'), val: stats.flete, color: 'text-blue-600' },
            { label: t('vat'), val: stats.vat, color: 'text-orange-600' },
            { label: t('others'), val: stats.otros, color: 'text-slate-600' }
          ].map((c, i) => (
            <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-slate-100 flex flex-col items-center">
              <span className="text-xs font-bold text-slate-400 uppercase">{c.label}</span>
              <span className={`text-lg font-black ${c.color}`}>{formatRMB(c.val)}</span>
              <span className="text-xs text-slate-500">{stats.vtaRMB > 0 ? formatPercent(c.val/stats.vtaRMB) : '0%'} {t('prom')}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-slate-800 text-white flex justify-between items-center">
          <h4 className="text-sm font-bold uppercase tracking-wider">{t('perf_vs_market')}</h4>
        </div>
        <div className="overflow-x-auto max-h-[500px] print:max-h-none">
          <table className="min-w-full text-sm text-left text-slate-600">
            <thead className="text-xs text-slate-500 uppercase bg-slate-50 sticky top-0 z-10 shadow-sm">
              <tr>
                <th className="px-4 py-3">{t('cont')}</th>
                <th className="px-4 py-3">{t('date')}</th>
                <th className="px-4 py-3">{t('format')}</th>
                <th className="px-4 py-3 text-right">{unitVolLabel} <br/><span className="text-[10px] text-slate-400">({t('phys_boxes')})</span></th>
                <th className="px-4 py-3">{t('producers')}</th>
                <th className="px-4 py-3 text-right">{t('sale')}<br/><span className="text-[10px] text-slate-400">(RMB/{unitPriceLabel})</span></th>
                <th className="px-4 py-3 text-right">{t('market')}<br/><span className="text-[10px] text-slate-400">(RMB/{unitPriceLabel})</span></th>
                <th className="px-4 py-3 text-right">{t('diff')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {contDict.map((c, i) => {
                const hasPrice = c.pricedKilos > 0;
                const cAvgRmb = hasPrice ? (c.RMB / c.pricedKilos) * priceMultiplier : 0;
                const cMktRmb = hasPrice ? (c.expectedRMB / c.pricedKilos) * priceMultiplier : 0;
                const diff = cAvgRmb - cMktRmb;
                const diffPct = cMktRmb > 0 ? (diff / cMktRmb) : 0;
                const isPositive = diff >= 0;

                return (
                  <tr key={i} className="hover:bg-slate-50 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-800 whitespace-nowrap">{c.id}</td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <div className="font-medium text-slate-700">{c.Nave}</div>
                      <div className="text-xs text-slate-400">{c.Fecha}</div>
                    </td>
                    <td className="px-4 py-3 text-xs font-medium text-slate-500">
                      {Array.from(c.Formatos).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="font-bold text-slate-700">{formatNumber(c.Kilos / volDivider)}</div>
                      <div className="text-xs text-slate-400">({formatNumber(c.Cajas)} cjs)</div>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500 max-w-[200px] truncate" title={Array.from(c.productores).join(', ')}>
                      {Array.from(c.productores).join(', ')}
                    </td>
                    <td className="px-4 py-3 text-right font-bold text-amber-600 whitespace-nowrap">
                      {hasPrice ? formatRMB(cAvgRmb) : <span className="text-xs text-slate-400 font-medium">{t('to_be_priced')}</span>}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-slate-500 whitespace-nowrap">
                      {hasPrice ? formatRMB(cMktRmb) : '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-bold whitespace-nowrap">
                      {hasPrice ? (
                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs ${isPositive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {isPositive ? <ArrowUpRight className="w-3 h-3 mr-1" /> : <ArrowDownRight className="w-3 h-3 mr-1" />}
                          {formatRMB(Math.abs(diff))} ({formatPercent(Math.abs(diffPct))})
                        </span>
                      ) : '-'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default BreakdownTab;
