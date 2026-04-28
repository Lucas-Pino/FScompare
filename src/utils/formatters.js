export const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
export const formatRMB = (val) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 }).format(val);
export const formatNumber = (val) => new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(val);
export const formatPercent = (val) => new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val);

export const parseNum = (val, format = 'EU') => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  if (str === '') return 0;

  const isNegative = (str.startsWith('(') && str.endsWith(')')) || str.startsWith('-');
  let cleaned = str.replace(/[()\- %]/g, '').trim();

  let num = 0;

  if (format === 'US') {
    // US Format: 1,000.00
    // Remove all commas, keep dots as decimal separator
    num = parseFloat(cleaned.replace(/,/g, ''));
  } else {
    // EU Format: 1.000,00
    // Remove all dots, replace comma with dot as decimal separator
    num = parseFloat(cleaned.replace(/\./g, '').replace(/,/g, '.'));
  }

  if (isNaN(num)) return 0;
  return isNegative ? -num : num;
};

export const parseCost = (val, vta, cajas, type = 'comis', format = 'EU') => {
  const num = parseNum(val, format);
  if (num === 0) return 0;

  // Heurística: Distinguir entre Porcentaje, Unitario o Total
  if (type === 'comis' || type === 'vat') {
    const threshold = type === 'comis' ? 25 : 20;
    if (num > 100) return num; // Probablemente es un TT (Total)
    if (num > 0 && num <= 1) return vta * num; // Porcentaje decimal (e.g. 0.08)
    if (num > 1 && num <= threshold) return vta * (num / 100); // Porcentaje entero (e.g. 8)
    return num * cajas; // Costo unitario
  }

  if (type === 'flete') {
    if (num > 500) return num; // Probablemente TT
    if (num > 0 && num < 50) return num * cajas; // Costo unitario
    return num;
  }

  return num;
};

export const parseCSV = (text) => {
  const delimiter = text.includes(';') && text.split(';').length > text.split(',').length ? ';' : ',';
  const lines = text.split('\n');
  let data = [];
  for (let line of lines) {
    if (!line.trim()) continue;
    const row = line.split(new RegExp(`\\${delimiter}(?=(?:(?:[^"]*"){2})*[^"]*$)`));
    data.push(row.map(cell => cell.replace(/(^"|"$)/g, '').trim()));
  }
  return data;
};
