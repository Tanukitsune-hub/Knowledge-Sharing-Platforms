# Work 0052 CODEX-03 — final target-runtime qualification

WORK_ID: 0052
DISPATCH_ID: 0052-CODEX-03
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION

## Context

Work0052 CODEX-02 reconciliation passed semantic/focused/bundle validation and PR #81 was merged after ChatGPT review.

The additional 390px Entity Workspace overflow found in CODEX-02 is pre-existing and outside the Work0052 production diff. ChatGPT verified these files are byte-identical between main and the Work0052 branch:

- `src/Styles.html`
- `src/EntityWorkspacePage.html`
- `src/ClientEntityWorkspace.html`

Therefore:
```text
PREEXISTING_ENTITY_WORKSPACE_390PX_OVERFLOW: FOLLOW_UP
WORK0052_BLOCKER: NO
FOLLOW_UP_WORK: 0056
```

## Primary Outcome

Deploy the accepted Work0052 missing-source integrity changes to the same owner-only Web App as version34 and verify that healthy normal runtime remains intact, while preserving the reviewed negative-path evidence without deleting a real production source solely for testing.

## Accepted repository evidence

```text
RECONCILE_PR: #81
RECONCILE_MERGE: c04f5ff80a1282578258a047d19c39f4eadc3c31
WORK0052_FOCUSED: 11/11 PASS
RELATED_AI_TESTS: 26/26 PASS
WORK0051_REGRESSION: 35/35 PASS
NPM_RUN_CHECK: 668/668 PASS
BUNDLE: 30/30 PASS
TARGET_BROWSER_WORK0052: 18 CHECKS PASS
INLINE_ERROR: PASS
STALE_ANSWER_HIDDEN: PASS
DIALOG_COUNT: 0
REAL_SOURCE_DELETE: 0
```

## Read first

- `docs/handoffs/0052-missing-source-graceful-failure-requirements.md`
- `docs/handoffs/0052-CODEX-02-missing-source-reconcile-report.md`
- `docs/handoffs/0051-completion-report.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/design/ui-japanese-copy-guidelines.md`

## Target identity

Use the already proven chain:

- Drive host `KSP Work 0028 Synthetic Host`
- same container-bound Apps Script project
- same existing owner-only WEB_APP
- baseline served version33
- same /exec

Do not use repository-root stale `.clasp.json`.
Use only the proven disposable mapping after read-only identity confirmation.

Never record Script ID, deployment ID, private URL, account identifier, OAuth material, or Drive IDs in GitHub/report.

## Phase 0 — pre-mutation gate

Confirm read-only:

1. exact latest `origin/main`
2. PR #81 merge included
3. Work0051 backup/manual operator still present
4. existing WEB_APP:
   - WEB_APP
   - version33
   - same /exec
   - execute-as unchanged
   - owner-only
5. current backup folder/trigger/snapshot from Work0051 remain healthy
6. current Backend identity unchanged

If identity or accepted Work0051 state is ambiguous, STOP before mutation.

## Phase 1 — validation

Before source sync:

- Work0052 focused tests PASS
- Work0051 backup/manual operator regression PASS
- relevant AI citation/replay tests PASS
- `npm run check` PASS
- `npm run check:bundle` PASS
- `git diff --check` PASS

Do not fix Entity Workspace 390px overflow in this Work.
That is Work0056 FOLLOW_UP.

## Phase 2 — source sync / version34

Allowed:
- source sync exact latest main: max 1
- independent saved-source readback: required
- immutable version create: max 1, expected version34
- existing proven WEB_APP update: max 1
- new deployment: 0

Saved-source/version readback must confirm:
- Work0051 backup files + manual operator remain present
- Work0052 cited-source validation logic present
- no unreviewed source drift

Then update the same existing WEB_APP to version34 once.

Verify:
- same deployment
- same /exec
- execute-as unchanged
- owner-only unchanged
- new deployment 0

## Phase 3 — target runtime smoke

On version34 same /exec:

- 7 normal pages nonblank
- Knowledge Search loads
- normal healthy navigation/search UI remains usable without invoking provider
- Full Output preview UI loads
- Work0048 manual-search-only preserved
- Work0049 async feedback preserved
- Work0050 Color Tool preserved
- Work0051 backup folder/trigger state preserved
- console material error/warn 0
- provider calls 0

## Missing-source failure-path acceptance

Do NOT delete, Trash, move, or revoke access to a real Meeting/Pitchbook source solely for qualification.

Do NOT create a fake production Backend row merely to force the failure.

Acceptance for the destructive/negative path is based on:
1. direct core/service tests executing the cited-source validation path;
2. replay-after-delete synthetic test;
3. provider-completion-before-success-audit test;
4. production browser harness proving inline error / stale-answer-hidden / dialog 0;
5. source/version readback proving the reviewed logic is what version34 serves.

Classify:

```text
REAL_PRODUCTION_SOURCE_DELETION_TEST: NOT_RUN_SAFETY
NEGATIVE_PATH_ACCEPTANCE: DETERMINISTIC_DIRECT_EVIDENCE
```

This is acceptable unless a material contradiction appears in version34 healthy runtime.

## Preserve Work0052 behavior

- cited sources only
- no whole-corpus Drive preflight
- missing/inaccessible/trashed/wrong-id cited source blocks answer
- Meeting MIME check
- registered folder check where applicable
- terminal replay revalidation
- no stale answer display
- inline error only
- popup/dialog 0
- Backend mutation 0
- source recreation 0
- auto-deactivate 0
- provider-index deletion 0
- no private file ID/URL exposure

## Safety boundary

```text
REAL_SOURCE_DELETE: 0
REAL_SOURCE_TRASH: 0
REAL_SOURCE_MOVE: 0
REAL_ACCESS_REVOKE: 0
FAKE_PRODUCTION_BACKEND_ROW: 0
PROVIDER_CALLS: 0
BUSINESS_DATA_MUTATION: 0
BACKUP_RESOURCE_MUTATION: 0
PERMISSION_CHANGE: 0
SOURCE_SYNC_MAX: 1
IMMUTABLE_VERSION_CREATE_MAX: 1
EXISTING_WEB_APP_UPDATE_MAX: 1
NEW_DEPLOYMENT: 0
WORK_0030: DEFERRED_BY_USER
```

## Stop conditions

STOP if:
- target identity changes
- saved-source readback mismatch
- Work0051 backup/manual operator disappears/regresses
- version34 content mismatch
- existing WEB_APP identity changes
- healthy runtime materially regresses
- provider call occurs unexpectedly

Do not start Work0053 in this dispatch.

## Delivery

Create:
- `docs/handoffs/0052-CODEX-03-missing-source-final-runtime-report.md`

Update:
- `docs/handoffs/0052-dispatches.md`

Docs/evidence Draft PR only if needed.

Do not mark Work0052 ACCEPTED.
Do not apply Completion Latch.

Return:

```text
WORK_ID: 0052
DISPATCH_ID: 0052-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
TARGET_RUNTIME_QUALIFICATION: PASS|FAIL
FINAL_SERVED_VERSION: 34|33_UNCHANGED
NEGATIVE_PATH: DETERMINISTIC_DIRECT_EVIDENCE|FAIL
REAL_PRODUCTION_SOURCE_DELETION_TEST: NOT_RUN_SAFETY
WORK0051_REGRESSION: PASS|FAIL
PROVIDER_CALLS: 0|...
BUSINESS_DATA_MUTATION: 0|...
BLOCKER: NONE|...
READY_FOR_CHATGPT_FINAL_REVIEW: YES|NO
```
