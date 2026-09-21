import fs from 'node:fs/promises';
import path from 'node:path';
import { load, type Cheerio, type CheerioAPI } from 'cheerio';
import type { AnyNode } from 'domhandler';

const OUTPUT_PATH = path.join(process.cwd(), 'data', 'suppliers.scraped.json');
const MIN_REASONABLE_RATE_PER_KWH = 0.05;

interface Offer {
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
  sourceUrl: string;
  supplierUrl: string;
  termsUrl: string;
  signUpUrl: string;
  promotional: boolean;
}

const TERRITORIES: Record<string, { id: number; name: string; rateCode: number }> = {
  'aep-ohio':        { id: 2, name: 'AEP Ohio',                   rateCode: 1 },
  'duke-energy':     { id: 4, name: 'Duke Energy Ohio',           rateCode: 1 },
  'ohio-edison':     { id: 7, name: 'Ohio Edison',                rateCode: 1 },
  'toledo-edison':   { id: 3, name: 'Toledo Edison',              rateCode: 1 },
  'aes-ohio':        { id: 9, name: 'AES Ohio (Dayton P&L)',      rateCode: 1 },
  'illuminating':    { id: 6, name: 'The Illuminating Company',   rateCode: 1 },
};

function extractPriceToCompare(bodyText: string): number {
  const normalized = bodyText.replace(/\s+/g, ' ');
  const match = normalized.match(
    /Price to Compare.*?\bis\s+\$([0-9]+\.[0-9]+)\s*(?:per\s*)?\/?kWh/i,
  );
  if (!match) {
    throw new Error('PUCO page did not expose a residential Price to Compare value');
  }

  return Number(match[1]);
}

function getLink($: CheerioAPI, row: Cheerio<AnyNode>, label: string): string {
  const link = row.find('a').filter((_, element) => $(element).text().trim() === label).first();
  return link.attr('href') || '';
}

function getSupplierName(row: Cheerio<AnyNode>): string {
  const title = row.find('.retail-title').first();
  const name = title
    .contents()
    .filter((_, node) => node.type === 'text')
    .first()
    .text()
    .trim();
  return name || title.text().replace(/\s+/g, ' ').trim();
}

async function fetchTerritory(key: string): Promise<Offer[]> {
  const info = TERRITORIES[key];
  const url = `https://energychoice.ohio.gov/ApplesToApplesComparision.aspx?Category=Electric&TerritoryId=${info.id}&RateCode=${info.rateCode}`;

  const response = await fetch(url);
  if (!response.ok) {
    console.error(`  ✗ Failed: ${response.status}`);
    return [];
  }

  const html = await response.text();
  const $ = load(html);
  const priceToCompare = extractPriceToCompare($('body').text());
  const offers: Offer[] = [];

  $('tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 5) return;

    const texts: string[] = [];
    cells.each((__, cell) => {
      texts.push($(cell).text().trim());
    });

    // Find the rate cell (0.XXXX format)
    const rateIdx = texts.findIndex(t => /^0\.\d{3,}$/.test(t));
    if (rateIdx < 0) return;

    const supplierCell = $(cells[rateIdx - 1]);
    const supplier = getSupplierName(supplierCell);

    const rate = parseFloat(texts[rateIdx]);
    const rateType = texts[rateIdx + 1]?.includes('Variable') ? 'Variable' : 'Fixed';
    const renewablePercent = parseInt(texts[rateIdx + 2]?.match(/(\d+)%/)?.[1] || '0');
    const introText = texts[rateIdx + 3] || '';
    const introductory = introText.toLowerCase().includes('yes');
    const termText = texts[rateIdx + 4] || '';
    const termMonths = parseInt(termText.match(/(\d+)\s*mo/)?.[1] || '0');
    const earlyTermFee = texts[rateIdx + 5]?.replace(/details/gi, '').trim() || '$0';
    const monthlyFee = texts[rateIdx + 6]?.trim() || '$0';
    const promotional = (texts[rateIdx + 7] || '').toLowerCase().includes('yes');

    offers.push({
      supplier,
      rate,
      rateType: rateType as 'Fixed' | 'Variable',
      renewablePercent,
      introductory,
      termMonths,
      earlyTermFee,
      monthlyFee,
      territory: key,
      territoryName: info.name,
      priceToCompare,
      sourceUrl: url,
      supplierUrl: getLink($, supplierCell, 'Company Url'),
      termsUrl: getLink($, supplierCell, 'Terms of Service'),
      signUpUrl: getLink($, supplierCell, 'Sign Up'),
      promotional,
    });
  });

  return offers;
}

async function main() {
  const allOffers: Record<string, Offer[]> = {};
  let totalOffers = 0;

  for (const [key, info] of Object.entries(TERRITORIES)) {
    console.log(`Fetching ${info.name}...`);
    const offers = await fetchTerritory(key);
    allOffers[key] = offers;
    totalOffers += offers.length;
    console.log(`  → ${offers.length} offers`);
  }

  const output = {
    scrapedAt: new Date().toISOString(),
    totalOffers,
    territories: allOffers,
  };

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(output, null, 2));
  console.log(`\nSaved ${totalOffers} total offers to ${OUTPUT_PATH}`);

  // Summary table
  console.log('\n=== BEST RATES BY TERRITORY ===');
  for (const [key, offers] of Object.entries(allOffers)) {
    const info = TERRITORIES[key];
    const fixed = offers
      .filter(o => o.rateType === 'Fixed' && o.rate >= MIN_REASONABLE_RATE_PER_KWH)
      .sort((a, b) => a.rate - b.rate);
    const variable = offers
      .filter(o => o.rateType === 'Variable' && o.rate >= MIN_REASONABLE_RATE_PER_KWH)
      .sort((a, b) => a.rate - b.rate);
    
    const best = fixed[0] || variable[0];
    if (best) {
      const savingsPct = ((best.priceToCompare - best.rate) / best.priceToCompare * 100).toFixed(1);
      console.log(`${best.territoryName} (PTC $${best.priceToCompare}): best $${best.rate}/kWh ${best.rateType} by ${best.supplier} → ${savingsPct}% savings`);
    } else {
      console.log(`${info.name}: no offers found`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
