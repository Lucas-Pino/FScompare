import React from 'react';

const PrintStyles = () => (
  <style>{`
    @media print {
      @page { size: landscape; margin: 5mm; }
      body {
        background-color: #fff !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        zoom: 0.8;
      }
      .no-print { display: none !important; }
      .max-w-7xl { max-width: none !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
      .grid { display: block !important; }
      .lg\:col-span-3 { width: 100% !important; margin: 0 !important; }
      .shadow-sm, .shadow-md, .shadow-xl, .shadow-inner { box-shadow: none !important; border: 1px solid #e2e8f0; }
      .bg-slate-50, .bg-blue-50, .bg-amber-50 { background-color: #fff !important; }
      .recharts-wrapper { page-break-inside: avoid; max-width: 100% !important; }
      .overflow-x-auto { overflow: visible !important; max-height: none !important; }
      table { width: 100% !important; table-layout: auto !important; }
      th, td { padding-left: 8px !important; padding-right: 8px !important; font-size: 10px !important; }
    }
  `}</style>
);

export default PrintStyles;
