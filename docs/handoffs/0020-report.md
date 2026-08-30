# Work 0020 report

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-20`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
FUNCTIONAL_READY: `YES`
WORK_READY_FOR_FINAL_MERGE: `NO`
BLOCKER: `GITHUB_INTEGRATION_CONFLICT`

## Executive conclusion

Work 0020's application outcome is complete on the OpenAI provider path. CODEX-19 repaired the broad-sync/partial-failure orchestration defect without reopening accepted CODEX-17/18 provider and citation evidence. The exact small synthetic Pitchbook and Meeting paths pass native grounded query/citation, metadata, lifecycle and final-integrity gates.

The existing standalone private Web App was updated in place once to version 57. No new runtime or Vector Store was created. This functional conclusion is latched.

GitHub delivery is not yet complete: PR #26 remains Draft/Open/unmerged and the branch is currently non-mergeable because it is behind a diverged `main`. CODEX-20 is limited to main reconciliation, deterministic validation, and final PR merge readiness. It must not redeploy or repeat runtime/provider qualification.

## Accepted functional evidence

```text
OPENAI_DIRECT_BASE_MODEL: PASS
OPENAI_DIRECT_FILE_SEARCH: PASS
OPENAI_VECTOR_STORE/UPLOAD/ATTRIBUTES/INDEX/FILTER/CLEANUP: PASS
OPENAI_CITATION_NORMALIZATION: PASS
OPENAI_RETRIEVED_SOURCE_NORMALIZATION: PASS
OPENAI_NATIVE_CONNECTION_SELF_TEST: PASS
OPENAI_EXACT_SOURCE_SYNC: PASS
OPENAI_PITCHBOOK_INDEX_QUERY_CITATION: PASS — DOC-000017
OPENAI_MEETING_INDEX_QUERY_CITATION: PASS — MTG-000005
OPENAI_METADATA_FILTER: PASS
OPENAI_LIFECYCLE: PASS
LOGIC_VALIDATION_AT_CODEX_19: PASS — focused 47/47; canonical 325/325
FULL_OUTPUT_RUNTIME: PASS — accepted prior evidence; not rerun in CODEX-19
SOURCE_READBACK: PASS
WEB_APP_DELIVERY: PASS — existing standalone deployment version 57
FINAL_INTEGRITY: PASS
GITHUB_CI_ACTUALLY_RAN: NO
FUNCTIONAL_READY: YES
FUNCTIONAL_BLOCKER: NONE
```

## CODEX-19 repair

The root cause was a sourceType-only, oldest-first Pitchbook batch that mixed the intended small synthetic source with unrelated old 5–25 MiB fixtures. Their item-level `OPENAI_INDEX_TIMEOUT` results were collapsed into generic `OPENAI_SYNC_FAILED`, disabling a valid provider and hiding safe diagnostics.

CODEX-19 added exact private-admin source selection, fail-closed authoritative/provider reconciliation, provider-current eligibility, partial item-failure semantics, last-known-good source preservation, and safe UI counts/error codes. Broad and scheduled sync behavior remains unchanged when `sourceId` is absent.

## Target-runtime qualification

- `DOC-000017` exact reconciliation reused one current source without duplicate upload.
- Metadata filtering passed across date, GP, asset class, capital type, and source type.
- Inactive exact sync removed one source; Reactivate exact sync rebuilt it; final exact sync reused one unchanged source.
- One native Pitchbook query produced the expected grounded synthetic answer and one authoritative normalized `DOC-000017` source.
- One native Meeting query produced the expected grounded synthetic answer and one authoritative normalized `MTG-000005` source.
- Disable/re-enable through the existing synthetic connection test succeeded with the stored key, followed by exact no-duplicate activation.

One adjacent synthetic row, `DOC-000018`, was briefly edited during browser qualification, detected before provider sync, and restored completely. No OpenAI operation targeted it; final authoritative readback confirmed restoration.

## GitHub integration residual

At CODEX-20 preparation:

```text
WORK_BRANCH_FUNCTIONAL_HEAD: d61dc166c835d65e8bbabd17dc2894b4aef69cd8
OBSERVED_MAIN: 0d9238293b1f5612956e206d22e4e75cfc767694
MERGE_BASE: bc7c6efda63b13e8a998e32d97028ee3a3557e3b
WORK_BRANCH_AHEAD: 124
WORK_BRANCH_BEHIND: 16
PR_26: Draft / Open / unmerged / non-mergeable
```

The principal semantic reconciliation must preserve both:

- Work 0020: File Search for Meeting/Pitchbook and Meeting-only `FULL_EXPORT` body with optional Pitchbook reference links;
- Work 0025: administrator-governed user model/thinking selection, including older-model support and policy-based hiding/prohibition.

Work 0023 bundle/installer decisions and all main-only accepted content must also be retained.

Active instruction:
`docs/handoffs/0020-CODEX-20-main-reconciliation-and-final-merge-readiness-instruction.md`

## Problem classification

### BLOCKER

- GitHub branch/main conflict currently prevents PR #26 from being merged safely.

### FIX SOON / FOLLOW-UP

- GitHub-hosted CI is absent; local checks remain the available deterministic evidence.
- Old 5–25 MiB OpenAI indexing timeouts require a separate bounded large-file Work.
- Gemini provider recovery remains deferred.

### BACKLOG / PLANNED

- Work 0025 implements administrator-controlled model and thinking/reasoning choices.
- Work 0023 implements generated bundle and company installer distribution.

## Current status

```text
FUNCTIONAL_RUNTIME_QUALIFICATION: PASS
MAIN_RECONCILIATION: PENDING CODEX-20
PR_MERGEABLE: NO
PR_READY_FOR_REVIEW: NO
RUNTIME_DEPLOYMENT_CHANGED_BY_CODEX_20: NOT APPLICABLE YET
READY_FOR_CHATGPT_FINAL_MERGE: NO
WORK_READY: NO
BLOCKER: GITHUB_INTEGRATION_CONFLICT
```

WORK_ID: `0020`
ACTIVE_DISPATCH_ID: `0020-CODEX-20`
BALL: `CODEX`
DISPATCH_STATUS: `READY`
