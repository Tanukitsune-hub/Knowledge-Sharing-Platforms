# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-21`
BALL: `CODEX`
STATUS: `READY`
MODE: `REVIEW_FIX -> QUALIFICATION`

Active instruction:
`docs/handoffs/0020-CODEX-21-openai-retry-replacement-and-orphan-cleanup-hardening-instruction.md`

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

## New pre-merge blocker

Final PR review found three unresolved code-level findings after CODEX-20 returned:

- an `Indexed` last-known-good entry with retryable `lastError` is not generally selected by the normal retry path;
- replacement currently deletes prior provider documents before replacement state is durably written;
- a successful OpenAI File upload is not guaranteed to be cleaned when attachment/indexing later fails.

These findings affect automatic recovery and provider-resource integrity. PR #26 must not merge until CODEX-21 closes them.

Review comments:

```text
3890736051 — retry eligibility
3890736053 — recoverable replacement state transition
3890736055 — upload/attachment/index failure cleanup
```

ChatGPT has replied to all three and left the threads unresolved pending evidence.

## CODEX-21 outcome

CODEX-21 must:

1. honor due retry metadata while retaining the last known-good Indexed source;
2. make replacement state transition recoverable and cleanup idempotent;
3. clean uploaded OpenAI File resources after attach/index failure while preserving the primary error;
4. add failure-injection regression tests;
5. rerun focused and canonical validation;
6. after deterministic PASS only, deploy/read back at most one version and requalify exact `DOC-000017` / `MTG-000005` paths;
7. resolve all three review threads and return the PR for final ChatGPT merge review.

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
REVIEW_HARDENING: PENDING CODEX-21
UNRESOLVED_REVIEW_THREADS: 3
READY_FOR_CHATGPT_FINAL_MERGE: NO
WORK_READY: NO
BLOCKER: PRE_MERGE_REVIEW_FINDINGS
```

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-21`
BALL: `CODEX`
STATUS: `READY`
