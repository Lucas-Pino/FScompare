export const formatUSD = (val) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 }).format(val);
export const formatRMB = (val) => new Intl.NumberFormat('zh-CN', { style: 'currency', currency: 'CNY', minimumFractionDigits: 2 }).format(val);
export const formatNumber = (val) => new Intl.NumberFormat('es-CL', { maximumFractionDigits: 1 }).format(val);
export const formatPercent = (val) => new Intl.NumberFormat('en-US', { style: 'percent', minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(val);

export const parseNum = (val) => {
  if (val === undefined || val === null || val === '') return 0;
  if (typeof val === 'number') return val;
  const str = String(val).trim();
  if (str === '') return 0;

  const isNegative = (str.startsWith('(') && str.endsWith(')')) || str.startsWith('-');
  let cleaned = str.replace(/[\(\)-]/g, '').trim();

  const commas = (cleaned.match(/,/g) || []).length;
  const dots = (cleaned.match(/\./g) || []).length;

  let num = 0;
  if (commas === 1 && dots === 0) num = parseFloat(cleaned.replace(',', '.'));
  else if (dots === 1 && commas === 0) num = parseFloat(cleaned);
  else if (commas > 0 && dots === 1 && cleaned.indexOf(',') < cleaned.indexOf('.')) num = parseFloat(cleaned.replace(/,/g, ''));
  else if (dots > 0 && commas === 1 && cleaned.indexOf('.') < cleaned.indexOf(',')) num = parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
  else if (commas > 1 && dots === 0) num = parseFloat(cleaned.replace(/,/g, ''));
  else if (dots > 1 && commas === 0) num = parseFloat(cleaned.replace(/\./g, ''));
  else num = parseFloat(cleaned.replace(/,/g, ''));

  if (isNaN(num)) return 0;
  return isNegative ? -num : num;
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
