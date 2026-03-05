/**
 * Transform raw PUCO scrape into the Supplier[] format the site expects.
 * Groups offers by supplier+rate+term to deduplicate across territories.
 */
import fs from 'node:fs/promises';
import path from 'node:path';

const INPUT = path.join(process.cwd(), 'data', 'suppliers.scraped.json');
const PUCO_INPUT = path.join(process.cwd(), 'data', 'suppliers.json');
const OUTPUT = path.join(process.cwd(), 'data', 'suppliers.json');

function slugify(name: string): string {
  return name.toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function parseTermFee(fee: string): number {
  const match = fee.match(/\$(\d+)/);
  return match ? parseInt(match[1]) : 0;
}

interface RawOffer {
  supplier: string;
  rate: number;
  rateType: 'Fixed' | 'Variable';
  renewablePercent: number;
  introductory: boolean;
  termMonths: number;
  earlyTermFee: string;
  monthlyFee: string;
  territory: string;
  territoryName: string;
  priceToCompare: number;
}

async function main() {
  // Read the PUCO scrape data
  const raw = JSON.parse(await fs.readFile(PUCO_INPUT, 'utf-8'));
  
  // Flatten all offers
  const allOffers: RawOffer[] = [];
  for (const [territory, offers] of Object.entries(raw.territories)) {
    for (const offer of offers as RawOffer[]) {
      allOffers.push(offer);
    }
  }

  // Group by supplier+rate+term to create unique Supplier entries
  const grouped = new Map<string, { offer: RawOffer; territories: Set<string> }>();
  
  for (const offer of allOffers) {
    const key = `${slugify(offer.supplier)}-${offer.rateType.toLowerCase()}-${offer.rate}-${offer.termMonths}`;
    if (grouped.has(key)) {
      grouped.get(key)!.territories.add(offer.territory);
    } else {
      grouped.set(key, { offer, territories: new Set([offer.territory]) });
    }
  }

  // Convert to Supplier[] format
  const suppliers = Array.from(grouped.entries()).map(([key, { offer, territories }]) => ({
    id: key,
    name: `${offer.supplier} - ${offer.rateType} ${offer.termMonths}mo`,
    utilityTerritories: Array.from(territories),
    ratePerKwh: offer.rate,
    termMonths: offer.termMonths,
    rateType: offer.rateType.toLowerCase() as 'fixed' | 'variable',
    renewablePercent: offer.renewablePercent,
    earlyTerminationFee: parseTermFee(offer.earlyTermFee),
    introRateMonths: offer.introductory ? 1 : null,
    website: '',
    notes: `PUCO-certified. Scraped ${raw.scrapedAt.split('T')[0]}.`,
  }));

  // Sort by rate (cheapest first)
  suppliers.sort((a, b) => a.ratePerKwh - b.ratePerKwh);

  await fs.writeFile(OUTPUT, JSON.stringify(suppliers, null, 2));
  console.log(`Transformed ${allOffers.length} raw offers → ${suppliers.length} unique supplier entries`);
  console.log(`Territories covered: ${new Set(allOffers.map(o => o.territory)).size}`);
  
  // Show top 10 cheapest
  console.log('\nTop 10 cheapest:');
  for (const s of suppliers.slice(0, 10)) {
    console.log(`  $${s.ratePerKwh}/kWh ${s.rateType} ${s.termMonths}mo — ${s.name} (${s.utilityTerritories.join(', ')})`);
  }
}

main().catch(console.error);
