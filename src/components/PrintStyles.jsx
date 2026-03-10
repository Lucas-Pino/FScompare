import React from 'react';

const PrintStyles = () => (
  <style>{`
    @media print {
      @page { size: landscape; margin: 10mm; }
      body { background-color: #fff !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      .no-print { display: none !important; }
      .shadow-sm, .shadow-md, .shadow-xl, .shadow-inner { box-shadow: none !important; border: 1px solid #e2e8f0; }
      .bg-slate-50, .bg-blue-50, .bg-amber-50 { background-color: #fff !important; }
      .recharts-wrapper { page-break-inside: avoid; max-width: 100% !important; }
      .overflow-x-auto { overflow: visible !important; max-height: none !important; }
    }
  `}</style>
);

export default PrintStyles;
