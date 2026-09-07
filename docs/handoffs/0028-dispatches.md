# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
ACTIVE_DISPATCH_ID: 0028-CODEX-08
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
PHASE: A1.10 / LIGHT-ONLY FINAL POLISH / DESIGN ONLY

## Strategy Reset — 2026-09-07

User explicitly changed Work 0028 from `Light / Dark / System` to `Light only`.

Primary Outcome is now: finish one high-quality Light UI/UX family without backend redesign, obtain user visual acceptance, then stop the design phase.

Accepted evidence and backend/source-contract boundaries from CODEX-07 remain closed. Dark/System design, theme selector, `prefers-color-scheme`, browser-local theme persistence and Dark chart palette are no longer required.

Production BUILD remains unauthorized until Light is accepted and the user explicitly authorizes BUILD.

## Current dispatch

CODEX-08 is prepared for the bounded Light-only final polish.

Instruction:
`docs/handoffs/0028-CODEX-08-light-only-final-polish-instruction.md`

Prepared branch:
`codex/0028-light-only-final-polish`

PR #44 remains unmerged review history / pre-CODEX-08 Light baseline. CODEX-08 should create a fresh Draft PR from current main rather than extend/rebase PR #44.

## Accepted technical evidence from CODEX-07

- 15 visual pages rendered with 1366×768 horizontal overflow 0/15;
- active sidebar destination exactly 1 per page;
- sidebar base `#182124`; ordinary UI `#E1001F` usage 0; active red left strip only;
- Product Design QA PASS / no actionable P0/P1/P2;
- browser console warning/error 0 in static harness;
- `git diff --check` PASS;
- changed-path review confirmed no production `src/**` or `dist/**` modifications.

Static design evidence still does not qualify keyboard navigation, focus order, measured contrast, screen reader behavior, Apps Script runtime, provider/server mapping or actual admin-check save persistence.

## Closed user corrections for CODEX-08

Authoritative detail: `docs/handoffs/0028-light-final-correction-decisions.md`.

### 1. Start surface

- `Light navigation` is design reference only, not a production page.
- production app starts at `ナレッジ検索`.

### 2. Relationship Explorer integration

- remove standalone `面談と資料の関連` sidebar destination;
- preserve its purpose and explicit relationship semantics;
- integrate `資料 → 関連面談` into `過去の記録 / 資料`;
- integrate `面談 → 関連資料` into `過去の記録 / 面談`;
- relationship truth remains `Meeting_Index.Related_Pitchbook_IDs` explicit Document IDs;
- GP may be a filter/presentation axis but must not become an inferred relationship rule;
- no new database / sheet / relation model / mutation workflow.

### 3. Final sidebar information architecture

Normal task destinations:

1. ナレッジ検索
2. 記録を追加
3. 過去の記録
4. 面談先サマリー
5. 面談実績の集計

System/tool destinations:

6. プルダウンの管理
7. 管理者ページ

No text group headings.

Between `面談実績の集計` and `プルダウンの管理`, add approximately one row of breathing space plus a decorative gold separator with pointed ends and a subtle center swell.

### 4. Gold polish

- deepen the current pale flat gold toward restrained champagne / antique metallic gold;
- prioritize the brand, sidebar icons, decorative separator and existing small gold accents;
- allow subtle highlight/shade/gradient;
- no strong glow, animation, mirror-like shine or loud 3D treatment;
- preserve thin-line icon family and text readability.

### 5. Theme scope

- Light only;
- Dark family: canceled;
- System theme: canceled;
- no theme selector / theme persistence / `prefers-color-scheme` requirement in Work 0028.

## Preserved selected Light direction

Closed unless user explicitly changes it:

- persistent left sidebar / desktop-first wide workspace;
- sidebar `#182124`;
- cool light slate page / white cards / cool borders;
- local refined thin-line SVG icon family;
- clean dense gold sayagata lower-left fading upper-right;
- active sidebar item left strip only `#E1001F` plus non-red active cue;
- no other ordinary UI use of `#E1001F`;
- Knowledge Search one visible model/profile selector and no normal-user Thinking;
- current Gemini qualified-disabled / normal-user hidden baseline;
- compact Meeting / Pitchbook / counterparty-summary layouts;
- Work 0027 and Work 0029 accepted behavior.

## Dispatch history

| Dispatch ID | Disposition |
|---|---|
| N/A | Route A planning/reconciliation. |
| 0028-CODEX-01 | Historical tombstone from superseded shared-admin line; never reuse. |
| 0028-CODEX-02 | Historical tombstone from superseded shared-admin PR #38; never reuse. |
| 0028-CODEX-03 | Product Design A/B/C Light comparison; RETURNED PARTIAL on Draft PR #40. |
| 0028-CODEX-04 | Selected Light cross-page family; RETURNED on Draft PR #41; technical review PASS. |
| 0028-CODEX-05 | Bounded Light visual refinement; RETURNED on Draft PR #42. |
| 0028-CODEX-06 | Navigation/Workspace consolidation; RETURNED on Draft PR #43; technical review PASS; further user corrections requested. |
| 0028-CODEX-07 | Final Light correction + screenshot review; RETURNED on Draft PR #44; controller technical review PASS; further user Light corrections requested. |
| 0028-CODEX-08 | Light-only final polish; READY for Codex on prepared branch. |

## Next gate

Codex executes `0028-CODEX-08` from the GitHub instruction and returns a new design-only Draft PR plus screenshot/validation/report evidence.

Do not implement production source, deploy, or create Dark/System variants.

If the resulting Light family is visually accepted, apply Completion Latch to the Light design phase. Production BUILD can begin only after a separate Strategy Reset and explicit user authorization.

## Evidence state

```text
USER_DIRECTION_SELECTED: YES
THEME_SCOPE: LIGHT_ONLY
DARK_FAMILY_REQUIRED: NO
SYSTEM_THEME_REQUIRED: NO
CODEX_07_RETURNED: YES
CODEX_08_PREPARED: YES
DRAFT_PR_44: OPEN / DESIGN ONLY / UNMERGED / REVIEW HISTORY BASELINE
CONTROLLER_TECHNICAL_REVIEW: PASS
USER_LIGHT_ACCEPTANCE: PENDING
LIGHT_NAVIGATION_PRODUCTION_PAGE: NO
PRODUCTION_START_SURFACE: ナレッジ検索
RELATIONSHIP_STANDALONE_DESTINATION: REMOVE_IN_CODEX_08
RELATIONSHIP_TARGET_SURFACE: 過去の記録 / 面談・資料
FINAL_SIDEBAR_DESTINATIONS: 7
SIDEBAR_GROUP_HEADINGS: NONE
SYSTEM_TOOL_SEPARATOR: REQUIRED_IN_CODEX_08
GOLD_METALLIC_POLISH: REQUIRED_IN_CODEX_08
COUNTERPARTY_SUMMARY_LABEL: 面談先サマリー
MERGED_ANALYTICS_LABEL: 面談実績の集計
MASTER_PAGE_LABEL: プルダウンの管理
ADMIN_PAGE_LABEL: 管理者ページ
ACTIVITY_ANALYTICS_MERGED_STRUCTURE: PASS
MONTHLY_MEETING_LIST_INTEGRATED: PASS
ROW_ADMIN_CHECKBOX_DESIGN: PASS / EXISTING CONTRACT MAPPING
CHART_TABLE_SIDE_BY_SIDE: PASS
SOURCE_CONTRACT_PARITY: PRESERVE
SIDEBAR_BASE_COLOR: #182124
ACTIVE_MENU_ACCENT: #E1001F / THIN LEFT STRIP ONLY
OTHER_E1001F_USAGE: NONE
ACTIVE_DISPATCH: 0028-CODEX-08
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
ACTIVE_DISPATCH_ID: 0028-CODEX-08
BALL: CODEX
STATUS: READY
