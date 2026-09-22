# Work 0051 — Backend daily backup / 30-day retention requirements

WORK_ID: 0051
STATUS: PLANNED
MODE: BUILD
DEPENDENCY: Work0050 ACCEPTED
ACTIVE_DISPATCH: NONE
BALL: NONE

## Primary Outcome

Knowledge Shareの業務台帳である `Knowledge Platform Backend` を1日1回自動snapshotし、30日を超えたsnapshotを自動整理する。

対象はBackend Spreadsheetのみ。

## Backup scope

Backup:
- `Knowledge Platform Backend`

Do NOT backup:
- `Knowledge Platform Audit`
- Meeting Records Google Docs
- Pitchbooks source files
- Knowledge Exports
- Apps Script source（GitHub / immutable versionsで保護済み）

Backend snapshotにはその時点の全sheetを含む:
- Counterparty_Master
- Option_Master
- Meeting_Index
- Pitchbook_Index
- Settings
- future backend sheets included by whole-file copy

## Storage location

Restricted control boundary配下に専用folderを作成:

`Knowledge Platform Backups`

Parent:
- authoritative `controlFolderId`

Backup file naming:
`Knowledge Platform Backend Backup YYYY-MM-DD`

Date basis:
- installation timezone / Asia/Tokyo

Do not put backup under the user-facing Knowledge root.

## Schedule

- once daily
- installable Apps Script time-based trigger
- approximate off-hours execution is acceptable; exact minute is not a product requirement
- trigger creation must be idempotent
- duplicate matching backup triggers must not be silently multiplied

## Daily idempotency

For one local calendar date:
- at most one accepted backup snapshot
- if same-date snapshot already exists, skip duplicate creation and continue retention cleanup

Trigger retry / duplicate invocation must not create multiple daily snapshots.

## Snapshot semantics

- create a full Drive copy of the Backend Spreadsheet
- original source spreadsheet is read-only from backup job perspective
- source spreadsheet must never be renamed/moved/modified by backup
- snapshot must reside only in dedicated backup folder
- verify copied file ID, MIME type, parent, non-trashed state before success

## Retention

Retention window:
- 30 days

Safe deletion policy:
- snapshots older than 30 days are moved to Google Drive Trash
- do not permanently delete in this Work
- only files inside the dedicated backup folder that match the app-owned backup naming/marker contract are eligible
- never delete the authoritative Backend Spreadsheet

Reason:
reversible cleanup is preferred; Backend-only snapshots are small, so permanent deletion adds risk with little storage benefit.

## Failure handling

Backup failure:
- must not affect normal Web App use
- must not mutate the Backend Spreadsheet
- must not delete existing backups
- retention cleanup should not run if backup folder identity/boundary is ambiguous
- log/report operational failure safely
- no user-facing popup during normal Web App use

## Installation / trigger contract

Existing trigger architecture currently supports minute-based trigger creation only.

Work0051 may extend trigger adapter/registry to support a DAILY schedule, but must:
- preserve existing AI trigger semantics
- keep trigger creation idempotent
- validate handler and event type
- avoid schema migration

An existing installation must receive the backup folder + daily trigger through the accepted setup/installation path or a bounded one-time migration step.

## Recovery contract

This Work creates backups; it does NOT build one-click restore.

Recovery procedure may be documented:
1. identify required dated backup snapshot
2. inspect snapshot
3. manually / separately restore under controlled incident procedure

Automatic restore is out of scope to avoid destructive overwrite.

## Acceptance Evidence

- dedicated backup folder created/reused under controlFolder
- source Backend file ID unchanged
- one backup copy created
- snapshot parent / MIME / name verified
- same-day second run creates 0 additional snapshot
- synthetic old app-owned backups >30 days -> moved to Trash
- exactly-30-day boundary tested deterministically
- unrelated files in folder not deleted
- source Backend never trashed/mutated
- daily trigger exists exactly once
- installer/setup rerun creates no duplicate folder/trigger
- failure path leaves source and existing snapshots intact
- Audit / Docs / Pitchbooks backup count 0
- schema/migration/provider/permission broadening 0
