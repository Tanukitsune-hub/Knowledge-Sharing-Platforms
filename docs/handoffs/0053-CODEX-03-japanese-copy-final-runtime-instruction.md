# Work 0053 CODEX-03 — final target-runtime qualification

WORK_ID: 0053
DISPATCH_ID: 0053-CODEX-03
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION

## Context

Work0053 copy/brand reconciliation passed ChatGPT review and PR #83 was merged.

```text
IMPLEMENTATION_PR: #83
IMPLEMENTATION_MERGE: 2e10d7c9fa26b9b5c05260e47d156665a1e0b269
BASELINE_SERVED_VERSION: 34
EXPECTED_FINAL_SERVED_VERSION: 35
PRODUCT_BRAND: Private Assets Intelligence
VISIBLE_ADMIN_PAGE_LABEL: 管理者ページ
```

Work0053 is not yet ACCEPTED.
Completion Latch is not applied.

## Primary Outcome

Deploy the reviewed Work0053 user-facing copy/brand changes to the same owner-only Web App as version35 and verify the real runtime preserves:

- `Private Assets Intelligence` brand
- naturalized Japanese UI
- visible `管理者ページ` label and 3 tabs
- Work0051 backup continuity
- Work0052 missing-source integrity logic
- no business/provider/permission changes

## Read first

- `docs/handoffs/0053-japanese-ui-copy-naturalization-requirements.md`
- `docs/handoffs/0053-CODEX-02-japanese-copy-reconcile-report.md`
- `docs/design/product-brand.md`
- `docs/design/ui-japanese-copy-guidelines.md`
- `docs/handoffs/0052-completion-report.md`
- `docs/operations/apps-script-web-app-deployment.md`

## Target identity

Use the proven same target chain:

- Drive host `KSP Work 0028 Synthetic Host`
- same container-bound Apps Script project
- same existing owner-only WEB_APP
- baseline served version34
- same /exec

Do not use repository-root stale `.clasp.json`.
Use only the proven disposable mapping after read-only identity confirmation.

Never write private Script ID, deployment ID, Drive ID, private URL, account identifier, or OAuth material into GitHub/report.

## Phase 0 — pre-mutation gate

Confirm read-only:

1. exact latest `origin/main`
2. PR #83 merge included
3. existing WEB_APP:
   - WEB_APP
   - version34
   - same /exec
   - execute-as unchanged
   - owner-only
4. Work0051 backup/manual operator source remains
5. Work0052 cited-source validation source remains
6. current backup folder/trigger/snapshot remain healthy

If target identity or accepted prior Work state is ambiguous, STOP before mutation.

## Phase 1 — repository validation

Before source sync:

- Work0053 focused copy/brand tests PASS
- Work0052 missing-source regression PASS
- Work0051 backup/manual operator regression PASS
- public surface / export / admin / maintenance tests PASS
- `npm run check` PASS
- `npm run check:bundle` PASS
- `git diff --check` PASS

Do not change source in this qualification.
If a defect is found, STOP and return a scoped repair Draft PR.

## Phase 2 — source sync / version35

Allowed:
- source sync exact latest main: max 1
- independent saved-source readback: required
- immutable version create: max 1, expected version35
- existing proven WEB_APP update: max 1
- new deployment: 0

Saved-source/version readback must confirm:
- Work0051 manual/private backup handlers remain
- Work0052 cited-source validation remains
- Work0053 brand/copy changes are present
- no unreviewed source drift

Then update the same existing WEB_APP to version35 once.

Verify:
- same deployment
- same /exec
- execute-as unchanged
- owner-only unchanged
- new deployment 0

## Phase 3 — version35 runtime brand / copy acceptance

On same /exec version35:

### Brand

Required:
- browser title = `Private Assets Intelligence`
- sidebar/brand header = `Private Assets Intelligence`
- old subtitle `PRIVATE ASSETS KNOWLEDGE` absent
- old user-facing `Knowledge Share` brand absent
- old product title `Knowledge Sharing Platforms` absent

Standalone Knowledge Search title:
- `ナレッジ検索 | Private Assets Intelligence`

If standalone route can be opened safely without provider calls, verify directly.
Otherwise verify the immutable version source and deterministic test evidence.

### 管理者ページ

Required:
- navigation label remains `管理者ページ`
- top-level heading remains `管理者ページ`
- 3 tabs remain:
  - AI設定
  - 削除記録の管理
  - テーマ設定
- do NOT rename to `設定`
- do NOT add/remove account role behavior
- do NOT add password gate

### Naturalized copy

Spot-check across all 7 normal pages:
- `Meeting` user-facing wording is naturalized where intended
- `Pitchbook` user-facing wording is `保存資料` where intended
- `Entity` is not exposed where natural Japanese exists
- awkward/internal terms do not appear:
  - 権威ある
  - authoritative
  - materialize
  - fail closed
  - stale source
  - provider response
- preserved terms remain where applicable:
  - Meeting ID
  - Document ID
  - Fund / Strategy
  - Status
  - OpenAI
  - Gemini
  - API
  - HEX
  - RGB

Do not treat internal dev/code strings as visible-copy failures.

## Phase 4 — regression

Required:
- 7 normal pages nonblank
- Work0048 manual-search-only preserved
- Work0049 async feedback preserved
- Work0050 Color Tool preserved
- Work0051 backup folder / trigger / snapshot continuity preserved
- Work0052 cited-source validation remains in served source
- console material error/warn 0
- provider calls 0
- business data mutation 0
- permission change 0

## Responsive acceptance

1440:
- 7 pages no material overflow

390:
- six pages other than Entity Workspace: overflow 0
- Entity Workspace may remain at known pre-existing baseline <=176px
- Work0053 must not worsen it

```text
ENTITY_WORKSPACE_390_OVERFLOW_BASELINE: 176px
FOLLOW_UP_WORK: 0056
WORK0053_BLOCKER: NO
```

Do not fix the underlying Entity Workspace overflow here.

## Safety boundary

```text
SOURCE_SYNC_MAX: 1
IMMUTABLE_VERSION_CREATE_MAX: 1
EXISTING_WEB_APP_UPDATE_MAX: 1
NEW_DEPLOYMENT: 0
PROVIDER_CALLS: 0
REAL_BUSINESS_DATA_MUTATION: 0
BACKUP_RESOURCE_MUTATION: 0
PERMISSION_CHANGE: 0
ADMIN_ROLE_CHANGE: 0
SHARED_PASSWORD_CHANGE: 0
WORK0054_IMPLEMENTATION: 0
WORK0030: DEFERRED_BY_USER
```

## Stop conditions

STOP if:
- target identity changes
- saved-source/version readback mismatch
- Work0051/0052 source disappears
- 管理者ページ is renamed/removed
- brand mismatch
- version35 runtime materially regresses
- provider call occurs unexpectedly
- Entity Workspace overflow exceeds known 176px baseline due Work0053 change

Do not start Work0054 in this dispatch.

## Delivery

Create:
- `docs/handoffs/0053-CODEX-03-japanese-copy-final-runtime-report.md`

Update:
- `docs/handoffs/0053-dispatches.md`

Docs/evidence Draft PR only if needed.

Do not mark Work0053 ACCEPTED.
Do not apply Completion Latch.

Return:

```text
WORK_ID: 0053
DISPATCH_ID: 0053-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
TARGET_RUNTIME_QUALIFICATION: PASS|FAIL
FINAL_SERVED_VERSION: 35|34_UNCHANGED
PRODUCT_BRAND: Private Assets Intelligence|...
ADMIN_PAGE_LABEL: 管理者ページ|...
ADMIN_TAB_COUNT: 3|...
WORK0051_REGRESSION: PASS|FAIL
WORK0052_REGRESSION: PASS|FAIL
ENTITY_WORKSPACE_390_OVERFLOW_PX: <number>
PROVIDER_CALLS: 0|...
BUSINESS_DATA_MUTATION: 0|...
NEW_DEPLOYMENT: 0|...
BLOCKER: NONE|...
READY_FOR_CHATGPT_FINAL_REVIEW: YES|NO
```
