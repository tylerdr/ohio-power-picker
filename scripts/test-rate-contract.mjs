import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const home = read('app/page.tsx');
const pricing = read('app/pricing/page.tsx');
const compare = read('components/compare-content.tsx');
const table = read('components/supplier-table.tsx');
const picks = read('components/top-picks.tsx');
const chat = read('app/api/chat/route.ts');
const llms = read('public/llms.txt');
const suppliers = read('data/suppliers.json');
const snapshot = read('lib/rate-snapshot.ts');
const layout = read('app/layout.tsx');

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(suppliers.includes('Scraped 2026-03-15.'), 'Supplier source snapshot date must remain discoverable.');
assert(snapshot.includes("supplierOffersAsOf: '2026-03-15'"), 'Canonical snapshot metadata must declare 2026-03-15.');
assert(snapshot.includes('ApplestoApples.aspx'), 'Canonical snapshot metadata must link to PUCO Apples to Apples.');

assert(pricing.includes('* 100).toFixed(2)'), 'Pricing difference must convert dollars/kWh to cents/kWh with * 100.');
assert(!pricing.includes('* 1000).toFixed(2)'), 'Retired 10x savings-display bug must not return.');

const core = [home, pricing, compare, table, picks, chat, llms].join('\n');
for (const retired of [
  'We pull live PUCO supplier data',
  'best supplier rate available right now',
  'Rates are updated regularly from PUCO data',
  'current public shopping context',
  'Get This Plan',
  'a licensed energy specialist will contact you',
]) {
  assert(!core.includes(retired), `Retired live/enrollment claim returned: ${retired}`);
}

for (const required of [
  'March 15, 2026',
  'verify current',
]) {
  assert(core.toLowerCase().includes(required.toLowerCase()), `Missing rate-snapshot boundary phrase: ${required}`);
}

assert(table.includes('Verify current offer at PUCO') || table.includes('Verify at PUCO'), 'Supplier table must route current verification to PUCO.');
assert(picks.includes('Verify current offer at PUCO'), 'Snapshot picks must route current verification to PUCO.');
assert(!table.includes('LeadCaptureModal'), 'Archived supplier table must not route stale offers into enrollment lead capture.');
assert(!picks.includes('LeadCaptureModal'), 'Archived top picks must not route stale offers into enrollment lead capture.');
assert(chat.includes('Never describe a stored rate'), 'AI system boundary must prohibit presenting stored rates as current.');
assert(!layout.includes('google-site-verification-placeholder'), 'HTML metadata must not emit a fake Google verification token.');
assert(layout.includes('canonical: SITE_URL'), 'Primary metadata must declare the canonical production URL.');

if (failures.length) {
  console.error(`Rate-contract checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Rate-contract checks passed.');
