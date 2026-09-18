# CODEX-02 — UI convergence across shared shell / Past Meetings / Counterparty Summary

WORK_ID: 0034
DISPATCH_ID: 0034-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD

## Context

CODEX-01 completed the first production implementation and actual owner-only version9 qualification.

Accepted CODEX-01 baseline:
- Draft PR #56 remains open/unmerged
- branch: `codex/0034-production-layout-sidebar-refresh`
- returned head: `d0eff1dc5bb684c1bd50cfe5c1a5e149e2deca49`
- Meeting-create candidate production layout PASS
- sidebar gold / 3D icon / ornament refresh PASS
- version9 actual runtime 2560/1440/1280/390 PASS
- synthetic Meeting registration/readback PASS
- `npm run check` 550/550
- bundle 30/30
- provider/confidential/delete/permission broadening 0

User reviewed version9 and requested one additional convergence pass. This is a new instruction after RETURNED, so use Dispatch `0034-CODEX-02`.

## Primary Outcome

Keep the accepted Meeting-create topology and sidebar visual direction, then converge the shared shell and two adjacent user surfaces:

1. remove sidebar horizontal scrollbar/overflow,
2. refine Meeting-create small UX details,
3. apply 2000px page width contract to all tabs,
4. simplify Past Meetings into a clean baseline,
5. simplify Counterparty Summary selection/stats.

Actual owner-only Web App qualification is required on the same target/deployment.

## A. Shared left sidebar — remove horizontal scrollbar

Observed user issue: sidebar content/ornament causes a horizontal scrollbar because the usable width is insufficient.

Required outcome:
- no horizontal scrollbar in left sidebar at Wide 2560 / Laptop 1440 / Compact 1280
- all nav labels and icons remain fully visible
- gold / 3D / ornament visual treatment from CODEX-01 remains
- ornament remains prominent and readable
- vertical scrolling may remain only when viewport height genuinely requires it

Diagnose the actual overflow source instead of merely hiding useful nav content.

Likely relevant current geometry includes fixed sidebar width and an ornament wider/offset beyond it. It is acceptable to:
- modestly widen the sidebar and update `.app-shell` left offset consistently,
- resize/reposition the ornament,
- set safe `overflow-x` behavior,
- prevent nav buttons/text from creating horizontal overflow.

Acceptance:
`horizontal scrollbar: 0` and no clipped nav label/icon at 2560/1440/1280.

## B. Shared page width — 2000px across all tabs

Meeting-create already uses `width:100%; max-width:2000px; left aligned`.

Apply the same desktop page-width contract to all normal navigation tabs/surfaces.

Preferred shared contract:
```text
page width: 100%
max-width: 2000px
left aligned
```

Do not force individual internal components/tables to 2000px when they have their own natural width. The page/container may use the available width; tables may keep local horizontal scroll wrappers if their own columns require it.

At <=720px retain existing mobile behavior.

Actual normal navigation pages should not remain artificially capped near the old narrow desktop width.

## C. Meeting-create refinements

Preserve the accepted CODEX-01 canonical 12-column topology.

### C1. Quick-add Counterparty button

`未登録の面談先を追加`:
- desktop visual width approximately 50% of its current/parent available width
- clearly smaller than the Counterparty select
- add a visible color treatment
- use a restrained gold accent consistent with the refreshed sidebar (soft gold fill / gold border / dark readable text is preferred)
- clear hover/focus state
- mobile may use fit-content or responsive safe width if 50% would make the label unusable

Do not change quick-add behavior.

### C2. Date / Time visual gap

User sees excess empty space between Date and Time.

Preserve:
- Date start1 span2
- Time start3 span1
- canonical 14px grid gap

Remove the extra perceived gap caused by internal control max-width/alignment. Date and Time controls should fill/use their assigned grid cells so the visual separation is close to the intended grid gap, not a large blank zone.

Do not alter Date/Time semantics/readback.

## D. Past Meetings — clean baseline

User wants this tab simplified before further fine design work.

### D1. Hide/remove visible filters

Remove from visible UI:
- `Equity / Debt`
- `要フォローのみ` checkbox

Underlying legacy/backend search compatibility may remain. Normal search payload must safely default:
- capitalType = empty
- followUpOnly = false

No missing-DOM runtime error.

### D2. Meeting Type -> checkbox group

Replace the Meeting Type dropdown with the same three visible type choices as checkbox controls:
- 定例年1回 (`ANNUAL_REVIEW`)
- 先方オフィス訪問 (`OFFICE_VISIT`)
- 年次総会 (`ANNUAL_GENERAL_MEETING`)

Semantics:
- none checked = no Meeting Type filter
- one checked = preserve current single-code behavior
- multiple checked = OR semantics (record matches if its Meeting_Type_Codes contains any checked code)

Preserve backward compatibility for existing single `meetingTypeCode` search callers while adding a `meetingTypeCodes` array/list contract for the new UI.

Do not change stored Meeting_Type_Codes or schema.

### D3. Clean desktop layout baseline

Use a simple 12-column desktop filter layout as the new clean baseline:

```text
Row 1:
Date From      span 2
Date To        span 2
面談先         span 4
Asset Class    span 2
Team           span 2

Row 2:
Fund / Strategy   span 6
Meeting Type checkbox group span 6

Row 3:
Status         span 2
remaining space intentionally blank
```

Search action/hint remains in a clean action row below.

At mobile <=720px use one column.

Goal is not final artistic tuning yet; it is a clean, readable baseline for the next Layout Lab iteration.

## E. Counterparty Summary — simplify selector and stats

### E1. Remove Counterparty Type from user-facing summary page

Remove the visible `面談先種別` selector from Counterparty Summary.

Counterparty selection should show all counterparties in one `面談先` selector.

Also remove Counterparty Type label from the normal visible identity line/header on this page. Backend `Counterparty_Type` metadata remains intact.

If print/PDF header currently exposes the type solely as a presentation label, remove it there too for consistent user-facing presentation; keep Counterparty ID / status as needed.

No backend schema or entity classification changes.

### E2. Active-only summary counts

Replace mixed total/active display such as:
`Meetings 4 / Active 4`

with active-only Japanese count display:
`Meetings 4件`

Use `activeMeetingCount`, not total meetingCount.

For consistency, if Pitchbooks is shown in the same summary card pattern, use `pitchbookActiveCount` and display `N件` rather than `total / Active`.

Other independent summary values (open follow-ups, relationships, latest date) may remain, preferably with `件` suffix for counts.

Do not remove underlying total counts from the service response; this is presentation behavior.

## F. Preserve accepted behavior

Do not regress:
- Meeting-create accepted topology
- Meeting registration/readback
- Business Date/Time
- Counterparty_Master behavior
- attachment relation behavior
- owner-only deployment security
- sidebar gold/3D/ornament direction
- Work0031 schema8 contracts
- Work0030 deferred state

## Required tests

Add/adjust focused tests for at least:
- sidebar no horizontal overflow contract / geometry classes
- all normal pages max-width 2000 contract
- quick-add styling/width
- Meeting Date/Time no artificial max-width gap
- Past Meetings hidden Capital Type / Follow-up visible UI
- Past Meetings checkbox group markup
- Meeting Type multi-code OR search normalization/validation/matching
- legacy single meetingTypeCode compatibility
- Past Meetings clean 12-column layout
- Counterparty Summary no visible type selector
- Counterparty identity presentation without type label
- active-only Meetings/Pitchbooks summary formatting

Run:
- focused tests
- `npm run check`
- `npm run check:bundle`
- canonical bundle regeneration
- `git diff --check`

## Target runtime qualification

Use same existing target / same single owner-only deployment.

Required actual browser checks:

### Sidebar
- Wide/Laptop/Compact: no horizontal scrollbar
- nav labels/icons not clipped
- gold/3D/ornament still visibly present

### All pages
- normal navigation pages use available desktop width up to max 2000px
- no page-level unintended horizontal overflow

### Meeting-create
- quick-add button smaller (~half visual width) + colored
- Date/Time visually adjacent with intended ~grid gap
- canonical topology unchanged

### Past Meetings
- Equity / Debt hidden
- Follow-up checkbox hidden
- Meeting Type is 3-checkbox group
- no selection works
- single selection works
- multiple selections OR works
- layout clean at 2560/1440/1280 and mobile one-column

### Counterparty Summary
- no visible Counterparty Type selector
- Counterparty selector includes all types
- visible identity does not show type label
- Meetings summary shows active count only as `N件`
- Pitchbooks uses active-only count if shown

### Runtime health
- existing synthetic Meeting search/readback remains usable
- console material error/warn 0
- page non-blank / navigation PASS

## Mutation / safety boundary

Same as CODEX-01:
```text
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
WORK_0030: DEFERRED_BY_USER
```

Maximum additional coherent repair/runtime cycles: 3.
Use source sync / immutable version / same deployment update only as needed per coherent cycle.

## Git / delivery

Continue existing:
- Draft PR #56
- branch `codex/0034-production-layout-sidebar-refresh`

Do not create a second PR.
Do not merge.

Report:
`docs/handoffs/0034-CODEX-02-ui-convergence-report.md`

Update `docs/handoffs/0034-dispatches.md` and PR body with CODEX-02 identity.

## Return contract

When all deterministic + actual runtime evidence is complete:
```text
WORK_ID: 0034
DISPATCH_ID: 0034-CODEX-02
BALL: CHATGPT
STATUS: RETURNED
```

If a truly user-only visual decision remains, return:
```text
WORK_ID: 0034
DISPATCH_ID: 0034-CODEX-02
BALL: USER
STATUS: ACTION_REQUIRED
```

Ordinary CSS/HTML/search-test failures should be repaired autonomously within budget.