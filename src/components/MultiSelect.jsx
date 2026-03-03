import React, { useState } from 'react';

const MultiSelect = ({ options, selected, onChange, t }) => {
  const [isOpen, setIsOpen] = useState(false);

  const isAllSelected = selected.length === 0;

  const handleToggle = (opt) => {
    if (isAllSelected) {
      onChange([opt]);
    } else if (selected.includes(opt)) {
      const newSel = selected.filter(item => item !== opt);
      onChange(newSel);
    } else {
      const newSel = [...selected, opt];
      if (newSel.length === options.length) {
        onChange([]);
      } else {
        onChange(newSel);
      }
    }
  };

  const displayText = isAllSelected
    ? t('all')
    : selected.length === 1
      ? selected[0]
      : `${selected.length} ${t('selected_items')}`;

  return (
    <div className="relative">
      <div
        className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg p-2.5 cursor-pointer flex justify-between items-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="truncate pr-2 font-medium">{displayText}</span>
        <span className="text-slate-400 text-xs">▼</span>
      </div>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>
          <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-60 overflow-y-auto py-1">
            <div
              className="px-3 py-2 hover:bg-slate-50 border-b border-slate-100 cursor-pointer flex items-center font-bold text-slate-700 text-sm"
              onClick={() => { onChange([]); setIsOpen(false); }}
            >
              <input type="checkbox" checked={isAllSelected} readOnly className="mr-3 w-4 h-4 text-blue-600 rounded border-slate-300" />
              {t('all')}
            </div>
            {options.map(opt => (
              <div
                key={opt}
                className="px-3 py-2 hover:bg-slate-50 cursor-pointer flex items-center text-slate-700 text-sm font-medium"
                onClick={() => handleToggle(opt)}
              >
                <input type="checkbox" checked={!isAllSelected && selected.includes(opt)} readOnly className="mr-3 w-4 h-4 text-blue-600 rounded border-slate-300" />
                {opt}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default MultiSelect;
