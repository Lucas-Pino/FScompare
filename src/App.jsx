import React, { useState, useMemo, useEffect } from 'react';
import { Package } from 'lucide-react';
import { VALID_CLIENTS, COLORS, DICT } from './utils/constants';
import { parseNum, parseCSV } from './utils/formatters';

import UploadScreen from './components/UploadScreen';
import Header from './components/layout/Header';
import FilterSidebar from './components/layout/FilterSidebar';
import TopKpis from './components/TopKpis';
import PrintStyles from './components/PrintStyles';
import ActiveFiltersBadge from './components/ActiveFiltersBadge';

import ChartUSD from './components/charts/ChartUSD';
import ChartRMB from './components/charts/ChartRMB';
import ChartVolume from './components/charts/ChartVolume';
import HeadToHead from './components/HeadToHead';
import RankingTab from './components/RankingTab';
import BreakdownTab from './components/BreakdownTab';

export default function App() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('ranking');
  const [selectedNaves, setSelectedNaves] = useState([]);
  const [selectedVariedades, setSelectedVariedades] = useState([]);
  const [selectedFormatos, setSelectedFormatos] = useState([]);
  const [lang, setLang] = useState('es');

  // Settings Mode
  const [displayMode, setDisplayMode] = useState('box'); // 'kilo' | 'box'
  const [equivWeightRaw, setEquivWeightRaw] = useState(5);

  const [clientA, setClientA] = useState(VALID_CLIENTS[0]);
  const [clientB, setClientB] = useState(VALID_CLIENTS[1]);
  const [breakdownClient, setBreakdownClient] = useState(VALID_CLIENTS[0]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Translation Helper Function
  const t = (key) => DICT[lang]?.[key] || key;

  useEffect(() => {
    if (!window.XLSX) {
      const script = document.createElement('script');
      script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
      script.async = true;
      document.body.appendChild(script);
      return () => { if(document.body.contains(script)) document.body.removeChild(script); };
    }
  }, []);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setError('');
    setIsLoading(true);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        let headers = [];
        let rawData = [];

        if (window.XLSX) {
          const arrayBuffer = event.target.result;
          const workbook = window.XLSX.read(arrayBuffer, { type: 'array' });
          let bestSheet = null;
          let maxValidRows = 0;

          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const rows = window.XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });

            let headerIdx = -1;
            for(let i = 0; i < Math.min(30, rows.length); i++) {
              const rowStr = (rows[i] || []).map(c => String(c).toLowerCase().trim());
              if(rowStr.includes("nave") && rowStr.includes("cliente real") && rowStr.includes("cajas")) {
                headerIdx = i; break;
              }
            }

            if (headerIdx !== -1) {
              const dataRows = rows.slice(headerIdx + 1);
              if (dataRows.length > maxValidRows) {
                maxValidRows = dataRows.length;
                bestSheet = sheetName;
                headers = rows[headerIdx];
                rawData = dataRows;
              }
            }
          }

          if (!bestSheet) throw new Error("No se encontró la cabecera correcta. Asegúrate de incluir las columnas 'Nave', 'Cliente real' y 'Cajas'.");
        } else {
          const text = new TextDecoder().decode(event.target.result);
          const rows = parseCSV(text);
          let headerIdx = -1;
          for(let i = 0; i < Math.min(30, rows.length); i++) {
            const rowStr = (rows[i] || []).map(c => String(c).toLowerCase().trim());
            if(rowStr.includes("nave") && rowStr.includes("cliente real") && rowStr.includes("cajas")) {
              headerIdx = i; break;
            }
          }
          if (headerIdx === -1) throw new Error("Formato inválido. No se detectaron las columnas requeridas.");
          headers = rows[headerIdx];
          rawData = rows.slice(headerIdx + 1);
        }

        const cleanHeaders = headers.map(h => String(h).toLowerCase().replace(/\s+/g, ' ').trim());
        const idxNave = cleanHeaders.indexOf('nave');
        const idxVariedad = cleanHeaders.indexOf('variedad_rot');
        const idxCalibre = cleanHeaders.indexOf('calibre_rot');
        const idxCliente = cleanHeaders.indexOf('cliente real');
        const idxCajas = cleanHeaders.indexOf('cajas');
        const idxVta = cleanHeaders.indexOf('total vta');
        const idxUSD = cleanHeaders.indexOf('final usd');

        const idxPesoNeto = cleanHeaders.findIndex(h => h.includes('peso neto') || h.includes('peso_neto'));
        const idxContenedor = cleanHeaders.findIndex(h => h.includes('contenedor'));
        const idxProductor = cleanHeaders.findIndex(h => h.includes('productor'));
        const idxFecha = cleanHeaders.findIndex(h => h.includes('fecha_despacho') || h.includes('fecha_emb') || h.includes('embarque'));

        // --- NUEVA LÓGICA DE DETECCIÓN DE COSTOS (TOTALES VS UNITARIOS) ---
        const idxTTComis = cleanHeaders.findIndex(h => h.includes('tt comis') || h.includes('total comis'));
        const idxComis = cleanHeaders.findIndex(h => h === 'comis imp' || h === 'comision' || h === 'comis' || h === 'comis.');

        const idxTTFlete = cleanHeaders.findIndex(h => h.includes('tt freight') || h.includes('tt flete') || h.includes('total flete') || h.includes('total freight'));
        const idxFlete = cleanHeaders.findIndex(h => h === 'freight' || h === 'flete' || h === 'flete interno');

        const idxTTVat = cleanHeaders.findIndex(h => h.includes('tt vat') || h.includes('tt impuesto') || h.includes('total vat'));
        const idxVat = cleanHeaders.findIndex(h => h === 'vat' || h === 'impuesto');

        const idxTTOtros = cleanHeaders.findIndex(h => h.includes('tt others') || h.includes('tt otros') || h.includes('total otros'));
        const idxOtros = cleanHeaders.findIndex(h => h.includes('others cost') || h.includes('otros cost') || h === 'otros' || h === 'others');

        if (idxCajas === -1 || idxVta === -1 || idxUSD === -1) {
          throw new Error("Faltan columnas vitales ('Cajas', 'Total vta', o 'Final USD').");
        }

        let parsedData = [];

        rawData.forEach(row => {
          if (!row || row.length === 0) return;
          const client = String(row[idxCliente] || '').trim().toUpperCase();
          const cajas = parseNum(row[idxCajas]);

          if (VALID_CLIENTS.includes(client) && cajas > 0) {
            const pesoNetoRaw = idxPesoNeto !== -1 ? parseNum(row[idxPesoNeto]) : 5;
            const pesoNeto = pesoNetoRaw > 0 ? pesoNetoRaw : 5;

            const vta = parseNum(row[idxVta]);
            const usd = parseNum(row[idxUSD]);

            const isPriced = vta !== 0 || usd !== 0;

            // Si hay columna TT (Total) la usa, sino, usa la unitaria y multiplica por las cajas.
            const comisTotal = idxTTComis !== -1 ? parseNum(row[idxTTComis]) : (idxComis !== -1 ? parseNum(row[idxComis]) * cajas : 0);
            const fleteTotal = idxTTFlete !== -1 ? parseNum(row[idxTTFlete]) : (idxFlete !== -1 ? parseNum(row[idxFlete]) * cajas : 0);
            const vatTotal = idxTTVat !== -1 ? parseNum(row[idxTTVat]) : (idxVat !== -1 ? parseNum(row[idxVat]) * cajas : 0);
            const otrosTotal = idxTTOtros !== -1 ? parseNum(row[idxTTOtros]) : (idxOtros !== -1 ? parseNum(row[idxOtros]) * cajas : 0);

            parsedData.push({
              Nave: String(row[idxNave] || 'Desconocida').trim(),
              Variedad: String(row[idxVariedad] || 'N/A').trim(),
              Calibre: String(row[idxCalibre] || 'N/A').trim(),
              Cliente: client,
              Cajas: cajas,
              PesoNeto: pesoNeto,
              Kilos: cajas * pesoNeto,
              isPriced: isPriced,
              pricedCajas: isPriced ? cajas : 0,
              pricedKilos: isPriced ? (cajas * pesoNeto) : 0,
              RMB: vta,
              USD: usd,
              Contenedor: idxContenedor !== -1 ? String(row[idxContenedor] || 'S/N').trim() : 'S/N',
              Productor: idxProductor !== -1 ? String(row[idxProductor] || 'N/A').trim() : 'N/A',
              Fecha: idxFecha !== -1 ? String(row[idxFecha] || '').trim().split(' ')[0] : '',
              Comis: comisTotal,
              Flete: fleteTotal,
              Vat: vatTotal,
              Otros: otrosTotal
            });
          }
        });

        if (parsedData.length === 0) {
          setError("No se encontraron datos numéricos para los importadores seleccionados.");
          setIsLoading(false); return;
        }

        setData(parsedData);
        setSelectedNaves([]);
        setSelectedVariedades([]);
        setSelectedFormatos([]);
        setIsLoading(false);

      } catch (err) {
        console.error(err);
        setError("Error de lectura: " + err.message);
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // --- DERIVED STATE / HOOKS ---
  const equivWeight = Number(equivWeightRaw) > 0 ? Number(equivWeightRaw) : 1;
  const isBoxMode = displayMode === 'box';
  const priceMultiplier = isBoxMode ? equivWeight : 1;
  const volDivider = isBoxMode ? equivWeight : 1;

  const unitPriceLabel = isBoxMode ? `${t('box_eq')} ${equivWeight}Kg` : t('kilo');
  const unitVolLabel = isBoxMode ? `Cajas Eq (${equivWeight}Kg)` : t('kilo');

  const naves = useMemo(() => Array.from(new Set(data.map(d => d.Nave))).sort(), [data]);
  const variedades = useMemo(() => Array.from(new Set(data.map(d => d.Variedad))).sort(), [data]);
  const formatos = useMemo(() => Array.from(new Set(data.map(d => String(d.PesoNeto)))).sort((a,b)=> parseFloat(a)-parseFloat(b)), [data]);

  const marketDict = useMemo(() => {
    const dict = {};
    data.forEach(d => {
      const key = `${d.Nave}|${d.Variedad}|${d.Calibre}|${d.PesoNeto}`;
      if (!dict[key]) dict[key] = { rmb: 0, usd: 0, kilos: 0 };
      dict[key].rmb += d.RMB;
      dict[key].usd += d.USD;
      dict[key].kilos += d.pricedKilos;
    });
    return dict;
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter(d =>
      (selectedNaves.length === 0 || selectedNaves.includes(d.Nave)) &&
      (selectedVariedades.length === 0 || selectedVariedades.includes(d.Variedad)) &&
      (selectedFormatos.length === 0 || selectedFormatos.includes(String(d.PesoNeto)))
    );
  }, [data, selectedNaves, selectedVariedades, selectedFormatos]);

  const chartDataUSD = useMemo(() => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.Calibre]) grouped[d.Calibre] = { Calibre: d.Calibre, _varieties: {} };
      if (!grouped[d.Calibre][d.Cliente]) grouped[d.Calibre][d.Cliente] = { sumUSD: 0, sumKilos: 0, varieties: new Set() };
      grouped[d.Calibre][d.Cliente].sumUSD += d.USD;
      grouped[d.Calibre][d.Cliente].sumKilos += d.pricedKilos;
      grouped[d.Calibre][d.Cliente].varieties.add(d.Variedad);
    });
    return Object.values(grouped).map(g => {
      const res = { Calibre: g.Calibre, _varieties: {} };
      VALID_CLIENTS.forEach(client => {
        if (g[client]) {
          res[client] = g[client].sumKilos > 0 ? parseFloat(((g[client].sumUSD / g[client].sumKilos) * priceMultiplier).toFixed(2)) : 0;
          res._varieties[client] = Array.from(g[client].varieties).join(', ');
        }
      });
      return res;
    });
  }, [filteredData, priceMultiplier]);

  const chartDataRMB = useMemo(() => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.Calibre]) grouped[d.Calibre] = { Calibre: d.Calibre, _varieties: {} };
      if (!grouped[d.Calibre][d.Cliente]) grouped[d.Calibre][d.Cliente] = { sumRMB: 0, sumKilos: 0, varieties: new Set() };
      grouped[d.Calibre][d.Cliente].sumRMB += d.RMB;
      grouped[d.Calibre][d.Cliente].sumKilos += d.pricedKilos;
      grouped[d.Calibre][d.Cliente].varieties.add(d.Variedad);
    });
    return Object.values(grouped).map(g => {
      const res = { Calibre: g.Calibre, _varieties: {} };
      VALID_CLIENTS.forEach(client => {
        if (g[client]) {
          res[client] = g[client].sumKilos > 0 ? parseFloat(((g[client].sumRMB / g[client].sumKilos) * priceMultiplier).toFixed(2)) : 0;
          res._varieties[client] = Array.from(g[client].varieties).join(', ');
        }
      });
      return res;
    });
  }, [filteredData, priceMultiplier]);

  const pieData = useMemo(() => {
    const totals = {};
    filteredData.forEach(d => {
      if (!totals[d.Cliente]) totals[d.Cliente] = { kilos: 0, cajas: 0, varieties: new Set() };
      totals[d.Cliente].kilos += d.Kilos;
      totals[d.Cliente].cajas += d.Cajas;
      totals[d.Cliente].varieties.add(d.Variedad);
    });
    return Object.keys(totals).map(k => ({
      name: k,
      value: totals[k].kilos / volDivider,
      cajas: totals[k].cajas,
      varieties: Array.from(totals[k].varieties).join(', ')
    })).sort((a,b) => b.value - a.value);
  }, [filteredData, volDivider]);

  const { winnerRMB, winnerUSD, totalCajas, totalVol } = useMemo(() => {
    if (filteredData.length === 0) return { winnerRMB: null, winnerUSD: null, totalCajas: 0, totalVol: 0 };
    const clientTotals = {};
    let tCajas = 0, tKilos = 0;
    filteredData.forEach(d => {
      tCajas += d.Cajas; tKilos += d.Kilos;
      if (!clientTotals[d.Cliente]) clientTotals[d.Cliente] = { name: d.Cliente, sumPricedKilos: 0, sumRMB: 0, sumUSD: 0 };
      clientTotals[d.Cliente].sumPricedKilos += d.pricedKilos;
      clientTotals[d.Cliente].sumRMB += d.RMB;
      clientTotals[d.Cliente].sumUSD += d.USD;
    });

    let bestRMB = { name: '-', val: -Infinity };
    let bestUSD = { name: '-', val: -Infinity };

    Object.values(clientTotals).forEach(c => {
      const avgRMB = c.sumPricedKilos > 0 ? (c.sumRMB / c.sumPricedKilos) * priceMultiplier : 0;
      const avgUSD = c.sumPricedKilos > 0 ? (c.sumUSD / c.sumPricedKilos) * priceMultiplier : 0;
      if (avgRMB > bestRMB.val) bestRMB = { name: c.name, val: avgRMB };
      if (avgUSD > bestUSD.val) bestUSD = { name: c.name, val: avgUSD };
    });
    return { winnerRMB: bestRMB, winnerUSD: bestUSD, totalCajas: tCajas, totalVol: tKilos / volDivider };
  }, [filteredData, priceMultiplier, volDivider]);

  const h2hStats = useMemo(() => {
    const dataA = filteredData.filter(d => d.Cliente === clientA);
    const dataB = filteredData.filter(d => d.Cliente === clientB);
    const calc = (arr) => {
      const cajas = arr.reduce((acc, d) => acc + d.Cajas, 0);
      const kilos = arr.reduce((acc, d) => acc + d.Kilos, 0);
      const pricedKilos = arr.reduce((acc, d) => acc + d.pricedKilos, 0);
      const rmb = arr.reduce((acc, d) => acc + d.RMB, 0);
      const usd = arr.reduce((acc, d) => acc + d.USD, 0);
      return {
        cajas,
        kilos,
        displayVol: kilos / volDivider,
        totalUSD: usd,
        avgRMB: pricedKilos > 0 ? (rmb / pricedKilos) * priceMultiplier : 0,
        avgUSD: pricedKilos > 0 ? (usd / pricedKilos) * priceMultiplier : 0
      };
    };
    const chartData = {};
    [...dataA, ...dataB].forEach(d => {
      if (!chartData[d.Calibre]) chartData[d.Calibre] = { Calibre: d.Calibre, _varieties: {} };
      if (!chartData[d.Calibre][d.Cliente]) chartData[d.Calibre][d.Cliente] = { sumUSD: 0, sumKilos: 0, varieties: new Set() };
      chartData[d.Calibre][d.Cliente].sumUSD += d.USD;
      chartData[d.Calibre][d.Cliente].sumKilos += d.pricedKilos;
      chartData[d.Calibre][d.Cliente].varieties.add(d.Variedad);
    });
    const chartH2H = Object.values(chartData).map(g => {
      const res = { Calibre: g.Calibre, _varieties: {} };
      [clientA, clientB].forEach(client => {
        if (g[client]) {
          res[client] = g[client].sumKilos > 0 ? parseFloat(((g[client].sumUSD / g[client].sumKilos) * priceMultiplier).toFixed(2)) : 0;
          res[`${client}_vol`] = parseFloat((g[client].sumKilos / volDivider).toFixed(1));
          res._varieties[client] = Array.from(g[client].varieties).join(', ');
        } else {
          res[client] = 0;
          res[`${client}_vol`] = 0;
          res._varieties[client] = '';
        }
      });
      return res;
    });
    return { statsA: calc(dataA), statsB: calc(dataB), chartH2H };
  }, [filteredData, clientA, clientB, priceMultiplier, volDivider]);

  // --- RENDER ---
  if (data.length === 0) return (
    <>
      <PrintStyles />
      <UploadScreen onUpload={handleFileUpload} isLoading={isLoading} error={error} t={t} lang={lang} setLang={setLang} />
    </>
  );

  return (
    <>
      <PrintStyles />
      <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800 relative">
        <div className="max-w-7xl mx-auto space-y-6">
          <Header onReset={() => setData([])} unitPriceLabel={unitPriceLabel} t={t} lang={lang} setLang={setLang} />

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <FilterSidebar
              naves={naves} variedades={variedades} formatos={formatos}
              selectedNaves={selectedNaves} setSelectedNaves={setSelectedNaves}
              selectedVariedades={selectedVariedades} setSelectedVariedades={setSelectedVariedades}
              selectedFormatos={selectedFormatos} setSelectedFormatos={setSelectedFormatos}
              displayMode={displayMode} setDisplayMode={setDisplayMode}
              equivWeight={equivWeightRaw} setEquivWeight={setEquivWeightRaw}
              totalCajas={totalCajas} totalVol={totalVol} unitVolLabel={unitVolLabel}
              t={t}
            />

            <div className="lg:col-span-3 space-y-6 print-container">
              <ActiveFiltersBadge naves={selectedNaves} vars={selectedVariedades} formats={selectedFormatos} t={t} />

              {activeTab !== 'ranking' && <TopKpis winnerRMB={winnerRMB} winnerUSD={winnerUSD} unitPriceLabel={unitPriceLabel} t={t} />}

              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 print-box">
                <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto no-print">
                  {[
                    { id: 'ranking', label: t('tab_ranking') },
                    { id: 'usd', label: t('tab_usd') },
                    { id: 'rmb', label: t('tab_rmb') },
                    { id: 'vol', label: t('tab_vol') },
                    { id: 'h2h', label: t('tab_h2h') },
                    { id: 'breakdown', label: t('tab_breakdown') }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex-1 min-w-[140px] py-2.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'}`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === 'ranking' ? (
                  <RankingTab
                    filteredData={filteredData} marketDict={marketDict}
                    priceMultiplier={priceMultiplier} volDivider={volDivider}
                    unitPriceLabel={unitPriceLabel} unitVolLabel={unitVolLabel}
                    t={t}
                  />
                ) : activeTab === 'breakdown' ? (
                  <BreakdownTab
                    client={breakdownClient} setClient={setBreakdownClient}
                    filteredData={filteredData} marketDict={marketDict}
                    priceMultiplier={priceMultiplier} volDivider={volDivider}
                    unitPriceLabel={unitPriceLabel} unitVolLabel={unitVolLabel}
                    t={t}
                  />
                ) : filteredData.length === 0 ? (
                  <div className="py-20 text-center text-slate-400"><Package className="w-12 h-12 mx-auto mb-3 opacity-50" /><p>{t('no_data')}</p></div>
                ) : (
                  <div className="w-full mt-4">
                    {activeTab === 'usd' && <ChartUSD data={chartDataUSD} unitPriceLabel={unitPriceLabel} />}
                    {activeTab === 'rmb' && <ChartRMB data={chartDataRMB} unitPriceLabel={unitPriceLabel} />}
                    {activeTab === 'vol' && <ChartVolume data={pieData} unitVolLabel={unitVolLabel} t={t} />}
                    {activeTab === 'h2h' && (
                      <HeadToHead
                        clientA={clientA} setClientA={setClientA}
                        clientB={clientB} setClientB={setClientB}
                        chartDataH2H={h2hStats.chartH2H}
                        statsA={h2hStats.statsA} statsB={h2hStats.statsB}
                        unitPriceLabel={unitPriceLabel} unitVolLabel={unitVolLabel}
                        t={t}
                      />
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
