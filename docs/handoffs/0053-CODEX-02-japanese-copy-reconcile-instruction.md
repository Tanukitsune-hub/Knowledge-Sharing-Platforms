# Work 0053 CODEX-02 — reconcile Japanese copy / brand changes onto version34 baseline

WORK_ID: 0053
DISPATCH_ID: 0053-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

旧stacked PR #75で実装済みのWork0053 semantic changesだけを、Work0052 accepted / version34のlatest mainへ安全に再適用する。

旧PR #75はcurrent mainから大きくbehindしており、generated bundle / manifestも古いbaselineを含むため、そのままmergeしない。

## Accepted baseline

```text
WORK0052: ACCEPTED
FINAL_SERVED_VERSION: 34
OLD_WORK0053_PR: #75
OLD_WORK0053_HEAD: 2ab8ca9a5ce7f5952140fac4c5b2a72323cc858e
OLD_WORK0053_PR_MERGE_ALLOWED: NO
WORK_0030: DEFERRED_BY_USER
```

## Read first

- `docs/handoffs/0053-japanese-ui-copy-naturalization-requirements.md`
- `docs/planning/work0053-japanese-ui-copy-naturalization.md`
- `docs/design/product-brand.md`
- `docs/design/ui-japanese-copy-guidelines.md`
- old branch/report:
  - `codex/0053-japanese-copy-brand`
  - `docs/handoffs/0053-CODEX-01-japanese-ui-copy-naturalization-report.md`
- `docs/handoffs/0052-completion-report.md`

## Branch strategy

Create fresh branch from exact latest main:

```text
codex/0053-japanese-copy-reconcile
```

Do not force-rewrite old stacked branch.

Reapply only Work0053 semantic copy/brand changes.

After the new Draft PR is successfully created:
- comment on PR #75 that it is superseded
- close PR #75
- do not merge PR #75

## Brand contract

User-facing product brand:

```text
Private Assets Intelligence
```

Required:
- main title -> `Private Assets Intelligence`
- left brand -> `Private Assets Intelligence`
- old subtitle `PRIVATE ASSETS KNOWLEDGE` removed
- standalone search title -> `ナレッジ検索 | Private Assets Intelligence`
- no extra `Platform` / `Hub` suffix

Do not rename internal identifiers/resources:
- repo
- paths / filenames
- functions / variables
- API/RPC names
- Script Properties
- `Knowledge Platform Backend`
- `Knowledge Platform Audit`
- existing Drive resource names
- historical Work IDs/docs

## Latest user decision: keep 管理者ページ

Very important:

```text
VISIBLE_ADMIN_PAGE_LABEL: 管理者ページ
KEEP_ADMIN_PAGE_NAVIGATION: YES
RENAME_ADMIN_PAGE_TO_SETTINGS: NO
ACCOUNT_ROLE_CHANGE: 0
SHARED_PASSWORD_CHANGE: 0
```

Do not implement Work0054 here.

Work0053 may naturalize text inside the page, e.g. tabs/hints/errors, but the top-level visible page name `管理者ページ` must remain.

Do not add:
- account-level administrator role
- adminEmails authorization
- shared password gate

Those are outside Work0053.

## Copy scope

Reapply the reviewed old Work0053 semantic changes where still valid on current main:

- page titles / section headings
- labels / hints
- buttons
- empty states
- loading / success / warning / error messages
- modal text
- Knowledge Search / Full Output
- maintenance / Entity summary / analytics
- Theme / provider settings
- print/export user-visible labels
- safe public error messages

Naturalize/remove visible implementation vocabulary where a natural Japanese term exists:
- 権威ある
- authoritative
- materialize
- canonical
- fail closed
- stale source
- boundary
- contract
- provider response
- Entity / Relationship where natural UI Japanese exists

Preserve established terms:
- Meeting ID
- Document ID
- Fund / Strategy
- Status
- OpenAI
- Gemini
- API
- HEX
- RGB

## Preserve current main semantics

Must preserve all accepted Work0051/0052 behavior:

Work0051:
- backend daily backup source
- `runBackendDailyBackupNow()`
- private scheduled `runBackendDailyBackup_()`
- daily trigger contract

Work0052:
- cited-source Drive validation
- missing/inaccessible source blocks answer
- terminal replay revalidation
- stale answer hidden
- inline error
- no automatic cleanup

Also preserve:
- Work0048 manual-search-only
- Work0049 async feedback
- Work0050 Theme Color Tool
- current Work0054 planning docs / roleless-admin-page decision

Do not pull old stacked source over newer current-main source blindly.
Resolve each semantic change against current main.

## Known mobile overflow

Entity Workspace has a pre-existing 390px overflow tracked as Work0056.

This Work does not need to fix it.

However:
- Work0053 copy changes must not make the known overflow worse
- other six pages must not gain new 390px overflow
- desktop layout must not materially regress

Use the current baseline measurement from Work0052:
```text
ENTITY_WORKSPACE_390_OVERFLOW_BASELINE: 176px
OTHER_SIX_PAGES_390_OVERFLOW: 0
```

Acceptable for this Work:
- Entity Workspace <= 176px, provided culprit remains pre-existing and Work0053 is not the cause
- other six pages = 0

If Work0053 increases the overflow, treat as Work0053 regression and repair only the copy/wrapping consequence, not the unrelated underlying Work0056 issue.

## Generated artifacts

After semantic source/test changes:
1. regenerate bundle from current branch source
2. generated metadata follows repository convention
3. bundle includes Work0051 + Work0052 + Work0053
4. no old stacked generated artifacts
5. `npm run check:bundle` PASS

## Tests

Required:
- Work0053 focused copy/brand tests
- Work0052 missing-source regression
- Work0051 backup/manual-operator regression
- public surface tests
- relevant export/admin/maintenance tests
- `npm run check`
- bundle regeneration
- `npm run check:bundle`
- `git diff --check`

Browser:
- 7 normal pages nonblank
- 管理者ページ remains visible
- 3 admin tabs remain
- old brand visible count 0
- `Private Assets Intelligence` visible in required title/brand surfaces
- old subtitle 0
- forbidden visible implementation terms 0 except explicit technical exceptions
- 1440 PASS
- 390:
  - other six pages overflow 0
  - Entity Workspace not worse than known 176px baseline
- console material error/warn 0
- popup/dialog regression 0

## Safety boundaries

```text
PRIMARY_CHANGE_TYPE: USER_FACING_COPY_AND_BRAND
BUSINESS_LOGIC_CHANGE: 0
BACKEND_API_CHANGE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_BEHAVIOR_CHANGE: 0
PERMISSION_CHANGE: 0
ADMIN_ROLE_CHANGE: 0
SHARED_PASSWORD_CHANGE: 0
APPS_SCRIPT_SOURCE_SYNC: 0
IMMUTABLE_VERSION_CREATE: 0
DEPLOYMENT_UPDATE: 0
NEW_DEPLOYMENT: 0
PROVIDER_CALLS: 0
REAL_BUSINESS_DATA_MUTATION: 0
WORK_0030: DEFERRED_BY_USER
```

This Dispatch is repository reconciliation only. Do not deploy version35 yet.

## Delivery

Fresh branch:
`codex/0053-japanese-copy-reconcile`

Fresh Draft PR against `main`.

Create:
`docs/handoffs/0053-CODEX-02-japanese-copy-reconcile-report.md`
`docs/handoffs/0053-dispatches.md`

Do not mark Work0053 ACCEPTED.
Do not apply Completion Latch.

Return:

```text
WORK_ID: 0053
DISPATCH_ID: 0053-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
NEW_BRANCH: codex/0053-japanese-copy-reconcile
NEW_DRAFT_PR: <number>
OLD_PR_75: SUPERSEDED_CLOSED
WORK0051_REGRESSION: PASS|FAIL
WORK0052_REGRESSION: PASS|FAIL
WORK0053_FOCUSED: PASS|FAIL
NPM_RUN_CHECK: PASS|FAIL
BUNDLE: PASS|FAIL
BROWSER: PASS|FAIL
ADMIN_PAGE_LABEL: 管理者ページ
ENTITY_WORKSPACE_390_OVERFLOW_PX: <number>
LIVE_MUTATION_COUNT: 0
BLOCKER: NONE|...
READY_FOR_CHATGPT_FINAL_REVIEW: YES|NO
```
