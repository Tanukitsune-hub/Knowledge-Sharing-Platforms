# Work 0021 — CODEX-01 structured filters and five-mode core

WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-01
MODE: BUILD -> QUALIFICATION
BALL: CODEX
STATUS: READY

## Primary outcome

Build the first bounded product slice of Work 0021: one shared Knowledge Search conditions/mode contract, core structured filters, and all five accepted modes on the qualified OpenAI route and the API-independent FULL_OUTPUT route.

Preserve the accepted Work 0020 provider/citation/lifecycle behavior and the accepted Work 0025 model/thinking policy. This dispatch moves the broad product forward; it is not a provider-rebuild, multi-Entity comparison campaign, format matrix, Gemini recovery, installer Work, or general hardening pass.

## Source and runtime baseline

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- required base: latest `origin/main`; the direct dispatch prompt supplies the exact prepared SHA
- create fresh branch: `agent/0021-structured-search-core`
- accepted Work 0020 merge: OpenAI File Search, authoritative citation normalization, exact sync/lifecycle/recovery, FULL_OUTPUT foundation
- accepted Work 0025 merge: administrator-governed model/thinking selection and exact tuple qualification
- current deployed runtime: standalone private Apps Script `KSP Work 0010 DEV Qualification`
- current deployed private Web App: version 60
- current qualified tuple: `openai-current-default` / `gpt-5.6-terra` / provider-default thinking
- runtime locator: `docs/operations/runtime-artifact-locator.md`
- designated existing synthetic sources: `DOC-000017`, `MTG-000005`
- protected/non-target sources: `DOC-000018` and old 5–25 MiB fixtures

Read the nearest `AGENTS.md`, this instruction, `docs/handoffs/0021-instruction.md`, `docs/planning/work-registry.md`, the full Work 0021 plan, Work 0020/0025 decisions, provider-neutral architecture, current source/tests, and runtime locator before editing.

GitHub/current code is the source of truth. Inventory the actual current UI, request contracts, source metadata, filters, mode templates, FULL_OUTPUT package builder, audit path, and tests before choosing exact implementation details.

## Accepted dependencies — do not reopen

Preserve:

- explicit `ChatGPT / Gemini / 全文出力` route selection;
- no automatic cross-provider fallback;
- OpenAI File Search as the API source-reading path;
- authoritative Drive source identity and normalized citations;
- Work 0025 model/thinking selectors and server-side effective-policy resolver;
- exact tuple qualification and raw model/thinking rejection;
- Meeting Google Doc as the authoritative FULL_OUTPUT body source;
- Pitchbook bodies excluded from FULL_OUTPUT; matching Pitchbooks may appear only as bounded reference metadata/Drive links;
- current retry/replacement/orphan-cleanup behavior;
- current Backend/Audit/Shared Drive architecture;
- one existing private Web App rather than a new deployment.

Do not modify the model/thinking registry contract except where strictly necessary to pass the existing validated selection through the expanded request.

## Dispatch boundary

### In scope

1. one canonical structured filter model shared by OpenAI and FULL_OUTPUT;
2. one shared conditions/mode UI;
3. core exact filters that are already representable safely;
4. all five mode templates and result contracts;
5. OpenAI filter translation and grounded citation behavior;
6. authoritative FULL_OUTPUT filtering and mode/scope parity;
7. safe Audit metadata for the new selections;
8. deterministic tests and a bounded private-Web-App campaign;
9. planning/tracking updates for the next Work 0021 dispatch.

### Deferred to 0021-CODEX-02

- explicit selection and synthesis across 2–5 Entities;
- per-Entity citation grouping/comparison table;
- Related GP where current comma-separated relationships cannot be represented exactly;
- Meeting Type if dedicated exact-filterable metadata is not already safely available;
- any advanced filter requiring provider reindex/migration beyond this bounded core.

### Deferred to 0021-CODEX-03

- six-format matrix: `.pdf / .pptx / .xlsx / .docx / .txt / .eml`;
- provider capability/parity matrix beyond the currently enabled OpenAI route;
- Gemini recovery/live qualification.

### Out of scope

- Work 0023 bundle/installer;
- historical-material migration;
- company-environment rollout;
- provider model discovery;
- exhaustive model/thinking benchmarks;
- large-file recovery;
- custom database, relation sheet, vector database, knowledge graph, or public-web enrichment.

## 1. Canonical filter contract

Extend one provider-neutral request/filter object. Do not create separate filter shapes for OpenAI and FULL_OUTPUT.

Implement the safely representable core set after current-code inventory:

```text
Date From / To
Counterparty Type
Counterparty Entity — one exact stable entity_key
GP — exact stable GP ID where applicable
Asset Class
Equity / Debt / Capital Type
Team
Fund / Strategy — exact trimmed value only where current metadata is authoritative
要フォロー
Source Type — Meeting / Pitchbook / both
```

Rules:

- empty/`未選択` values mean no filter and are omitted;
- validate all Master-backed IDs server-side against current authoritative catalogs;
- Entity uses exact stable `entity_key`, not display text;
- Fund / Strategy uses an exact distinct trimmed value; no fuzzy normalization;
- boolean follow-up has explicit unset / required / not-required semantics if the UI exposes both values;
- date values use the repository Business Date contract;
- source-type-incompatible filters must fail clearly or produce an explicit limitation; never silently broaden scope;
- comma-separated substring matching is never treated as exact;
- Inactive Master values may remain selectable for historical records where current product rules permit;
- client controls are not authorization or validation;
- provider Store/File IDs never enter the public request.

If one listed core filter cannot be represented exactly without a material reindex or architecture change, implement the remaining coherent set, return a safe explicit unsupported limitation for that filter, and route the exact missing capability to CODEX-02. Do not fake equality.

## 2. Shared UI

Use one conditions/mode form for all three routes.

Preserve the Work 0025 controls:

```text
Route
Model
Thinking
Mode
Structured filters
Question / additional instruction
```

Behavior:

- model/thinking controls appear only for enabled AI routes;
- FULL_OUTPUT hides AI model/thinking controls;
- changing route does not create a second independent filter form;
- selector values use stable IDs/internal values, while labels remain human-readable;
- dependent options refresh safely when Counterparty Type/Entity or other existing relationships require it;
- disabled Gemini remains visible or safely unavailable according to the existing product behavior, with no fallback;
- search/result state must not accidentally reuse a stale query after filters, mode, model, or thinking change;
- existing pending-query/resume behavior remains valid with the expanded fingerprint.

Do not redesign the whole application. Make the existing Knowledge Search page genuinely usable with the new conditions.

## 3. Five modes

Use one mode-definition registry shared by API and FULL_OUTPUT routes:

```text
自由質問
要約
時系列
比較
面談準備
```

Mode changes output instruction/structure only. It must not alter source authority, access boundaries, filter semantics, model-policy enforcement, or citation mapping.

### 自由質問

- question required;
- direct grounded answer;
- evidence/uncertainty state;
- normalized citations.

### 要約

- question optional;
- summarize the selected scope across sources;
- distinguish major facts/themes, changes, contradictions, and evidence gaps;
- cite supporting sources.

### 時系列

- question optional;
- produce dated chronology from the selected scope;
- distinguish change, continuity, and missing periods;
- citations attributable to periods/items.

### 比較 — CODEX-01 scope

- implement the shared mode and prompt/output contract now;
- compare periods, documents, strategies, or themes inside the current single-Entity/GP/filter scope;
- do not pretend this is the later 2–5 Entity feature;
- if the user attempts explicit multi-Entity comparison before CODEX-02, return a clear bounded limitation rather than inventing support.

### 面談準備

- require one suitable target scope: exact Entity or GP according to the current authoritative model;
- organize recent updates, changes, unresolved points, items to reconfirm, suggested questions, evidence gaps, and citations;
- do not create autonomous investment recommendations.

Each mode must have deterministic validation for required inputs and output/prompt structure.

## 4. OpenAI retrieval behavior

Use the selected Work 0025-qualified model/thinking tuple through the existing server-side resolver.

Translate the canonical filters to the currently supported OpenAI File Search filter shape:

- exact equality for stable IDs/booleans/source type/exact strategy;
- `gte` / `lte` for date range;
- explicit `and` composition for multiple clauses where the current provider API contract supports it;
- no filename or display-name identity matching;
- no silent removal of unsupported clauses.

Preserve:

- `include: ["file_search_call.results"]` where required by current normalization;
- authoritative source reconciliation;
- deduplication by stable source identity;
- citation provenance distinction;
- no provider ID exposure;
- insufficient-evidence behavior when no trustworthy source supports an answer.

Do not broad-sync the corpus merely to test filters. Add/reindex only exact small synthetic sources if strictly required.

## 5. FULL_OUTPUT parity

FULL_OUTPUT uses the same canonical mode, filters, selected scope, and input validation, but calls no AI API.

Preserve the accepted source boundary:

- Meeting Google Docs body is authoritative and may enter the package;
- Pitchbook body/content is not extracted into FULL_OUTPUT;
- matching Pitchbooks may appear only as bounded reference metadata and authoritative Drive links;
- one canonical package must back Copy / Google Docs / PDF outputs.

Required behavior:

- exact same structured filter semantics as the API route against authoritative records;
- scope/source/character summary;
- selected mode and optional instruction included in the external-AI handoff prompt/package contract;
- output buttons above the fixed-height internally scrollable preview;
- no-results and hard-stop behavior remain safe;
- stale preview fingerprint invalidates output creation;
- Audit never stores the full package/body.

## 6. Catalog and metadata

Reuse existing GP/Option/Entity catalogs and source metadata. Do not add a new sheet solely for filters.

Where current OpenAI documents lack a core exact metadata field that is already authoritative in Backend rows, update the canonical source metadata builder and exact-sync only the designated small synthetic source(s) needed for runtime proof. Preserve source IDs and content hashes; do not create duplicate current provider documents.

Do not introduce a broad reindex. Document any required future metadata migration for real historical records as a follow-up rather than blocking the bounded product slice.

## 7. Result and citation UX

For OpenAI results show at least:

- selected provider/model/thinking labels or safe effective-selection summary;
- mode and scope summary;
- answer;
- insufficient-evidence or limitation note;
- normalized citation list;
- source type, stable source ID, date, display name/entity where available;
- authoritative Drive link;
- cited-source count;
- omitted/truncated indicator where the bounded contract already supports it.

Never expose provider Store/File IDs or raw response payloads.

For FULL_OUTPUT preserve its separate package preview/output UX rather than presenting AI citations.

## 8. Audit

Append only bounded structured metadata permitted by the existing redaction policy:

```text
route/provider
mode
validated model profile ID
validated thinking profile ID
structured filter stable IDs/exact values
single selected Entity stable key where applicable
result
cited stable source IDs
safe error/limitation code
existing safe latency/usage fields
```

Do not store:

- API keys or credentials;
- question/additional instruction text where current policy redacts it;
- generated answers;
- chunks or source bodies;
- FULL_OUTPUT body/package;
- raw provider payloads;
- provider Store/File IDs.

## 9. Deterministic validation

Add focused tests covering at least:

1. one canonical request/filter model feeds OpenAI and FULL_OUTPUT;
2. each core filter validates stable IDs/exact values and omits empty values;
3. multiple OpenAI clauses compose exactly and no clause is silently dropped;
4. invalid/stale Entity/GP/Option IDs fail closed;
5. source-type-incompatible filter behavior is explicit;
6. exact Fund / Strategy behavior does not use substring matching;
7. follow-up unset/true/false semantics if exposed;
8. pending-query fingerprint includes route, effective model/thinking, mode, and all filters;
9. all five mode input contracts and prompt/output structures;
10. CODEX-01 comparison mode does not claim 2–5 Entity support;
11. meeting-preparation target requirement;
12. normalized citation/Drive-link behavior;
13. insufficient-evidence/no-result behavior;
14. FULL_OUTPUT uses the same filters/mode and remains API-independent;
15. FULL_OUTPUT Meeting-body/Pitchbook-reference boundary;
16. Copy/Docs/PDF canonical package parity does not regress;
17. safe Audit metadata/redaction;
18. Work 0025 model/thinking policy and exact tuple qualification do not regress;
19. Work 0020 retry/replacement/cleanup and citation tests do not regress;
20. disabled Gemini/no-failover behavior remains intact;
21. public surface and administrator/user authorization remain valid.

Run focused tests first, then:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Do not weaken existing assertions merely to pass.

## 10. Bounded target-runtime qualification

Only after deterministic PASS:

1. verify `docs/operations/runtime-artifact-locator.md` and the exact current standalone Apps Script/Web App target;
2. deliver/read back the exact tested source once;
3. create at most one immutable Apps Script version, expected version 61;
4. update the same existing private Web App once;
5. preserve the stored OpenAI API key and model policy without reading, printing, logging, or replacing secrets;
6. use the currently qualified `gpt-5.6-terra` + provider-default tuple only;
7. do not call Gemini;
8. do not broad-sync Meeting or Pitchbook records;
9. inspect existing small synthetic coverage first; create at most three small non-confidential synthetic source records/files only if essential to prove filters/modes, and record/clean or clearly retain them as test fixtures;
10. exact-sync only a newly created/designated small source that actually needs new metadata; otherwise reuse existing Indexed sources;
11. never target `DOC-000018` or old 5–25 MiB fixtures.

Minimum native campaign:

### OpenAI

- one query proving a compound core filter and exact authoritative citation;
- one query proving a second materially different filter combination;
- one bounded execution of each five modes on a small scope;
- one no-result/insufficient-evidence case;
- one disabled-Gemini attempt showing safe error and no fallback/provider call;
- confirm selected/default Work 0025 model/thinking tuple remains effective.

Avoid redundant calls: one query may satisfy multiple gates when evidence is explicit.

### FULL_OUTPUT

- one bounded preview using the same representative mode/filter scope as an OpenAI query;
- verify source/character summary, preview placement, no-results behavior and mode/scope package text;
- verify no AI/provider call;
- create only the minimum artifact(s) needed to prove the changed filter/mode path still uses the canonical package; clean test artifacts where the existing contract requires it;
- do not rerun a broad FULL_OUTPUT campaign.

### Integrity

- authoritative row/source counts remain coherent;
- no duplicate current provider document;
- `DOC-000018` unchanged;
- old large fixtures unchanged;
- no new Vector Store, Web App, Library or public endpoint;
- no Gemini call or fallback;
- final OpenAI readiness remains active;
- final Audit contains only safe metadata.

## 11. Completion and stop rule

CODEX-01 is complete when the core shared filter/mode product works on OpenAI and FULL_OUTPUT and required bounded validation passes.

Do not extend this dispatch for:

- 2–5 Entity comparison;
- Related GP/Meeting Type exactness requiring a separate metadata strategy;
- six-format qualification;
- Gemini recovery;
- historical corpus migration;
- broad reindex;
- provider model discovery;
- cosmetic page redesign;
- exhaustive edge cases or benchmark campaigns.

Route those to the planned later dispatch/Work. A CODEX-01 follow-up is justified only by a material blocker to this dispatch's primary outcome:

- normal core filter/mode flow fails;
- source identity/citation correctness fails;
- Work 0025 policy can be bypassed or regresses;
- data/provider state corrupts or duplicates;
- credential/confidential-data safety fails;
- FULL_OUTPUT calls AI or violates its authoritative-source boundary;
- required deterministic/native qualification fails.

After the gates pass, stop and return the PR for ChatGPT review.

## 12. GitHub delivery

Create a fresh branch from the exact current main supplied in the direct prompt:

`agent/0021-structured-search-core`

Create/update:

- `docs/handoffs/0021-dispatches.md`;
- `docs/handoffs/0021-instruction.md`;
- `docs/handoffs/0021-report.md`;
- `docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`;
- `docs/planning/work-registry.md`;
- `docs/planning/mvp-and-roadmap.md`;
- `docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md` where actual implementation facts require clarification;
- `docs/operations/runtime-artifact-locator.md`.

Open one Draft PR against `main`. Commit and push all scoped changes. Do not merge the PR.

## Completion latch

```text
CANONICAL_FILTER_MODEL: PASS | FAIL
CORE_STRUCTURED_FILTERS: PASS | FAIL
SHARED_ROUTE_MODE_UI: PASS | FAIL
OPENAI_FILTER_TRANSLATION: PASS | FAIL
MODE_FREE_QUESTION: PASS | FAIL
MODE_SUMMARY: PASS | FAIL
MODE_TIMELINE: PASS | FAIL
MODE_COMPARISON_CORE: PASS | FAIL
MODE_MEETING_PREP: PASS | FAIL
OPENAI_GROUNDED_CITATIONS: PASS | FAIL
FULL_OUTPUT_FILTER_MODE_PARITY: PASS | FAIL
FULL_OUTPUT_API_INDEPENDENCE: PASS | FAIL
AUDIT_REDACTION: PASS | FAIL
WORK_0025_POLICY_REGRESSION: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL
RUNTIME_DEPLOYMENT_VERSION: <version | unchanged>
GEMINI_CALLED: YES | NO
BROAD_SYNC_RUN: YES | NO
LARGE_FIXTURE_MUTATION: YES | NO
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CODEX_02: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

## Mandatory final response

The final Codex response must begin and end with:

```text
WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```
