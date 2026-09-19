# CODEX-01 — Restore monthly Meeting admin review workflow

WORK_ID: 0039
DISPATCH_ID: 0039-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Accepted baseline

Work0038 is accepted and completion-latched.

```text
APPLICATION_BASELINE_MERGE: 27fb5ca200cdb4d26f7111555cde33c8c2956892
SERVED_BASELINE_VERSION: 18
OWNER_ONLY_DEPLOYMENT: preserve
WORK_0038: ACCEPTED
WORK_0030: DEFERRED_BY_USER
```

## Primary Outcome

Restore the accepted monthly administrative review workflow directly in `面談実績の集計 > 該当Meeting`: readable Meeting Type labels plus an autosaving `確認済み` checkbox on each Meeting row.

## Historical / current facts

- Work0017 implemented and qualified persistent `Admin_Check_*` metadata and `updateMeetingAdminCheck`.
- Current backend/live paths remain intact.
- Work0028 Light design intended inline `確認済み` checkbox in the Meeting list.
- Current production never ported that presentation and later Work0037 one-year default hides the legacy single-month card.

Do not redesign backend storage.

## Exact target table

`該当Meeting` columns:
1. 日付
2. Meeting ID
3. 面談先
4. Team
5. Meeting Type
6. Status
7. 原本
8. 確認済み

### Meeting Type

Render canonical Japanese labels, not raw codes:
- `ANNUAL_REVIEW` -> `定例年1回`
- `OFFICE_VISIT` -> `先方オフィス訪問`
- `ANNUAL_GENERAL_MEETING` -> `年次総会`

Prefer server/read-model mapping sourced from `KSP_MEETING_TYPE_DEFINITIONS`; do not duplicate a separate canonical map in client code.

Multiple values: display all labels clearly. Empty: `未設定`.

### 原本

Keep existing safe Doc link behavior in a dedicated `原本` column.
Fix the current header/renderer mismatch where header says `月次管理` but the cell contains Doc.

### 確認済み checkbox

Each drill row always renders a checkbox bound to `record.adminCheckCompleted`.

Checkbox is visible for:
- one-year default range
- one-month range
- other supported ranges

Do not gate checkbox visibility on `adminCheckAvailable` or `series.length === 1`.

On change:
1. disable checkbox / mark pending
2. call existing `updateMeetingAdminCheck`
3. send `meetingId`, `desiredCompleted`, `expectedAdminCheckCompleted`, `expectedAdminCheckUpdatedAt`
4. preserve existing optimistic concurrency
5. success updates local record state and checkbox
6. stale/error restores authoritative state via bounded reload and shows error

Autosave means no separate Save button.

### Data source

Update client lookup to use `activityAnalyticsData.drill.records`, not legacy `adminChecks` array, so the checkbox works for any selected date range.

### Legacy separate card

Remove `activity-admin-check-card` from normal UI / rendering to avoid duplicate controls.

Backend `adminChecks` / `adminCheckAvailable` response fields may remain temporarily for compatibility; do not broaden server changes unless necessary.

## Safety invariants

Admin-check mutation must remain metadata-only:
- normal Meeting Version unchanged
- normal Meeting Updated_At unchanged
- Doc unchanged
- follow-up unchanged
- AI state unchanged

Preserve existing Audit behavior and `Admin_Check_Updated_At / By`.

No schema change. No migration. No new sheet/table/property.

## Tests

Deterministic tests must cover:
- canonical Meeting Type labels
- raw code not shown as user-facing primary label
- unchecked -> checked
- checked persists after reload
- checked -> unchecked
- stale expected state fails safely
- one-year range still renders checkbox
- one-month range renders checkbox
- Doc link under `原本` header
- legacy separate admin-check card absent from normal UI
- no Version/Updated/Doc/follow-up mutation contract regression

Run:
- focused tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## Target runtime qualification

Use the same existing owner-only Web App.
Use isolated synthetic Meeting data only.

Required actual evidence:
- one synthetic row checkbox false -> true -> reload -> true -> false
- exact same Meeting row
- exactly expected admin-check Audit events
- normal Meeting Version/Updated/Doc unchanged
- 2560 / 1440 / 1280 / 390
- one-year default still shows checkbox
- Meeting Type Japanese labels visible
- console material error/warn0

Do not invoke providers. AI sync unchanged.

## Git delivery

Branch: `codex/0039-monthly-admin-review`
Create one Draft PR. Do not merge.
Report: `docs/handoffs/0039-CODEX-01-monthly-admin-review-restoration-report.md`

## Return

```text
WORK_ID: 0039
DISPATCH_ID: 0039-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```