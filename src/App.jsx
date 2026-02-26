import React, { useState, useMemo, useEffect } from 'react';
import { Package } from 'lucide-react';
import { VALID_CLIENTS } from './utils/constants';
import { parseNum, parseCSV } from './utils/formatters';

import UploadScreen from './components/UploadScreen';
import Header from './components/layout/Header';
import FilterSidebar from './components/layout/FilterSidebar';
import TopKpis from './components/TopKpis';

import ChartUSD from './components/charts/ChartUSD';
import ChartRMB from './components/charts/ChartRMB';
import ChartVolume from './components/charts/ChartVolume';
import HeadToHead from './components/HeadToHead';

export default function App() {
  const [data, setData] = useState([]);
  const [activeTab, setActiveTab] = useState('usd');
  const [selectedNave, setSelectedNave] = useState('Todas');
  const [selectedVariedad, setSelectedVariedad] = useState('Todas');

  // Estados para Head-to-Head
  const [clientA, setClientA] = useState(VALID_CLIENTS[0]);
  const [clientB, setClientB] = useState(VALID_CLIENTS[1]);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
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
            for (let i = 0; i < Math.min(30, rows.length); i++) {
              const rowStr = (rows[i] || []).map(c => String(c).toLowerCase().trim());
              if (rowStr.includes("nave") && rowStr.includes("cliente real") && rowStr.includes("cajas")) {
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

          if (!bestSheet) throw new Error("No se encontró la cabecera en el archivo Excel. Asegúrate de subir la Base de Datos con columnas 'Nave', 'Cliente real' y 'Cajas'.");
        } else {
          const text = new TextDecoder().decode(event.target.result);
          const rows = parseCSV(text);
          let headerIdx = -1;
          for (let i = 0; i < Math.min(30, rows.length); i++) {
            const rowStr = (rows[i] || []).map(c => String(c).toLowerCase().trim());
            if (rowStr.includes("nave") && rowStr.includes("cliente real") && rowStr.includes("cajas")) {
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

        if (idxCajas === -1 || idxVta === -1 || idxUSD === -1) {
          throw new Error("Faltan columnas vitales ('Cajas', 'Total vta', o 'Final USD').");
        }

        let grouped = {};
        rawData.forEach(row => {
          if (!row || row.length === 0) return;
          const client = String(row[idxCliente] || '').trim().toUpperCase();
          const cajas = parseNum(row[idxCajas]);
          const totalVta = parseNum(row[idxVta]);
          const finalUSD = parseNum(row[idxUSD]);

          if (VALID_CLIENTS.includes(client) && cajas > 0) {
            const nave = String(row[idxNave] || 'Desconocida').trim();
            const variedad = String(row[idxVariedad] || 'N/A').trim();
            const calibre = String(row[idxCalibre] || 'N/A').trim();

            const key = `${nave}|${variedad}|${calibre}|${client}`;
            if (!grouped[key]) {
              grouped[key] = { Nave: nave, Variedad: variedad, Calibre: calibre, Cliente: client, Cajas: 0, RMB: 0, USD: 0 };
            }
            grouped[key].Cajas += cajas;
            grouped[key].RMB += totalVta;
            grouped[key].USD += finalUSD;
          }
        });

        const finalData = Object.values(grouped).map(g => ({
          ...g,
          Precio_RMB: g.Cajas > 0 ? (g.RMB / g.Cajas) : 0,
          FOB_USD: g.Cajas > 0 ? (g.USD / g.Cajas) : 0
        }));

        if (finalData.length === 0) {
          setError("No se encontraron datos numéricos para los importadores seleccionados.");
          setIsLoading(false); return;
        }

        setData(finalData);
        setSelectedNave('Todas');
        setSelectedVariedad('Todas');
        setIsLoading(false);

      } catch (err) {
        console.error(err);
        setError("Error de lectura: " + err.message);
        setIsLoading(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ---------------- DATOS DERIVADOS Y FILTROS ----------------
  const naves = ['Todas', ...Array.from(new Set(data.map(d => d.Nave))).sort()];
  const variedades = ['Todas', ...Array.from(new Set(data.map(d => d.Variedad))).sort()];

  const filteredData = useMemo(() => {
    return data.filter(d =>
      (selectedNave === 'Todas' || d.Nave === selectedNave) &&
      (selectedVariedad === 'Todas' || d.Variedad === selectedVariedad)
    );
  }, [data, selectedNave, selectedVariedad]);

  const chartDataUSD = useMemo(() => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.Calibre]) grouped[d.Calibre] = { Calibre: d.Calibre };
      grouped[d.Calibre][d.Cliente] = parseFloat(d.FOB_USD.toFixed(2));
    });
    return Object.values(grouped);
  }, [filteredData]);

  const chartDataRMB = useMemo(() => {
    const grouped = {};
    filteredData.forEach(d => {
      if (!grouped[d.Calibre]) grouped[d.Calibre] = { Calibre: d.Calibre };
      grouped[d.Calibre][d.Cliente] = parseFloat(d.Precio_RMB.toFixed(2));
    });
    return Object.values(grouped);
  }, [filteredData]);

  const pieData = useMemo(() => {
    const totals = {};
    filteredData.forEach(d => {
      totals[d.Cliente] = (totals[d.Cliente] || 0) + d.Cajas;
    });
    return Object.keys(totals).map(k => ({ name: k, value: totals[k] })).sort((a, b) => b.value - a.value);
  }, [filteredData]);

  const { winnerRMB, winnerUSD, totalCajas } = useMemo(() => {
    if (filteredData.length === 0) return { winnerRMB: null, winnerUSD: null, totalCajas: 0 };
    const clientTotals = {};
    let tCajas = 0;

    filteredData.forEach(d => {
      tCajas += d.Cajas;
      if (!clientTotals[d.Cliente]) clientTotals[d.Cliente] = { name: d.Cliente, sumCajas: 0, sumRMB: 0, sumUSD: 0 };
      clientTotals[d.Cliente].sumCajas += d.Cajas;
      clientTotals[d.Cliente].sumRMB += d.RMB;
      clientTotals[d.Cliente].sumUSD += d.USD;
    });

    let bestRMB = { name: '-', val: -Infinity };
    let bestUSD = { name: '-', val: -Infinity };

    Object.values(clientTotals).forEach(c => {
      const avgRMB = c.sumCajas > 0 ? (c.sumRMB / c.sumCajas) : 0;
      const avgUSD = c.sumCajas > 0 ? (c.sumUSD / c.sumCajas) : 0;
      if (avgRMB > bestRMB.val) bestRMB = { name: c.name, val: avgRMB };
      if (avgUSD > bestUSD.val) bestUSD = { name: c.name, val: avgUSD };
    });

    return { winnerRMB: bestRMB, winnerUSD: bestUSD, totalCajas: tCajas };
  }, [filteredData]);

  // ---------------- HEAD TO HEAD LOGIC ----------------
  const h2hStats = useMemo(() => {
    const dataA = filteredData.filter(d => d.Cliente === clientA);
    const dataB = filteredData.filter(d => d.Cliente === clientB);

    const calc = (arr) => {
      const cajas = arr.reduce((acc, d) => acc + d.Cajas, 0);
      const rmb = arr.reduce((acc, d) => acc + d.RMB, 0);
      const usd = arr.reduce((acc, d) => acc + d.USD, 0);
      return {
        cajas,
        avgRMB: cajas > 0 ? rmb / cajas : 0,
        avgUSD: cajas > 0 ? usd / cajas : 0
      };
    };

    const statsA = calc(dataA);
    const statsB = calc(dataB);

    const chartData = {};
    [...dataA, ...dataB].forEach(d => {
      if (!chartData[d.Calibre]) chartData[d.Calibre] = { Calibre: d.Calibre };
      chartData[d.Calibre][d.Cliente] = parseFloat(d.FOB_USD.toFixed(2));
    });

    return { statsA, statsB, chartH2H: Object.values(chartData) };
  }, [filteredData, clientA, clientB]);

  // ---------------- RENDERIZADO UI ----------------

  if (data.length === 0) {
    return <UploadScreen error={error} isLoading={isLoading} handleFileUpload={handleFileUpload} />
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6 font-sans text-slate-800">
      <div className="max-w-7xl mx-auto space-y-6">

        <Header onReset={() => setData([])} />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

          <FilterSidebar
            naves={naves}
            variedades={variedades}
            selectedNave={selectedNave}
            setSelectedNave={setSelectedNave}
            selectedVariedad={selectedVariedad}
            setSelectedVariedad={setSelectedVariedad}
            totalCajas={totalCajas}
          />

          <div className="lg:col-span-3 space-y-6">

            <TopKpis winnerRMB={winnerRMB} winnerUSD={winnerUSD} />

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">

              <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl mb-6 overflow-x-auto">
                {[
                  { id: 'usd', label: '🚢 FOB Neto (USD)' },
                  { id: 'rmb', label: '💰 Venta Bruta (RMB)' },
                  { id: 'vol', label: '📦 Participación' },
                  { id: 'h2h', label: '🥊 Head-to-Head' }
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 min-w-[140px] py-2.5 text-sm font-semibold rounded-lg transition-colors duration-200 ${activeTab === tab.id ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {filteredData.length === 0 ? (
                <div className="py-20 text-center text-slate-400">
                  <Package className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p>No hay datos disponibles para los filtros seleccionados.</p>
                </div>
              ) : (
                <div className="w-full mt-4">
                  {activeTab === 'usd' && <ChartUSD data={chartDataUSD} />}
                  {activeTab === 'rmb' && <ChartRMB data={chartDataRMB} />}
                  {activeTab === 'vol' && <ChartVolume data={pieData} />}
                  {activeTab === 'h2h' && (
                    <HeadToHead
                      clientA={clientA} setClientA={setClientA}
                      clientB={clientB} setClientB={setClientB}
                      h2hStats={h2hStats}
                    />
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
