# Work 0020 dispatch control

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-20`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-20 — READY / MAIN RECONCILIATION

Purpose:

- preserve the completed CODEX-19 functional and target-runtime evidence;
- merge the latest `main` into `agent/0020-ai-provider-core` without rewriting history;
- reconcile Work 0020's Meeting-only `FULL_EXPORT` boundary with Work 0025's administrator-governed model/thinking policy;
- preserve all Work 0023 bundle/installer decisions and all Work 0020 implementation/test evidence;
- run the canonical deterministic checks;
- leave PR #26 mergeable and ready for ChatGPT's final merge review.

Instruction:
`docs/handoffs/0020-CODEX-20-main-reconciliation-and-final-merge-readiness-instruction.md`

Current observed GitHub state at dispatch preparation:

```text
WORK_BRANCH_FUNCTIONAL_HEAD: d61dc166c835d65e8bbabd17dc2894b4aef69cd8
OBSERVED_MAIN: 0d9238293b1f5612956e206d22e4e75cfc767694
MERGE_BASE: bc7c6efda63b13e8a998e32d97028ee3a3557e3b
WORK_BRANCH_AHEAD: 124
WORK_BRANCH_BEHIND: 16
PR_26: Draft / Open / unmerged / non-mergeable
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS
RUNTIME_DEPLOYMENT_VERSION: 57
```

CODEX-20 is integration-only. No Apps Script deployment, provider call, source-data mutation, FULL_OUTPUT rerun, broad Pitchbook retry, rebase, force-push, or PR merge is authorized.

## Returned dispatches

### 0020-CODEX-19 — RETURNED / FUNCTIONAL COMPLETION PASS

- exact private-admin `sourceType + sourceId` sync implemented and qualified;
- authoritative identity/type/existence/ambiguity checks fail closed;
- current OpenAI Indexed state no longer reselected solely by stale legacy Pending;
- item-level partial failure preserves provider usability and successful indexed sources;
- sanitized counts and safe item codes reach the private-admin UI;
- existing private Web App updated once to version 57;
- exact `DOC-000017` reconciliation, metadata filtering, lifecycle and no-duplicate reuse PASS;
- native Pitchbook and Meeting grounded query/citation PASS;
- disable/re-enable and final integrity PASS;
- old large timeout fixtures preserved as follow-up.

Report:
`docs/handoffs/0020-CODEX-19-openai-native-sync-scope-and-partial-failure-recovery-report.md`

### 0020-CODEX-18 — RETURNED / CLOSED

OpenAI citation and retrieved-source normalization, direct synthetic File Search and native connection/small-source indexing evidence remain accepted.

### 0020-CODEX-17 — RETURNED / CLOSED

Direct OpenAI provider path, Vector Store, upload, exact filter, grounded answer and cleanup passed.

### 0020-CODEX-16 — SUPERSEDED / NOT EXECUTED

Prepared for additional Gemini diagnosis, then superseded when OpenAI became the active completion provider.

## Current classification

```text
PRIMARY_COMPLETION_PROVIDER: OPENAI
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS
OPENAI_PROVIDER_PATH: PASS
OPENAI_CITATION_AND_SOURCE_NORMALIZATION: PASS
OPENAI_EXACT_SOURCE_SYNC: PASS
OPENAI_NATIVE_QUERY/LIFECYCLE: PASS
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun
FINAL_INTEGRITY: PASS
GEMINI_RUNTIME: BLOCKED / DEFERRED PROVIDER RECOVERY
GITHUB_MAIN_RECONCILIATION: PENDING CODEX-20
PR_MERGEABLE: NO
WORK_READY_FOR_FINAL_MERGE: NO
BLOCKER: GITHUB_INTEGRATION_CONFLICT
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-20`
BALL: `CODEX`
STATUS: `READY`
