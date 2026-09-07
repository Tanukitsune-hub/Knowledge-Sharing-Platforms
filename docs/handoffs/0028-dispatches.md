# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
ACTIVE_DISPATCH_ID: 0028-CODEX-08
BALL: CHATGPT
STATUS: REVIEW
MODE: INVESTIGATION
PHASE: A1.11 / LIGHT-ONLY ANALYTICS TABLE CORRECTION / DESIGN ONLY

## Current state

CODEX-08 returned Draft PR #45 from `codex/0028-light-only-final-polish` at head `2a1843048f76b6a48cec35fcdfe2c5b116c7e3dd`.

PR #45 remains the current Light visual baseline. ChatGPT controller technical review for CODEX-08 is `TECHNICAL_REVIEW_PASS`, but user visual acceptance is not complete because a new bounded correction was requested for the individual Meeting list in `面談実績の集計`.

No technical BLOCKER is open.

## Accepted CODEX-08 evidence preserved

- 14/14 design pages render;
- 1366×768 horizontal overflow 0/14;
- 7 sidebar destinations / active exactly 1;
- standalone Relationship Explorer removed and Past Records relationship views integrated;
- system/tool separator and restrained metallic gold polish accepted as current baseline;
- Product Design QA P0/P1/P2 = 0;
- browser console warning/error 0;
- `npm run check` PASS / 456;
- production `src/**` / `dist/**` changes NONE;
- runtime / deploy / Dark / System NONE.

## New closed user correction

Authoritative decision:
`docs/handoffs/0028-CODEX-09-analytics-meeting-type-columns-decisions.md`

In the lower individual Meeting table of `面談実績の集計`, add three narrow columns immediately before the rightmost `確認済み` column:

1. `年1回面談`
2. `オフィス訪問`
3. `年次総会`

Each row shows `○` when the corresponding existing `meetingTypeCodes` value is present and `—` otherwise.

Existing code mapping:

- `ANNUAL_REVIEW` → 年1回面談
- `OFFICE_VISIT` → オフィス訪問
- `ANNUAL_GENERAL_MEETING` → 年次総会

Meeting Type is multi-select, so multiple `○` in one row are valid.

To avoid duplicate information and unnecessary width, change the existing `Team / 面談種別` column to `Team`. Keep `確認済み` as the rightmost column and preserve the existing `adminCheckCompleted` / `updateMeetingAdminCheck` mapping.

This is presentation-only for the current design phase. No new backend / dataset / sheet / endpoint / mutation is authorized.

## Preserved Light-only direction

- production start surface: `ナレッジ検索`;
- sidebar destinations exactly 7;
- Light only; Dark/System/theme selector/persistence canceled;
- sidebar `#182124`, active `#E1001F` left strip only;
- Past Records relationship integration preserved;
- Work 0027 and Work 0029 accepted contracts remain closed;
- production implementation and deployment remain unauthorized.

## Dispatch history

| Dispatch ID | Disposition |
|---|---|
| 0028-CODEX-01 | Historical tombstone; never reuse. |
| 0028-CODEX-02 | Historical tombstone; never reuse. |
| 0028-CODEX-03 | A/B/C Light exploration; RETURNED PARTIAL on PR #40. |
| 0028-CODEX-04 | Selected Light family; RETURNED on PR #41. |
| 0028-CODEX-05 | Light refinement; RETURNED on PR #42. |
| 0028-CODEX-06 | Navigation/Workspace consolidation; RETURNED on PR #43. |
| 0028-CODEX-07 | Final Light correction; RETURNED on PR #44. |
| 0028-CODEX-08 | Light-only final polish; RETURNED on PR #45; controller technical review PASS; further user correction requested. |

## Next gate

If the user asks to execute this correction, allocate fresh Dispatch ID `0028-CODEX-09`; do not reuse CODEX-08.

CODEX-09 must remain design-only and should update the current Light review target with the bounded analytics-table correction plus screenshot/validation evidence.

```text
THEME_SCOPE: LIGHT_ONLY
DRAFT_PR_45: CURRENT LIGHT BASELINE
CONTROLLER_TECHNICAL_REVIEW_CODEX_08: PASS
USER_LIGHT_ACCEPTANCE: PENDING
ANALYTICS_MEETING_TYPE_COLUMNS: REQUIRED_NEXT_CORRECTION
MEETING_TYPE_SOURCE: existing meetingTypeCodes
MEETING_TYPE_DISPLAY: ○ / —
CONFIRMATION_COLUMN: RIGHTMOST / PRESERVE
NEXT_UNUSED_DISPATCH: 0028-CODEX-09
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
BALL: CHATGPT
STATUS: REVIEW
