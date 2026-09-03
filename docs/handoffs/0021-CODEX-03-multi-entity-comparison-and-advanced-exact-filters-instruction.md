# Work 0021 — CODEX-03 multi-Entity comparison and advanced exact filters

WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-03
MODE: BUILD -> QUALIFICATION
BALL: CODEX
STATUS: READY

## Primary outcome

Implement the next bounded product slice of Work 0021 on top of the accepted version-62 core:

1. explicit 2–5 Entity qualitative comparison;
2. per-Entity evidence/citation attribution and evidence-gap handling;
3. exact `Related GP` and `Meeting Type` filters using authoritative Meeting metadata;
4. the same multi-Entity/filter semantics in API-independent FULL_OUTPUT.

Preserve the accepted CODEX-01/CODEX-02 core. Do not reopen provider architecture, model/thinking policy, metadata reconciliation, five-mode core qualification, format expansion, Gemini recovery, installer work, or general hardening.

## Reviewed baseline

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- branch: `agent/0021-structured-search-core`
- reviewed starting head before ChatGPT dispatch-tracking commits: `3df387eccf1e3c3f10047f1bdd307707a0ee4308`
- PR: #34, Draft / Open / unmerged / mergeable
- main remains the Work-0021 starting base unless current remote inspection proves otherwise
- current private Web App: version 62
- current OpenAI tuple: `openai-current-default / gpt-5.6-terra / provider-default`
- CODEX-02 canonical validation: `360/360` PASS
- CODEX-02 exact Apps Script readback: `80/80` PASS
- current provider documents: 16 completed, no `DOC-000017` duplicate
- Gemini live calls remain deferred

Fetch remote refs before editing. If `origin/main` advanced, inspect and integrate normally only when necessary to keep the PR current. Do not rebase, force-push, reset shared history, or merge the PR.

## Accepted dependencies — do not reopen

Preserve:

- explicit `ChatGPT / Gemini / 全文出力` routes;
- OpenAI File Search as the current qualified API route;
- no cross-provider fallback;
- Work 0025 model/thinking selectors, exact tuple qualification and server enforcement;
- canonical core filters and five modes from CODEX-01;
- CODEX-02 exact OpenAI attribute comparison/in-place refresh/readback;
- string Business Date range semantics already proven at runtime;
- authoritative source identity and normalized citations;
- FULL_OUTPUT Meeting-body / Pitchbook-reference-only boundary;
- Audit redaction;
- existing Backend/Audit/Shared Drive/private Web App identities.

Do not add a new database, sheet, Vector Store, Web App, Library, endpoint or provider-specific source identity model.

## Existing synthetic runtime coverage

Use existing non-confidential DEV records before creating any new fixture.

### Entity A — GP

```text
entity_key: GP:GP-000031
display: KSP DEV GP 0010 Renamed
known OpenAI evidence: DOC-000017 and MTG-000005
known Pitchbook token: CODEX18_SYNTH_PITCHBOOK_20260830
```

### Entity B — LP / Asset Owner

```text
entity_key: LP_ASSET_OWNER:OPT-CPLP-001
display: CODEX02 Synthetic LP Asset Owner 20260827
known OpenAI evidence: MTG-000004
Related_GP_IDs includes: GP-000031
Meeting_Type_Codes includes: ANNUAL_REVIEW, OFFICE_VISIT
Team: OPT-TEAM-001
Fund / Strategy: CODEX02 Synthetic Strategy 20260827
Follow up: true
known Meeting body token: CODEX02 synthetic meeting body 20260827
```

`MTG-000003` also contains `Related_GP_IDs=GP-000031` and `Meeting_Type_Codes=ANNUAL_REVIEW,OFFICE_VISIT` and may be used read-only if useful for exact-membership logic.

Protected/non-target sources remain `DOC-000018` and the old 5–25 MiB fixtures.

## 1. Canonical multi-Entity request contract

Extend the existing `selectedEntityKeys` contract rather than creating a separate incompatible request model.

For explicit multi-Entity comparison:

- mode must be `比較`;
- allow 2–5 unique exact stable Entity keys;
- validate every key against the existing Counterparty Entity catalog;
- reject duplicates, stale/unknown keys, fewer than 2, or more than 5;
- preserve input order for display and Audit where useful;
- do not accept raw display names as identities;
- do not silently fuzzy-normalize Entity IDs;
- do not silently combine an unrelated single `filters.entityKey` with `selectedEntityKeys`.

Preferred final normal-user behavior:

- ordinary modes keep the existing single Counterparty Entity filter;
- `比較` exposes an explicit multi-Entity selector for 2–5 Entities;
- when explicit multi-Entity comparison is active, the single Entity filter is empty/disabled or the server rejects the ambiguous combination.

Backward-compatible internal handling of the earlier single-scope comparison is acceptable if it does not weaken the final explicit comparison contract.

## 2. Multi-Entity retrieval strategy

Use the simplest exact strategy that preserves evidence coverage and source identity.

Preferred order:

1. exact provider-native `OR` over stable `entity_key` values when the current OpenAI filter grammar supports it and deterministic/runtime tests prove correct attribution; or
2. bounded separate exact retrieval per Entity when one grouped request cannot safely prove coverage.

Do not use substring/fuzzy matching.

Correctness rules:

- every normalized citation in a comparison must map to one selected Entity via authoritative source metadata;
- citations from an unselected Entity must be excluded/fail safely and produce a bounded warning/error rather than silently contaminating the comparison;
- return an explicit per-Entity evidence state, even when one Entity has no retrieved evidence;
- do not invent symmetry, rankings, or conclusions for an Entity with weaker/no evidence;
- if retrieval for one selected Entity produces no evidence, the result may still complete only if the output clearly marks that evidence gap and does not fabricate facts;
- keep the comparison synthesis grounded in the retrieved authoritative sources.

The response contract should expose enough safe structured data for the UI, conceptually:

```text
selected entities
entity evidence status
per-Entity normalized citations
combined comparison answer / comparison structure
warnings / evidence gaps
```

Reuse the existing normalized citation `entityKey` and `counterpartyType`; do not create a second citation identity system.

## 3. Comparison output contract

For OpenAI comparison, produce a practical LP-useful result:

- compact common-dimension comparison table when evidence supports it;
- supported similarities;
- supported differences;
- changes over time where dates permit;
- evidence asymmetry/gaps;
- per-Entity citation grouping;
- no investment recommendation or invented scoring/ranking.

The normal result view must let the user see which sources support each Entity and open the authoritative Drive links.

## 4. Exact Related GP filter

`Meeting_Index.Related_GP_IDs` is a multi-valued source field. Do not treat its comma-separated representation as a provider-exact scalar and do not use substring matching.

Implement exact token-membership semantics from authoritative Meeting rows:

```text
parse Related_GP_IDs -> exact stable GP IDs -> membership match
```

Requirements:

- use GP Master stable IDs/labels for choices;
- Related GP is Meeting-only in this Work;
- if Related GP is selected with explicit `Source Type = Pitchbook`, fail closed with a safe incompatible-filter error;
- when source type is omitted, either make the effective source Meeting explicit or require Meeting in the UI; do not silently apply Related GP semantics to Pitchbooks;
- intersect Related GP membership with the existing canonical filters and optional Entity scope exactly.

Provider strategy:

- resolve matching Active Meeting stable source IDs from authoritative rows first;
- then use a bounded exact provider filter over those stable source IDs when supported, or bounded exact retrieval;
- do not expand the provider metadata schema solely to encode every Related GP membership unless exact source-ID resolution is proven insufficient.

Bound the resolved source-ID set. If the set is too large for a safe exact request, return a clear `narrow filters` limitation instead of sending an unbounded OR expression.

## 5. Exact Meeting Type filter

`Meeting_Index.Meeting_Type_Codes` is also a multi-valued source field. Apply the same exact-token approach:

```text
parse Meeting_Type_Codes -> exact accepted code -> membership match
```

Requirements:

- use the existing accepted Meeting Type registry/constants already used by Meeting registration; do not create another master sheet;
- Meeting Type is Meeting-only;
- no substring matching (`ANNUAL` must not match `ANNUAL_REVIEW` unless it is the exact accepted code);
- resolve Active matching Meeting source IDs authoritatively and combine with other canonical filters exactly;
- use bounded exact provider source-ID filtering/retrieval;
- FULL_OUTPUT uses the identical token-membership semantics directly against authoritative rows.

At least `ANNUAL_REVIEW` must be covered by the target-runtime synthetic campaign because `MTG-000004` already contains it.

## 6. Advanced-filter pre-resolution contract

Related GP and Meeting Type may be represented internally as a bounded exact `sourceId` set rather than new provider attributes.

If both are supplied, apply logical AND at the authoritative row level before provider retrieval.

Other core filters continue to use their accepted CODEX-02 semantics. Do not weaken Date, Entity, GP, Asset Class, Capital Type, Team, Fund/Strategy, follow-up or Source Type behavior merely to make pre-resolution easier.

If the pre-resolved source set is empty, return a normal no-evidence result without a provider call where possible.

## 7. FULL_OUTPUT parity

FULL_OUTPUT must use the same selected Entities, Related GP, Meeting Type and other canonical filters, while continuing to call no AI API.

For explicit multi-Entity comparison:

- build one deterministic package grouped by selected Entity and then source;
- include authoritative Meeting Google Doc body text only;
- keep Pitchbooks reference-metadata/Drive-link only;
- include Entity display labels and stable keys in scope metadata;
- preserve mode/additional-instruction context for approved external-AI handoff;
- show evidence gaps when a selected Entity has no matching source;
- keep Copy / Google Docs / PDF package parity logic intact, but CODEX-03 runtime qualification needs only a preview unless a regression specifically requires an artifact.

## 8. UI

Extend the current single Knowledge Search page; do not create a static comparison dashboard.

For `比較` mode:

- provide an ergonomic 2–5 Entity selector using existing catalog entries;
- show type + name to the user while sending stable keys;
- prevent duplicates;
- make the 2–5 requirement clear;
- make per-Entity evidence/citations visible in the result.

Add Related GP and Meeting Type controls to the same filter form with their exact source-scope rules.

Do not redesign unrelated pages.

## 9. Audit / observability

Record only bounded safe metadata already allowed by policy:

- route/provider;
- mode;
- selected Entity stable keys;
- Related GP stable ID;
- Meeting Type code;
- existing structured filter IDs;
- effective model/thinking profile IDs;
- cited stable source IDs;
- per-Entity cited source counts or safe evidence status;
- safe limitation/error code.

Do not log questions/additional instructions, answers, retrieved chunks, source bodies, full-output body, credentials, raw provider payloads, Vector Store IDs or provider File IDs.

## 10. Deterministic tests

Add focused tests covering at minimum:

### Multi-Entity validation

- 2 Entities valid;
- 5 Entities valid;
- 1 Entity rejected for explicit multi comparison;
- 6 Entities rejected;
- duplicate Entity rejected;
- stale/unknown Entity rejected;
- ambiguous single `entityKey` + explicit multi-Entity comparison rejected or deterministically normalized according to the documented contract.

### Retrieval / citations

- exact OR/bounded strategy contains only selected stable Entity keys/source IDs;
- normalized citations group by the correct selected Entity;
- citation for an unselected Entity is rejected/warned fail safely;
- one Entity with zero evidence is explicitly represented as an evidence gap rather than fabricated content;
- current strict OpenAI content-hash/provider-document identity checks remain intact.

### Related GP / Meeting Type

- exact token membership matches `GP-000031` but no substring lookalike;
- exact `ANNUAL_REVIEW` match but no partial-code match;
- Related GP + Meeting Type applies AND correctly;
- source-type incompatibility fails closed;
- empty exact pre-resolution avoids broad provider retrieval;
- excessive source-ID resolution is bounded/fails safely.

### FULL_OUTPUT

- same selected Entities/advanced filters as OpenAI contract;
- deterministic grouping by Entity/source;
- Meeting body included, Pitchbook body excluded;
- evidence-gap representation;
- API-independent behavior and Audit redaction preserved.

### Regression

- CODEX-02 metadata-only reconciliation tests remain PASS;
- canonical core filters and all five modes remain PASS;
- Work 0025 policy enforcement remains PASS;
- Gemini disabled/no-failover deterministic behavior remains PASS.

Run focused tests, then:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Do not weaken an existing assertion merely to pass.

## 11. Target-runtime qualification

Only after deterministic PASS:

1. deliver/read back the exact tested source once to the existing standalone Apps Script project;
2. create at most one immutable Apps Script version, expected version 63;
3. update the same existing private Web App once;
4. preserve the stored OpenAI API key without reading/printing/logging/replacing it;
5. do not call Gemini;
6. do not broad-sync any source.

Use existing synthetic records only unless they are proven insufficient.

### Runtime gate A — 2-Entity OpenAI comparison

Select exactly:

```text
Entity A: GP:GP-000031
Entity B: LP_ASSET_OWNER:OPT-CPLP-001
Mode: 比較
Provider: ChatGPT / OpenAI
Current qualified model/thinking tuple
```

Use a bounded date/source scope that includes the existing evidence.

Require:

- completed grounded comparison;
- at least one authoritative normalized citation attributable to Entity A;
- at least one authoritative normalized citation attributable to Entity B;
- no authoritative citation attributable to an unselected Entity;
- explicit evidence-gap behavior if one Entity genuinely has no matching evidence;
- authoritative Drive links remain valid.

The expected existing evidence includes `DOC-000017`/`MTG-000005` for Entity A and `MTG-000004` for Entity B.

### Runtime gate B — advanced exact Meeting filter

Use:

```text
Source Type: Meeting
Entity: LP_ASSET_OWNER:OPT-CPLP-001
Related GP: GP-000031
Meeting Type: ANNUAL_REVIEW
```

Require exact retrieval of the intended existing Meeting evidence, expected `MTG-000004`, with its authoritative normalized citation and the known body fact/token `CODEX02 synthetic meeting body 20260827`.

The filter must not match a partial/substring token by design.

### Runtime gate C — FULL_OUTPUT multi-Entity preview

Use the same 2-Entity comparison scope and verify:

- both selected Entities are represented/grouped correctly when matching evidence exists;
- Meeting bodies remain authoritative text;
- Pitchbooks remain reference-only;
- no AI API call;
- no export artifact is required for this bounded gate unless deterministic/runtime evidence reveals a regression.

### Runtime gate D — integrity

Verify:

- same private Web App identity;
- provider document count does not unexpectedly grow;
- no duplicate current provider identity for tested sources;
- `DOC-000018` and old large fixtures unchanged;
- no Gemini request;
- no broad source sync;
- no confidential data;
- no new Vector Store/Web App/Library/endpoint/trigger.

If a tested existing synthetic source has metadata-only provider drift under the already-accepted CODEX-02 contract, an exact bounded in-place attribute refresh is allowed; do not upload a replacement merely to refresh metadata.

## 12. STOP / scope rule

After the explicit 2–5 Entity comparison, per-Entity citation attribution, Related GP exact filter, Meeting Type exact filter, FULL_OUTPUT parity and required bounded runtime gates pass, STOP.

Do not extend CODEX-03 for:

- six-format qualification;
- Gemini live recovery;
- provider catalog/model benchmarking;
- Work 0023 bundle/installer;
- historical migration;
- company rollout;
- general UI polish;
- exhaustive comparison styles;
- broad provider metadata normalization;
- large-file work.

Those remain later dispatches/Works.

A new repair dispatch before CODEX-04 is justified only for a blocker to this exact primary outcome under the Work Registry stop rule.

## 13. GitHub delivery

Create:

`docs/handoffs/0021-CODEX-03-multi-entity-comparison-and-advanced-exact-filters-report.md`

Update:

- `docs/handoffs/0021-dispatches.md`;
- `docs/handoffs/0021-instruction.md`;
- `docs/handoffs/0021-report.md`;
- `docs/planning/work-registry.md`;
- `docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`;
- `docs/operations/runtime-artifact-locator.md` if runtime identity changes;
- PR #34 body.

Commit and push all scoped changes on the existing Work 0021 branch. Keep PR #34 Draft/Open/unmerged. Do not merge it.

## Completion latch

```text
MULTI_ENTITY_REQUEST_VALIDATION: PASS | FAIL
MULTI_ENTITY_COMPARISON: PASS | FAIL
PER_ENTITY_CITATION_ATTRIBUTION: PASS | FAIL
UNSELECTED_ENTITY_CITATION_GUARD: PASS | FAIL
EVIDENCE_GAP_HANDLING: PASS | FAIL
RELATED_GP_EXACT_FILTER: PASS | FAIL
MEETING_TYPE_EXACT_FILTER: PASS | FAIL
ADVANCED_FILTER_SOURCE_ID_RESOLUTION: PASS | FAIL
FULL_OUTPUT_MULTI_ENTITY_PARITY: PASS | FAIL
OPENAI_RUNTIME_MULTI_ENTITY: PASS | FAIL
OPENAI_RUNTIME_ADVANCED_FILTER: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL
RUNTIME_DEPLOYMENT_VERSION: <version | unchanged>
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CODEX_04: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

## Mandatory final chat response

The final response must begin and end with:

```text
WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
```
