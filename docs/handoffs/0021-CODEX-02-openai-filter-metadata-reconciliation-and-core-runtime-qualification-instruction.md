# Work 0021 — CODEX-02 OpenAI filter metadata reconciliation and core runtime qualification

WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-02
MODE: REVIEW_FIX -> QUALIFICATION
BALL: CODEX
STATUS: READY

## Primary outcome

Unblock the already-implemented Work 0021 core structured filters/five modes by reconciling the designated source's authoritative row metadata with the exact current OpenAI vector-store file attributes, fixing only the verified metadata/filter compatibility defect, and completing the bounded CODEX-01 OpenAI/FULL_OUTPUT runtime gates.

This is not the planned multi-Entity feature dispatch and not a general hardening pass. After this repair dispatch, explicit 2–5 Entity comparison moves to `0021-CODEX-03` and the six-format/provider-parity campaign moves to `0021-CODEX-04`.

## Reviewed baseline

- repository: `Tanukitsune-hub/Knowledge-Sharing-Platforms`
- branch: `agent/0021-structured-search-core`
- reviewed CODEX-01 head: `54b3b8237c408d6c6937a5c5dad51c569b1c98dd`
- PR: #34, Draft / Open / unmerged / mergeable at review
- current private Web App: version 61
- CODEX-01 logic validation: PASS — focused 32/32; canonical 355/355
- Apps Script readback: PASS — 80/80
- first new compound-filter OpenAI runtime query: safe insufficient-evidence / zero authoritative citations
- GitHub CI: absent

Fetch remote refs before editing. Preserve all accepted Work 0020/0025 evidence and all deterministic CODEX-01 filter/mode work.

## Evidence already reconciled by ChatGPT

The authoritative Backend row for `Pitchbook / DOC-000017` currently contains:

```text
Business Date represented by row Date: 2026-08-30 JST
GP_ID: GP-000031
GP display name: KSP DEV GP 0010 Renamed
Asset_Class_ID: OPT-AC-003
Capital_Type_ID: OPT-CT-001
Fund_Strategy: CODEX-19 Synthetic Exact Scope
Status: Active
Updated_At: 2026-08-30T15:38:09.350Z
OpenAI Indexed_At: 2026-08-30T15:47:50.211Z
```

The failed version-61 UI scope used the matching Date / GP / Asset Class / Capital Type / Fund-Strategy / Pitchbook conditions. The provider index timestamp is later than the authoritative row update timestamp. Therefore do not assume that the Backend row itself is stale and do not weaken or remove exact filters to obtain a pass.

Current source construction already derives the expected OpenAI attributes from authoritative rows, including `source_type`, `source_id`, `date_key`, `gp_id`, `asset_class_id`, `capital_type_id`, `fund_strategy`, and related stable identity fields.

A strong but not yet proven root-cause candidate is the date-range attribute type. Current Work 0021 sends `gte/lte` against string `date_key` values such as `YYYY-MM-DD`. Current OpenAI Retrieval documentation demonstrates range filters using numeric date attributes (Unix timestamps), while vector-store file attributes can be updated independently from file content. Treat this as a hypothesis to verify against the actual provider attributes and API behavior, not as a reason to skip read-only reconciliation.

## Phase 1 — read-only decisive reconciliation first

Before any source sync, metadata mutation, OpenAI query, Apps Script version, or deployment update:

1. load the authoritative `DOC-000017` row and build the exact expected source/attribute contract using production source builders;
2. resolve exactly one current OpenAI vector-store file using stable `source_type + source_id` identity;
3. read that file's current vector-store attributes using the existing read/list helpers or the smallest read-only helper required;
4. compare expected vs actual values **and value types** for at least:

```text
source_type
source_id
date_key
gp_id
asset_class_id
capital_type_id
fund_strategy
content_hash
```

and any Work 0021 attributes already expected for this Pitchbook, such as `entity_key`, `counterparty_type`, `counterparty_id`;
5. confirm whether the current file content hash matches the authoritative current content hash;
6. record only safe attribute names/types/normalized values needed for the diagnosis. Do not print or persist Vector Store IDs, OpenAI File IDs, credentials, raw provider payloads, or source body text.

If zero or multiple provider files match `Pitchbook + DOC-000017`, stop fail-closed before any mutation and return that exact identity blocker.

## Phase 2 — fix only the verified cause

### A. Date-range compatibility

If the provider file is otherwise current and the failure is attributable to string range semantics, introduce one numeric provider attribute derived deterministically from the canonical Business Date and use that attribute for `gte/lte` Date From/To filtering.

Requirements:

- keep `date_key` string if useful for identity/display/exact diagnostics;
- add a numeric sortable Business Date attribute, for example a Unix-day/timestamp or `YYYYMMDD` ordinal derived from the canonical business date;
- use numeric values in OpenAI `gte/lte` clauses;
- FULL_OUTPUT continues to use the canonical business-date contract directly against authoritative rows;
- do not change business-date meaning or introduce timezone drift;
- no fuzzy/string fallback when a numeric range filter is expected.

### B. Metadata-only drift / schema expansion

If current provider attributes differ from the authoritative expected attributes even though file content is unchanged, make metadata reconciliation a first-class part of the exact OpenAI sync/reconciliation path.

Preferred implementation:

- use the OpenAI vector-store file attribute update operation for the existing exact file when safe;
- compare desired and current provider attributes deterministically;
- update attributes without re-uploading/re-embedding unchanged content;
- re-read and verify the exact updated attributes;
- keep the existing provider document identity and no-duplicate guarantee.

If the current API/runtime cannot safely update attributes in place, use one bounded exact-source replacement only after proving that limitation. Never broad-reindex.

Future metadata changes must not be skipped solely because `contentHash` is unchanged. Use the smallest coherent detection mechanism (for example deterministic attribute comparison during exact reconciliation and/or an attribute contract fingerprint/version). Do not build a generalized migration framework in this dispatch.

### C. If another exact mismatch is proven

Fix only that mismatch, add deterministic coverage, and preserve the exact filter semantics. Do not remove clauses one by one merely to make the test pass unless the product contract intentionally marks that filter unsupported and the Work 0021 plan is updated accordingly.

## Required deterministic tests

Add focused tests for the verified root cause and at minimum cover:

1. canonical Business Date produces a deterministic numeric OpenAI range attribute with no timezone drift;
2. Date From/To generates numeric `gte/lte` clauses while exact string IDs remain exact `eq` clauses;
3. expected provider attributes are derived from the authoritative source row;
4. metadata-only attribute drift is detected even when content hash is unchanged;
5. exact attribute refresh updates/reconciles one existing provider document without duplicate upload when in-place update is supported;
6. unchanged content + unchanged attributes remains unchanged/no-op;
7. zero/multiple exact provider identities fail closed;
8. existing Work 0020 retry/replacement/orphan-cleanup and citation behavior remains PASS;
9. Work 0025 exact model/thinking qualification and server resolver remains PASS;
10. FULL_OUTPUT uses the same canonical filters/modes but remains API-independent.

Run focused tests first, then:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Do not weaken existing assertions.

## Bounded target-runtime campaign

Only after deterministic PASS:

1. deliver/read back the exact tested source once to the existing standalone Apps Script project;
2. create at most one immutable Apps Script version, expected version 62;
3. update the same existing private Web App once;
4. preserve the stored OpenAI key without reading, printing, logging, or replacing it;
5. reconcile/refresh **only** `Pitchbook / DOC-000017` provider attributes if needed; no broad sync;
6. re-read the exact provider attributes and require expected values/types;
7. run one decisive free-question query using the same compound scope that failed in CODEX-01 and require:
   - expected grounded synthetic facts;
   - at least one authoritative normalized source;
   - authoritative `Pitchbook / DOC-000017` citation;
8. only if that decisive gate passes, complete the minimum remaining CODEX-01 runtime campaign:
   - `要約` once on bounded existing synthetic scope;
   - `時系列` once on bounded existing synthetic scope;
   - core single-scope `比較` once;
   - `面談準備` once using one exact existing Entity/GP target;
   - one bounded FULL_OUTPUT preview/package parity check using the same canonical filter/mode contract; no AI API call;
   - one disabled-Gemini safe-error/no-failover observation **without a Gemini API call**;
9. confirm final OpenAI/provider state, `DOC-000017`, `MTG-000005`, `DOC-000018`, old large fixtures, Audit, and runtime integrity.

Keep live calls minimal. Reuse accepted citation/provider evidence where the new filter/mode behavior does not require another duplicate test.

If the decisive compound-filter query still returns no source after exact attribute/type reconciliation, STOP and report the new evidence. Do not broad-sync, repeatedly query, or deploy again.

## Prohibited actions

- no Gemini API call;
- no broad Meeting/Pitchbook sync;
- no mutation of `DOC-000018` or old 5–25 MiB fixtures;
- no confidential/company data;
- no full provider Store rebuild;
- no new Vector Store/Web App/Library/public endpoint;
- no 2–5 Entity comparison implementation;
- no Related GP / Meeting Type advanced filter implementation;
- no six-format campaign;
- no Work 0023 implementation;
- no general cleanup/hardening campaign;
- no rebase, force-push, history rewrite, or PR merge.

## Dispatch numbering after this repair

Because CODEX-02 is now the blocker-repair dispatch, update the Work 0021 plan/tracking so:

```text
0021-CODEX-01
  core filters + five modes implementation; runtime blocker returned

0021-CODEX-02
  exact provider-attribute/date-range reconciliation + completion of core runtime gates

0021-CODEX-03
  2–5 Entity comparison + advanced exact filters/citation attribution

0021-CODEX-04
  bounded six-format matrix + explicit provider-capability/parity evidence
```

Gemini live recovery remains a separately deferred near-completion Work, not CODEX-04's mandatory blocker.

## Scope / stop rule

When the exact compound-filter blocker is closed and the bounded remaining CODEX-01 OpenAI/FULL_OUTPUT runtime gates pass, STOP. Do not extend CODEX-02 for cosmetic UI, exhaustive edge cases, provider discovery, broad benchmark work, or future filters.

## GitHub delivery

Create:

`docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-report.md`

Update:

- `docs/handoffs/0021-dispatches.md`;
- `docs/handoffs/0021-instruction.md`;
- `docs/handoffs/0021-report.md`;
- `docs/planning/work-registry.md`;
- `docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`;
- `docs/operations/runtime-artifact-locator.md`;
- PR #34 body.

Commit and push all scoped changes. Keep PR #34 Draft/Open/unmerged. Do not merge it.

## Completion latch

```text
EXACT_PROVIDER_ATTRIBUTE_READBACK: PASS | FAIL
ROOT_CAUSE: <verified cause>
NUMERIC_DATE_RANGE_FILTER: PASS | NOT_APPLICABLE | FAIL
METADATA_ONLY_RECONCILIATION: PASS | NOT_APPLICABLE | FAIL
OPENAI_COMPOUND_FILTER_QUERY: PASS | FAIL
FIVE_MODE_RUNTIME_CORE: PASS | FAIL
FULL_OUTPUT_RUNTIME_PARITY: PASS | FAIL
GEMINI_DISABLED_NO_FAILOVER: PASS | FAIL
LOGIC_VALIDATION: PASS | FAIL
TARGET_RUNTIME_QUALIFICATION: PASS | FAIL
RUNTIME_DEPLOYMENT_VERSION: <version | unchanged>
GITHUB_CI_ACTUALLY_RAN: YES | NO
READY_FOR_CODEX_03: YES | NO
BLOCKER: NONE | <specific blocker>
FINAL_COMMIT: <sha>
```

## Mandatory final chat response

The final response must begin and end with:

```text
WORK_ID: 0021
DISPATCH_ID: 0021-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```
