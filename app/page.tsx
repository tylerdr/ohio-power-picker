import Link from 'next/link';
import SiteHeader from '@/components/site-header';
import SiteFooter from '@/components/site-footer';
import { utilities } from '@/lib/utilities';

export default function HomePage() {
  return (
    <main className="pb-16">
      <SiteHeader />
      <section className="px-5 pt-10 md:px-10">
        <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Ohio Power Picker</p>
            <h1 className="mt-4 text-4xl font-semibold text-ink md:text-5xl" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
              Find a lower electricity rate in minutes.
            </h1>
            <p className="mt-4 text-base text-ink/70">
              Ohio is deregulated, which means you can choose your electricity supplier. Most offers cost more than the default rate. We surface the best options without the fine print.
            </p>

            <div className="mt-6 grid gap-3 text-sm text-ink/70">
              <div className="rounded-2xl bg-sky/60 p-4">
                <p className="font-semibold text-ink">72% of offers are more expensive</p>
                <p>We highlight which suppliers actually save you money.</p>
              </div>
              <div className="rounded-2xl bg-leaf/10 p-4">
                <p className="font-semibold text-ink">Plain-English recommendations</p>
                <p>AI summarizes rate type, term length, and risk factors.</p>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
            <h2 className="text-xl font-semibold text-ink" style={{ fontFamily: 'var(--font-fraunces), serif' }}>
              Start your comparison
            </h2>
            <p className="mt-2 text-sm text-ink/70">
              Enter your zip code and select your current utility.
            </p>

            <form action="/compare" method="get" className="mt-6 grid gap-4">
              <label className="grid gap-2 text-sm font-medium text-ink">
                Zip code
                <input
                  name="zip"
                  inputMode="numeric"
                  pattern="[0-9]{5}"
                  placeholder="43215"
                  className="rounded-2xl border border-sea/20 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-sea focus:outline-none"
                  required
                />
              </label>
              <label className="grid gap-2 text-sm font-medium text-ink">
                Utility
                <select
                  name="utility"
                  className="rounded-2xl border border-sea/20 bg-white px-4 py-3 text-base text-ink shadow-sm focus:border-sea focus:outline-none"
                  required
                >
                  <option value="">Select your utility</option>
                  {utilities.map((utility) => (
                    <option key={utility.id} value={utility.id}>
                      {utility.name}
                    </option>
                  ))}
                </select>
              </label>
              <button
                type="submit"
                className="rounded-full bg-sea px-5 py-3 text-sm font-semibold text-white transition hover:bg-leaf"
              >
                Compare suppliers
              </button>
            </form>

            <div className="mt-6 rounded-2xl bg-mist p-4 text-sm text-ink/70">
              <p className="font-semibold text-ink">Need help finding your utility?</p>
              <p className="mt-1">Look at the top of your electric bill, or check the utility service area list.</p>
              <Link href="/about" className="mt-3 inline-flex text-sm font-semibold text-sea">
                See utility territories
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pt-12 md:px-10">
        <div className="mx-auto max-w-6xl rounded-3xl border border-white/60 bg-white/70 p-8 shadow-card backdrop-blur">
          <div className="grid gap-6 md:grid-cols-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Step 1</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Enter zip + utility</h3>
              <p className="mt-2 text-sm text-ink/70">We match you to suppliers serving your territory.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Step 2</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Compare savings</h3>
              <p className="mt-2 text-sm text-ink/70">See how every plan stacks up against the default rate.</p>
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-ink/50">Step 3</p>
              <h3 className="mt-3 text-lg font-semibold text-ink">Pick confidently</h3>
              <p className="mt-2 text-sm text-ink/70">AI flags variable rates, fees, and best value.</p>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </main>
  );
}
