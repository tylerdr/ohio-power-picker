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
      <div className="flex h-40 items-end gap-2">
        {data.map((item) => {
          const height = `${(item.value / max) * 100}%`;
          return (
            <div key={item.month} className="flex flex-1 flex-col items-center gap-2">
              <div className="w-full">
                <div
                  className={`w-full rounded-2xl ${getColor(item.value)}`}
                  style={{ height }}
                  title={`${item.month}: ${formatRate(item.value)}`}
                />
              </div>
              <span className="text-xs text-ink/60">{item.month}</span>
            </div>
          );
        })}
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
