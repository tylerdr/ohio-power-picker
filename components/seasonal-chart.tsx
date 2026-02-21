'use client';

import { formatRate } from '@/lib/utils';

type SeasonalDatum = {
  month: string;
  value: number;
};

type Props = {
  data: SeasonalDatum[];
};

export default function SeasonalChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-sea/10 bg-mist p-6 text-sm text-ink/70">
        No seasonal data available.
      </div>
    );
  }

  const values = data.map((item) => item.value);
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const lowThreshold = min + range * 0.33;
  const highThreshold = min + range * 0.66;

  const getColor = (value: number) => {
    if (value <= lowThreshold) return 'bg-sky';
    if (value <= highThreshold) return 'bg-sun';
    return 'bg-danger';
  };

  return (
    <div className="rounded-3xl border border-white/70 bg-white/80 p-4 shadow-card">
      <div className="flex items-end gap-2" style={{ height: 160 }}>
        {data.map((item) => {
          // Use pixel height based on proportion to max
          const barHeight = Math.max(8, Math.round((item.value / max) * 140));
          return (
            <div key={item.month} className="flex flex-1 flex-col items-center justify-end h-full">
              <div
                className={`w-full rounded-t-lg ${getColor(item.value)} transition-all`}
                style={{ height: barHeight }}
                title={`${item.month}: ${formatRate(item.value)}`}
              />
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex gap-2">
        {data.map((item) => (
          <div key={`label-${item.month}`} className="flex-1 text-center text-xs text-ink/60">
            {item.month}
          </div>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-4 text-xs text-ink/60">
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sky" />
          Low months
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-sun" />
          Moderate
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-danger" />
          Peak months
        </span>
      </div>
    </div>
  );
}
