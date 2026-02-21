import { Supplier } from '@/lib/types';
import { formatRate } from '@/lib/utils';

const TOO_GOOD_MULTIPLIER = 0.7;

type Props = {
  variant?: 'compact' | 'full';
  priceToCompare?: number;
  suppliers?: Supplier[];
};

export default function ScamShield({ variant = 'full', priceToCompare, suppliers }: Props) {
  const tooGoodSuppliers = priceToCompare && suppliers
    ? suppliers.filter((supplier) => supplier.ratePerKwh <= priceToCompare * TOO_GOOD_MULTIPLIER)
    : [];

  if (variant === 'compact') {
    return (
      <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Scam Shield</p>
        <h3 className="mt-2 text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
          Quick tips to avoid costly surprises
        </h3>
        <div className="mt-4 grid gap-3 text-sm text-ink/70 md:grid-cols-2">
          <div className="rounded-2xl bg-sun/20 p-4">
            Never show your bill to door-to-door salespeople — they can switch you without consent.
          </div>
          <div className="rounded-2xl bg-sun/10 p-4">
            Delivery and supply are separate — you always pay delivery to your utility no matter what.
          </div>
          <div className="rounded-2xl bg-sun/20 p-4">
            Variable rates often spike after 1-3 months. Read the fine print before you switch.
          </div>
          <div className="rounded-2xl bg-sun/10 p-4">
            Early termination fees can lock you in. Look for ETFs above $75.
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-3xl border border-white/60 bg-white/70 p-6 shadow-card backdrop-blur">
      <div className="flex flex-col gap-2">
        <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Scam Shield</p>
        <h3 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
          Ohio scam warnings to keep you protected
        </h3>
        <p className="text-sm text-ink/70">Real complaints in Ohio often follow the same patterns. Watch for these traps.</p>
      </div>

      {priceToCompare && tooGoodSuppliers.length > 0 && (
        <div className="mt-4 rounded-2xl border border-sun/40 bg-sun/20 p-4 text-sm text-ink/80">
          <p className="font-semibold text-ink">Too good to be true checker</p>
          <p className="mt-1">
            Rates more than 30% below the Price to Compare ({formatRate(priceToCompare)}) deserve extra scrutiny.
          </p>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {tooGoodSuppliers.map((supplier) => (
              <li key={supplier.id}>{supplier.name} — {formatRate(supplier.ratePerKwh)}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="mt-6 grid gap-3 text-sm text-ink/70">
        <details className="rounded-2xl border border-sea/10 bg-mist p-4">
          <summary className="cursor-pointer font-semibold text-ink">Door-to-door scam alert</summary>
          <p className="mt-2">
            Never show your bill to door-to-door salespeople. They can use your account number to switch you without permission.
          </p>
        </details>
        <details className="rounded-2xl border border-sea/10 bg-mist p-4">
          <summary className="cursor-pointer font-semibold text-ink">Variable rate trap</summary>
          <p className="mt-2">
            Intro rates often spike after 1-3 months. If you see “variable,” assume the price can jump at any time.
          </p>
        </details>
        <details className="rounded-2xl border border-sea/10 bg-mist p-4">
          <summary className="cursor-pointer font-semibold text-ink">Delivery vs supply</summary>
          <p className="mt-2">
            Choosing a supplier only changes the supply portion. You always pay delivery to your utility, no matter what.
          </p>
        </details>
        <details className="rounded-2xl border border-sea/10 bg-mist p-4">
          <summary className="cursor-pointer font-semibold text-ink">ETF gotchas</summary>
          <p className="mt-2">
            Early termination fees can lock you in. If an ETF is over $75, be sure the savings are worth it.
          </p>
        </details>
        <details className="rounded-2xl border border-sea/10 bg-mist p-4">
          <summary className="cursor-pointer font-semibold text-ink">"Too good to be true" checker</summary>
          <p className="mt-2">
            Any rate more than 30% below the Price to Compare should trigger a second look at term length, fees, and auto-renewal language.
          </p>
        </details>
      </div>
    </section>
  );
}
