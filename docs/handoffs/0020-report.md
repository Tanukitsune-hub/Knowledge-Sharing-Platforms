# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-19`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
WORK_READY: `NO`
BLOCKER: `YES`

## Executive conclusion

CODEX-18 materially qualified the OpenAI provider path and successfully indexed the intended small synthetic Pitchbook. The generic native `OPENAI_SYNC_FAILED` was caused by orchestration of a broad Pitchbook batch containing unrelated old large size-matrix fixtures, not by failure of the intended small synthetic source or the OpenAI connection itself.

Work 0020 remains open because exact native Meeting/Pitchbook query, metadata, lifecycle and final integrity are not yet complete. CODEX-19 is prepared to repair exact sync scoping, partial-failure/readiness semantics and safe admin diagnostics, then finish those native gates.

## Accepted evidence

```text
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_VECTOR_STORE/UPLOAD/ATTRIBUTES/INDEX/FILTER/CLEANUP: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_NATIVE_CONNECTION_SELF_TEST: PASS
OPENAI_SMALL_SYNTHETIC_PITCHBOOK_INDEX: PASS — DOC-000017 is OpenAI Indexed
OPENAI_SYNTHETIC_MEETING_INDEX: PASS — MTG-000005 is OpenAI Indexed
LOGIC_VALIDATION: PASS through CODEX-18 — 316/316
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
SOURCE_READBACK: PASS — 78/78 deployable files
WEB_APP_DELIVERY: PASS — existing standalone deployment version 56
GITHUB_CI_ACTUALLY_RAN: NO
```

## Independent read-only runtime diagnosis

After CODEX-18 returned, ChatGPT read the authoritative Backend Settings, Pitchbook_Index and Meeting_Index plus the Restricted Audit without mutating data.

Observed facts:

1. The small CODEX-18 synthetic Pitchbook `DOC-000017` has a complete OpenAI Indexed provider state.
2. The synthetic Meeting `MTG-000005` and multiple earlier Meetings have complete OpenAI Indexed provider states.
3. Old size-matrix Pitchbooks at 5, 10, 15, 20 and 25 MiB show item-level `OPENAI_INDEX_TIMEOUT` or related failed/pending state.
4. `AI_SYNC_BATCH_SIZE` was 10.
5. Current source supports admin selection by `sourceType` only, not exact `sourceId`.
6. Provider work selection sorts eligible rows oldest-first before applying the batch limit.
7. Current eligibility can reconsider an otherwise current provider entry solely because the legacy shared AI status is Pending.
8. Any non-OK aggregate sync causes the admin action to disable OpenAI, set readiness `ERROR` and throw generic `OPENAI_SYNC_FAILED`.
9. The private-admin UI displays only the generic message even though the sync report already contains sanitized per-item error codes.
10. Settings now show OpenAI disabled/readiness `ERROR`, while usable OpenAI-indexed sources remain present.

## Root-cause classification

```text
OPENAI_PROVIDER_REACHABILITY: PASS
OPENAI_SMALL_SOURCE_INDEXING: PASS
OPENAI_CITATION/SOURCE_MAPPING: PASS
PRIMARY_NATIVE_FAILURE: broad mixed Pitchbook batch + synchronous large-file indexing timeout
DIAGNOSTIC_DEFECT: item-level safe errors collapsed to generic UI failure
READINESS_DEFECT: partial item failure globally disables a valid provider
QUALIFICATION_SCOPE_DEFECT: no exact admin source selection
```

This is a bounded application orchestration defect. It is not evidence that OpenAI File Search failed for the intended small synthetic Pitchbook.

## Active CODEX-19

Instruction:
`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-instruction.md`

Required result:

- optional exact administrator-only `sourceType + sourceId` sync;
- current OpenAI Indexed entries are not repeatedly selected solely due stale legacy Pending status;
- item-level failures do not invalidate credentials/store or discard successful indexed sources;
- safe counts and error codes reach the admin UI;
- no broad retry or mutation of old large fixtures;
- exact small synthetic Pitchbook and Meeting query/citation PASS;
- metadata filter, update/reindex, Inactive, Reactivate, delete/rebuild, disable/re-enable and final integrity PASS.

## Problem classification

### BLOCKER

1. Native admin sync cannot isolate one exact source, so old large fixtures contaminate qualification.
2. Aggregate item failures globally disable OpenAI and hide the safe underlying item errors.
3. Native Meeting/Pitchbook query, lifecycle and final-integrity gates remain incomplete.
4. PR #26 remains non-mergeable and cannot be reconciled until provider qualification closes.

### FIX SOON / FOLLOW-UP

- OpenAI indexing of 5–25 MiB sources needs a separately bounded long-running/pending lifecycle assessment after Work 0020; do not hide or delete this evidence.
- GitHub-hosted CI remains absent.
- Gemini provider recovery is a later provider-specific Work.
- Work 0025 will add administrator-governed model/thinking selection after Work 0020 closes.

## Current status

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_RUNTIME: PARTIAL / SMALL-SOURCE PATH VIABLE
OPENAI_NATIVE_SYNC_ORCHESTRATION: BLOCKED — CODEX-19 active
GEMINI_RUNTIME: BLOCKED / DEFERRED
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-19`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
WORK_READY: `NO`
BLOCKER: `YES`
