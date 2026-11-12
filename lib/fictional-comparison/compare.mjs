// Pure, provider-free acceptance reference. No product source, tariff feed or payment dependency.
const fail = message => { throw new Error(message); };
const object = x => x !== null && typeof x === 'object' && !Array.isArray(x);
function keys(x, allowed, required = allowed) {
  if (!object(x) || Object.keys(x).some(k => !allowed.includes(k)) || required.some(k => !Object.hasOwn(x, k))) fail('Invalid or unsupported fields. Only fictional aggregate inputs are accepted.');
}
function int(x, min, max, label) {
  if (!Number.isSafeInteger(x) || x < min || x > max) fail(`Invalid ${label}.`);
}
function plan(p) {
  const common = ['id', 'name', 'termMonths', 'eligibility', 'monthlyFeeCents', 'exitFeeCents'];
  keys(p, [...common, 'rateSchedule', 'rateBand'], common);
  if (typeof p.id !== 'string' || !/^[a-z0-9-]{1,40}$/.test(p.id)) fail('Invalid plan id.');
  if (typeof p.name !== 'string' || !/^[A-Za-z0-9 .()-]{1,80}$/.test(p.name)) fail('Invalid fictional plan name.');
  int(p.termMonths, 1, 36, 'term');
  int(p.monthlyFeeCents, 0, 100000, 'monthly fee');
  int(p.exitFeeCents, 0, 100000, 'exit fee');
  if (!['fictional-eligible', 'ineligible', 'unknown'].includes(p.eligibility)) fail('Invalid eligibility.');
  if (Object.hasOwn(p, 'rateSchedule') === Object.hasOwn(p, 'rateBand')) fail('Supply exactly one schedule or scenario band.');
  if (Object.hasOwn(p, 'rateBand')) {
    keys(p.rateBand, ['lowMicroUsdPerKwh', 'highMicroUsdPerKwh']);
    const { lowMicroUsdPerKwh: low, highMicroUsdPerKwh: high } = p.rateBand;
    int(low, 0, 2000000, 'scenario low rate'); int(high, low, 2000000, 'scenario high rate');
  } else {
    if (!Array.isArray(p.rateSchedule) || p.rateSchedule.length < 1 || p.rateSchedule.length > 36) fail('Invalid rate schedule.');
    let last = 0;
    for (const s of p.rateSchedule) {
      keys(s, ['fromMonth', 'toMonth', 'rateMicroUsdPerKwh']);
      int(s.fromMonth, 1, 36, 'rate start'); int(s.toMonth, s.fromMonth, p.termMonths, 'rate end');
      int(s.rateMicroUsdPerKwh, 0, 2000000, 'rate');
      if (s.fromMonth !== last + 1) fail('Rate schedule must be ordered, contiguous and non-overlapping.');
      last = s.toMonth;
    }
  }
}
export function validate(input) {
  keys(input, ['schema', 'fictional', 'caseId', 'currency', 'horizonMonths', 'usageKwh', 'baseline', 'plans']);
  if (input.schema !== 'fictional-tariff-input.1' || input.fictional !== true || input.currency !== 'USD') fail('Only fictional USD fixtures are accepted.');
  if (typeof input.caseId !== 'string' || !/^fictional-[a-z0-9-]{1,60}$/.test(input.caseId)) fail('Use a fictional case id; no customer identifiers.');
  int(input.horizonMonths, 1, 36, 'horizon');
  if (!Array.isArray(input.usageKwh) || input.usageKwh.length !== input.horizonMonths) fail('Provide one usage value for every month.');
  input.usageKwh.forEach(x => int(x, 0, 100000, 'whole kWh usage'));
  plan(input.baseline);
  if (input.baseline.eligibility !== 'fictional-eligible' || input.baseline.rateBand || !covered(input.baseline, input.horizonMonths)) fail('A complete fictional fixed/scheduled baseline is required.');
  if (!Array.isArray(input.plans) || input.plans.length < 1 || input.plans.length > 20) fail('Provide 1 to 20 fictional candidates.');
  const ids = new Set([input.baseline.id]);
  for (const p of input.plans) { plan(p); if (ids.has(p.id)) fail('Duplicate plan id.'); ids.add(p.id); }
}
function covered(p, months) {
  return p.termMonths >= months && (p.rateBand || p.rateSchedule.at(-1).toMonth >= months);
}
function rateAt(p, month, band) {
  return p.rateBand ? p.rateBand[band] : p.rateSchedule.find(s => s.fromMonth <= month && s.toMonth >= month).rateMicroUsdPerKwh;
}
function monthly(p, usage, switchFeeCents, band) {
  return usage.map((kwh, i) => {
    const micro = BigInt(kwh) * BigInt(rateAt(p, i + 1, band));
    // Half-up, once per monthly supply energy charge. Fees are whole cents.
    const energyCents = Number((micro + 5000n) / 10000n);
    const entryCents = i === 0 ? switchFeeCents : 0;
    return { month: i + 1, kwh, rateMicroUsdPerKwh: rateAt(p, i + 1, band), energyCents, monthlyFeeCents: p.monthlyFeeCents, incumbentExitFeeCents: entryCents, totalCents: energyCents + p.monthlyFeeCents + entryCents };
  });
}
const sum = rows => rows.reduce((n, x) => n + x.totalCents, 0);
function comparison(rows, baseline) {
  let cumulative = 0;
  const deltas = rows.map((r, i) => { cumulative += baseline[i].totalCents - r.totalCents; return cumulative; });
  const first = deltas.findIndex(x => x >= 0);
  const sustained = deltas.findIndex((x, i) => x >= 0 && deltas.slice(i).every(y => y >= 0));
  return {
    totalCents: sum(rows), modeledDifferenceCents: sum(baseline) - sum(rows),
    firstNonnegativeMonth: first < 0 ? null : first + 1,
    sustainedNonnegativeMonth: sustained < 0 ? null : sustained + 1,
    cumulativeDifferenceCents: deltas, months: rows,
  };
}
export function assess(input) {
  validate(input);
  const baseRows = monthly(input.baseline, input.usageKwh, 0);
  const results = input.plans.map(p => {
    const result = { id: p.id, name: p.name, termMonths: p.termMonths, remainingTermMonths: Math.max(0, p.termMonths - input.horizonMonths), exitFeeExposureCents: p.termMonths > input.horizonMonths ? p.exitFeeCents : 0 };
    if (p.eligibility !== 'fictional-eligible') return { ...result, status: 'excluded', reason: `Eligibility ${p.eligibility}; no cost or ranking supplied.` };
    if (!covered(p, input.horizonMonths)) return { ...result, status: 'incomplete', reason: 'Term or scheduled rate ends before the requested horizon. Renewal is unknown; no extrapolation.' };
    if (p.rateBand) {
      return { ...result, status: 'scenario-only',
        lowCost: comparison(monthly(p, input.usageKwh, input.baseline.exitFeeCents, 'lowMicroUsdPerKwh'), baseRows),
        highCost: comparison(monthly(p, input.usageKwh, input.baseline.exitFeeCents, 'highMicroUsdPerKwh'), baseRows),
        reason: 'User-defined scenario endpoints, not guaranteed bounds or a forecast. Unranked.' };
    }
    return { ...result, status: 'comparable', ...comparison(monthly(p, input.usageKwh, input.baseline.exitFeeCents), baseRows) };
  });
  const known = results.filter(x => x.status === 'comparable');
  const minimum = Math.min(sum(baseRows), ...known.map(x => x.totalCents));
  return {
    schema: 'fictional-tariff-assessment.1', fictional: true, caseId: input.caseId,
    horizonMonths: input.horizonMonths, totalKwh: input.usageKwh.reduce((a, b) => a + b, 0),
    baseline: { id: input.baseline.id, termMonths: input.baseline.termMonths, remainingTermMonths: Math.max(0, input.baseline.termMonths - input.horizonMonths), totalCents: sum(baseRows), months: baseRows,
      exitFeeExposureCents: input.baseline.termMonths > input.horizonMonths ? input.baseline.exitFeeCents : 0 },
    results,
    lowestModeledKnownCostIds: [...(sum(baseRows) === minimum ? [input.baseline.id] : []), ...known.filter(x => x.totalCents === minimum).map(x => x.id)].sort(),
    limitations: [
      'Wholly fictional tariffs and usage; no current availability, enrollment, brokerage or savings claim.',
      'Supply energy, stated monthly fees and one immediate incumbent exit fee only. Delivery, taxes, credits, deposits and other charges are excluded.',
      'Whole kWh usage. Integer micro-USD/kWh rates; round each monthly energy charge half-up to cents, then add fees.',
      'Switch at start of month 1. Baseline termMonths is its remaining term at that time. Baseline exit fee applies once per switched candidate. Candidate exit fees are not charged because no further switch is modeled.',
      'Any remaining term and exit-fee exposure at horizon end are disclosed, not included in the cost. This is not a total-bill or contract-lifetime comparison.',
      'Scheduled rates are explicit fixture assumptions. Short terms, unknown renewal and unknown eligibility do not produce complete comparisons.',
      'Variable-rate scenario endpoints are assumptions, not guaranteed bounds or a forecast; actual rates can lie outside them. They are not ranked.',
      'No buyer, paid rights, conversion metrics or staffed delivery capacity is established by this output.',
    ],
  };
}
export const money = cents => `${cents < 0 ? '-' : ''}$${(Math.abs(cents) / 100).toFixed(2)}`;
export function renderReport(r) {
  const rows = r.results.map(x => x.status === 'comparable'
    ? `| ${x.name} | ${money(x.totalCents)} | ${money(x.modeledDifferenceCents)} | ${x.firstNonnegativeMonth ?? 'never'} / ${x.sustainedNonnegativeMonth ?? 'never'} | ${x.remainingTermMonths} | ${money(x.exitFeeExposureCents)} |`
    : x.status === 'scenario-only'
      ? `| ${x.name} (unranked scenarios) | ${money(x.lowCost.totalCents)} to ${money(x.highCost.totalCents)} | ${money(x.highCost.modeledDifferenceCents)} to ${money(x.lowCost.modeledDifferenceCents)} | not forecast | ${x.remainingTermMonths} | ${money(x.exitFeeExposureCents)} |`
      : `| ${x.name} | ${x.status.toUpperCase()} | ${x.reason} | n/a | ${x.remainingTermMonths} | ${money(x.exitFeeExposureCents)} |`);
  const details = r.results.flatMap(x => x.status === 'comparable' ? [x] : x.status === 'scenario-only' ? [{ id: `${x.id}-low`, ...x.lowCost }, { id: `${x.id}-high`, ...x.highCost }] : []);
  return [
    '# Fictional electricity comparison — reproducible decision exercise',
    '**SYNTHETIC ONLY. No current offer, enrollment service, paid delivery or customer result.**',
    `Case ${r.caseId}; ${r.horizonMonths} months; ${r.totalKwh} kWh. All prices USD.`,
    `Stay with fictional incumbent: ${money(r.baseline.totalCents)}. Lowest fully modeled cost (including stay): ${r.lowestModeledKnownCostIds.join(', ')}. This selects a fixture, not an available tariff.`,
    'Positive difference means lower modeled cost than staying; negative means higher modeled cost. Timing is first / sustained month when cumulative difference is nonnegative.',
    '| Fictional alternative | Modeled supply + entry cost | Difference versus stay | Timing (month) | Months remaining at horizon | Uncharged exit exposure at horizon |',
    '|---|---:|---:|---|---:|---:|',
    `| Stay with fictional incumbent | ${money(r.baseline.totalCents)} | $0.00 | n/a | ${r.baseline.remainingTermMonths} | ${money(r.baseline.exitFeeExposureCents)} |`, ...rows,
    '\n## Assumptions and exclusions', ...r.limitations.map(x => `- ${x}`),
    '\n## Reproducible monthly ledger',
    '| Option | Month | kWh | Rate (USD/kWh) | Energy | Monthly fee | Incumbent exit fee | Total |',
    '|---|---:|---:|---:|---:|---:|---:|---:|',
    ...[{ id: r.baseline.id, months: r.baseline.months }, ...details].flatMap(x => x.months.map(m => `| ${x.id} | ${m.month} | ${m.kwh} | ${(m.rateMicroUsdPerKwh / 1000000).toFixed(6)} | ${money(m.energyCents)} | ${money(m.monthlyFeeCents)} | ${money(m.incumbentExitFeeCents)} | ${money(m.totalCents)} |`)),
    '\n## Acceptance question',
    'Can the reader reproduce every monthly cost, distinguish a lower modeled cost from an achievable saving, see why a cheap headline rate may lose, and identify missing terms before deciding?',
    '\n## Download boundary',
    'This is a free fictional Markdown report. Downloaded text retains this calculation; no saved account, server custody, recovery packet, payment or delivery service is created.',
    '',
  ].join('\n');
}
