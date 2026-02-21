'use client';

import { useMemo, type PointerEvent as ReactPointerEvent } from 'react';
import { formatRate } from '@/lib/utils';
import type { HistoricalRate } from '@/lib/types';

const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

type RateChartPoint = HistoricalRate & { avgPtcRate: number };

type Props = {
  data: RateChartPoint[];
  activeIndex: number | null;
  onActiveIndexChange: (index: number | null) => void;
};

const average = (values: number[]) => values.reduce((sum, value) => sum + value, 0) / values.length;

const formatPeriod = (period: string) => {
  const [year, month] = period.split('-');
  const monthIndex = Number(month) - 1;
  return `${monthLabels[monthIndex]} '${year.slice(-2)}`;
};

const formatTick = (value: number) => `${(value * 100).toFixed(1)}¢`;

export default function RateChart({ data, activeIndex, onActiveIndexChange }: Props) {
  const computedData = useMemo(() => {
    return data.map((item) => {
      const ptcValues = Object.values(item.priceToCompare);
      const avgPtcRate = ptcValues.length ? average(ptcValues) : item.avgPtcRate;
      return { ...item, avgPtcRate };
    });
  }, [data]);

  if (computedData.length === 0) {
    return (
      <div className="rounded-2xl border border-sea/10 bg-mist p-6 text-sm text-ink/70">
        No rate history available.
      </div>
    );
  }

  const width = Math.max(720, computedData.length * 18);
  const height = 260;
  const padding = { top: 24, right: 24, bottom: 36, left: 48 };

  const allValues = computedData.flatMap((item) => [
    item.avgVariableRate,
    item.avgFixedRate,
    item.avgPtcRate
  ]);

  const minValue = Math.min(...allValues) - 0.004;
  const maxValue = Math.max(...allValues) + 0.004;
  const range = maxValue - minValue || 1;

  const xScale = (index: number) => {
    const available = width - padding.left - padding.right;
    return padding.left + (index / (computedData.length - 1)) * available;
  };

  const yScale = (value: number) => {
    const available = height - padding.top - padding.bottom;
    return padding.top + (1 - (value - minValue) / range) * available;
  };

  const buildPoints = (values: number[]) =>
    values.map((value, index) => `${xScale(index)},${yScale(value)}`).join(' ');

  const variablePoints = buildPoints(computedData.map((item) => item.avgVariableRate));
  const fixedPoints = buildPoints(computedData.map((item) => item.avgFixedRate));
  const ptcPoints = buildPoints(computedData.map((item) => item.avgPtcRate));

  const handlePointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const ratio = x / rect.width;
    const index = Math.min(
      computedData.length - 1,
      Math.max(0, Math.round(ratio * (computedData.length - 1)))
    );
    onActiveIndexChange(index);
  };

  const handlePointerLeave = () => {
    onActiveIndexChange(null);
  };

  const yTicks = 5;
  const tickValues = Array.from({ length: yTicks }, (_, i) =>
    minValue + (range / (yTicks - 1)) * i
  );

  const activePoint = activeIndex !== null ? computedData[activeIndex] : null;
  const activeX = activeIndex !== null ? xScale(activeIndex) : null;
  const tooltipLeft = activeX ? Math.min(95, Math.max(5, (activeX / width) * 100)) : 0;

  return (
    <div className="relative" style={{ minWidth: `${width}px` }}>
      <div className="absolute left-4 top-2 text-xs font-semibold uppercase tracking-[0.2em] text-ink/40">
        ¢/kWh
      </div>
      {activePoint && (
        <div
          className="absolute top-2 rounded-2xl border border-sea/10 bg-white px-4 py-3 text-xs text-ink shadow-card"
          style={{ left: `${tooltipLeft}%`, transform: 'translateX(-50%)' }}
        >
          <div className="font-semibold text-ink">{formatPeriod(activePoint.period)}</div>
          <div className="mt-1 flex flex-col gap-1">
            <span className="text-sun">Variable: {formatRate(activePoint.avgVariableRate)}</span>
            <span className="text-leaf">Fixed: {formatRate(activePoint.avgFixedRate)}</span>
            <span className="text-ink/70">PTC: {formatRate(activePoint.avgPtcRate)}</span>
          </div>
        </div>
      )}
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="h-64 w-full"
        role="img"
        aria-label="Historical Ohio electricity rate chart"
        onPointerMove={handlePointerMove}
        onPointerLeave={handlePointerLeave}
        onPointerDown={handlePointerMove}
      >
        <rect x={0} y={0} width={width} height={height} fill="transparent" />
        {tickValues.map((value) => (
          <g key={value}>
            <line
              x1={padding.left}
              x2={width - padding.right}
              y1={yScale(value)}
              y2={yScale(value)}
              stroke="#0b1b2b"
              strokeOpacity="0.08"
            />
            <text
              x={8}
              y={yScale(value) + 4}
              className="fill-ink/60 text-xs"
            >
              {formatTick(value)}
            </text>
          </g>
        ))}

        {computedData.map((item, index) => {
          if (index % 3 !== 0) return null;
          return (
            <text
              key={item.period}
              x={xScale(index)}
              y={height - 10}
              textAnchor="middle"
              className="fill-ink/60 text-xs"
            >
              {formatPeriod(item.period)}
            </text>
          );
        })}

        <polyline
          points={ptcPoints}
          fill="none"
          stroke="#0b1b2b"
          strokeOpacity="0.4"
          strokeWidth="2"
          strokeDasharray="6 6"
        />
        <polyline
          points={fixedPoints}
          fill="none"
          stroke="#1b8f5a"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <polyline
          points={variablePoints}
          fill="none"
          stroke="#f6c453"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {activePoint && activeX !== null && (
          <g>
            <line
              x1={activeX}
              x2={activeX}
              y1={padding.top}
              y2={height - padding.bottom}
              stroke="#0b1b2b"
              strokeOpacity="0.2"
            />
            <circle
              cx={activeX}
              cy={yScale(activePoint.avgVariableRate)}
              r={5}
              fill="#f6c453"
              stroke="#fff"
              strokeWidth="2"
            />
            <circle
              cx={activeX}
              cy={yScale(activePoint.avgFixedRate)}
              r={5}
              fill="#1b8f5a"
              stroke="#fff"
              strokeWidth="2"
            />
            <circle
              cx={activeX}
              cy={yScale(activePoint.avgPtcRate)}
              r={5}
              fill="#0b1b2b"
              stroke="#fff"
              strokeWidth="2"
            />
          </g>
        )}
      </svg>

      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink/70">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-8 rounded-full bg-sun" />
          Avg variable rate
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-8 rounded-full bg-leaf" />
          Avg fixed rate
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-8 rounded-full bg-ink/40" />
          Price to Compare (PTC)
        </span>
      </div>
    </div>
  );
}
