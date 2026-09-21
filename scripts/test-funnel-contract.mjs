import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const emailCapture = read('components/email-capture.tsx');
const subscribe = read('app/api/subscribe/route.ts');
const leads = read('app/api/leads/route.ts');

const failures = [];
const assert = (condition, message) => {
  if (!condition) failures.push(message);
};

assert(emailCapture.includes('Automatic rate alerts are unavailable right now'), 'UI must disclose that automatic alerts are unavailable.');
assert(emailCapture.includes('does not create an alert subscription'), 'Manual email fallback must not imply an alert subscription.');
assert(emailCapture.includes('mailto:tai@sprinterconsulting.com'), 'Manual rate-question destination must remain explicit.');

for (const [name, source] of [['subscribe', subscribe], ['leads', leads]]) {
  assert(source.includes('status: 503'), `${name} route must fail closed with 503.`);
  assert(source.includes('Cache-Control'), `${name} route must prevent caching the unavailable response.`);
  assert(!source.includes('writeFile'), `${name} route must not write to ephemeral storage.`);
  assert(!source.includes('RESEND_API_KEY'), `${name} route must not imply configured notification delivery.`);
}

if (failures.length) {
  console.error(`Funnel-contract checks failed (${failures.length}):`);
  for (const failure of failures) console.error(`- ${failure}`);
  process.exit(1);
}

console.log('Funnel-contract checks passed.');
