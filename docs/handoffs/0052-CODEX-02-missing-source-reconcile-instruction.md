# Work 0052 CODEX-02 — reconcile missing-source implementation onto accepted version33 baseline

WORK_ID: 0052
DISPATCH_ID: 0052-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Work0052 CODEX-01で実装済みのmissing-source graceful failureを、Work0051 accepted / version33のlatest mainへ安全に再適用し、stale generated bundleやWork0051 regressionを持ち込まず、新しいreviewable Draft PRとして返す。

## Why this dispatch exists

旧Draft PR #74はWork0051 CODEX-01時点の古いstacked branchをbaseにしている。

Current state:
- PR #74 semantic Work0052 source/test changesはreview上妥当
- ただしbranchはcurrent mainから大きくbehind
- generated bundle / manifestがWork0051 manual operatorとversion33 baselineを含まない古い内容
- current mainへそのままmergeするとaccepted Work0051成果を巻き戻す危険がある

Therefore PR #74はそのままmergeしない。

## Accepted baseline

```text
WORK0051: ACCEPTED
FINAL_SERVED_VERSION: 33
WORK0051_COMPLETION_LATCH: APPLIED
CURRENT_MAIN: latest origin/main
OLD_WORK0052_PR: #74
OLD_WORK0052_HEAD: ddb4bb819f35e797d5cc3cb49c44f6be5674fc6c
OLD_BRANCH_BEHIND_MAIN: YES
```

## Read first

- `docs/handoffs/0052-missing-source-graceful-failure-requirements.md`
- `docs/planning/work0052-missing-source-graceful-failure.md`
- old branch/report:
  - `codex/0052-missing-source-graceful-failure`
  - `docs/handoffs/0052-CODEX-01-missing-source-graceful-failure-report.md`
- `docs/handoffs/0051-completion-report.md`
- `docs/operations/backend-daily-backup.md`
- `docs/design/ui-japanese-copy-guidelines.md`

## Branch strategy

Do NOT force-rewrite the old stacked branch.

Create a fresh branch from exact latest main:

```text
codex/0052-missing-source-reconcile
```

Reapply only Work0052 semantic changes.

PR #74 remains historical/superseded evidence and must not be merged.

## Semantic changes to preserve from CODEX-01

### Source model identity
In `src/150_KnowledgeSearchModels.gs`:
- authoritative source mappings include registered Drive file ID:
  - Meeting -> `Doc_File_ID`
  - Pitchbook -> `File_ID`

### AI result integrity
In `src/164_AiProviderCore.gs`:
- cited sources only are validated against current Backend + Drive source
- no full-corpus preflight
- missing/inaccessible/trashed/wrong-id cited source => terminal safe failure
- Meeting validates expected Google Docs MIME
- expected registered folder boundary validated where available
- stale answer is not returned
- terminal replay revalidates current Drive source
- provider success audit/result must not occur before cited-source validation
- safe public code/message does not expose Drive file ID/private URL

### Knowledge Search UI
In `src/ClientKnowledgeSearch.html`:
- error status hides stale prior result
- inline error only
- popup/dialog 0

### Full Output wording
Preserve natural missing-source wording in `src/155_KnowledgeExportContracts.gs`, but do not pull old wording over newer Work0053 decisions because Work0053 is not yet accepted.
Use current main + Work0052 requirements as source of truth.

### Tests
Reapply/update:
- Work0052 missing-source focused tests
- AI helper changes required by cited Drive metadata validation
- browser deterministic inline-error test
- no-popup assertion
- healthy-source regression
- replay-after-delete regression

## Preserve current main

Must preserve all accepted Work0051 content, including:
- Backend daily backup files
- manual operator `runBackendDailyBackupNow()`
- daily trigger contract
- current bundle source order
- version33 source baseline semantics

Do not delete or regress any Work0051 source/test/doc.

Also preserve:
- Work0050 Color Tool
- Work0048 manual search
- Work0049 async feedback

## Generated artifacts

After applying semantic source/test changes on latest main:

1. regenerate bundle from current source
2. release metadata must use the current branch source commit according to repo convention
3. `npm run check:bundle` PASS
4. no generated artifact may reference old Work0051 stacked head as source baseline
5. bundle includes both:
   - Work0051 manual operator
   - Work0052 missing-source changes

## Tests

Required:
- Work0052 focused tests
- Work0051 backup/manual-operator regression tests
- relevant AI citation/replay tests
- public surface tests
- production UI browser deterministic test
- `npm run check`
- bundle regeneration
- `npm run check:bundle`
- `git diff --check`

Browser acceptance:
- inline missing-source error visible
- stale answer hidden
- popup/dialog 0
- 7 normal pages nonblank
- 390px no material overflow
- console material error/warn 0

## Safety boundaries

```text
AUTO_RECREATE_SOURCE: 0
AUTO_DEACTIVATE_RECORD: 0
BACKEND_MUTATION_ON_MISSING_SOURCE: 0
PROVIDER_INDEX_AUTO_DELETE: 0
PROVIDER_CALLS: 0
REAL_SOURCE_DELETE_FOR_TEST: 0
BUSINESS_DATA_MUTATION: 0
APPS_SCRIPT_SOURCE_SYNC: 0
IMMUTABLE_VERSION_CREATE: 0
DEPLOYMENT_UPDATE: 0
NEW_DEPLOYMENT: 0
PERMISSION_CHANGE: 0
WORK_0030: DEFERRED_BY_USER
```

This Dispatch is repository reconciliation only. Do not deploy version34 yet.

## Delivery

Fresh branch:
`codex/0052-missing-source-reconcile`

Fresh Draft PR against:
`main`

Do not merge PR #74.
Do not close PR #74 until the new Draft PR is successfully created; then mark #74 superseded in a comment and close it.

Create report:
`docs/handoffs/0052-CODEX-02-missing-source-reconcile-report.md`

Create/update dispatch:
`docs/handoffs/0052-dispatches.md`

Return:

```text
WORK_ID: 0052
DISPATCH_ID: 0052-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
NEW_BRANCH: codex/0052-missing-source-reconcile
NEW_DRAFT_PR: <number>
OLD_PR_74: SUPERSEDED_CLOSED
WORK0051_REGRESSION: PASS|FAIL
WORK0052_FOCUSED: PASS|FAIL
NPM_RUN_CHECK: PASS|FAIL
BUNDLE: PASS|FAIL
BROWSER: PASS|FAIL
LIVE_MUTATION_COUNT: 0
BLOCKER: NONE|...
READY_FOR_CHATGPT_FINAL_REVIEW: YES|NO
```

Do not mark Work0052 ACCEPTED.
Do not apply Completion Latch.
