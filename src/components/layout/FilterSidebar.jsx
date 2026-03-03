import React from 'react';
import { Ship, Tag, Box, Settings2 } from 'lucide-react';
import { formatNumber } from '../../utils/formatters';
import MultiSelect from '../MultiSelect';

const FilterSidebar = ({
  naves, variedades, formatos,
  selectedNaves, setSelectedNaves,
  selectedVariedades, setSelectedVariedades,
  selectedFormatos, setSelectedFormatos,
  displayMode, setDisplayMode,
  equivWeight, setEquivWeight,
  totalCajas, totalVol, unitVolLabel, t
}) => (
  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 space-y-6">
    <h3 className="font-semibold text-slate-800 border-b pb-2 flex items-center">{t('filters')}</h3>
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
        <Ship className="w-4 h-4 mr-1" /> {t('vessel')}
      </label>
      <MultiSelect options={naves} selected={selectedNaves} onChange={setSelectedNaves} t={t} />
    </div>
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
        <Tag className="w-4 h-4 mr-1" /> {t('variety')}
      </label>
      <MultiSelect options={variedades} selected={selectedVariedades} onChange={setSelectedVariedades} t={t} />
    </div>
    <div>
      <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
        <Box className="w-4 h-4 mr-1" /> {t('format')}
      </label>
      <MultiSelect options={formatos} selected={selectedFormatos} onChange={setSelectedFormatos} t={t} />
    </div>

    <div className="pt-4 mt-4 border-t border-slate-100 space-y-4 no-print">
      <div>
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
          <Settings2 className="w-4 h-4 mr-1" /> {t('view_by')}
        </label>
        <div className="flex bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setDisplayMode('kilo')}
            className={`flex-1 text-xs py-1.5 font-bold rounded-md transition-colors ${displayMode === 'kilo' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t('kilo')}
          </button>
          <button
            onClick={() => setDisplayMode('box')}
            className={`flex-1 text-xs py-1.5 font-bold rounded-md transition-colors ${displayMode === 'box' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {t('box_eq')}
          </button>
        </div>
      </div>

      {displayMode === 'box' && (
        <div>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center">
            {t('weight_eq')}
          </label>
          <input
            type="number"
            value={equivWeight}
            onChange={e => setEquivWeight(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 text-slate-800 text-sm rounded-lg focus:ring-blue-500 block p-2.5"
            min="0.5"
            step="0.5"
          />
        </div>
      )}
    </div>

    <div className="pt-4 space-y-4">
      <div className="p-4 bg-slate-100 rounded-xl border border-slate-200">
        <p className="text-xs text-slate-500 font-semibold mb-1 uppercase">{t('vol_analyzed')}</p>
        <p className="text-2xl font-bold text-slate-800">{formatNumber(totalVol)} <span className="text-sm font-normal text-slate-500">{unitVolLabel}</span></p>
        <p className="text-sm font-medium text-slate-500 mt-1">{formatNumber(totalCajas)} {t('phys_boxes')}</p>
      </div>
    </div>
  </div>
);

export default FilterSidebar;
