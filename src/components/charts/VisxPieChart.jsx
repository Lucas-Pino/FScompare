import React, { useMemo } from 'react';
import { Pie } from '@visx/shape';
import { Group } from '@visx/group';
import { ParentSize } from '@visx/responsive';
import { Annotation, Label, Connector } from '@visx/annotation';
import { scaleOrdinal } from '@visx/scale';
import { useTooltip, TooltipWithBounds, defaultStyles } from '@visx/tooltip';
import { localPoint } from '@visx/event';
import { GradientPinkBlue } from '@visx/gradient';
import { LegendOrdinal, LegendItem, LegendLabel } from '@visx/legend';
import { formatNumber } from '../../utils/formatters';
import { COLORS } from '../../utils/constants';

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

export default function VisxPieChart({
  data,
  valueKey = 'value',
  nameKey = 'name',
  unitLabel = '',
  height = 450
}) {
  const {
    showTooltip,
    hideTooltip,
    tooltipData,
    tooltipLeft,
    tooltipTop,
  } = useTooltip();

  return (
    <div className="relative">
      <ParentSize>
        {({ width }) => {
          if (width < 10) return null;

          const margin = { top: 40, right: 80, bottom: 40, left: 80 };
          const innerWidth = width - margin.left - margin.right;
          const innerHeight = height - margin.top - margin.bottom;
          const radius = Math.min(innerWidth, innerHeight) / 2;
          const centerY = height / 2;
          const centerX = width / 2;
          const donutThickness = 60;

          const colorScale = scaleOrdinal({
            domain: data.map(d => d[nameKey]),
            range: data.map(d => COLORS[d[nameKey]] || '#94a3b8'),
          });

          return (
            <div className="relative">
              <svg width={width} height={height}>
                <GradientPinkBlue id="pie-gradient" />
                <Group top={centerY} left={centerX}>
                  <Pie
                    data={data}
                    pieValue={d => d[valueKey]}
                    outerRadius={radius}
                    innerRadius={radius - donutThickness}
                    cornerRadius={6}
                    padAngle={0.03}
                  >
                    {pie => {
                      return pie.arcs.map((arc, index) => {
                        const { name } = arc.data;
                        const [centroidX, centroidY] = pie.path.centroid(arc);
                        const arcColor = COLORS[name] || '#94a3b8';
                        const labelRadius = radius * 1.25;
                        const labelAngle = (arc.startAngle + arc.endAngle) / 2;
                        const lx = labelRadius * Math.sin(labelAngle);
                        const ly = -labelRadius * Math.cos(labelAngle);

                        return (
                          <g key={`arc-${name}-${index}`}>
                            <path
                              d={pie.path(arc)}
                              fill={arcColor}
                              className="transition-all duration-300 hover:opacity-80 cursor-pointer"
                              onMouseMove={event => {
                                const point = localPoint(event);
                                showTooltip({
                                  tooltipData: arc.data,
                                  tooltipLeft: point.x,
                                  tooltipTop: point.y,
                                });
                              }}
                              onMouseLeave={() => hideTooltip()}
                            />
                            {arc.endAngle - arc.startAngle > 0.1 && (
                              <Annotation
                                x={centroidX}
                                y={centroidY}
                                dx={lx - centroidX}
                                dy={ly - centroidY}
                              >
                                <Connector stroke={arcColor} strokeWidth={1} type="line" />
                                <Label
                                  title={name}
                                  titleFontSize={10}
                                  titleFontWeight="bold"
                                  titleFill={arcColor}
                                  backgroundFill="white"
                                  backgroundProps={{ opacity: 0.9 }}
                                  showAnchorLine={false}
                                  horizontalAnchor={lx > 0 ? 'start' : 'end'}
                                  verticalAnchor="middle"
                                />
                              </Annotation>
                            )}
                          </g>
                        );
                      });
                    }}
                  </Pie>
                </Group>
              </svg>

              <div className="flex flex-wrap justify-center gap-4 mt-4 px-6 no-print">
                <LegendOrdinal scale={colorScale}>
                  {labels =>
                    labels.map((label, i) => (
                      <LegendItem key={`legend-${i}`} margin="0 8px">
                        <div className="flex items-center">
                          <div
                            style={{
                              width: 10,
                              height: 10,
                              borderRadius: '50%',
                              backgroundColor: label.value,
                              marginRight: 6,
                            }}
                          />
                          <LegendLabel align="left" margin={0}>
                            <span className="text-[10px] font-bold text-slate-500 uppercase">
                              {label.text}
                            </span>
                          </LegendLabel>
                        </div>
                      </LegendItem>
                    ))
                  }
                </LegendOrdinal>
              </div>

              {tooltipData && (
                <TooltipWithBounds
                  key={Math.random()}
                  top={tooltipTop}
                  left={tooltipLeft}
                  style={tooltipStyles}
                >
                  <div className="space-y-2 min-w-[180px]">
                    <div className="flex items-center justify-between border-b border-white/10 pb-1.5 mb-1.5">
                      <span className="font-bold text-white text-xs">{tooltipData[nameKey]}</span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white/70">Volumen:</span>
                      <span className="font-bold text-emerald-400">
                        {formatNumber(tooltipData[valueKey])} {unitLabel}
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px]">
                      <span className="text-white/70">Cajas Físicas:</span>
                      <span className="font-bold text-blue-400">
                        {formatNumber(tooltipData.cajas)}
                      </span>
                    </div>
                    {tooltipData.varieties && (
                      <div className="mt-2 pt-1.5 border-t border-white/5 text-[10px] text-white/50 italic leading-tight">
                        {tooltipData.varieties}
                      </div>
                    )}
                  </div>
                </TooltipWithBounds>
              )}
            </div>
          );
        }}
      </ParentSize>
    </div>
  );
}
