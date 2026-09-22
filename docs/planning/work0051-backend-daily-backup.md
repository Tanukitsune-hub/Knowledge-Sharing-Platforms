# Work 0051 — Backend daily backup plan

WORK_ID: 0051
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0049 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Backend Spreadsheet onlyをdaily snapshotし、30日超のapp-owned snapshotsを安全にTrashへ送る。

## Implementation direction

- dedicated `Knowledge Platform Backups` folder under `controlFolderId`
- whole-file Drive copy
- local-date idempotency
- daily time-based trigger
- retention cleanup in same scheduled run
- app-owned filename/metadata boundary
- no permanent delete
- no automatic restore

## Likely source areas

- core resource / trigger contracts
- setup / installer resource resolution
- live Drive adapters
- new backup service / entrypoint
- tests / bundle

## Routing

Route C planned.

Recommended model:
- GPT-5.6 Sol High

Reason:
installer/resource identity, Drive boundary, trigger idempotency, retention deletion safetyを同時に扱うため。

## Safety

```text
BACKUP_SCOPE: BACKEND_SPREADSHEET_ONLY
AUDIT_BACKUP: 0
DOC_BACKUP: 0
PITCHBOOK_BACKUP: 0
PERMANENT_DELETE: 0
AUTOMATIC_RESTORE: 0
SOURCE_BACKEND_MUTATION: 0
SCHEMA_CHANGE: 0
WORK_0030: DEFERRED_BY_USER
```
