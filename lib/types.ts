export type RateType = 'fixed' | 'variable';

export type Supplier = {
  id: string;
  name: string;
  utilityTerritories: string[];
  ratePerKwh: number;
  termMonths: number;
  rateType: RateType;
  renewablePercent: number;
  earlyTerminationFee: number;
  introRateMonths: number | null;
  website: string;
  notes: string;
};

export type Utility = {
  id: string;
  name: string;
  serviceArea: string;
  priceToCompare: number;
};

export type HistoricalRate = {
  period: string;
  avgRetailRate: number;
  avgVariableRate: number;
  avgFixedRate: number;
  priceToCompare: Record<string, number>;
};
