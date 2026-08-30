# Work 0020 — CODEX-19 OpenAI native sync scope and partial-failure recovery

WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-19
MODE: INCIDENT_RECOVERY -> QUALIFICATION
BALL: CODEX
STATUS: READY

## Primary outcome

Remove the residual native OpenAI sync blocker without reopening accepted provider evidence, then complete the bounded native Meeting/Pitchbook query, metadata, lifecycle and final-integrity gates for Work 0020.

## Runtime / artifact locator

- RUNTIME_LOCATOR_PATH: `docs/operations/runtime-artifact-locator.md`
- RUNTIME_LOCATOR_VERIFIED: PARTIAL — standalone Apps Script name and data artifacts are verified; Script ID/editor URL/deployment URL remain to be recorded when safely available
- TARGET_RUNTIME: standalone private Google Apps Script Web App `KSP Work 0010 DEV Qualification`
- CURRENT_DEPLOYMENT_VERSION: 56
- PRIMARY_DATA_ARTIFACT: `Knowledge Platform Backend`
- AUDIT_ARTIFACT: `Knowledge Platform Audit`
- ISOLATED_TEST_DATA: existing synthetic Work 0010/0013/0018 records only
- SIDE_EFFECT_STATE: guarded, OpenAI-only, no Gemini/fallback

Update the locator before RETURNED if a new Apps Script version is deployed or any stable runtime identity is observed.

## Strongest current evidence

ChatGPT performed read-only target-runtime inspection after CODEX-18 returned.

Closed evidence:

- OpenAI direct base model, Vector Store, upload, indexing, exact filter, grounded answer and cleanup PASS.
- OpenAI INLINE_CITATION / RETRIEVED_SOURCE normalization PASS.
- The newly registered small synthetic Pitchbook `DOC-000017` is already `OPENAI.status = Indexed` in the authoritative Backend.
- Existing synthetic Meeting `MTG-000005` and multiple earlier Meetings are already `OPENAI.status = Indexed`.
- The generic UI failure was not a failure to index `DOC-000017`.
- Several old size-matrix Pitchbooks were selected by the same broad Pitchbook sync and recorded `OPENAI_INDEX_TIMEOUT`.
- Settings after the aggregate failure show OpenAI disabled and readiness `ERROR`, even though valid OpenAI-indexed sources exist.
- Current admin sync selection accepts only `sourceType`; it cannot target one exact source.
- Current provider selection sorts eligible work oldest-first and then takes `AI_SYNC_BATCH_SIZE = 10`.
- Current admin mutation converts any non-OK aggregate sync into global `OPENAI_SYNC_FAILED`, disables OpenAI, sets readiness `ERROR`, and discards the safe per-item sync summary from the UI.
- Current user UI therefore shows only generic `エラー`.

The active hypothesis is one coherent orchestration defect:

> The native qualification requested Pitchbook scope, but the admin sync could not isolate the intended small synthetic Pitchbook. It processed older eligible large size-matrix fixtures first/in the same batch; item-level indexing timeouts were collapsed into a global provider error and disabled an otherwise viable provider. The intended synthetic Pitchbook itself successfully indexed.

## Fastest safe decisive action

Do not retry the same broad Pitchbook sync.

First reproduce the orchestration defect deterministically from the exact current source:

1. a sourceType-only Pitchbook selection can include unrelated older eligible rows;
2. an exact source cannot be selected;
3. one item-level failure makes the admin action throw generic `OPENAI_SYNC_FAILED` and globally disable the provider;
4. the safe sync summary/error codes do not reach the browser;
5. an OpenAI entry that is already current can still be reconsidered solely because the legacy shared AI status remains Pending.

Only after these reproduce, implement the smallest coherent repair below.

## Required repair

### A. Exact admin source selection

Add an optional administrator-only exact `sourceId` to the existing sync request.

Contract:

- `sourceId` is optional;
- when present, `sourceType` is mandatory;
- validate the source ID syntax and existence against the authoritative rows;
- select exactly that one matching source or fail closed;
- do not accept arbitrary raw IDs from normal-user search routes;
- scheduled/background sync with no `sourceId` retains existing broad behavior;
- normal sourceType-only admin sync remains available, but qualification/repair can use an exact source.

Do not add a new public/debug endpoint. Reuse `mutateAiProviderSettings` and the existing private-admin authorization boundary.

### B. Provider-current eligibility

Prevent a provider entry that is already Indexed/current from being repeatedly selected only because the legacy shared `AI_Index_Status` remains Pending for another provider.

At minimum, an Indexed OpenAI entry with a valid document identity/content hash and `indexedAt >= source row Updated_At` must not be made eligible solely by the legacy Pending signal.

Preserve re-index eligibility when the source row is actually newer than the provider indexing state, the provider entry is incomplete, or the provider entry itself is Pending/Failed according to retry rules.

### C. Partial sync and readiness semantics

Separate provider/config failure from item-level source failure.

- Credential/store/config/provider-level failure may set OpenAI readiness `ERROR` and disable the provider.
- One or more item-level indexing failures must not automatically invalidate the OpenAI connection or discard already indexed usable sources.
- For a successful exact-source sync, set/keep OpenAI enabled and readiness `ACTIVE`.
- For a broad sync with both successes and item failures, keep the provider usable and represent a safe partial state such as `ACTIVE_WITH_SYNC_ERRORS` (or an equivalent validated existing-state design).
- For an exact-source item failure, return the source-level failure and safe error code without falsely treating the API key/Vector Store as invalid.
- Do not silently claim all sources are synchronized.

### D. Safe UI result

Return the existing sanitized sync summary to the private-admin browser even when some items fail.

Show only safe fields such as:

- selected / indexed / unchanged / removed / failed counts;
- provider status;
- deduplicated safe error codes such as `OPENAI_INDEX_TIMEOUT`;
- whether the provider remains active/usable.

Do not expose API keys, source contents, raw provider payloads, Store/File IDs or stack traces.

The browser must not reduce a known item-level timeout to the single unhelpful label `エラー`.

### E. Large-file boundary

Do not redesign all OpenAI indexing into a new asynchronous subsystem in this dispatch unless the exact small-source qualification still fails after A-D.

The existing 5–25 MiB size-matrix indexing timeouts are a real follow-up and must be recorded, but they are not allowed to contaminate the exact small Meeting/Pitchbook Work 0020 qualification.

Do not retry, delete or mutate the old large fixtures merely to obtain a PASS.

## Logic validation

Add deterministic tests for at least:

1. exact `sourceType + sourceId` selects one and only one source;
2. invalid/missing/mismatched source identity fails closed;
3. broad sourceType-only selection behavior is preserved;
4. scheduled sync behavior is unchanged;
5. a current OpenAI Indexed entry is not reselected solely due legacy Pending when provider indexedAt is not older than row Updated_At;
6. actual source update makes the provider eligible again;
7. item-level partial failure does not disable a valid provider;
8. provider/config failure still disables/errors safely;
9. safe partial summary reaches the admin UI;
10. UI displays counts and safe error code without raw provider identity;
11. existing OpenAI-only scope, citation/source normalization, security, no-failover and FULL_OUTPUT contracts remain intact.

Run focused tests, then:

```text
npm run check
python tools/validate_agent_foundation.py
git diff --check
```

Report exact counts and whether GitHub CI actually ran.

## Target-runtime qualification

Only after logic validation PASS:

1. deliver/read back the exact tested source once;
2. create at most one new immutable Apps Script version;
3. update the same existing private Web App in place once;
4. preserve the stored OpenAI key without reading, displaying or logging it;
5. reconnect through the existing synthetic connection test only if required to recover readiness;
6. use exact admin selection for `DOC-000017` only;
7. confirm it is reused/unchanged or Indexed without creating a duplicate provider document;
8. do not run a broad Pitchbook sync;
9. run one native Pitchbook query constrained by the existing safe filters so that the unique synthetic source is authoritative; require grounded answer plus one normalized source;
10. use exact admin selection for `MTG-000005` only if a sync/readback step is required; otherwise preserve its existing Indexed evidence;
11. run one native Meeting query and require grounded answer plus authoritative normalized source;
12. complete the already-defined metadata filter, update/reindex without duplicate, Inactive exclusion, Reactivate restoration, exact delete/rebuild, disable/re-enable and final integrity gates using only the designated small synthetic sources;
13. restore intended final settings and report all remaining failed large fixtures honestly as follow-up.

Before any provider mutation, perform read-only reconciliation by exact `source_type + source_id + content_hash`. If exactly one current provider document already exists, reuse/reconcile it and do not upload again. If zero or multiple exact matches exist, stop safely and report the classification before mutation.

## Prohibited actions

- no Gemini live calls;
- no OpenAI/Gemini automatic fallback;
- no broad Pitchbook retry;
- no mutation/deletion of old large size-matrix fixtures for cosmetic cleanup;
- no confidential data;
- no FULL_OUTPUT rerun;
- no new Web App, Library, public/debug endpoint or Vector Store;
- no raw provider identifier exposure;
- no weakening exact metadata/citation checks;
- no current-main merge/rebase during this bounded repair.

## Delivery

Create:

`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-report.md`

Update:

- `docs/handoffs/0020-instruction.md`
- `docs/handoffs/0020-dispatches.md`
- `docs/handoffs/0020-report.md`
- `docs/operations/runtime-artifact-locator.md`
- PR #26

Commit and push all scoped changes to `agent/0020-ai-provider-core`.

## Completion report fields

```text
OPENAI_SYNC_ROOT_CAUSE
OPENAI_EXACT_SOURCE_SYNC
OPENAI_PARTIAL_FAILURE_SEMANTICS
OPENAI_ADMIN_SYNC_DIAGNOSTICS
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION
OPENAI_MEETING_INDEX_QUERY_CITATION
OPENAI_METADATA_FILTER
OPENAI_LIFECYCLE
LARGE_FILE_INDEXING_FOLLOW_UP
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
FULL_OUTPUT_RUNTIME
FINAL_INTEGRITY
RUNTIME_LOCATOR_VERIFIED
RUNTIME_LOCATOR_UPDATED
READY
BLOCKER
FINAL_COMMIT
GITHUB_CI_ACTUALLY_RAN
```

## Mandatory final response

The final Codex chat response must begin and end with exactly:

```text
WORK_ID: 0020
DISPATCH_ID: 0020-CODEX-19
BALL: CHATGPT
STATUS: RETURNED
```

If a genuine native user action is still required, use `BALL: USER` and `STATUS: ACTION_REQUIRED` instead. Missing either identity block is a reporting-contract failure.
