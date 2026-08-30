# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-21`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-21 — READY / PRE-MERGE REVIEW HARDENING

Final ChatGPT review after CODEX-20 found three substantive unresolved PR #26 threads:

1. preserved usable `Indexed` state can carry due retry metadata that normal eligibility may ignore;
2. replacement ordering can delete prior documents before replacement state is durably recorded;
3. OpenAI `/files` upload can leave an orphan when attachment/indexing later fails.

Instruction:
`docs/handoffs/0020-CODEX-21-openai-retry-replacement-and-orphan-cleanup-hardening-instruction.md`

Required outcome:

- close all three review findings with focused failure-injection tests;
- preserve the already-qualified OpenAI/Citation/Meeting/Pitchbook behavior;
- deploy/read back at most one new immutable version only after deterministic PASS;
- requalify exact `DOC-000017` and `MTG-000005` paths only;
- resolve all three review threads;
- return PR #26 mergeable and ready for ChatGPT's final merge.

No broad sync, old-large-fixture retry, Gemini, FULL_OUTPUT, confidential data, new provider resource, history rewrite, or PR merge is authorized.

## Returned dispatches

### 0020-CODEX-20 — RETURNED / MAIN RECONCILIATION PASS, REVIEW BLOCKERS FOUND AFTER RETURN

- latest fetched `origin/main` merged normally;
- Work 0020/0023/0025 contracts retained;
- production Apps Script source unchanged by reconciliation;
- canonical checks PASS, 325/325;
- PR became mergeable and ready for review;
- subsequent final review found three unresolved code findings, so merge readiness is revoked pending CODEX-21.

Report:
`docs/handoffs/0020-CODEX-20-main-reconciliation-and-final-merge-readiness-report.md`

### 0020-CODEX-19 — RETURNED / FUNCTIONAL COMPLETION PASS

Exact OpenAI source sync, native Meeting/Pitchbook grounded citation, metadata, lifecycle, no-duplicate reuse and final integrity passed on existing private Web App version 57.

### 0020-CODEX-18 — RETURNED / CLOSED

OpenAI citation and retrieved-source normalization, direct File Search and native small-source indexing evidence remain accepted.

### 0020-CODEX-17 — RETURNED / CLOSED

Direct OpenAI provider path, Vector Store, exact filter, grounded answer and cleanup passed.

## Current classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS — accepted CODEX-19 evidence
MAIN_RECONCILIATION: PASS
CODEX_20_LOGIC_VALIDATION: PASS — 325/325
REVIEW_P1_INDEXED_RETRY_ELIGIBILITY: BLOCKED
REVIEW_P2_REPLACEMENT_TRANSACTION: BLOCKED
REVIEW_P2_UPLOAD_ORPHAN_CLEANUP: BLOCKED
UNRESOLVED_REVIEW_THREADS: 3
PR_MERGEABLE: YES at last readback
PR_READY_FOR_FINAL_MERGE: NO
GITHUB_CI_ACTUALLY_RAN: NO
BLOCKER: PRE_MERGE_REVIEW_FINDINGS
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-21`
BALL: `CODEX`
STATUS: `READY`
