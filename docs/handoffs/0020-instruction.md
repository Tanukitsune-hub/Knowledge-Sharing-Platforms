# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-21`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `REVIEW_FIX -> QUALIFICATION`

Completed instruction:
`docs/handoffs/0020-CODEX-21-openai-retry-replacement-and-orphan-cleanup-hardening-instruction.md`

Completion report:
`docs/handoffs/0020-CODEX-21-openai-retry-replacement-and-orphan-cleanup-hardening-report.md`

Latest completed integration report:
`docs/handoffs/0020-CODEX-20-main-reconciliation-and-final-merge-readiness-report.md`

Latest completed functional report:
`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-report.md`

Runtime locator:
`docs/operations/runtime-artifact-locator.md`

## Latched completed evidence

Work 0020 remains functionally qualified on the OpenAI path and reconciled with current main:

```text
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
```

Do not reopen or broadly repeat those gates.

## Closed pre-merge review findings

Final PR review found three code-level findings after CODEX-20 returned:

- an `Indexed` last-known-good entry with retryable `lastError` is not generally selected by the normal retry path;
- replacement currently deletes prior provider documents before replacement state is durably written;
- a successful OpenAI File upload is not guaranteed to be cleaned when attachment/indexing later fails.

CODEX-21 closed all three with failure-injection coverage and bounded target-runtime requalification.

Review comments:

```text
3890736051 — retry eligibility
3890736053 — recoverable replacement state transition
3890736055 — upload/attachment/index failure cleanup
```

All three threads were replied to with the fixing commit/test evidence and resolved.

## CODEX-21 completed outcome

CODEX-21 completed:

1. honor due retry metadata while retaining the last known-good Indexed source;
2. make replacement state transition recoverable and cleanup idempotent;
3. clean uploaded OpenAI File resources after attach/index failure while preserving the primary error;
4. add failure-injection regression tests;
5. rerun focused and canonical validation;
6. after deterministic PASS only, deploy/read back at most one version and requalify exact `DOC-000017` / `MTG-000005` paths;
7. resolved all three review threads and returned the Open/unmerged PR for final ChatGPT merge review.

The same private Web App is now version 58. Exact `DOC-000017` sync was unchanged with one current provider document, and one bounded grounded query each returned `DOC-000017` and `MTG-000005` as the sole authoritative normalized source.

## Safety boundary

- no broad source sync or large-fixture retry;
- no confidential data;
- no Gemini or fallback;
- no FULL_OUTPUT rerun;
- no new Vector Store/Web App/Library/public endpoint/credential;
- no rebase, force-push, history rewrite, or PR merge.

## Current status

```text
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS
MAIN_RECONCILIATION: PASS
REVIEW_HARDENING: PASS
CODEX_21_LOGIC_VALIDATION: PASS — 330/330
TARGET_RUNTIME_QUALIFICATION: PASS — version 58, designated synthetic sources only
UNRESOLVED_REVIEW_THREADS: 0
READY_FOR_CHATGPT_FINAL_MERGE: YES
WORK_READY: YES
BLOCKER: NONE
```

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-21`
BALL: `CHATGPT`
STATUS: `RETURNED`
