# Broker assessment — proposal, not an active offer

Prepared 2026-10-22. Pending owner approval and buyer validation. This technical
handoff does not supersede accepted business decisions. No outreach, invoice,
contract, paid checkout, enrollment, production activation or spend is authorized.

## Buyer and bounded value

Hypothesis: an established Ohio electricity broker with an existing comparison
funnel needs to decide whether better comparison and attribution warrant investment.
Trigger: a documented loss between comparison and completed enrollment, or a known
current-data maintenance problem. Neither urgency nor willingness to pay is proven.

Proposed price: $500 once for one conversion and data-feasibility assessment.
Public comparison remains free. One pilot only; maximum eight delivery hours.
Do not represent this price as published, accepted or collected.

Deliverables: a source/date/provenance matrix for one utility territory; aggregate
funnel baseline with missing measurements explicit; a comparison of referral vs
embedded-tool feasibility; and a written go/no-go recommendation with blockers.
Excludes custom software, current-rate feed operation, consumer records, enrollment,
legal advice, guaranteed savings, guaranteed conversion uplift and ongoing support.

## Intake and acceptance

Before accepting: verify legal buyer identity, actual operating website and relevant
partner/certification evidence; record a specific painful job and decision-maker;
approve a written scope, delivery owner, due date, payment method and refund/cancellation
terms. No promised delivery date until operator availability is confirmed.
Use public sources and aggregate funnel counts only. No bills, account numbers,
consumer contact lists or credentials. Keep buyer and financial evidence out of GitHub.

Acceptance requires all four deliverables, source dates, explicit uncertainty,
a reproducible funnel definition and documented buyer acceptance or requested
correction. Keep receipt/payment reconciliation and delivery access in an approved
private system. A signed scope, invoice or test payment is not settled revenue.

## Delivery runbook (eight-hour ceiling)

1. Intake and evidence inventory: 1 hour.
2. Current-data feasibility for one territory: 2 hours. Capture source timestamp,
   permitted access, fields, fees and eligibility. Report unavailable data as blocked.
3. Aggregate funnel and attribution assessment: 2 hours. Define sessions -> comparison
   -> official/partner outbound -> completed enrollment -> accepted payout. Require
   a denominator and date range for every rate. Do not infer enrollments from clicks.
4. Commercial options and go/no-go: 2 hours; handoff/correction allowance: 1 hour.

Stop and return for scope resolution before exceeding the ceiling. Report measured
labor and costs. $500 / 8 = $62.50 gross per hour; this is not margin. Net cash per
sale = settled price minus refunds, fees, incremental costs and required reserves.
Those inputs remain unknown. Do not assign routine delivery to Tyler by default.

## Conversion experiment — pending permission

Hypothesis: ten verified brokers yield three qualified discussions and one paid
assessment. These counts are targets, not observed conversion rates. No paid ads.
First verify the previously recorded relationship privately; placeholder domains
are not prospects. Prospect list is currently empty of freshly qualified identities.

For each prospect record: official identity/source/date, Ohio relevance, buyer role,
contact provenance, specific trigger, fit and disqualifier. Obtain approval for exact
recipients and copy before sending. Cap at ten initial messages and one follow-up.
Window: seven days from approved first send. Primary metric: settled assessment
payments / delivered approved initial messages. Guardrails: zero unsupported rate
claims, zero consumer-data transfers, eight-hour delivery ceiling, one active pilot.
Continue only after paid acceptance and feasible delivery. No paid acceptance after
the bounded test means retain the hold; no broad widget development.

Unsent draft: “We are evaluating whether a clearer electricity comparison and
attribution workflow would solve a measurable problem for Ohio brokers. A proposed
$500 assessment covers current-data feasibility, an aggregate funnel baseline and
a go/no-go recommendation, without a custom build or promised conversion lift.
Would that address a decision you already need to make?”

## Release gates and target math

Before any paid/referral activation: current-data provenance, activity-specific
regulatory review, named partner agreement, consent/privacy terms, durable storage,
server-side payment verification, idempotent fulfillment, failure/recovery tests,
support owner, monitoring and rollback must have evidence. Current disabled APIs
must stay disabled until their prerequisites pass.

October target: $10,000 collected by October 31, 2026 23:59 America/Los_Angeles;
MRR reported separately. Actual cash, refunds, MRR and net cash per sale are unknown.
Therefore actual gap and sale count cannot yet be calculated. Conditional scenario
only: with no credited receipts and $500 net cash per sale, ceil(10000 / 500) = 20
sales and up to 160 delivery hours. At a hypothesized 10% prospect-to-paid rate,
that requires 200 qualified prospects. Fees/costs increase the required count.
The one-pilot capacity ceiling permits only $500 gross in the initial test; the
$10,000 October goal is unsupported by current pricing, demand and capacity evidence.

## Evidence and next checkpoints

Baseline source: main cce3232e4eb322555ed2667391b4ed418152b86f; no open PRs at
inspection. Live homepage and /compare retrieved October 22 match archived-screening
positioning; no exact deployment SHA or browser/mobile interaction proof established.
Supplier snapshot: March 15, 2026; utility benchmarks static. Official consumer
verification destination: https://www.energychoice.ohio.gov/ (accessed 2026-10-22).
Automated leads/subscriptions intentionally fail closed in source. Revenue, traffic,
contracts, current prospect qualification and delivery capacity remain unverified.

- October 22–23: baseline, evidence access and critical journey defects; preserve holds.
- October 24–26: validate release/acquisition prerequisites; no activation by calendar alone.
- October 27–30: measured conversion/delivery only following scoped approval.
- October 31: reconcile settled cash, refunds, one-time/subscription receipts and MRR.

Execution owner: this product's Tai cloud lane. Next action: obtain product-scoped
read-only receipt/funnel exports and verify the recorded broker identity; then
complete a named-buyer proposal. No scheduled continuation is claimed.
