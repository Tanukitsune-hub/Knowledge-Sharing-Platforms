# Work 0020 — AI Provider Core

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-20`
BALL: `CODEX`
STATUS: `READY`
MODE: `QUALIFICATION`

Active instruction:
`docs/handoffs/0020-CODEX-20-main-reconciliation-and-final-merge-readiness-instruction.md`

Latest completed functional report:
`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-report.md`

Runtime locator:
`docs/operations/runtime-artifact-locator.md`

## Functional outcome — complete and latched

Work 0020 is functionally ready on the OpenAI completion path. CODEX-17 direct provider qualification and CODEX-18 citation/source normalization remain accepted. CODEX-19 repaired exact native sync scoping, provider-current eligibility, partial item-failure readiness and safe private-admin diagnostics, then completed native Pitchbook/Meeting grounded citation, metadata, lifecycle and final-integrity gates.

```text
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_CONNECTION_SELF_TEST: PASS native
OPENAI_EXACT_SOURCE_SYNC: PASS native
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS native — DOC-000017
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS native — MTG-000005
OPENAI_METADATA_FILTER: PASS native
OPENAI_LIFECYCLE: PASS native
LOGIC_VALIDATION_AT_CODEX_19: PASS — focused 47/47; canonical 325/325
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun in CODEX-19
SOURCE_READBACK: PASS
WEB_APP_DELIVERY: PASS — same existing private Web App, version 57
FINAL_INTEGRITY: PASS
FUNCTIONAL_READY: YES
FUNCTIONAL_BLOCKER: NONE
```

Do not reopen or repeat this target-runtime qualification without material contradictory evidence.

## Remaining GitHub delivery work

PR #26 remains Draft/Open/unmerged and is currently non-mergeable because the Work branch diverged from `main`.

At dispatch preparation:

```text
WORK_BRANCH_FUNCTIONAL_HEAD: d61dc166c835d65e8bbabd17dc2894b4aef69cd8
OBSERVED_MAIN: 0d9238293b1f5612956e206d22e4e75cfc767694
MERGE_BASE: bc7c6efda63b13e8a998e32d97028ee3a3557e3b
WORK_BRANCH_AHEAD: 124
WORK_BRANCH_BEHIND: 16
```

CODEX-20 must merge the latest main normally, preserve Work 0023 bundle/installer and Work 0025 administrator-governed model/thinking decisions, preserve Work 0020's Meeting-only `FULL_EXPORT` body boundary and OpenAI implementation, run the canonical checks, and leave PR #26 mergeable and ready for ChatGPT's final merge review.

## Residual routing

- Old 5–25 MiB size-matrix Pitchbooks with item-level `OPENAI_INDEX_TIMEOUT` remain a separate bounded follow-up and are not a Work 0020 blocker.
- Gemini provider recovery remains deferred; there is no automatic provider fallback.
- Work 0025 will implement policy-governed user model/thinking selection after integration.
- GitHub-hosted CI is absent; do not report it as passed.

## Safety boundary

CODEX-20 is GitHub integration-only:

- no OpenAI or Gemini API calls;
- no Apps Script version or Web App deployment;
- no source-data, Drive, Backend, Audit, or Vector Store mutation;
- no FULL_OUTPUT rerun;
- no broad Pitchbook retry or old-fixture mutation;
- no rebase, force-push, history rewrite, or PR merge.

## Current Work status

```text
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS
GITHUB_MAIN_RECONCILIATION: PENDING
PR_MERGEABLE: NO
READY_FOR_CHATGPT_FINAL_MERGE: NO
WORK_READY: NO
BLOCKER: GITHUB_INTEGRATION_CONFLICT
```

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-20`
BALL: `CODEX`
STATUS: `READY`
