# Work 0051 CODEX-03 — guarded manual backup operator path

WORK_ID: 0051
DISPATCH_ID: 0051-CODEX-03
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Work0051 CODEX-02で判明した `APPROVED_PRIVATE_BACKUP_MANUAL_EXECUTION_PATH_UNAVAILABLE` を、scheduled handler `runBackendDailyBackup_()` のprivate性を維持したまま解消する。

editor function pickerから明示実行できる、owner/admin限定のmanual operator entrypointを追加する。

このDispatchではsource implementation / tests / Draft PRまで。
Apps Script source sync、setup、backup folder/trigger/snapshot作成、version33、deployment更新は行わない。

## Recommended model

GPT-5.6 Sol High。

理由:
public top-level Apps Script functionを1つ追加するため、normal-user RPC surfaceへの意図しない露出とauthorization semanticsを慎重にレビューする必要がある。

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

or an equivalent clear name without a trailing underscore.

This wrapper is for administrator/operator manual execution only.

The scheduled daily handler remains:
```js
runBackendDailyBackup_()
```

Do not rename the scheduled handler and do not point the daily trigger at the public wrapper.

## Authorization contract

The manual wrapper must fail closed before any Drive/backup mutation unless all conditions are true:

1. installation state/config is readable
2. configured `adminEmails` contains the active operator email
3. `Session.getActiveUser().getEmail()` is non-empty
4. `Session.getEffectiveUser().getEmail()` is non-empty
5. active email === effective email
6. normalized email is in configured `adminEmails`

Reason:
- editor/manual run by the owner/admin should pass
- future Web App execute-as-owner calls from another user must not pass via effective-user fallback
- blank active identity must fail
- normal-user browser access must not be treated as administrator merely because effective user is the deployer

Do NOT reuse an authorization helper whose blank-active fallback accepts effective user alone.

A dedicated narrow helper is preferred.

Suggested internal shape:

```js
kspAssertBackendBackupOperator_(environment)
kspRunBackendDailyBackupOperator_(environment)
runBackendDailyBackupNow()
```

Equivalent implementation is acceptable.

## Environment contract

Use a testable environment adapter for session identities rather than hard-coding untestable Session access inside core logic.

Preferred:
- `kspCreateBackendBackupEnvironment_()` exposes `getSessionIdentities()`
- returns normalized-safe raw active/effective strings
- authorization logic remains in core backup service

Do not move this authorization logic into UI/client code.

## Manual wrapper behavior

On authorized execution:

1. authorize
2. call the same private `kspRunBackendDailyBackup_()` service used by scheduled execution
3. preserve its same-day idempotency and retention semantics
4. write only the existing safe Logger summary:
   - operation
   - ok
   - snapshot
   - retentionTrashed
   - errorCode
5. return the bounded result object

Do not log:
- file IDs
- folder IDs
- private URLs
- account/email
- Script ID / deployment ID
- source contents

Unauthorized execution:
- must fail before copy / Trash
- must not create folder/trigger
- must not modify Backend
- must not invoke provider calls

A clear internal error code such as `BACKUP_OPERATOR_UNAUTHORIZED` is expected.

## Public-surface boundary

The new top-level function is editor-visible by design, but normal product UI must not expose it.

Required:
- no button/link/menu in Web App
- no HTML reference to `runBackendDailyBackupNow`
- no automatic browser call
- no new admin tab action
- no API executable deployment
- no new doGet/doPost route
- no client helper wrapping it

Add a test that scans user-facing/client HTML and confirms manual backup operator function name is not referenced.

Because Apps Script public server functions may be callable from `google.script.run` when known, server-side authorization is mandatory and must be sufficient by itself.

## Tests

At minimum:

### Authorized operator
- active == effective == configured admin
- wrapper/service proceeds
- first run can return CREATED
- second run can return REUSED
- underlying backup service remains exactly the same implementation path

### Unauthorized
Each fails before mutation:
- active blank
- effective blank
- active != effective
- active not in adminEmails
- configured adminEmails empty
- installation/config unreadable

Assert for unauthorized:
- copy calls 0
- Trash calls 0
- source mutation 0

### Surface
- scheduled handler still ends with underscore
- daily trigger registry still targets `runBackendDailyBackup_`
- manual wrapper has no trailing underscore / editor-visible
- normal-user HTML/client source contains 0 references to manual wrapper
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
- `src/21_BackendBackup.gs`
- `src/22_BackendBackupLive.gs`
- `src/99_EntryPoints.gs`
- tests
- bundle artifacts
- docs as needed

Avoid unrelated copy/UI changes.

## Safety

```text
NORMAL_USER_UI_CHANGE: 0
NORMAL_USER_RPC_WIRING: 0
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
- exact authorization predicate
- production files changed
- authorized tests
- unauthorized fail-closed tests
- normal-user UI reference count
- scheduled handler target unchanged
- full/bundle results
- external mutation count 0
- BLOCKER / READY_FOR_CHATGPT_FINAL_REVIEW

WORK_ID: 0051
DISPATCH_ID: 0051-CODEX-03
BALL: CODEX
STATUS: READY
