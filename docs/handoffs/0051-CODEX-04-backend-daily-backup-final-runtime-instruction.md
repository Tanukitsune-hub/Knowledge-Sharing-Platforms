# Work 0051 CODEX-04 — Backend daily backup final target-runtime qualification

WORK_ID: 0051
DISPATCH_ID: 0051-CODEX-04
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION

## Context

Work0051 CODEX-03でmanual operator implementationを追加し、ChatGPT final review後にPR #79をmergeした。

```text
BACKUP_IMPLEMENTATION_PR: #73
BACKUP_IMPLEMENTATION_MERGE: cc4af362bce24409246e4d03ab6f804a365ecb83
MANUAL_OPERATOR_PR: #79
MANUAL_OPERATOR_MERGE: e398dc20aeaa4d508ee04d5ca62a98c23353458f
BASELINE_SERVED_VERSION: 32
EXPECTED_FINAL_SERVED_VERSION: 33
```

Work0051はまだACCEPTEDではない。
Completion LatchはNOT_APPLIED。

## Primary Outcome

same owner-only target Apps Script projectへWork0051を導入し、

- dedicated `Knowledge Platform Backups` folder
- daily backup trigger exactly 1
- current-date Backend snapshot exactly 1
- same-day second manual run => REUSED
- Backend sourceにbackup job由来のdrift 0
- version33 / same owner-only /exec

をtarget-runtime evidenceで確認する。

## Read first

- `docs/handoffs/0051-CODEX-03-manual-backup-operator-report.md`
- `docs/handoffs/0051-CODEX-02-backend-daily-backup-runtime-report.md`
- `docs/handoffs/0051-backend-daily-backup-requirements.md`
- `docs/operations/backend-daily-backup.md`
- `docs/operations/apps-script-web-app-deployment.md`
- `docs/handoffs/0050-completion-report.md`

## User policy to preserve

Application-levelの「管理者 / 一般利用者」区分は設けない。

This Dispatch:
- do not add `adminEmails` authorization to manual backup
- do not hard-code person/email
- do not add role checks
- do not add backup UI

Existing installer/setup authorization behavior is outside Work0051 scope and must not be redesigned here. Work0054 handles no-admin-role / Settings unification.

## Target identity

Reuse the exact target chain proven in Work0050 CODEX-03 and Work0051 CODEX-02:

- Drive host: `KSP Work 0028 Synthetic Host`
- bound Apps Script project
- same existing owner-only WEB_APP
- same /exec
- current served version32

Do not use repository-root stale `.clasp.json`.
Use/reconstruct only the proven disposable mapping.

Never write Script ID, deployment ID, Drive IDs, private URL, user/account ID, OAuth material to GitHub/report.

## Phase 0 — pre-mutation gate

Confirm read-only:

1. latest `origin/main` exact
2. PR #73 and PR #79 merges both included
3. target bound project identity unchanged
4. existing WEB_APP:
   - type WEB_APP
   - version32
   - execute-as unchanged
   - access owner-only
   - same /exec
5. Backend exact resource under restricted control boundary
6. current Backend sheet names:
   - Counterparty_Master
   - Option_Master
   - Meeting_Index
   - Pitchbook_Index
   - Settings
7. exact-name backup folder absent or uniquely identifiable
8. current project trigger inventory
9. current backup snapshot inventory if folder already exists

If any target/resource identity is ambiguous, STOP before mutation.

## Phase 1 — local validation

Before sync:

- focused Work0051 backup/setup/manual operator/public-surface tests PASS
- `npm run check` PASS
- `npm run check:bundle` PASS
- `git diff --check` PASS

No source repair in this run.
If code defect is found, STOP and return a repair Draft PR; do not deploy.

## Phase 2 — source sync

Allowed:
- sync exact latest main to proven Apps Script project: max 1
- independent saved-source readback: required

After readback verify:
- Work0051 backup source present
- `runBackendDailyBackupNow()` present
- scheduled `runBackendDailyBackup_()` remains private
- trigger registry targets private handler
- no unreviewed source drift

Then confirm Apps Script editor function picker includes:
- `runBackendDailyBackupNow`
- `installKnowledgeShare`

If manual operator is still not selectable after exact saved-source sync, STOP before setup.

## Phase 3 — setup / installation idempotency

Use existing editor-visible `installKnowledgeShare()` path.

Run 1:
- setup succeeds
- dedicated `Knowledge Platform Backups` folder created/reused under authoritative control boundary
- installation state records backupFolderId
- Backend Settings records BACKUP_FOLDER_ID
- exactly one daily CLOCK trigger for `runBackendDailyBackup_`

Run 2:
- same folder reused
- duplicate folder 0
- daily backup trigger count remains exactly 1
- duplicate trigger 0
- existing AI trigger semantics unchanged
- Backend and Audit identities unchanged

Allowed intended setup writes:
- installation state/status
- Backend Settings metadata
- backup folder creation if absent
- backup trigger creation if absent

Unexpected business-data mutation => STOP.

After setup Run 2, record the new baseline for backup-job drift:
- Backend file identity/name/parent
- Backend modifiedTime
- sheet names/count
- relevant row counts or stable metadata sufficient to prove backup job does not mutate Backend

## Phase 4 — first manual backup

Execute from Apps Script editor function picker:

`runBackendDailyBackupNow()`

Expected:
```text
ok: true
snapshot: CREATED
retentionTrashed: 0
```

If a valid same-day snapshot already exists unexpectedly, `REUSED` may be accepted only after proving it was created by this Work0051 app-owned contract and all identity/content checks pass.

Verify the snapshot:
- distinct from authoritative Backend
- exact name `Knowledge Platform Backend Backup YYYY-MM-DD`
- date basis Asia/Tokyo
- Google Spreadsheet MIME
- parent = dedicated backup folder only
- non-trashed
- appProperties:
  - backup kind
  - source Backend identity
  - date
- whole-file copy contains all current Backend sheets
- Audit is not copied
- Meeting Docs not copied
- Pitchbooks not copied
- Knowledge Exports not copied

Do not record Drive IDs in report.

## Phase 5 — second same-day manual backup

Execute `runBackendDailyBackupNow()` a second time.

Required:
```text
ok: true
snapshot: REUSED
same-day app-owned snapshot count: exactly 1
additional snapshot created: 0
```

Compare Backend after second run to the post-setup baseline:
- same identity
- same name
- same parent
- modifiedTime unchanged by backup job
- same sheet names/count
- no row/schema/business mutation caused by backup job

This comparison intentionally starts after setup to isolate backup-job effects from setup metadata writes.

## Phase 6 — retention

Do NOT create/backdate fake real files solely to test retention.

Accepted deterministic evidence already covers:
- age 31 days => Trash
- exactly 30 days => keep
- unrelated file => keep
- wrong source / name / marker => keep
- ambiguous/list/copy failure => Trash 0

Live expectation for newly created folder:
- `retentionTrashed = 0`

If legitimate app-owned >30-day backups somehow already exist, accepted cleanup may occur per contract, but verify eligibility before counting.

Permanent delete: forbidden.

## Phase 7 — version33 / existing WEB_APP

Only after Phases 0–6 PASS:

1. create exactly one immutable version
   - expected version33
2. read back version content and confirm exact saved source
3. update the same proven existing WEB_APP exactly once
4. verify:
   - same /exec
   - execute-as unchanged
   - access owner-only unchanged
   - new deployment 0
   - wrong deployment mutation 0

No second deploy attempt in this bounded run.

## Phase 8 — runtime smoke

On version33 same /exec:

- 7 normal pages nonblank
- Theme Color Tool still available
- Work0048 deleted-record manual-search-only preserved
- Work0049 async feedback preserved
- normal settings/admin page current baseline opens
- console material error/warn 0
- provider calls 0

Do not run Theme Save/Reset merely for smoke.

## Trigger acceptance

Final project trigger state:
- `runBackendDailyBackup_` count exactly 1
- event type CLOCK
- daily time-based schedule
- installation timezone
- no duplicate matching trigger

Actual next-day firing is not required in this dispatch.
Manual execution + exact trigger metadata is sufficient bounded acceptance evidence.

## Mutation budget

```text
SOURCE_SYNC_MAX: 1
SETUP_RUNS: 2
BACKUP_FOLDER_CREATE_MAX: 1
BACKUP_TRIGGER_CREATE_MAX: 1
MANUAL_BACKUP_RUNS: 2
SAME_DAY_SNAPSHOT_CREATE_MAX: 1
RETENTION_TRASH_EXPECTED: 0
IMMUTABLE_VERSION_CREATE_MAX: 1
EXISTING_WEB_APP_UPDATE_MAX: 1
NEW_DEPLOYMENT: 0
PROVIDER_CALLS: 0
MEETING_PITCHBOOK_MASTER_MUTATION: 0
PERMISSION_CHANGE: 0
WORK_0030: DEFERRED_BY_USER
```

## Stop conditions

STOP without fix-forward if:
- target identity changes
- saved-source readback mismatch
- manual operator not visible
- setup creates duplicate/ambiguous folder
- trigger count != 1
- first backup cannot be verified
- second backup creates another snapshot
- Backend drifts due to backup execution
- unrelated file is trashed
- deployment identity changes
- runtime has material regression

Do not begin Work0052 in this dispatch.

## Delivery

Create:
- `docs/handoffs/0051-CODEX-04-backend-daily-backup-final-runtime-report.md`

Update:
- `docs/handoffs/0051-dispatches.md`

Create docs/evidence Draft PR only if needed.
Do not mark Work0051 ACCEPTED.
Do not apply Completion Latch.

Return:

```text
WORK_ID: 0051
DISPATCH_ID: 0051-CODEX-04
BALL: CHATGPT
STATUS: RETURNED
TARGET_RUNTIME_QUALIFICATION: PASS|FAIL
FINAL_SERVED_VERSION: 33|32_UNCHANGED
BACKUP_FOLDER: CREATED|REUSED|NOT_RUN
DAILY_TRIGGER_COUNT: <n>
FIRST_BACKUP: CREATED|REUSED|NOT_RUN
SECOND_BACKUP: REUSED|NOT_RUN
SAME_DAY_SNAPSHOT_COUNT: <n>
RETENTION_TRASHED: <n>
BACKEND_BACKUP_JOB_DRIFT: 0|...
NEW_DEPLOYMENT: 0
BLOCKER: NONE|...
READY_FOR_CHATGPT_FINAL_REVIEW: YES|NO
```
