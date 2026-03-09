import React from 'react';
import VisxBarGroup from './VisxBarGroup';
import { VALID_CLIENTS, COLORS } from '../../utils/constants';
import { formatUSD } from '../../utils/formatters';

export default function ChartUSD({ data, unitPriceLabel }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <h4 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-sm flex items-center">
                🚢 Retorno FOB Neto por Calibre
                <span className="ml-2 px-2 py-0.5 bg-blue-50 text-blue-600 rounded text-[10px] lowercase font-medium">
                    (usd/{unitPriceLabel})
                </span>
            </h4>
            <VisxBarGroup
                data={data}
                keys={VALID_CLIENTS}
                colors={COLORS}
                valueFormatter={formatUSD}
                unitLabel={unitPriceLabel}
                volLabel={`Eq (${unitPriceLabel.split(' ')[2]})`}
            />
        </div>
    );
}
