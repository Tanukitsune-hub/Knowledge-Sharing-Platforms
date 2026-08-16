# Work 0012 — Apps Script public-surface and reliability hardening

WORK_ID: `0012`

Repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`

Route: `C — Codex implementation, security hardening, and validation`, with ChatGPT retaining ownership of findings, accepted product scope, GitHub review, integration, and completion.

Recommended Codex model: `Sol High`.

Rationale: the primary defect is a critical, repository-wide Apps Script public-function boundary failure. Correcting it requires cross-cutting function/call-site migration, trigger and template preservation, security reasoning, regression enforcement, and final review across the complete source tree. Use Luna Max subagents for bounded mechanical inventories/tests when useful, but the parent should retain Sol High-level synthesis.

Starting ref: `2e64cefca07e065fafab4ff05261d2035364564a`

Target branch: `agent/0012-adversarial-review-hardening`

Draft PR target: `main`

Primary review source:

- `docs/reviews/0012-adversarial-review.md`

## Before starting

1. Read every applicable `AGENTS.md` and `AGENTS.override.md`.
2. Identify and follow the repository-specific subagent policy.
3. Use subagents actively and proportionately. Subagent use is mandatory.
4. At minimum use independent perspectives for:
   - complete Apps Script top-level/public-function inventory and exploitability review;
   - cross-file rename/call-site/trigger/template migration;
   - Knowledge Export limits, source integrity, Docs/PDF links, and prompt behavior;
   - error redaction, security tests, regression suite, documentation consistency, and final diff review.
5. Avoid overlapping write ownership. The parent agent must synthesize all findings and verify the final complete diff.
6. Never commit credentials, Google resource IDs, private URLs, account identifiers, source content, local paths, tokens, or production data.

## Outcome

Make the integrated application safe to continue toward a multi-user deployment by:

1. reducing the Apps Script browser-callable server surface to an explicit normal-user facade allowlist;
2. making all internal, adapter, administrator, diagnostic, retention, and trigger-only functions private to `google.script.run`;
3. adding automated public-surface regression enforcement;
4. fixing the accepted Knowledge Export path so broad previews are bounded before Doc reads and source links are authoritative/clickable;
5. improving prompt readability and public error redaction;
6. reconciling current documentation with the implemented Works 0004–0011 and the Work 0012 security boundary.

Do not add new product features or reopen accepted architecture.

## Required scope

### 1. Establish the public facade allowlist

Create one canonical allowlist used by validation/tests. Confirm actual client call sites before finalizing it.

Expected normal-user facade candidates are limited to the current Web App needs:

```text
doGet
getMeetingBootstrapData
registerMeeting
getPitchbookBootstrapData
preparePitchbookBatch
uploadPitchbookFile
getPhase1MaintenanceBootstrapData
searchMeetingRecords
getMeetingMaintenanceRecord
updateMeetingMaintenance
changeMeetingStatus
searchPitchbookRecords
getPitchbookMaintenanceRecord
updatePitchbookMaintenance
changePitchbookStatus
mutateMaster
quickAddGp
getPhase1Diagnostics  # only if its response remains explicitly safe and the UI still uses it
getKnowledgeSearchBootstrapData
searchKnowledge
previewKnowledgeExport
createKnowledgeExport
getKnowledgeExportPrompt
recordKnowledgeExportPromptCopy
```

Remove, privatize, or justify any additional browser-callable function. `askKnowledgeQuestion` is a legacy alias and should not remain public unless an actual supported client dependency is proven.

### 2. Make all implementation functions private

Apps Script rule:

- a `ksp` prefix is not a privacy boundary;
- a top-level server function is browser-callable unless it ends with `_` or is not top-level.

Requirements:

- rename every non-allowlisted top-level function with a trailing `_`, or move it into a non-top-level object/closure;
- update every call site across `.gs`, `.html`, tests, trigger registry strings, setup, templates, and validators;
- make `include` private and update template calls;
- make setup/validation/status/bootstrap-template functions editor-only/private;
- make audit-retention cleanup private;
- make manual AI sync and internal diagnostics private unless a narrowly sanitized user-facing diagnostic is explicitly allowed;
- make `kspWriteKnowledgeExportDocument`, `kspTrashKnowledgeExportFile`, live adapters, raw Drive/Sheets/Docs helpers, and every other direct service helper private;
- preserve installable trigger operation after private handler renaming;
- do not create a new authentication or ACL system merely to keep privileged functions public.

The fix must not rely on obscurity, UI hiding, naming conventions other than the Apps Script private rule, or client-side checks.

### 3. Add public-surface regression enforcement

Extend `scripts/validate-apps-script.cjs` or add a focused validator/test that:

- correctly identifies top-level function declarations while ignoring comments and string literals;
- fails when a top-level function without trailing `_` is not in the canonical allowlist;
- fails when a required public facade is missing;
- flags direct service helpers as public;
- checks that no privileged setup/retention/sync/admin function is public;
- covers the known destructive examples;
- does not add a heavy parser dependency unless genuinely necessary.

Add focused tests that model the intended public/private list. Run the validator as part of `npm run check`.

### 4. Sanitize privileged and public responses

- normal-user calls must not return backend/audit/folder/store IDs, Script Properties, credential state, raw API payloads, stacks, or private URLs not required by the requested user result;
- setup/status/validation reports remain editor-only and must not be exposed through `google.script.run`;
- replace raw public `error.message` propagation with a fixed safe error catalog for Meeting, Pitchbook, maintenance, Search, and Export paths;
- keep useful non-secret error codes;
- detailed diagnostics may go only to restricted server logs when safe;
- add synthetic secret markers to tests and prove they do not enter browser responses or Audit rows.

### 5. Bound Knowledge Export before materialization

Current count limits must act as server resource guards.

- resolve and count matching Active rows first;
- if Meeting count is over `50` or Pitchbook count is over `200`, return the exact count-based hard stop without reading every Meeting Doc;
- for requests within count limits, materialize at most the allowed Meeting count and compute exact authoritative text characters;
- stop before artifact creation when character count exceeds `250,000`;
- preserve warning thresholds and no-partial-output behavior;
- add a large synthetic Index test proving count hard-stop performs zero Meeting Doc reads;
- add a practical server deadline/budget guard without introducing background jobs, Cloud runtime, or split exports.

### 6. Bind links to stable file IDs and make them explicit hyperlinks

- verify each Meeting link corresponds to its `Doc_File_ID`;
- verify each Pitchbook link corresponds to its `File_ID`;
- prefer deriving canonical Docs/Drive URLs from stable IDs after confirming the file exists and is accessible;
- reject the entire export on source ID/link/file mismatch;
- write explicit hyperlinks into generated Google Docs rather than relying on automatic URL detection;
- ensure PDF output preserves useful source-link text and, where supported, hyperlinks;
- add corruption and link-target tests.

### 7. Make copied prompts human-readable

- include current GP, Asset Class, and Equity/Debt display names rather than only internal IDs;
- optionally include stable IDs in parentheses for traceability;
- preserve all five mode contracts and provider-neutral language;
- continue to work without Gemini configuration;
- never store prompt text in Audit.

### 8. Lightweight abuse protection

Apply the smallest useful server-side protection to expensive public operations:

- short-lived export-creation idempotency keyed to actor/temporary key, preview fingerprint, and output type;
- bounded throttling for repeated preview/export/Search calls using existing Apps Script primitives;
- safe behavior for `UNIDENTIFIED` without requiring persistent user identity;
- clear non-secret retry responses;
- no external rate-limit service, new database, or complex queue.

If a safe simple implementation would materially complicate the architecture, record a precise FIX SOON item rather than adding a fragile mechanism. The critical public-surface fix must not be delayed.

### 9. Reconcile documentation and diagnostics

After implementation stabilizes, update at least:

- `README.md`;
- `docs/README.md`;
- `docs/product/vision.md`;
- `docs/architecture/target-architecture.md`;
- `docs/planning/mvp-and-roadmap.md`;
- `docs/planning/apps-script-implementation-plan.md` where current status is stale;
- `docs/operations/runtime-policy.md`;
- `docs/governance/security.md`;
- `docs/decisions/decision-log.md`;
- root `AGENTS.md` and `src/AGENTS.md`.

Requirements:

- state that Works 0004–0011 are merged;
- state that Work 0012 hardening is active/completed as appropriate;
- document the explicit public facade / private function rule;
- include Knowledge Export in architecture and roadmap;
- preserve the explicit deferred production qualification items from Works 0010–0011;
- document export permission/retention risk;
- clarify the application/release version versus component Work IDs so setup/status output is not misleading.

Do not claim deferred live checks passed.

## Validation

Run a normal full checkout and:

```bash
npm run check
npm run test
git diff --check
```

Record exact counts.

Required focused validation:

- public allowlist inventory;
- known destructive helpers not public;
- setup/retention/sync/status functions not browser-callable;
- template include and Web App routes still work;
- installable trigger registry uses the correct private handler;
- all existing Meeting/Pitchbook/maintenance/AI/Export tests remain green;
- large export count hard-stop performs no Doc reads;
- stale preview and no-partial-output remain intact;
- ID/link mismatches fail closed;
- explicit hyperlink adapter behavior;
- readable five-mode prompts;
- error/Audit redaction with synthetic secret markers;
- setup migration/idempotency after any schema/version change.

### Targeted DEV validation

Using synthetic data only, when the existing authenticated DEV Apps Script project can be safely reconnected without Windows UI automation:

- push the hardened source;
- rerun setup/validation if handler/resource migration requires it;
- verify the normal Web App workflows still operate;
- from the browser, verify a representative internal/destructive function cannot be called through `google.script.run`;
- verify private setup/retention/sync functions are absent from the client surface;
- verify the private installable trigger executes or direct editor execution succeeds;
- create one Google Doc and one PDF Export and inspect source hyperlinks and folder placement.

If the DEV context is unavailable, complete all deterministic validation and mark only the live exposure/hyperlink checks as environment-limited. Do not claim production readiness.

Hosted CI absence is not a blocker, and no CI PASS may be claimed without an actual workflow run.

## Non-goals

- no new source database or Vector DB;
- no new user ACL system;
- no model router or model selection UI;
- no `.msg` support;
- no automatic EML attachment indexing;
- no export history, ZIP, scheduling, automatic expiry, or oversized-request splitting;
- no production deployment;
- no completion of the previously deferred billing-dependent Gemini matrices unless directly required to prove this hardening;
- no unrelated refactor or cosmetic redesign.

## Acceptance criteria

- the only browser-callable Apps Script functions are the reviewed public facade allowlist;
- direct destructive/internal helpers are not callable through `google.script.run`;
- privileged setup/retention/sync/status operations are private to normal Web App users;
- the public-surface validator prevents regression;
- normal Web App behavior and trigger behavior remain intact;
- broad Export previews hard-stop before unbounded Doc reads;
- source links are bound to stable file IDs and explicitly represented;
- copied prompts use human-readable names;
- public responses and Audit remain content/secret/redaction safe;
- governing documentation matches the implemented state;
- all canonical and focused tests pass;
- no implementation BLOCKER remains in the safely executable scope.

## Git and PR requirements

- work only on `agent/0012-adversarial-review-hardening`;
- preserve the ChatGPT-authored review and corrected source instructions;
- write `docs/handoffs/0012-report.md`;
- commit and push all scoped source, tests, docs, and report changes;
- open or update a Draft PR against `main`;
- link `docs/reviews/0012-adversarial-review.md`, `docs/handoffs/0012-instruction.md`, and `docs/handoffs/0012-report.md` in the PR;
- do not merge; ChatGPT will review the final diff and evidence.

## Stop / escalation conditions

Stop and report `BLOCKER` only if:

- Apps Script cannot preserve the required normal-user facade while making internal functions private;
- private trigger/editor execution cannot be retained without reopening the architecture;
- the current source contracts cannot bind authoritative file IDs and links safely;
- a data-integrity/security defect cannot be repaired within this scope;
- continuing requires production data, secret disclosure, destructive production action, or a new architecture.

Do not stop solely because hosted CI is absent, the existing DEV project is unavailable, a live browser check is user-dependent, or optional backlog remains.

## Completion response

Return only:

- Work ID;
- report path;
- final commit;
- branch;
- Draft PR;
- `BLOCKER: YES / NO`;
- one-line blocker summary when applicable.
