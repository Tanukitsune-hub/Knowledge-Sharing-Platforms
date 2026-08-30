# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-21`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
FUNCTIONAL_READY: `YES`
READY_FOR_CHATGPT_FINAL_MERGE: `NO`
BLOCKER: `PRE_MERGE_REVIEW_FINDINGS`

## Executive conclusion

Work 0020 remains functionally complete on the OpenAI provider path, and CODEX-20 successfully reconciled the branch with current main. The deployed private Web App version 57 evidence remains valid.

However, final review of PR #26 found three unresolved implementation defects in recovery/cleanup paths. They do not invalidate the successful small-source query and lifecycle evidence, but they can cause automatic retry suppression, inconsistent provider state after replacement failure, and orphaned OpenAI File objects. PR #26 must not merge until CODEX-21 fixes and requalifies these paths.

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

All three remain unresolved by design until fixing commits and tests exist.

## Active repair

Instruction:
`docs/handoffs/0020-CODEX-21-openai-retry-replacement-and-orphan-cleanup-hardening-instruction.md`

CODEX-21 will add focused failure-injection tests, rerun the canonical suite, and only after deterministic PASS update the same private Web App at most once and requalify the designated small synthetic sources. It will not broad-sync, retry large fixtures, call Gemini, rerun FULL_OUTPUT, or merge the PR.

## Problem classification

### BLOCKER

- retryable preserved Indexed state can be skipped indefinitely;
- replacement state/document ordering can become inconsistent;
- upload/attachment/index failure can accumulate orphaned provider Files;
- 3 unresolved review threads;
- PR #26 is not approved for final merge despite remaining GitHub-mergeable at last readback.

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
REVIEW_P1_INDEXED_RETRY_ELIGIBILITY: FAIL / OPEN
REVIEW_P2_REPLACEMENT_TRANSACTION: FAIL / OPEN
REVIEW_P2_UPLOAD_ORPHAN_CLEANUP: FAIL / OPEN
UNRESOLVED_REVIEW_THREADS: 3
PR_READY_FOR_FINAL_MERGE: NO
WORK_READY: NO
BLOCKER: PRE_MERGE_REVIEW_FINDINGS
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-21`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
