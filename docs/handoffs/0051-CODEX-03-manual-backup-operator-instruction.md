# Work 0051 CODEX-03 — manual backup operator path

WORK_ID: 0051
DISPATCH_ID: 0051-CODEX-03
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Work0051 CODEX-02で判明した `APPROVED_PRIVATE_BACKUP_MANUAL_EXECUTION_PATH_UNAVAILABLE` を解消する。

scheduled handler `runBackendDailyBackup_()` はprivateのまま維持し、Apps Script editorのfunction pickerから手動実行できるoperator entrypointを追加する。

ユーザー方針:
- アプリ内で「管理者 / 一般利用者」を分けない
- Web Appにアクセスできる利用者は原則同じ機能を使える
- 特定個人のemail rosterをapplication authorizationに使わない

このDispatchではsource implementation / tests / Draft PRまで。
Apps Script source sync、setup、backup folder/trigger/snapshot作成、version33、deployment更新は行わない。

## Read first

- `docs/handoffs/0051-CODEX-02-backend-daily-backup-runtime-report.md`
- `docs/handoffs/0051-backend-daily-backup-requirements.md`
- `docs/planning/work0051-backend-daily-backup.md`
- `docs/operations/backend-daily-backup.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/handoffs/0050-completion-report.md`

## Closed conclusions

```text
TARGET_PROJECT_IDENTITY: PROVEN
BASELINE_WEB_APP_VERSION: 32
BACKEND_BOUNDARY: PROVEN
BACKUP_IMPLEMENTATION_PR: #73 MERGED
PRIVATE_SCHEDULED_HANDLER: runBackendDailyBackup_
PRIVATE_HANDLER_MUST_REMAIN_PRIVATE: YES
IN_APP_ADMIN_ROLE: NONE
EMAIL_ROSTER_AUTHORIZATION_FOR_BACKUP: 0
NORMAL_USER_UI_FOR_MANUAL_BACKUP: 0
API_EXECUTABLE_DEPLOYMENT: 0
NEW_DEPLOYMENT: 0
CODEX02_EXTERNAL_MUTATION: 0
WORK_0030: DEFERRED_BY_USER
```

## Required design

Add one editor-visible operator entrypoint, recommended name:

```js
runBackendDailyBackupNow()
```

or equivalent clear name without trailing underscore.

Scheduled daily trigger remains:
```js
runBackendDailyBackup_()
```

Do not rename the scheduled handler and do not point the daily trigger at the manual wrapper.

## Authorization / access contract

Do NOT add application-level administrator authorization.

Specifically:
- do not check `adminEmails`
- do not hard-code a person/email
- do not require installer owner
- do not add shared-admin password/token
- do not add a role table

The manual operator relies on the underlying Google / Apps Script access boundary for the project/editor.

The function itself must still be operationally safe:
- same backup service
- same same-day idempotency
- same restricted folder/source boundary
- same app-owned retention boundary
- no permanent delete

## Manual wrapper behavior

On execution:
1. call the same `kspRunBackendDailyBackup_()` service used by scheduled execution
2. preserve same-day idempotency and retention semantics
3. log only the existing safe summary:
   - operation
   - ok
   - snapshot
   - retentionTrashed
   - errorCode
4. return the bounded result object

Do not log:
- file IDs
- folder IDs
- private URLs
- account/email
- Script ID / deployment ID
- source contents

Do not duplicate backup/retention implementation inside the wrapper.

## Product surface boundary

This operator exists to support controlled manual execution and qualification.

For Work0051:
- no new button/link/menu in Web App
- no automatic browser invocation
- no API executable deployment
- no new doGet/doPost route
- no new backup settings UI

A future Work will normalize the current “管理者ページ” concept so application features are not role-gated.

## Tests

At minimum:

### Manual operator
- editor-visible top-level function exists
- no trailing underscore
- calls the same backup service path
- first run can return CREATED
- second run can return REUSED
- no duplicate backup logic

### Role policy
- manual operator contains no `adminEmails` authorization
- no hard-coded email
- no installer-owner dependency
- no shared-admin password/token dependency

### Surface
- scheduled handler still ends with underscore
- daily trigger registry still targets `runBackendDailyBackup_`
- no Web App UI button/menu added for manual backup
- no API/deployment config change

### Regression
- Work0051 existing focused tests
- setup trigger tests
- `npm run check`
- bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## Scope

Expected production files:
- `src/99_EntryPoints.gs`
- tests
- bundle artifacts
- docs as needed

Only change backup core/live files if necessary for testability. Avoid unrelated UI/copy changes.

## Safety

```text
IN_APP_ADMIN_ROLE: NONE
EMAIL_AUTHORIZATION_CHANGE_FOR_MANUAL_BACKUP: REMOVE_REQUIREMENT
NORMAL_USER_UI_CHANGE: 0
SCHEDULED_HANDLER_VISIBILITY_CHANGE: 0
BACKUP_BUSINESS_SEMANTICS_CHANGE: 0
RETENTION_SEMANTICS_CHANGE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_CHANGE: 0
PERMISSION_CHANGE: 0
APPS_SCRIPT_SOURCE_SYNC: 0
REAL_BACKUP_MUTATION: 0
REAL_TRIGGER_MUTATION: 0
DEPLOYMENT_UPDATE: 0
NEW_DEPLOYMENT: 0
WORK_0030: DEFERRED_BY_USER
```

## Delivery

Branch:
`codex/0051-manual-backup-operator`

Draft PR, do not merge.

Report:
`docs/handoffs/0051-CODEX-03-manual-backup-operator-report.md`

Update:
`docs/handoffs/0051-dispatches.md`

Report must include:
- production files changed
- wrapper -> same backup service evidence
- no app-level admin/email gating evidence
- scheduled handler target unchanged
- tests / bundle
- external mutation count 0
- BLOCKER / READY_FOR_CHATGPT_FINAL_REVIEW

WORK_ID: 0051
DISPATCH_ID: 0051-CODEX-03
BALL: CODEX
STATUS: READY
