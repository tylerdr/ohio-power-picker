# Free fictional comparison integration

This branch adds only a provider-free learning tool at `/comparison-lab`, four
predefined fictional scenarios, a reproducible Markdown report download and an
About-page link. It imports no real tariffs, bills, identities or customer records.
It makes no availability, achievable-savings, enrollment, brokerage or revenue claim.
The report is free; it creates no commercial engagement or staffed support promise.

## Custody boundary (checked November 12, 2026)

Main: `cce3232e4eb322555ed2667391b4ed418152b86f`. Sole open PR: #13, reserved Tai
assessment lane, head `e008e52f43ee77409d306b268b66d118abcacbba`.
Its changed files cover `lib/assessment/**`, `app/broker-assessment/**`,
`app/api/broker-assessments/**`, `components/assessment-preparer.tsx`,
`components/lead-capture-modal.tsx`, `lib/supabase/server.ts`, package manifests,
assessment/custody documents and SQL, assessment/funnel tests, `LEADS.md` and
the public broker sample. None is touched by this branch. It introduces no
assessment adapter, persistence, recovery, checkout or entitlement implementation.

This branch owns only `lib/fictional-comparison/**`, `app/comparison-lab/**`,
`scripts/fictional-comparison/**`, this document and the narrow About-page link.
Existing source reservation and commercial scope stay with PR13. Package manifests
are intentionally unchanged. Empty hosted runtime targets remain empty. No paid
service runtime or operational configuration is enabled.

## Run focused checks

```sh
node --test scripts/fictional-comparison/*.test.mjs
npx tsc --noEmit --incremental false
```

The pure engine is adopted from separately reviewed local packet
`fdd48a0182e1121e5f0dc4d5d5016b49ed786384`; it has not been mathematically rewritten.
Numeric tests cover seasonal months, fees, rounding, unknowns, ties, first versus
sustained crossover and remaining term exposure. Integration tests execute actual
scenario, page SSR and download handlers with real React/Next Link/shadcn Button;
they cover all four examples, invalid query values, report bytes and headers, and
provider-free execution. No old broad suite is rerun for these checks.

The prior standalone HTML `file://` navigation was denied by Chromium with
`ERR_BLOCKED_BY_ADMINISTRATOR`. It is not retried or served by an alternate transport.
SSR and source checks here are not desktop/mobile browser acceptance. No browser
or production verification is claimed by this document.

Validation on November 12: all 42 focused calculation/integration tests passed;
TypeScript passed; Next.js production build completed all 107 pages and included
both new dynamic routes. Independent review prompted static ledger sections,
fictional social metadata and removal of the standalone packet's recovery promise
from this Markdown-only download. No package or PR13 reserved file was changed.

## Calculation boundary

Rates are integer micro-USD/kWh; usage is whole kWh. Each monthly energy charge is
rounded half-up before adding monthly fees. Switching charges the incumbent exit
fee once; staying does not. No subsequent switch is modeled; remaining contract
time and potential exit fee are disclosed separately. Delivery/taxes/credits and
other charges are excluded. A missing term/rate cannot be annualized. Variable
scenario endpoints are not forecasts or guaranteed bounds and are not ranked.

## Commercial separation

The existing $500 one-time assessment remains only a proposal. A real engagement
still requires buyer/signatory and scope acceptance, issuing entity/payment terms,
reserved operator capacity/due date, refund/cancellation rules, and private
delivery/support/recovery acceptance. This branch supplies none of those facts,
changes no commitments and creates no recurring offer or MRR.
