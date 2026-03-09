import React from 'react';
import VisxBarGroup from './VisxBarGroup';
import { VALID_CLIENTS, COLORS } from '../../utils/constants';
import { formatRMB } from '../../utils/formatters';

export default function ChartRMB({ data, unitPriceLabel }) {
    return (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <h4 className="font-bold text-slate-800 mb-6 uppercase tracking-wider text-sm flex items-center">
                💴 Venta Bruta por Calibre
                <span className="ml-2 px-2 py-0.5 bg-amber-50 text-amber-600 rounded text-[10px] lowercase font-medium">
                    (rmb/{unitPriceLabel})
                </span>
            </h4>
            <VisxBarGroup
                data={data}
                keys={VALID_CLIENTS}
                colors={COLORS}
                valueFormatter={formatRMB}
                unitLabel={unitPriceLabel}
                volLabel={`Eq (${unitPriceLabel.split(' ')[2]})`}
            />
        </div>
    );
}
