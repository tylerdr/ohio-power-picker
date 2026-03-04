'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';

type HomeSize = 'apartment' | 'small' | 'medium' | 'large' | 'xl';
type HeatingType = 'gas' | 'electric' | 'heatpump';
type HouseholdSize = 'small' | 'medium' | 'large';

const HOME_SIZES: { key: HomeSize; label: string; emoji: string; kwh: number }[] = [
  { key: 'apartment', label: 'Apartment', emoji: '🏢', kwh: 500 },
  { key: 'small', label: 'Small', emoji: '🏡', kwh: 750 },
  { key: 'medium', label: 'Medium', emoji: '🏠', kwh: 1000 },
  { key: 'large', label: 'Large', emoji: '🏘️', kwh: 1400 },
  { key: 'xl', label: 'XL', emoji: '🏰', kwh: 2000 },
];

const HEATING_TYPES: { key: HeatingType; label: string; emoji: string; multiplier: number }[] = [
  { key: 'gas', label: 'Gas', emoji: '🔥', multiplier: 1.0 },
  { key: 'electric', label: 'Electric', emoji: '⚡', multiplier: 1.4 },
  { key: 'heatpump', label: 'Heat Pump', emoji: '♻️', multiplier: 1.15 },
];

const HOUSEHOLD_SIZES: { key: HouseholdSize; label: string; emoji: string; multiplier: number }[] = [
  { key: 'small', label: '1-2', emoji: '👤', multiplier: 1.0 },
  { key: 'medium', label: '3-4', emoji: '👨‍👩‍👧', multiplier: 1.15 },
  { key: 'large', label: '5+', emoji: '👨‍👩‍👧‍👦', multiplier: 1.3 },
];

type Props = {
  onEstimateChange: (kwh: number) => void;
};

export default function HomeProfile({ onEstimateChange }: Props) {
  const [homeSize, setHomeSize] = useState<HomeSize>('medium');
  const [heating, setHeating] = useState<HeatingType>('gas');
  const [household, setHousehold] = useState<HouseholdSize>('medium');

  const calculate = useCallback(
    (h: HomeSize, ht: HeatingType, hs: HouseholdSize) => {
      const base = HOME_SIZES.find((s) => s.key === h)!.kwh;
      const heatMult = HEATING_TYPES.find((t) => t.key === ht)!.multiplier;
      const houseMult = HOUSEHOLD_SIZES.find((s) => s.key === hs)!.multiplier;
      const est = Math.round(base * heatMult * houseMult);
      onEstimateChange(est);
      return est;
    },
    [onEstimateChange]
  );

  const estimatedKwh = (() => {
    const base = HOME_SIZES.find((s) => s.key === homeSize)!.kwh;
    const heatMult = HEATING_TYPES.find((t) => t.key === heating)!.multiplier;
    const houseMult = HOUSEHOLD_SIZES.find((s) => s.key === household)!.multiplier;
    return Math.round(base * heatMult * houseMult);
  })();

  return (
    <div className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3
            className="text-lg font-semibold text-ink"
            style={{ fontFamily: 'var(--font-fraunces), serif' }}
          >
            Your Home Profile
          </h3>
          <p className="text-sm text-ink/60">Tap to personalize your savings estimate</p>
        </div>
        <div className="mt-2 sm:mt-0 rounded-2xl bg-leaf/15 px-4 py-2 text-center">
          <p className="text-xs text-ink/60">Estimated usage</p>
          <p className="text-xl font-bold text-ink">{estimatedKwh.toLocaleString()} <span className="text-sm font-normal text-ink/60">kWh/mo</span></p>
        </div>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {/* Home Size */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/50">Home Size</p>
          <div className="flex flex-wrap gap-2">
            {HOME_SIZES.map((s) => (
              <Button
                key={s.key}
                type="button"
                variant="ghost"
                onClick={() => {
                  setHomeSize(s.key);
                  calculate(s.key, heating, household);
                }}
                className={`h-auto flex flex-col items-center rounded-2xl px-3 py-2 text-xs transition ${
                  homeSize === s.key
                    ? 'bg-sea text-white shadow-md'
                    : 'bg-mist text-ink/70 hover:bg-sky/60'
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="mt-0.5 font-medium">{s.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Heating Type */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/50">Heating</p>
          <div className="flex flex-wrap gap-2">
            {HEATING_TYPES.map((t) => (
              <Button
                key={t.key}
                type="button"
                variant="ghost"
                onClick={() => {
                  setHeating(t.key);
                  calculate(homeSize, t.key, household);
                }}
                className={`h-auto flex flex-col items-center rounded-2xl px-3 py-2 text-xs transition ${
                  heating === t.key
                    ? 'bg-sea text-white shadow-md'
                    : 'bg-mist text-ink/70 hover:bg-sky/60'
                }`}
              >
                <span className="text-lg">{t.emoji}</span>
                <span className="mt-0.5 font-medium">{t.label}</span>
              </Button>
            ))}
          </div>
        </div>

        {/* Household Size */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-ink/50">Household</p>
          <div className="flex flex-wrap gap-2">
            {HOUSEHOLD_SIZES.map((s) => (
              <Button
                key={s.key}
                type="button"
                variant="ghost"
                onClick={() => {
                  setHousehold(s.key);
                  calculate(homeSize, heating, s.key);
                }}
                className={`h-auto flex flex-col items-center rounded-2xl px-3 py-2 text-xs transition ${
                  household === s.key
                    ? 'bg-sea text-white shadow-md'
                    : 'bg-mist text-ink/70 hover:bg-sky/60'
                }`}
              >
                <span className="text-lg">{s.emoji}</span>
                <span className="mt-0.5 font-medium">{s.label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
