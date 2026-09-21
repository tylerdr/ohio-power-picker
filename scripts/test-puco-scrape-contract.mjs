import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const source = fs.readFileSync(path.join(root, 'scripts/scrape-puco.ts'), 'utf8');
const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(source.includes('extractPriceToCompare'), 'PUCO scraper must parse the benchmark from the source page.');
assert(!source.includes('ptc: 0.1065'), 'PUCO scraper must not carry a stale hardcoded benchmark.');
assert(source.includes("'toledo-edison':   { id: 3"), 'Toledo Edison must use PUCO territory 3.');
assert(source.includes("'aes-ohio':        { id: 9"), 'AES Ohio must use PUCO territory 9.');
assert(source.includes("getSupplierName(supplierCell)"), 'Supplier names must come from the marked PUCO supplier title.');
assert(source.includes('signUpUrl'), 'Scraped offers must retain the source enrollment URL for provenance review.');
assert(source.includes('promotional'), 'Scraped offers must retain the promotional-offer flag.');
assert(source.includes('MIN_REASONABLE_RATE_PER_KWH'), 'Scraper summaries must exclude malformed sub-five-cent rows.');

const transform = fs.readFileSync(path.join(root, 'scripts/transform-puco-data.ts'), 'utf8');
assert(transform.includes('MIN_REASONABLE_RATE_PER_KWH'), 'Transformed data must exclude malformed sub-five-cent rows.');

if (failures.length) {
  console.error(`PUCO scraper contract checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('PUCO scraper contract checks passed.');
