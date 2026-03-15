import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const OUTPUT_PATH = path.join(process.cwd(), 'data', 'suppliers.scraped.json');

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
}

const TERRITORIES: Record<string, { id: number; name: string; rateCode: number; ptc: number }> = {
  'aep-ohio':        { id: 2, name: 'AEP Ohio',                   rateCode: 1, ptc: 0.1065 },
  'duke-energy':     { id: 4, name: 'Duke Energy Ohio',           rateCode: 1, ptc: 0.1006 },
  'ohio-edison':     { id: 7, name: 'Ohio Edison',                rateCode: 1, ptc: 0.0933 },
  'aes-ohio':        { id: 3, name: 'AES Ohio (Dayton P&L)',      rateCode: 1, ptc: 0.0889 },
  'toledo-edison':   { id: 9, name: 'Toledo Edison',              rateCode: 1, ptc: 0.0933 },
  'illuminating':    { id: 6, name: 'The Illuminating Company',   rateCode: 1, ptc: 0.0933 },
};

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
  const offers: Offer[] = [];

  $('tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 5) return;

    const texts: string[] = [];
    cells.each((__, cell) => texts.push($(cell).text().trim()));

    // Find the rate cell (0.XXXX format)
    const rateIdx = texts.findIndex(t => /^0\.\d{3,}$/.test(t));
    if (rateIdx < 0) return;

    // Supplier is in the cell before rate (skip checkbox cell at index 0)
    const supplierRaw = texts[rateIdx - 1] || '';
    // Extract just the company name - the cell contains name+address+phone+links all mashed together
    // The name ends at the first digit sequence (start of address) or known suffix
    const supplierMatch = supplierRaw.match(/^(.+?(?:LLC|Inc|Corp|Ltd|LP|Co\.|Services|Solutions|Energy))\b/i);
    let supplier: string;
    if (supplierMatch) {
      supplier = supplierMatch[1].trim();
    } else {
      // Fallback: take text before first number sequence (address)
      const fallback = supplierRaw.match(/^([A-Za-z &.,'-]+)/);
      supplier = fallback ? fallback[1].trim() : supplierRaw.substring(0, 40);
    }

    const rate = parseFloat(texts[rateIdx]);
    const rateType = texts[rateIdx + 1]?.includes('Variable') ? 'Variable' : 'Fixed';
    const renewablePercent = parseInt(texts[rateIdx + 2]?.match(/(\d+)%/)?.[1] || '0');
    const introText = texts[rateIdx + 3] || '';
    const introductory = introText.toLowerCase().includes('yes');
    const termText = texts[rateIdx + 4] || '';
    const termMonths = parseInt(termText.match(/(\d+)\s*mo/)?.[1] || '0');
    const earlyTermFee = texts[rateIdx + 5]?.replace(/details/gi, '').trim() || '$0';
    const monthlyFee = texts[rateIdx + 6]?.trim() || '$0';

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
      priceToCompare: info.ptc,
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
    const fixed = offers.filter(o => o.rateType === 'Fixed' && o.rate > 0).sort((a, b) => a.rate - b.rate);
    const variable = offers.filter(o => o.rateType === 'Variable' && o.rate > 0).sort((a, b) => a.rate - b.rate);
    
    const best = fixed[0] || variable[0];
    if (best) {
      const savingsPct = ((info.ptc - best.rate) / info.ptc * 100).toFixed(1);
      console.log(`${info.name} (PTC $${info.ptc}): best $${best.rate}/kWh ${best.rateType} by ${best.supplier} → ${savingsPct}% savings`);
    } else {
      console.log(`${info.name}: no offers found`);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
