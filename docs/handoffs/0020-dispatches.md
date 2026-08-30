# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-19`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-19 — READY

- mode: `INCIDENT_RECOVERY -> QUALIFICATION`;
- purpose: repair the bounded native OpenAI sync-orchestration defect exposed after CODEX-18, then finish native Meeting/Pitchbook query, metadata, lifecycle and final-integrity gates;
- instruction: `docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-instruction.md`;
- runtime locator: `docs/operations/runtime-artifact-locator.md`;
- exact execution baseline: branch `agent/0020-ai-provider-core`, CODEX-18 final returned head `299bfa78de6adfd70daeb9357405fd1c34e71c6f`, plus ChatGPT handoff commits;
- target runtime: standalone private Apps Script `KSP Work 0010 DEV Qualification`, currently Web App version 56;
- preserve the stored OpenAI key without exposing it;
- no broad Pitchbook retry, no Gemini, no fallback, no confidential data, no new Store/Web App/Library/public endpoint, and no current-main integration.

Read-only target-runtime evidence establishing the active hypothesis:

```text
DOC-000017 small CODEX-18 synthetic Pitchbook: OPENAI Indexed
MTG-000005 synthetic Meeting: OPENAI Indexed
old 5–25 MiB size-matrix Pitchbooks: item-level OPENAI_INDEX_TIMEOUT
AI_SYNC_BATCH_SIZE: 10
current admin selector: sourceType only, no exact sourceId
selection order: oldest eligible first
aggregate failure result: OpenAI disabled + readiness ERROR + generic UI エラー
```

Required repair:

- exact administrator-only `sourceType + sourceId` selection;
- current provider entry not reselected solely because unrelated legacy status remains Pending;
- partial item failures do not invalidate the provider connection or discard successes;
- sanitized counts and item-level safe codes reach the admin UI;
- exact small-source native qualification only;
- old large-file timeout behavior routed to follow-up rather than hidden or retried broadly.

## Returned dispatch

### 0020-CODEX-18 — RETURNED / BLOCKER RECLASSIFIED

CODEX-18 correctly stopped after the private-admin UI returned generic `OPENAI_SYNC_FAILED`. Subsequent ChatGPT read-only inspection established that the intended small synthetic Pitchbook did index successfully and that unrelated older large size-matrix fixtures timed out within the same broad batch. Accepted CODEX-18 provider, citation, self-test, source delivery and native indexing evidence remains closed.

### 0020-CODEX-17 — RETURNED / CLOSED

Direct OpenAI provider path, Vector Store, upload, exact filter, grounded answer and cleanup passed. Citation normalization was the narrow blocker later repaired by CODEX-18.

### 0020-CODEX-16 — SUPERSEDED / NOT EXECUTED

Prepared for additional Gemini diagnosis, then superseded when OpenAI became the active completion provider.

## Current classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
OPENAI_PROVIDER_PATH: PASS
OPENAI_CITATION_AND_SOURCE_NORMALIZATION: PASS
OPENAI_NATIVE_SMALL_SOURCE_INDEXING: PASS
OPENAI_NATIVE_SYNC_ORCHESTRATION: BLOCKED — active CODEX-19 repair
OPENAI_NATIVE_QUERY/LIFECYCLE: pending
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
FULL_OUTPUT_RUNTIME: PASS
FINAL_INTEGRITY: NOT RUN
READY: NO
BLOCKER: YES
```

Only one active dispatch may exist.

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-19`
BALL: `CODEX`
STATUS: `READY`
