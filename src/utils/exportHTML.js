/**
 * Generates an interactive HTML dashboard from the current filtered data.
 * @param {Array} data - Filtered rows from the dashboard
 * @param {Object} filters - Currently active filter state
 * @param {Object} settings - Display mode and weight settings
 * @param {Function} t - Translation function
 * @param {string} lang - Language code
 */
export const exportToHTML = (data, filters, settings, t, lang) => {
  // Safety: Ensure we don't break the <script> tags in the generated HTML
  const escapeJSON = (obj) => JSON.stringify(obj).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');

  const serializedData = escapeJSON(data || []);
  const serializedSettings = escapeJSON(settings || {});

  const htmlContent = `<!DOCTYPE html>
<html lang="${lang || 'es'}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pura Vida Report - Interactive Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; background-color: #f8fafc; }
        .chart-container { height: 450px; width: 100%; }
        .tab-btn { padding: 0.5rem 1rem; border-radius: 0.5rem; transition: all 0.2s; font-size: 0.875rem; font-weight: 600; }
        .tab-btn.active { background-color: #fff; color: #1d4ed8; box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1); }
        .tab-btn:not(.active) { color: #64748b; }
        .tab-btn:not(.active):hover { color: #334155; background-color: #f1f5f9; }
    </style>
</head>
<body class="p-4 md:p-8">
    <div id="root"></div>
    <script>
        const { useState, useMemo } = React;
        const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

        // Data injected from the exporter
        const rawData = ${serializedData};
        const appSettings = ${serializedSettings};

        const COLORS = {
          'HUASHENG': '#3b82f6',
          'YUHUA': '#10b981',
          'FRUIT MATE': '#f59e0b',
          'SANGO': '#ef4444',
          'HATTAT': '#8b5cf6',
          'PARAMOUNT': '#ec4899',
          'JOY WING MAU': '#06b6d4'
        };

        const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
        const formatRMB = (val) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY' }).format(val);

        function Report() {
            const equivWeight = Number(appSettings.equivWeightRaw) || 5;
            const priceMultiplier = appSettings.displayMode === 'box' ? equivWeight : 1;
            const unitLabel = appSettings.displayMode === 'box' ? 'Caja Eq' : 'Kg';

            const [activeTab, setActiveTab] = useState('usd');

            const chartData = useMemo(() => {
                const grouped = {};
                rawData.forEach(d => {
                    if (!grouped[d.Calibre]) grouped[d.Calibre] = { Calibre: d.Calibre };
                    if (!grouped[d.Calibre][d.Cliente]) grouped[d.Calibre][d.Cliente] = { sumUSD: 0, sumRMB: 0, sumKilos: 0 };
                    grouped[d.Calibre][d.Cliente].sumUSD += d.USD || 0;
                    grouped[d.Calibre][d.Cliente].sumRMB += d.RMB || 0;
                    grouped[d.Calibre][d.Cliente].sumKilos += d.pricedKilos || 0;
                });
                return Object.values(grouped).map(g => {
                    const res = { Calibre: g.Calibre };
                    Object.keys(COLORS).forEach(client => {
                        if (g[client] && g[client].sumKilos > 0) {
                            res[client + '_usd'] = parseFloat(((g[client].sumUSD / g[client].sumKilos) * priceMultiplier).toFixed(2));
                            res[client + '_rmb'] = parseFloat(((g[client].sumRMB / g[client].sumKilos) * priceMultiplier).toFixed(2));
                        }
                    });
                    return res;
                });
            }, []);

            return React.createElement('div', { className: 'max-w-6xl mx-auto space-y-6' },
                // Header
                React.createElement('header', { className: 'bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-center' },
                    React.createElement('div', null,
                        React.createElement('h1', { className: 'text-2xl font-bold text-slate-900' }, 'Pura Vida Analytics - Reporte Interactivo'),
                        React.createElement('p', { className: 'text-slate-500 text-sm' }, 'Generado el ' + new Date().toLocaleDateString() + ' | Vista: ' + unitLabel)
                    ),
                    React.createElement('img', { src: 'https://placehold.co/100x40/3b82f6/white?text=Pura+Vida', className: 'h-10 rounded opacity-20' })
                ),

                // Main Chart Card
                React.createElement('div', { className: 'bg-white p-6 rounded-2xl shadow-sm border border-slate-100' },
                    // Tab Selector
                    React.createElement('div', { className: 'flex space-x-2 bg-slate-100 p-1 rounded-xl mb-6 w-fit' },
                        React.createElement('button', {
                            onClick: () => setActiveTab('usd'),
                            className: 'tab-btn ' + (activeTab === 'usd' ? 'active' : '')
                        }, 'FOB Neto (USD)'),
                        React.createElement('button', {
                            onClick: () => setActiveTab('rmb'),
                            className: 'tab-btn ' + (activeTab === 'rmb' ? 'active' : '')
                        }, 'Venta Bruta (RMB)')
                    ),

                    React.createElement('h2', { className: 'text-lg font-bold mb-4 text-slate-800' },
                        activeTab === 'usd' ? 'Retorno FOB Neto por Calibre' : 'Venta Bruta en Destino por Calibre'
                    ),

                    React.createElement('div', { className: 'chart-container' },
                        React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
                            React.createElement(BarChart, { data: chartData, margin: { top: 10, right: 30, left: 0, bottom: 20 } },
                                React.createElement(CartesianGrid, { strokeDasharray: '3 3', vertical: false, stroke: '#e2e8f0' }),
                                React.createElement(XAxis, { dataKey: 'Calibre', tick: {fill: '#64748b', fontSize: 12}, axisLine: false, tickLine: false, dy: 10 }),
                                React.createElement(YAxis, {
                                    tickFormatter: val => activeTab === 'usd' ? '$' + val : '¥' + val,
                                    tick: {fill: '#64748b', fontSize: 12},
                                    axisLine: false,
                                    tickLine: false
                                }),
                                React.createElement(Tooltip, {
                                    formatter: (val, name) => [
                                        activeTab === 'usd' ? formatUSD(val) : formatRMB(val),
                                        name.replace('_usd', '').replace('_rmb', '')
                                    ],
                                    contentStyle: { borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }
                                }),
                                React.createElement(Legend, { wrapperStyle: { paddingTop: '20px' }, iconType: 'circle' }),
                                Object.keys(COLORS).map(client =>
                                    React.createElement(Bar, {
                                        key: client,
                                        dataKey: client + '_' + activeTab,
                                        name: client,
                                        fill: COLORS[client],
                                        radius: [4, 4, 0, 0],
                                        maxBarSize: 50,
                                        isAnimationActive: true
                                    })
                                )
                            )
                        )
                    )
                ),

                React.createElement('footer', { className: 'text-center text-slate-400 text-xs py-8 border-t border-slate-200 mt-12' },
                    'Pura Vida Analytics - Reporte Comercial de Exportación. Este archivo es independiente y puede verse sin conexión.'
                )
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Report));
    </script>
</body>
</html>`;

  try {
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    if (blob.size === 0) {
        throw new Error("Blob size is 0");
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Reporte_Interactivo_${new Date().getTime()}.html`;
    document.body.appendChild(a);
    a.click();

    // Cleanup
    setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }, 100);
  } catch (err) {
    console.error("Export failed:", err);
    alert("Error al generar el archivo HTML. Por favor intente de nuevo.");
  }
};
