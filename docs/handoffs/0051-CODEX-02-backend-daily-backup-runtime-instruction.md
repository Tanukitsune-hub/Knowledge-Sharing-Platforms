# Work 0051 CODEX-02 — Backend daily backup target-runtime qualification

WORK_ID: 0051
DISPATCH_ID: 0051-CODEX-02
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION

## Context

Work0051 repository implementation passed ChatGPT final review and PR #73 was merged.

```text
IMPLEMENTATION_PR: #73
IMPLEMENTATION_MERGE: cc4af362bce24409246e4d03ab6f804a365ecb83
BASELINE_SERVED_VERSION: 32
EXPECTED_FINAL_SERVED_VERSION: 33
```

Work0050 Completion Latch is applied. Work0051 is not yet ACCEPTED.

## Primary Outcome

same owner-only Apps Script projectでWork0051を実運用状態へ導入し、

- restricted control boundary直下の dedicated backup folder
- daily trigger exactly one
- Backend whole-file snapshot exactly one for the current local date
- same-day rerun creates no duplicate snapshot
- Backend source itself is not changed by the backup job
- normal Web App remains healthy

をtarget-runtime evidenceで確認する。

## Read first

- `docs/handoffs/0051-backend-daily-backup-requirements.md`
- `docs/handoffs/0051-CODEX-01-backend-daily-backup-report.md`
- `docs/operations/backend-daily-backup.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/handoffs/0050-completion-report.md`

## Authoritative target identity

Use the same proven target chain from Work0050 CODEX-03.

Entry path:
- Drive host `KSP Work 0028 Synthetic Host`
- container-bound Apps Script project
- same owner account
- same existing owner-only WEB_APP /exec

Do not use the repository root stale `.clasp.json`.
Use/reconstruct only a disposable mapping after target project identity is independently proven.

Do not record Script ID, deployment ID, private URL, account identifiers, OAuth material, or Drive IDs in GitHub/report.

## Pre-mutation gate

Before any write:
1. latest main exact and contains PR #73 merge
2. target project identity matches Work0050 accepted chain
3. current WEB_APP is version32, execute-as unchanged, owner-only, same /exec
4. source Backend exists under the same restricted control boundary
5. record privately:
   - Backend file identity/name/parent
   - Backend sheet names/count
   - current project trigger inventory
   - whether exact-name `Knowledge Platform Backups` folder already exists
   - if folder exists, inventory only its app-owned backup candidates and retention eligibility

If resource/deployment identity is ambiguous, STOP before mutation.

## Phase A — source sync

Allowed:
- source sync exact latest main: max 1
- independent saved-source readback: required

Then run focused validation as needed.

Do not create immutable version yet if setup cannot be safely completed.

## Phase B — setup / installation state

Run the accepted setup path using the verified container-bound project.

Goal:
- create or reuse exactly one `Knowledge Platform Backups` folder under authoritative `controlFolderId`
- add/update installation-state backupFolderId
- add/update Backend Settings `BACKUP_FOLDER_ID`
- create exactly one `runBackendDailyBackup_` daily CLOCK trigger in installation timezone
- preserve existing AI trigger semantics

Run setup once, verify success.

Then run setup a second time as the idempotency check:
- same backup folder reused
- backup trigger count remains exactly 1
- no duplicate folder
- no duplicate trigger
- Backend remains exactly the accepted 5 current sheets
- Audit remains separate

Setup is allowed to update installation/settings metadata as designed. Do not treat those intended operational writes as business-data drift.

If setup creates or mutates unexpected resources, STOP.

## Phase C — first real backup

Before running backup:
- record Backend metadata after setup: same file ID/name/parent and modifiedTime
- record backup folder contents
- verify no ambiguous duplicate same-day app-owned snapshot

Run `runBackendDailyBackup_` manually once.

Expected:
- `ok=true`
- current Asia/Tokyo date key
- snapshot `CREATED` unless a valid same-day app-owned snapshot already existed; if so `REUSED`
- no source Backend rename/move
- snapshot is distinct Spreadsheet file
- name = `Knowledge Platform Backend Backup YYYY-MM-DD`
- parent = dedicated backup folder only
- MIME = Google Spreadsheet
- non-trashed
- appProperties marker/source/date contract exact
- snapshot contains all current Backend sheets
- Audit / Meeting Docs / Pitchbooks / Knowledge Exports are not copied

If an existing same-day valid snapshot is reused, verify its identity/content contract before treating it as acceptance evidence.

## Phase D — same-day idempotency

Run `runBackendDailyBackup_` manually a second time.

Required:
- `ok=true`
- `snapshot=REUSED`
- additional snapshot count = 0
- same-day app-owned snapshot count = exactly 1
- source Backend unchanged by backup calls

Compare Backend metadata immediately before first backup and after second backup:
- same file ID
- same name
- same parent
- modifiedTime unchanged by the backup job itself
- sheet names/count unchanged
- no row/schema mutation caused by the backup job

Note: setup metadata writes occurred before this comparison and are not attributed to backup execution.

## Phase E — retention evidence

Do not fabricate or backdate real production files solely to test retention.

Use repository deterministic evidence already accepted for:
- 31-day snapshot -> Trash
- exactly-30-day snapshot -> keep
- unrelated file -> keep
- wrong source/name/marker -> keep
- ambiguous/list/copy failure -> Trash 0

In live folder:
- if pre-existing genuinely app-owned >30-day snapshots exist, the backup job may move them to Trash per the accepted contract; record count only, not IDs
- otherwise expected live retentionTrashed = 0

Permanent delete is forbidden.

## Phase F — immutable version / Web App

After setup + backup qualification PASS:
- create exactly one immutable version, expected version33
- update the same proven existing WEB_APP deployment once
- new deployment 0
- same /exec
- execute-as unchanged
- owner-only access unchanged

Then runtime smoke:
- all 7 normal pages nonblank
- Color Tool still available
- Work0048 manual-search-only remains
- Work0049 async feedback remains
- console material error/warn 0
- provider calls 0

## Trigger acceptance

Verify after final setup:
- exactly one project trigger for `runBackendDailyBackup_`
- event type CLOCK
- daily schedule contract / installation timezone
- no duplicate matching trigger

Actual next-day scheduled firing is not required for this bounded qualification; manual execution + trigger metadata is acceptance evidence for scheduled setup.

## Allowed / expected mutations

```text
SOURCE_SYNC_MAX: 1
SETUP_RUNS: 2
BACKUP_FOLDER_CREATE_MAX: 1
DAILY_TRIGGER_CREATE_MAX: 1
BACKUP_MANUAL_RUNS: 2
SAME_DAY_BACKUP_FILE_CREATE_MAX: 1
RETENTION_TRASH: ONLY_EXISTING_APP_OWNED_OLDER_THAN_30_DAYS
IMMUTABLE_VERSION_CREATE_MAX: 1
EXISTING_WEB_APP_UPDATE_MAX: 1
NEW_DEPLOYMENT: 0
```

Forbidden:
- permanent delete
- automatic restore
- Audit backup
- Meeting Doc backup
- Pitchbook backup
- Knowledge Export backup
- provider calls
- business Meeting/Pitchbook/Master mutation
- permission broadening
- new deployment
- Work0030 activation

## Tests before source mutation

- focused Work0051 setup / backup tests
- `npm run check`
- `npm run check:bundle`
- `git diff --check`

## Stop conditions

Stop immediately if:
- target identity ambiguity returns
- setup creates duplicate/ambiguous backup folder
- trigger cannot be proven unique
- backup source boundary mismatches
- snapshot verification fails
- Backend appears mutated by backup job
- unrelated files become retention candidates
- second run creates a second same-day snapshot
- deployment identity changes

Do not fix forward into Work0052.

## Delivery

Create/update:
- `docs/handoffs/0051-CODEX-02-backend-daily-backup-runtime-report.md`
- `docs/handoffs/0051-dispatches.md`

Docs-only Draft PR is acceptable.

Do not mark Work0051 ACCEPTED.
Do not apply Completion Latch.

Return:
```text
WORK_ID: 0051
DISPATCH_ID: 0051-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
TARGET_RUNTIME_QUALIFICATION: PASS|FAIL
FINAL_SERVED_VERSION: <version or unchanged>
BACKUP_FOLDER: CREATED|REUSED|NOT_RUN
DAILY_TRIGGER_COUNT: <n>
FIRST_BACKUP: CREATED|REUSED|NOT_RUN
SECOND_BACKUP: REUSED|NOT_RUN
SAME_DAY_SNAPSHOT_COUNT: <n>
RETENTION_TRASHED: <n>
BACKEND_BACKUP_JOB_DRIFT: 0|...
BLOCKER: NONE|...
READY_FOR_CHATGPT_FINAL_REVIEW: YES|NO
```

WORK_0030 remains DEFERRED_BY_USER.
