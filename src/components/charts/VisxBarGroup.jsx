import React, { useMemo, useState, useCallback, useRef } from 'react';
import { Group } from '@visx/group';
import { BarGroup } from '@visx/shape';
import { AxisBottom, AxisLeft } from '@visx/axis';
import { scaleBand, scaleLinear, scaleOrdinal } from '@visx/scale';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { GridRows } from '@visx/grid';
import { ParentSize } from '@visx/responsive';
import { LinearGradient } from '@visx/gradient';
import { Download, RotateCcw } from 'lucide-react';
import { toPng } from 'html-to-image';
import { Zoom } from '@visx/zoom';
import { formatUSD, formatRMB, formatNumber } from '../../utils/formatters';

const tooltipStyles = {
  ...defaultStyles,
  backgroundColor: 'rgba(15, 23, 42, 0.95)',
  color: 'white',
  borderRadius: '12px',
  padding: '12px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  border: 'none',
  fontSize: '12px',
  lineHeight: '1.5',
  pointerEvents: 'none',
  zIndex: 1000,
};

const VisxBarGroup = ({
  data,
  keys,
  colors,
  xKey = 'Calibre',
  valueFormatter = formatUSD,
  unitLabel = '',
  volLabel = 'Cajas Eq',
  height = 450
}) => {
  const containerRef = useRef(null);
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip();

  const handleDownload = useCallback(async () => {
    if (containerRef.current === null) return;
    const dataUrl = await toPng(containerRef.current, { cacheBust: true, backgroundColor: '#ffffff' });
    const link = document.createElement('a');
    link.download = `chart-${new Date().getTime()}.png`;
    link.href = dataUrl;
    link.click();
  }, []);

  return (
    <div className="relative group/chart" ref={containerRef}>
      <ParentSize>
        {({ width }) => {
          if (width < 10) return null;

          const margin = { top: 40, right: 20, bottom: 60, left: 60 };
          const xMax = width - margin.left - margin.right;
          const yMax = height - margin.top - margin.bottom;

          const xScale = scaleBand({
            domain: data.map(d => d[xKey]),
            padding: 0.2,
          }).rangeRound([0, xMax]);

          const xGroupScale = scaleBand({
            domain: keys,
            padding: 0.15,
          }).rangeRound([0, xScale.bandwidth()]);

          const colorScale = scaleOrdinal({
            domain: keys,
            range: keys.map(k => colors[k] || '#94a3b8'),
          });

          const maxValue = Math.max(
            ...data.map(d => Math.max(...keys.map(k => d[k] || 0))),
            1
          );

          const yScale = scaleLinear({
            domain: [0, maxValue * 1.15],
            nice: true,
          }).range([yMax, 0]);

          return (
            <Zoom
              width={xMax}
              height={yMax}
              scaleXMin={1}
              scaleXMax={4}
              scaleYMin={1}
              scaleYMax={4}
            >
              {zoom => (
                <div className="relative">
                  <div className="absolute right-4 top-2 flex space-x-2 z-20 opacity-0 group-hover/chart:opacity-100 transition-opacity no-print">
                    <button
                      onClick={() => zoom.reset()}
                      className="p-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 shadow-sm transition-all"
                      title="Reset Zoom"
                    >
                      <RotateCcw size={16} />
                    </button>
                    <button
                      onClick={handleDownload}
                      className="p-1.5 bg-white/80 backdrop-blur border border-slate-200 rounded-lg text-slate-600 hover:text-blue-600 shadow-sm transition-all"
                      title="Download PNG"
                    >
                      <Download size={16} />
                    </button>
                  </div>

                  <svg
                    width={width}
                    height={height}
                    style={{ cursor: zoom.isDragging ? 'grabbing' : 'default', touchAction: 'none' }}
                  >
                    <defs>
                      {keys.map(key => (
                        <LinearGradient
                          key={`grad-${key}`}
                          id={`grad-${key}`}
                          from={colors[key] || '#94a3b8'}
                          to={colors[key] || '#94a3b8'}
                          toOpacity={0.7}
                        />
                      ))}
                    </defs>
                    <rect
                      width={width}
                      height={height}
                      rx={14}
                      fill="transparent"
                      onMouseDown={zoom.dragStart}
                      onMouseMove={zoom.dragMove}
                      onMouseUp={zoom.dragEnd}
                      onMouseLeave={() => {
                        if (zoom.isDragging) zoom.dragEnd();
                      }}
                    />
                    <Group top={margin.top} left={margin.left}>
                      <Group transform={zoom.toString()}>
                        <GridRows scale={yScale} width={xMax} stroke="#f1f5f9" strokeDasharray="0" />
                        <BarGroup
                          data={data}
                          keys={keys}
                          height={yMax}
                          x0={d => d[xKey]}
                          x0Scale={xScale}
                          x1Scale={xGroupScale}
                          yScale={yScale}
                          color={colorScale}
                        >
                          {barGroups =>
                            barGroups.map(barGroup => (
                              <Group key={`bar-group-${barGroup.index}-${barGroup.x0}`} left={barGroup.x0}>
                                {barGroup.bars.map(bar => (
                                  <rect
                                    key={`bar-group-bar-${barGroup.index}-${bar.index}-${bar.value}-${bar.key}`}
                                    x={bar.x}
                                    y={bar.y}
                                    width={bar.width}
                                    height={bar.height}
                                    fill={`url(#grad-${bar.key})`}
                                    rx={4}
                                    className="transition-all duration-300 hover:brightness-110 cursor-pointer"
                                    onMouseMove={event => {
                                      const point = localPoint(event);
                                      const d = data[barGroup.index];
                                      const clientName = bar.key.replace('_vol_val', '');
                                      showTooltip({
                                        tooltipData: {
                                          client: clientName,
                                          value: bar.value,
                                          volume: d._volumes?.[clientName] || d[`${clientName}_vol`] || 0,
                                          varieties: d._varieties?.[clientName] || '',
                                          calibre: d[xKey],
                                        },
                                        tooltipLeft: point.x,
                                        tooltipTop: point.y,
                                      });
                                    }}
                                    onMouseLeave={() => hideTooltip()}
                                  />
                                ))}
                              </Group>
                            ))
                          }
                        </BarGroup>
                      </Group>
                      <AxisBottom
                        top={yMax}
                        scale={xScale}
                        stroke="#e2e8f0"
                        tickStroke="#e2e8f0"
                        tickLabelProps={{
                          fill: '#94a3b8',
                          fontSize: 10,
                          fontWeight: 600,
                          textAnchor: 'middle',
                        }}
                      />
                      <AxisLeft
                        scale={yScale}
                        stroke="none"
                        tickStroke="none"
                        tickFormat={val => valueFormatter(val).split('.')[0]}
                        tickLabelProps={{
                          fill: '#94a3b8',
                          fontSize: 10,
                          fontWeight: 600,
                          textAnchor: 'end',
                          dx: -8,
                          dy: 4,
                        }}
                      />
                    </Group>
                  </svg>

                  {tooltipData && (
                    <TooltipWithBounds
                      key={Math.random()}
                      top={tooltipTop}
                      left={tooltipLeft}
                      style={tooltipStyles}
                    >
                      <div className="space-y-2 min-w-[160px]">
                        <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                          <span className="font-bold text-white text-xs">{tooltipData.client}</span>
                          <span className="text-white/60 text-[10px] uppercase font-bold tracking-wider">{tooltipData.calibre}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/70 font-medium">Precio:</span>
                          <span className="font-bold text-blue-400">{valueFormatter(tooltipData.value)}{unitLabel && unitLabel.length < 15 && `/${unitLabel}`}</span>
                        </div>
                        <div className="flex justify-between items-center text-[11px]">
                          <span className="text-white/70 font-medium">Volumen:</span>
                          <span className="font-bold text-emerald-400">{formatNumber(tooltipData.volume)} {volLabel}</span>
                        </div>
                        {tooltipData.varieties && (
                          <div className="mt-2 pt-1.5 border-t border-white/5 text-[10px] text-white/40 italic leading-tight font-medium">
                            {tooltipData.varieties}
                          </div>
                        )}
                      </div>
                    </TooltipWithBounds>
                  )}
                </div>
              )}
            </Zoom>
          );
        }}
      </ParentSize>
    </div>
  );
};

export default VisxBarGroup;
