import fs from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const OUTPUT_PATH = path.join(process.cwd(), 'data', 'suppliers.scraped.json');

const TERRITORIES: Record<string, string> = {
  'aep-ohio': 'AEP Ohio',
  'duke-energy-ohio': 'Duke Energy Ohio',
  'ohio-edison': 'Ohio Edison',
  'aes-ohio': 'Dayton Power & Light',
  'toledo-edison': 'Toledo Edison',
  'illuminating-company': 'The Illuminating Company'
};

async function fetchTerritory(territory: string) {
  const url = new URL('https://energychoice.ohio.gov/ApplestoApplesComparision.aspx');
  url.searchParams.set('Category', 'Electric');
  url.searchParams.set('Territory', territory);

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${territory}: ${response.status}`);
  }

  const html = await response.text();
  const $ = load(html);

  const rows: Array<Record<string, string>> = [];
  $('table tr').each((_, row) => {
    const cells = $(row).find('td');
    if (cells.length < 6) return;

    const name = $(cells[0]).text().trim();
    const rate = $(cells[1]).text().trim();
    const term = $(cells[2]).text().trim();
    const rateType = $(cells[3]).text().trim();
    const renewable = $(cells[4]).text().trim();
    const fee = $(cells[5]).text().trim();

    if (!name || name === 'Supplier Name') return;

    rows.push({
      name,
      rate,
      term,
      rateType,
      renewable,
      fee,
      territory
    });
  });

  return rows;
}

async function main() {
  const results: Record<string, Array<Record<string, string>>> = {};

  for (const territory of Object.values(TERRITORIES)) {
    console.log(`Fetching ${territory}...`);
    results[territory] = await fetchTerritory(territory);
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(results, null, 2));
  console.log(`Saved scrape to ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
