# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-19`
BALL: `CODEX`
STATUS: `READY`
MODE: `INCIDENT_RECOVERY -> QUALIFICATION`

Active instruction:
`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-instruction.md`

Runtime locator:
`docs/operations/runtime-artifact-locator.md`

## Primary outcome

Deliver and qualify one provider-neutral Knowledge Search core with ChatGPT, Gemini and full-output routes. OpenAI is the active completion provider. Gemini recovery is deferred and no automatic provider failover is permitted.

## Accepted evidence

```text
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_CONNECTION_SELF_TEST: PASS native
OPENAI_SMALL_SYNTHETIC_PITCHBOOK_INDEX: PASS native
OPENAI_SYNTHETIC_MEETING_INDEX: PASS native
LOGIC_VALIDATION: PASS through CODEX-18 — 316/316
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
SOURCE_READBACK: PASS — 78/78 deployable files
WEB_APP_DELIVERY: PASS — existing standalone private Web App version 56
```

## CODEX-18 blocker reclassified by read-only runtime evidence

The generic `OPENAI_SYNC_FAILED` did not mean the intended small synthetic Pitchbook failed to index.

Authoritative Backend inspection shows:

- `DOC-000017`, the small CODEX-18 synthetic Pitchbook, is already OpenAI Indexed;
- `MTG-000005` and other synthetic Meetings are already OpenAI Indexed;
- old 5–25 MiB size-matrix Pitchbooks recorded item-level `OPENAI_INDEX_TIMEOUT`;
- the broad Pitchbook sync used `AI_SYNC_BATCH_SIZE = 10`;
- the current source can restrict only by `sourceType`, sorts eligible work oldest-first and cannot target one exact source;
- the aggregate item failures disabled OpenAI and changed readiness to `ERROR` despite usable indexed sources;
- the private-admin UI reduced the safe item-level result to generic `エラー`.

The active defect is therefore bounded native sync orchestration and error/readiness handling, not OpenAI provider reachability or the new small synthetic Pitchbook.

## CODEX-19 required outcome

Implement and qualify the smallest coherent repair:

1. optional administrator-only exact `sourceType + sourceId` sync selection;
2. provider-current eligibility that does not reselect a current OpenAI entry solely because the legacy shared AI status remains Pending;
3. item-level partial failures do not invalidate a valid provider connection or discard successful indexed sources;
4. sanitized sync counts and safe error codes reach the admin UI;
5. no broad Pitchbook retry or mutation of old large fixtures;
6. exact small synthetic Pitchbook and Meeting queries/citations, metadata filters, lifecycle and final integrity complete natively.

## Current status

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_PROVIDER_PATH: PASS
OPENAI_SMALL_SOURCE_INDEXING: PASS
OPENAI_NATIVE_SYNC_ORCHESTRATION: BLOCKED — broad mixed batch / generic aggregate failure
OPENAI_NATIVE_QUERY_AND_LIFECYCLE: pending CODEX-19
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

## Safety boundary

- use only existing isolated synthetic DEV data;
- preserve the stored API key without reading, printing or logging it;
- no Gemini calls or cross-provider fallback;
- no broad Pitchbook sync;
- no deletion/mutation of old large fixtures merely to get a pass;
- no confidential data, FULL_OUTPUT rerun, new Vector Store, Web App, Library or public/debug endpoint;
- keep PR #26 Draft/Open/unmerged;
- do not reconcile current main until provider qualification closes.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-19`
BALL: `CODEX`
STATUS: `READY`
