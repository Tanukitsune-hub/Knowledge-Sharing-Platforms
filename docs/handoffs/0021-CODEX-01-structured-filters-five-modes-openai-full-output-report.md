# Work 0021 — CODEX-01 structured filters, five modes, OpenAI and FULL_OUTPUT report

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD -> QUALIFICATION`

## Outcome

The canonical structured-filter and five-mode core is implemented on branch `agent/0021-structured-search-core` from exact base `a5edd1aabed1bfa34609b42807a615f43d2cd19a`. OpenAI and FULL_OUTPUT now consume one normalized request/filter/mode contract. Work 0025 model/thinking resolution, the Work 0020 FULL_EXPORT Meeting-body/Pitchbook-reference boundary, exact stable-ID validation, Audit redaction, and disabled-provider no-failover behavior remain enforced.

Logic validation passed. Target-runtime qualification did not pass: the first and only version-61 OpenAI qualification query returned a safe insufficient-evidence answer and zero normalized citations for the uniquely scoped existing synthetic Pitchbook. The instruction's STOP rule was applied immediately. No remaining mode, FULL_OUTPUT runtime, Gemini-disabled runtime, sync, or follow-up provider attempt was run.

## Implemented scope

- one canonical request containing route, mode, question/additional instruction, model/thinking profile IDs, selected Entity keys, and nested structured filters;
- exact Date, Counterparty Type, one Counterparty Entity, GP, Asset Class, Equity/Debt, Team, Fund/Strategy, follow-up, and Source Type filters;
- all five modes: `自由質問 / 要約 / 時系列 / 比較 / 面談準備`;
- fail-closed validation for stale values, incompatible source/filter combinations, missing meeting-prep target, and deferred 2–5 Entity comparison;
- OpenAI attribute-filter translation and FULL_OUTPUT exact row filtering from the same contract;
- route/model/thinking/mode/filter-sensitive pending-query fingerprints;
- filter/mode/scope display in results and FULL_OUTPUT package preview;
- safe Audit metadata without question, answer, chunks, bodies, credentials, or provider IDs.

Explicit 2–5 Entity comparison, Related GP/Meeting Type advanced filters, six-format qualification, Gemini recovery, Work 0023, broad sync, large-fixture recovery, and general hardening were not implemented.

## Deterministic evidence

```text
FOCUSED_TESTS: PASS — 32/32
NPM_RUN_CHECK: PASS — 355/355
AGENT_FOUNDATION: PASS
GIT_DIFF_CHECK: PASS
PUBLIC_SURFACE_AND_TEMPORAL_CHECKS: PASS through npm run check
LOGIC_VALIDATION: PASS
```

The focused suite covers canonical OpenAI/FULL_OUTPUT parity, exact historical IDs, stale/fuzzy rejection, empty-clause omission, explicit false follow-up, source compatibility, deferred multi-Entity rejection, meeting-prep targeting, all five prompt contracts, pending-query invalidation, exact FULL_OUTPUT matching, Audit redaction, and package source boundaries.

## Exact source delivery and deployment

Implementation commit `07e4761` was pushed once to the existing Apps Script project. An isolated pull-back matched all `80/80` Apps Script files after the normal `.gs`/`.js` and newline normalization. The pull-back files were removed.

Preflight proved exactly one version-60 Web App target with `WEB_APP`, `/exec`, `USER_DEPLOYING`, and `MYSELF`. Exactly one immutable version, version `61`, was created. That same deployment was updated exactly once and read back with the same private entrypoint/access tuple at version 61. Other deployments were not changed. No new Web App, Library, Vector Store, Store, endpoint, trigger, or public exposure was created.

## Target-runtime qualification and STOP

The first qualification used only the existing synthetic Pitchbook scope shown by the Web App:

```text
Date: 2026-08-30 through 2026-08-30
GP: KSP DEV GP 0010 Renamed
Asset Class: Infrastructure
Capital Type: Equity
Fund / Strategy: CODEX-19 Synthetic Exact Scope
Source Type: Pitchbook
Mode: 自由質問
Effective tuple: openai-current-default / gpt-5.6-terra / provider-default
```

The request completed normally but reported insufficient evidence, no retrievable source body, and no authoritative citation. Therefore:

```text
OPENAI_COMPOUND_FILTER_QUERY: FAIL_CLOSED
GROUNDED_EXPECTED_ANSWER: FAIL
AUTHORITATIVE_NORMALIZED_SOURCE: 0
TARGET_RUNTIME_QUALIFICATION: BLOCKED
```

Safe classification: `OPENAI_COMPOUND_FILTER_EXISTING_INDEX_METADATA_MISMATCH_OR_EMPTY_RETRIEVAL`. The qualified Work 0020/0025 provider, citation, lifecycle, and exact-tuple evidence is preserved; this result only shows that the new compound filter against the existing indexed source was not qualified.

Per the STOP rule, no second OpenAI query, remaining mode query, FULL_OUTPUT runtime preview/artifact, disabled Gemini attempt, source sync/reindex, provider metadata inspection, or second deployment was performed.

## Side-effect and integrity state

```text
APPS_SCRIPT_SOURCE_PUSH: ONE
APPS_SCRIPT_VERSION_CREATED: 61 / ONE
PRIVATE_WEB_APP_UPDATE: ONE / SAME DEPLOYMENT
OPENAI_QUERY: ONE / EXISTING SYNTHETIC PITCHBOOK SCOPE
GEMINI_CALLED: NO
FULL_OUTPUT_RUNTIME: NOT RUN AFTER STOP
SOURCE_SYNC_OR_LIFECYCLE: NONE
EXPORT_ARTIFACTS: NONE
APPLICATION_SOURCE_ROWS_MUTATED: NONE
PROTECTED_DOC_000018_OR_LARGE_FIXTURES_MUTATED: NO
CONFIDENTIAL_DATA_USED: NO
```

## Completion state

```text
CANONICAL_FILTER_MODEL: PASS
CORE_STRUCTURED_FILTERS: FAIL — PASS LOGIC / BLOCKED TARGET RUNTIME
SHARED_ROUTE_MODE_UI: PASS
OPENAI_FILTER_TRANSLATION: FAIL — PASS LOGIC / LIVE FILTER RETURNED NO SOURCE
MODE_FREE_QUESTION: FAIL — LIVE COMPOUND FILTER RETURNED NO SOURCE
MODE_SUMMARY: FAIL — NOT RUN TARGET RUNTIME AFTER STOP
MODE_TIMELINE: FAIL — NOT RUN TARGET RUNTIME AFTER STOP
MODE_COMPARISON_CORE: FAIL — NOT RUN TARGET RUNTIME AFTER STOP
MODE_MEETING_PREP: FAIL — NOT RUN TARGET RUNTIME AFTER STOP
OPENAI_GROUNDED_CITATIONS: FAIL — ZERO SOURCES FOR NEW COMPOUND FILTER
FULL_OUTPUT_FILTER_MODE_PARITY: FAIL — PASS LOGIC / NOT RUN TARGET RUNTIME AFTER STOP
FULL_OUTPUT_API_INDEPENDENCE: PASS
AUDIT_REDACTION: PASS
WORK_0025_POLICY_REGRESSION: PASS
LOGIC_VALIDATION: PASS
TARGET_RUNTIME_QUALIFICATION: FAIL
RUNTIME_DEPLOYMENT_VERSION: 61
GEMINI_CALLED: NO
BROAD_SYNC_RUN: NO
LARGE_FIXTURE_MUTATION: NO
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_CODEX_02: NO
READY: NO
BLOCKER: OPENAI_COMPOUND_FILTER_EXISTING_INDEX_METADATA_MISMATCH_OR_EMPTY_RETRIEVAL
FINAL_COMMIT: reported from the pushed PR head in the final return
```

The next dispatch should first reconcile the exact row metadata and current provider attributes for `Pitchbook / DOC-000017` without broad sync or mutation, then authorize at most one smallest decisive requalification path. It must not weaken exact filters or reuse filename as identity.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
