export const exportToHTML = (data, filters, settings, t, lang) => {
  const serializedData = JSON.stringify(data);
  const serializedFilters = JSON.stringify(filters);
  const serializedSettings = JSON.stringify(settings);

  const htmlContent = `
<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Pura Vida Report - Interactive</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
    <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
    <script src="https://unpkg.com/recharts/umd/Recharts.js"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
        .chart-container { height: 400px; width: 100%; }
    </style>
</head>
<body class="bg-slate-50 p-4 md:p-8">
    <div id="root"></div>
    <script>
        const { useState, useMemo } = React;
        const { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } = Recharts;

        const data = ${serializedData};
        const settings = ${serializedSettings};

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

        function Report() {
            const equivWeight = Number(settings.equivWeightRaw) || 5;
            const priceMultiplier = settings.displayMode === 'box' ? equivWeight : 1;

            const chartData = useMemo(() => {
                const grouped = {};
                data.forEach(d => {
                    if (!grouped[d.Calibre]) grouped[d.Calibre] = { Calibre: d.Calibre };
                    if (!grouped[d.Calibre][d.Cliente]) grouped[d.Calibre][d.Cliente] = { sumUSD: 0, sumKilos: 0 };
                    grouped[d.Calibre][d.Cliente].sumUSD += d.USD;
                    grouped[d.Calibre][d.Cliente].sumKilos += d.pricedKilos;
                });
                return Object.values(grouped).map(g => {
                    const res = { Calibre: g.Calibre };
                    Object.keys(COLORS).forEach(client => {
                        if (g[client]) {
                            res[client] = g[client].sumKilos > 0 ? parseFloat(((g[client].sumUSD / g[client].sumKilos) * priceMultiplier).toFixed(2)) : 0;
                        }
                    });
                    return res;
                });
            }, []);

            return React.createElement('div', { className: 'max-w-5xl mx-auto space-y-8' },
                React.createElement('header', { className: 'bg-white p-6 rounded-2xl shadow-sm border border-slate-100' },
                    React.createElement('h1', { className: 'text-2xl font-bold text-slate-900' }, 'Reporte Comercial Interactivo'),
                    React.createElement('p', { className: 'text-slate-500' }, 'Generado el ' + new Date().toLocaleDateString())
                ),
                React.createElement('div', { className: 'bg-white p-6 rounded-2xl shadow-sm border border-slate-100' },
                    React.createElement('h2', { className: 'text-lg font-bold mb-4 text-slate-800' }, 'FOB Neto por Calibre (Interactivo)'),
                    React.createElement('div', { className: 'chart-container' },
                        React.createElement(ResponsiveContainer, { width: '100%', height: '100%' },
                            React.createElement(BarChart, { data: chartData },
                                React.createElement(CartesianGrid, { strokeDasharray: '3 3', vertical: false, stroke: '#e2e8f0' }),
                                React.createElement(XAxis, { dataKey: 'Calibre' }),
                                React.createElement(YAxis, { tickFormatter: val => '$' + val }),
                                React.createElement(Tooltip, { formatter: val => formatUSD(val) }),
                                React.createElement(Legend, {}),
                                Object.keys(COLORS).map(client =>
                                    React.createElement(Bar, { key: client, dataKey: client, fill: COLORS[client], radius: [4, 4, 0, 0] })
                                )
                            )
                        )
                    )
                ),
                React.createElement('footer', { className: 'text-center text-slate-400 text-xs py-8' }, 'Pura Vida Analytics - Reporte Estático con Interactividad')
            );
        }

        const root = ReactDOM.createRoot(document.getElementById('root'));
        root.render(React.createElement(Report));
    </script>
</body>
</html>
  `;

  const blob = new Blob([htmlContent], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `Reporte_Interactivo_${new Date().getTime()}.html`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
