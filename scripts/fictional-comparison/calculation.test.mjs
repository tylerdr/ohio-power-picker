import assert from 'node:assert/strict';
import { test } from 'node:test';
import fs from 'node:fs/promises';
import { assess, renderReport } from '../../lib/fictional-comparison/compare.mjs';
const fixture = JSON.parse(await fs.readFile(new URL('../../lib/fictional-comparison/fixture.json', import.meta.url)));
const input = () => structuredClone(fixture);
const plan = (r, id) => r.results.find(p => p.id === id);

test('independently calculated annual oracle: 10300 kWh, fees and $60 incumbent exit charge', () => {
  const r = assess(input());
  assert.equal(r.totalKwh, 10300); assert.equal(r.baseline.totalCents, 119300);
  assert.equal(plan(r, 'harbor').totalCents, 113100); assert.equal(plan(r, 'harbor').modeledDifferenceCents, 6200);
  assert.equal(plan(r, 'meadow').totalCents, 111750); assert.equal(plan(r, 'meadow').modeledDifferenceCents, 7550);
  assert.deepEqual(r.lowestModeledKnownCostIds, ['meadow']);
});
test('monthly oracle preserves seasonality and fee timing', () => {
  const r = assess(input());
  assert.deepEqual(r.baseline.months.map(m => m.totalCents), [10400,9300,8200,7100,8200,10400,12600,13700,11500,9300,8200,10400]);
  assert.deepEqual(plan(r,'harbor').months.map(m=>m.totalCents), [15300,8400,7500,6600,7500,9300,11100,12000,10200,8400,7500,9300]);
  assert.deepEqual(plan(r,'meadow').months.map(m=>m.totalCents), [12800,6100,5400,6800,7850,9950,12050,13100,11000,8900,7850,9950]);
  assert.equal(plan(r,'harbor').firstNonnegativeMonth, 7); assert.equal(plan(r,'harbor').sustainedNonnegativeMonth, 7);
  assert.equal(plan(r,'meadow').firstNonnegativeMonth, 2);
});
test('incumbent exit fee charged once and never for staying; candidate exit is not charged on entry', () => {
  const x = input(); const withFee = assess(x); x.baseline.exitFeeCents = 0; const noFee = assess(x);
  assert.equal(withFee.baseline.totalCents, noFee.baseline.totalCents);
  for (const id of ['harbor','meadow']) assert.equal(plan(withFee,id).totalCents-plan(noFee,id).totalCents,6000);
  assert.equal(plan(withFee,'harbor').months.filter(m=>m.incumbentExitFeeCents).length,1);
});
test('schedule changes exactly at month four, no introductory annualization', () => {
  const p = plan(assess(input()), 'meadow');
  assert.equal(p.months[2].rateMicroUsdPerKwh,70000); assert.equal(p.months[3].rateMicroUsdPerKwh,105000);
});
test('variable scenario lower/upper costs are unranked with negative difference preserved', () => {
  const r = assess(input()), p = plan(r,'breeze');
  assert.equal(p.status,'scenario-only'); assert.equal(p.lowCost.totalCents,84100); assert.equal(p.highCost.totalCents,166500);
  assert.equal(p.lowCost.modeledDifferenceCents,35200); assert.equal(p.highCost.modeledDifferenceCents,-47200);
  assert(!r.lowestModeledKnownCostIds.includes('breeze'));
});
test('missing renewal, short term and unknown eligibility do not yield costs or rank', () => {
  const x = input(); x.plans[1].rateSchedule.pop(); const r=assess(x);
  for(const id of ['meadow','short','unknown-area']) { const p=plan(r,id); assert(!Object.hasOwn(p,'totalCents')); assert(!r.lowestModeledKnownCostIds.includes(id)); }
  assert.equal(plan(r,'meadow').status,'incomplete'); assert.equal(plan(r,'unknown-area').status,'excluded');
});
test('cheapest headline rate can lose to fees; staying is an explicit candidate', () => {
  const x=input(); x.plans=[x.plans[0]]; x.plans[0].monthlyFeeCents=10000;
  const r=assess(x); assert.equal(plan(r,'harbor').modeledDifferenceCents,-99400); assert.deepEqual(r.lowestModeledKnownCostIds,['baseline']);
});
test('exact annual break-even at 600 kWh/month preserves stay/Harbor tie', () => {
  const x=input(); x.usageKwh=Array(12).fill(600); x.plans=[x.plans[0]];
  const r=assess(x); assert.equal(plan(r,'harbor').modeledDifferenceCents,0); assert.deepEqual(r.lowestModeledKnownCostIds,['baseline','harbor']);
});
test('first crossing can reverse; sustained crossing is distinct', () => {
  const x=input(); x.horizonMonths=3; x.usageKwh=[1000,0,1000]; x.baseline.exitFeeCents=0;
  x.plans=[{...x.plans[0],monthlyFeeCents:2000}]; const p=plan(assess(x),'harbor');
  assert.deepEqual(p.cumulativeDifferenceCents,[500,-1000,-500]); assert.equal(p.firstNonnegativeMonth,1); assert.equal(p.sustainedNonnegativeMonth,null);
});
test('zero usage still incurs monthly and incumbent exit fees', () => {
  const x=input(); x.usageKwh=Array(12).fill(0); const r=assess(x);
  assert.equal(r.baseline.totalCents,6000); assert.equal(plan(r,'harbor').totalCents,20400);
});
test('round each monthly energy charge half-up before summing, using integer rates', () => {
  const x=input(); x.horizonMonths=2; x.usageKwh=[1,1]; x.baseline.monthlyFeeCents=0;
  x.baseline.rateSchedule[0].rateMicroUsdPerKwh=5000;
  assert.equal(assess(x).baseline.totalCents,2); // $0.005 each month -> $0.01 + $0.01
});
test('short horizon discloses uncharged future exit exposure', () => {
  const x=input(); x.horizonMonths=3; x.usageKwh=x.usageKwh.slice(0,3); const r=assess(x);
  assert.equal(plan(r,'harbor').exitFeeExposureCents,7500); assert.equal(r.baseline.exitFeeExposureCents,6000);
  assert.equal(plan(r,'harbor').totalCents,31200);
});
test('remaining contract months and both baseline/candidate exit exposures survive report rendering', () => {
  const x=input(); x.baseline.termMonths=24; x.baseline.rateSchedule[0].toMonth=24;
  x.plans[0].termMonths=36; x.plans[0].rateSchedule[0].toMonth=36;
  const r=assess(x), report=renderReport(r);
  assert.equal(r.baseline.remainingTermMonths,12); assert.equal(plan(r,'harbor').remainingTermMonths,24);
  assert.match(report,/Stay with fictional incumbent \| \$1193.00 \| \$0.00 \| n\/a \| 12 \| \$60.00/);
  assert.match(report,/Fictional Harbor Fixed \| \$1131.00 \| \$62.00 \| 7 \/ 7 \| 24 \| \$75.00/);
});
test('ineligible cheap candidate is excluded', () => {
  const x=input(); x.plans[1].eligibility='ineligible'; const r=assess(x);
  assert.equal(plan(r,'meadow').status,'excluded'); assert.deepEqual(r.lowestModeledKnownCostIds,['harbor']);
});
for (const [name, change] of [
  ['real input flag',x=>x.fictional=false],['foreign currency',x=>x.currency='EUR'],['customer field',x=>x.accountNumber='FICTIONAL-REJECT'],
  ['negative usage',x=>x.usageKwh[0]=-1],['fractional usage unsupported',x=>x.usageKwh[0]=1.5],['nonfinite usage',x=>x.usageKwh[0]=Infinity],
  ['missing month',x=>x.usageKwh.pop()],['zero horizon',x=>x.horizonMonths=0],['numeric string',x=>x.usageKwh[0]='900'],
  ['duplicate id',x=>x.plans[0].id='baseline'],['negative fee',x=>x.plans[0].monthlyFeeCents=-1],['missing fee',x=>delete x.plans[0].monthlyFeeCents],
  ['overlapping schedule',x=>x.plans[1].rateSchedule[1].fromMonth=3],['schedule gap',x=>x.plans[1].rateSchedule[1].fromMonth=5],
  ['reversed band',x=>x.plans[2].rateBand.lowMicroUsdPerKwh=200000],['unknown baseline',x=>x.baseline.rateSchedule[0].toMonth=6],
  ['HTML name',x=>x.plans[0].name='<script>fictional</script>'],['conflicting modes',x=>x.plans[0].rateBand={lowMicroUsdPerKwh:1,highMicroUsdPerKwh:2}],
]) test(`reject ${name}`,()=>{const x=input();change(x);assert.throws(()=>assess(x));});
test('model is deterministic and does not mutate caller input',()=>{
  const x=input(), before=JSON.stringify(x); assert.deepEqual(assess(x),assess(x)); assert.equal(JSON.stringify(x),before);
});
test('report explains scope, sign, excluded terms and scenario boundaries',()=>{
  const s=renderReport(assess(input()));
  for(const phrase of ['SYNTHETIC ONLY','-$472.00','INCOMPLETE','EXCLUDED','Delivery, taxes','not guaranteed bounds','incumbent exit fee','no saved account','Fictional Harbor Fixed']) assert(s.includes(phrase),phrase);
});
