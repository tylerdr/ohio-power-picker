# Owner-bound assessment custody — source-only activation contract

Parent PR13 ba7985a88700b996ab83f0bbad2d6a4f03cf730e. No provider, credential,
DB, branch or deployment actions accompany this proposal.

## Composition

`AssessmentCustody` preserves accepted registration/scope, original input, dated
source observations, original report/digest and preparation timestamp. Later edits
change `editedInput` and increment a checked version; recovery never regenerates
original bytes from a new template. Every read/write checks owner+tenant before
provider reads, then verifies current invoice/reversal evidence and checks it again
at response/persistence boundary. Nonzero partial refunds and any dispute deny
access under this proposed conservative policy; no new customer refund terms are
invented. Draft/open/unpaid, out-of-band payment, mismatched account/mode/customer,
missing reversal evidence and outages fail closed. Provider fixtures are not money.

`assessmentHandlers` composes that service with injected existing server session
authentication; request headers/body cannot supply owner authority. Reads are private
no-store. Writes require same origin, bounded JSON, existing accepted registration
and optimistic version. The saved view uses same-origin credentials and clears its
report before failures. References alone grant no rights.

`app/api/broker-assessments/[id]/route.ts` intentionally binds null runtime and
returns 503. Hosted activation requires all three together:
1. Existing verified session identity -> tenant/owner; runtime session/CSRF policy.
2. Dedicated durable transactional custody store, private ACL, backup/recovery and
   one-pilot registration authority. No registration-creation route exists here;
   an accepted bounded $500 measurement-gap scope and available slot cannot be
   inferred from payment or a checkbox. No new identity/checkout system introduced.
3. Server-scoped invoice reader returning authoritative invoice/customer/account/
   mode/amount/currency plus reconciled refund/dispute state. Current named sandbox
   is acct_1Re4ltEQ7c58oLZ4, livemode:false; no new invoice fixture or provider read.
   Actual provider implementation/credentials are NOT supplied by this patch.

`FileCustody` is the disposable/native-cloud test adapter: explicit absolute private
root, per-record cross-process exclusive lock, atomic replace, restrictive file
modes, no stale-lock takeover. Busy/crashed lock requires operator inspection; do
not delete locks automatically. It rejects VERCEL; ephemeral serverless files are
not hosted durability. A dedicated hosted adapter remains an external binding,
not a silent shared resource selection. No SQL or provider configuration is applied.

## Evidence limits and offer

Dated 2026-10-22 observations are retained; later reads label them dated evidence
requiring recheck. No new current offer, tariff PDF, buyer baseline, enrollment or
consumer advice. Original report remains explicitly synthetic/preparation-only;
paid authorization is distinct from content acceptance/delivery completion.
$500 proposed assessment, eight-hour ceiling, one pilot; no additional capacity.
Advertised tai@sprinterconsulting.com inbox is not verified staffing, message receipt
or staffed recovery. No outreach. Existing public sample/decision/campaign unchanged.

## Focused verification

Run `node scripts/test-assessment-custody.mjs`: 13 new isolated cases cover immutable
original/scope, edited-input versions, stale evidence, foreign owner/tenant before
provider, draft/unpaid, reversals/wrong resource binding, outage/retry, final-boundary
recheck, concurrency, real HTTP handlers, malformed/oversized input and corruption.
Targeted TypeScript includes the new service/adapters/HTTP route/saved-view closure.
Full repository was not restored after workspace maintenance; base Git tree preserves
all unrelated files. No old suite reruns or exact Vercel build claim for this unattached
tree. Root publishes with both required Tyler identities only after source review.

Rollback: discard unattached tree; after any reviewed future release revert source.
No native resource, invoice or migration cleanup is needed from this change.

## Concrete mounted composition successor

Inspection: current repository API rules name lib/supabase/server.ts, but the
published tree has no such helper, no sessions/store implementation and no Stripe
runtime. This successor supplies that helper and concrete HTTP adapters without
claiming an existing project/schema/session binding. No existing login is replaced.

Mounted route now invokes configFromEnvironment -> mountedAssessmentHandlers.
Production is disabled; only Preview plus a reviewed exact target entry is eligible.
APPROVED_ASSESSMENT_TARGETS remains EMPTY. Environment values alone cannot activate
an arbitrary or shared project. Missing binding returns 503 before any network read.

Server helper remotely verifies /auth/v1/user, rejects anonymous/ambiguous sessions,
checks issuer/sub/expiry only after remote verification and asks service-only RPC
for current membership plus auth.sessions presence. It never trusts user_metadata
or caller owner/tenant headers. Existing session issuer must establish the Secure,
HttpOnly, Path=/ __Host-ohio-access-token cookie (or existing clients may use Bearer);
this code does not create accounts, login, cookies or recovery-token ownership.

PostgREST adapter implements load -> callback -> compare-and-swap commit. RPC checks
current owner/membership/revision and preserves original JSON. Native SQL proposal
is documents/sql/assessment-custody-proposal.sql: private tables with RLS, no client
grants, service-only RPC grants, one-active-pilot index, no public registration path.
This is a compatibility proposal, NOT applied SQL or proven native policy behavior.
Dedicated project and existing auth.schema compatibility must be verified first.

Stripe reader makes only GETs using pinned 2024-06-20 response shapes; actual account
and Balance.livemode establish key scope on every access, then invoice plus expanded
charge/payment-intent must agree on invoice/customer/PI/charge/currency/mode/amount.
Charge refund/dispute state is authoritative; out-of-band, credit notes, customer
balance and unsupported/missing/multi-payment evidence fail closed. This narrow
single-captured-charge contract must be provider-rehearsed before enabling. No
webhook or new invoice is needed for fresh GET-based manual-invoice authorization.

Variable NAMES only (none configured): OHIO_ASSESSMENT_ENABLED,
OHIO_ASSESSMENT_SUPABASE_URL, OHIO_ASSESSMENT_TENANT,
OHIO_ASSESSMENT_PUBLISHABLE_KEY, OHIO_ASSESSMENT_SERVICE_KEY,
OHIO_ASSESSMENT_STRIPE_KEY; VERCEL_ENV must be preview. Required read permissions:
Stripe Account, Balance, Invoice, Charge/PaymentIntent expansion; only named separate
sandbox acct_1Re4ltEQ7c58oLZ4. Existing synthetic invoice is untouched. No secrets
are fetched, printed or stored by execution. Origin is compiled-allowlisted, not
request-selected; no Connect account impersonation header is sent.

New receipt: node scripts/test-assessment-adapters.mjs — 8 focused cases PASS,
concrete mounted transport chain, auth/membership denial, draft denial, actual-key
mode mismatch, foreign charge/refund/dispute, CAS conflicts, outage/new-instance
retry and foreign row rejection. Transport responses are synthetic; not native SQL,
real Stripe, browser or hosted acceptance. New service/route/saved-view adapter
closure typechecks. The earlier 13 custody cases were NOT rerun. Zod 3.25.76 was
already installed/locked transitively; it is promoted to a pinned direct dependency
for repository-required route-boundary validation. No install command was run.

### Narrow session-revocation correction

The remotely verified JWT session ID and expiry now remain in request-local
VerifiedOwnerSession, separate from registration and report content. Load and CAS
receive that exact session binding; callers cannot replace it through intake/headers.
The SQL proposal checks owner-session existence/expiry on load, locks the actual
session row FOR SHARE during CAS, and rechecks expiry before persistence. A concurrent
session deletion must serialize before denial or after the commit transaction.
The PostgREST adapter then calls the live owner/tenant/session RPC again after CAS,
before returning any original/edited report; a revoked session or expired verified
JWT at this response boundary denies, including GET recovery. It does not reuse the
actor cached at request authentication as proof of current authority.

Focused new receipt: node scripts/test-assessment-adapters.mjs --session-revocation
— 4 PASS: revocation during load, between auth and write CAS, after read CAS before
private response, and SQL session-parameter/owner-row-lock source contract. Existing
8 mounted adapter cases and 13 custody checks were not rerun. Targeted types passed.
Transport fixtures model revocation; SQL was not executed. SQL NULL/UI review remains
open and is not silently declared resolved. Approved targets remain empty. No provider,
install, DB, credential, deployment, ref or contact action occurred.


### NULL-safe CAS and initial preparation successor

CAS now rejects NULL/negative p_revision before the row comparison and uses
IS DISTINCT FROM for revision equality. Saved versions must be present JSON numbers,
canonical positive integer text and within JS safe integer bounds before bigint
casts. Existing saved versions are validated before increment comparison. Missing,
JSON null, fractional, string and unsafe versions cannot exploit SQL UNKNOWN.
Registration and immutable-original checks remain. PostgREST also rejects malformed
saved versions before emitting a commit request. These SQL changes are NOT executed
native PostgreSQL proof; the focused SQL receipt is a source-contract assertion.

Saved UI now includes first-report preparation using existing same-origin session
credentials and expectedVersion:0. No user/tenant/invoice/scope registration authority
is sent from the browser. The existing server registration, accepted bounded scope,
one-pilot authority and authoritative invoice checks still gate creation. No new
registration/checkout funnel. A second attempt conflicts and instructs reload;
original scope/source dates/bytes are retained. Form checkbox is preparation intent,
not customer legal acceptance or capacity reservation. Report remains clearly
synthetic preparation, not completed professional delivery.

New focused receipts only:
- node scripts/test-assessment-adapters.mjs --cas-initial: 5 PASS (malformed loaded
  revisions; malformed saved versions without commit; NULL-safe SQL source contract;
  UI request->mounted handler->original persistence/retry; draft/revoked denial).
- node scripts/test-assessment-saved-render.mjs: actual React server render PASS for
  initial controls, disabled scope/reference gate, recovery action and no private
  original before authenticated load. SSR is not browser click/account-switch proof.
- Targeted new source/saved-view TypeScript closure PASS. Earlier 13/8/4 cases not
  repeated. Existing available dependencies only; no installs/provider/ref actions.

No actual resource binding, operational staffing or additional pilot capacity is
asserted. Approved targets stay empty. Native NULL regression and hosted/browser
acceptance remain separate review/activation work.

### Private reader session-transition correction

Saved reader now obtains a fresh server-verified session view before and after each
load/prepare/edit. A stable opaque fingerprint binds tenant, owner and session (no
JWT/access token is returned). Response registration owner/tenant/reference must
match the freshly verified session. Request epochs, AbortControllers and unmount
fences prevent obsolete responses or errors from restoring prior private data.

Server session-view endpoint composes the existing verified-user/live-session RPC
helper and remains 503 under the empty approved-target list. It supplies the standard
Supabase GoTrue storage-key BroadcastChannel name; auth broadcast/storage payloads
are invalidation hints only, never identity authority. No new account/session system
or client-granted entitlement. Existing cookie/session issuer must emit its supported
Supabase auth transitions; this patch does not bind an unknown issuer.

Auth broadcast/storage, focus/pageshow/pagehide/visibility transitions clear private
report/edit state and abort pending work. The server expiry timestamp installs an
expiry-clear timer. Five-second server probes detect silent remote revocation;
network calls have the existing ten-second server adapter timeout. Remote revocation
without a local event is bounded polling detection, NOT an instantaneous push claim.
Session-verification outage clears the report rather than authorizing cached rights.
Every report server read/write still performs existing fresh paid/session checks.

New narrow proof only:
- node scripts/test-assessment-reader-transitions.mjs: 8 PASS; actual saved component
  executes hooks/effects/event handlers under a deterministic dispatcher, with React
  server-rendered output inspected across A->B/signout pending loads, loaded-view
  clearing, expiry/revocation, unmount, silent cookie switch and verification outage.
  This is not a browser DOM, browser Auth SDK or hosted account-switch acceptance.
- node scripts/test-assessment-adapters.mjs --reader-session: 2 PASS; actual session
  handler authenticates current owner/session, does not expose tokens, and denies
  revoked/foreign/missing binding/outage snapshots. Provider responses are fixtures.
- Targeted saved-reader/session endpoint TypeScript closure PASS. Unaffected prior
  13/8/4/5 checks were not rerun. SQL/native proposal, operator/price/one-pilot gates
  unchanged; no provider/install/ref/credential/DB action.
