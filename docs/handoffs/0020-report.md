# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-21`
BALL: `CHATGPT`
DISPATCH_STATUS: `RETURNED`
FUNCTIONAL_READY: `YES`
READY_FOR_CHATGPT_FINAL_MERGE: `YES`
BLOCKER: `NONE`

## Executive conclusion

Work 0020 is functionally complete on the OpenAI provider path, reconciled with current main, and hardened against the three final retry/replacement/orphan-cleanup review findings. CODEX-21 added failure-injection coverage, passed the canonical 330/330 suite, updated the same private Web App once to version 58, and requalified only `DOC-000017` and `MTG-000005`.

PR #26 is Open, unmerged, mergeable, has zero unresolved non-outdated review threads, and is ready for ChatGPT's final merge. No Gemini, FULL_OUTPUT, broad sync, large-fixture retry/mutation, confidential-data use, or new runtime/provider resource occurred.

## Accepted evidence retained

```text
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_EXACT_SOURCE_SYNC: PASS
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS — DOC-000017
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS — MTG-000005
OPENAI_METADATA_FILTER: PASS
OPENAI_LIFECYCLE: PASS
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS
MAIN_RECONCILIATION: PASS
CODEX_20_LOGIC_VALIDATION: PASS — 325/325
RUNTIME_DEPLOYMENT_CHANGED_BY_CODEX_20: NO
GITHUB_CI_ACTUALLY_RAN: NO
CODEX_21_LOGIC_VALIDATION: PASS — focused 35/35; canonical 330/330
CODEX_21_TARGET_RUNTIME_QUALIFICATION: PASS — existing private Web App version 58
```

## Final-review findings

### BLOCKER 1 — preserved Indexed state may not retry

The item-failure path preserves a last-known-good provider entry as `Indexed` and records retry metadata in `lastError`. Normal eligibility generally evaluates retry timing only after requiring `status == Failed`, so a preserved usable entry can become invisible to scheduled retry when no other revision signal remains.

Required result: due retryable cleanup/replacement errors remain schedulable while clean current Indexed entries remain skipped.

### BLOCKER 2 — replacement transaction is not recoverable

Current order is upload/index replacement, delete prior provider documents, then persist replacement state. A prior-document deletion failure or state-write failure can leave provider state pointing to a deleted document or leave the new document unrecorded.

Required result: persist the new current identity before destructive stale cleanup; if state persistence fails, remove the unrecorded replacement and retain the prior state; if stale cleanup fails after commit, retain the new current state and retry cleanup idempotently.

### BLOCKER 3 — post-upload attach/index failures can orphan Files

After the OpenAI `/files` upload succeeds, a later vector-store attachment or indexing failure currently throws without guaranteed removal of the uploaded File object.

Required result: attachment/index failure attempts attachment and File cleanup, always attempts File cleanup even if attachment cleanup fails, and preserves the primary failure with safe cleanup diagnostics.

Review comment IDs:

```text
3890736051
3890736053
3890736055
```

All three are closed by CODEX-21 and retained here as historical problem classification.

## Completed repair

Instruction:
`docs/handoffs/0020-CODEX-21-openai-retry-replacement-and-orphan-cleanup-hardening-instruction.md`

CODEX-21 added focused failure-injection tests, passed the canonical suite, delivered/read back the exact tested source, updated the same private Web App once to version 58, exact-synced `DOC-000017` unchanged, and obtained one grounded authoritative citation each for `DOC-000017` and `MTG-000005`. The detailed evidence is in `docs/handoffs/0020-CODEX-21-openai-retry-replacement-and-orphan-cleanup-hardening-report.md`.

## Problem classification

### BLOCKER

- none.

### FIX SOON / FOLLOW-UP

- GitHub-hosted CI remains absent;
- old 5–25 MiB OpenAI indexing timeouts require a separate bounded large-file Work;
- Gemini recovery remains deferred.

### BACKLOG / PLANNED

- Work 0023 generated bundle/installer implementation;
- Work 0025 administrator-governed model/thinking implementation.

## Current status

```text
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS
MAIN_RECONCILIATION: PASS
REVIEW_P1_INDEXED_RETRY_ELIGIBILITY: PASS
REVIEW_P2_REPLACEMENT_TRANSACTION: PASS
REVIEW_P2_UPLOAD_ORPHAN_CLEANUP: PASS
LOGIC_VALIDATION: PASS — 330/330
TARGET_RUNTIME_QUALIFICATION: PASS — version 58
UNRESOLVED_REVIEW_THREADS: 0
PR_READY_FOR_FINAL_MERGE: YES
WORK_READY: YES
BLOCKER: NONE
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-21`
BALL: `CHATGPT`
DISPATCH_STATUS: `RETURNED`
