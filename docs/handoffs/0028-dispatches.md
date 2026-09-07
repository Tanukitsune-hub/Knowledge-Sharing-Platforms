# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-09
ACTIVE_DISPATCH_ID: 0028-CODEX-09
BALL: CHATGPT
STATUS: REVIEW
MODE: INVESTIGATION
PHASE: A1.12 / LIGHT-ONLY FINAL USER CORRECTIONS / DESIGN ONLY

## Current state

CODEX-09 returned Draft PR #46 from `codex/0028-final-light-user-corrections`.

- PR: https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/46
- PR head: `400f2f0e77acf81deb32e363d79a3962dfd2f017`
- design artifact: `933111ce96cd170210f80ca7bada862cbdfe310c`
- report: `docs/handoffs/0028-CODEX-09-final-light-user-corrections-report.md`

PR #45 remains the prior visual baseline / review history. PR #46 is the current Light visual review target.

ChatGPT controller technical review: `TECHNICAL_REVIEW_PASS / USER_LIGHT_ACCEPTANCE_PENDING`.

No technical BLOCKER was found.

## Accepted CODEX-09 technical evidence

- Draft PR #46: open / draft / mergeable / unmerged;
- changed paths: design/docs/report/control files only; production `src/**` / `dist/**` changes NONE;
- 15/15 design pages rendered at 1366×768;
- horizontal overflow 0 / 15;
- sidebar destinations exactly 7; active exactly 1 per page;
- browser console warning/error 0;
- Product Design QA actionable P0/P1/P2 = 0;
- `npm run check`: PASS / 456 of 456;
- design assertions / JS syntax / diff hygiene: PASS;
- GitHub CI status checks: none reported; local validation only;
- runtime / deploy / Dark / System / provider / data / auth changes: NONE.

Static design evidence does not qualify Apps Script runtime, persistence, server-side preset resolution, authentication behavior, measured contrast, screen-reader behavior, complete keyboard paths or mobile behavior.

## Closed user corrections implemented in CODEX-09 design

### 1. Knowledge Search

Primary layout:

1. Row 1: `GP / 情報ソース / 開始日 / 終了日 / 全期間`
2. Row 2: `検索モード / AIモデル`
3. Row 3: wide / larger `質問`

Default period: rolling 3 years / `全期間` OFF.

Information source options:

- `面談記録・資料` → Meeting + Pitchbook
- `面談記録のみ` → Meeting
- `資料のみ` → Pitchbook

`全文出力（AIを使わない）` is Meeting-only and excludes Pitchbook body/reference links.

Free Question remains editable. Non-free modes display fixed prompts in gray read-only textarea and preserve the free-question draft when switching back.

### 2. Search mode admin design

`管理者ページ` includes a `検索モード設定` design with:

- display name;
- fixed prompt / instruction;
- enabled state;
- sort order;
- generic preset addition;
- protected `自由質問` baseline;
- preserved special semantics for `比較` and `面談準備`.

Persistence and authoritative server-side fixed-prompt resolution remain future BUILD requirements; CODEX-09 does not implement them.

### 3. 面談実績の集計

Lower Meeting table columns:

`日付 / 面談先 / Asset Class / Team / 原資料 / 年1回面談 / オフィス訪問 / 年次総会 / 確認済み`

Meeting Type display uses existing `meetingTypeCodes` with `○ / —`, including multiple applicable types per row. `確認済み` remains rightmost with existing admin-check mapping. `Fund / Strategy` is removed from this specific monthly admin-review table only.

### 4. Gold icon polish

Sidebar icon geometry remains local Lucide/Feather-family SVG with existing ISC/MIT license. CODEX-09 uses local masks at 22px with bright highlight / rich gold / antique shadow and subtle drop shadow. No new external runtime dependency or CDN.

## Preserved boundaries

- Work 0027 Gemini qualified-disabled / normal-user hidden;
- Work 0029 shared-admin security behavior;
- Light only; Dark/System/theme selector canceled;
- sidebar `#182124`;
- active `#E1001F` thin left strip only; ordinary UI red none;
- Past Records explicit Meeting↔Pitchbook relation semantics remain unchanged by CODEX-09;
- production implementation and deployment remain unauthorized.

## Pending user design thought after CODEX-09 started

The user is considering simplifying Past Records relationship presentation to keep `面談 → 関連資料` while removing the reverse `資料 → 関連面談` view because the latter may not be used in practice.

This was not part of CODEX-09 and is not yet a closed requirement. Do not implement it until the user explicitly confirms the final direction.

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
| 0028-CODEX-08 | Light-only final polish; RETURNED on PR #45; controller technical review PASS. |
| 0028-CODEX-09 | Final accumulated Light user corrections; RETURNED on PR #46; controller technical review PASS. |

## Next gate

User visual review of Draft PR #46.

If the user accepts the Light family and confirms no additional visual correction, record Light acceptance and apply Completion Latch to the Work 0028 design phase.

If the user explicitly confirms removal of `資料 → 関連面談` or requests another visual correction, allocate fresh Dispatch ID `0028-CODEX-10`; do not reuse CODEX-09.

Production BUILD still requires a separate Strategy Reset and explicit user authorization. Deployment remains separately scoped.

```text
THEME_SCOPE: LIGHT_ONLY
DRAFT_PR_46: OPEN / DRAFT / CURRENT LIGHT VISUAL REVIEW TARGET
CONTROLLER_TECHNICAL_REVIEW_CODEX_09: PASS
USER_LIGHT_ACCEPTANCE: PENDING
PAST_RECORD_REVERSE_RELATION_REMOVAL: USER_CONSIDERING / NOT_CLOSED
ACTIVE_DISPATCH: 0028-CODEX-09 / RETURNED
NEXT_UNUSED_DISPATCH: 0028-CODEX-10
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-09
BALL: CHATGPT
STATUS: REVIEW
