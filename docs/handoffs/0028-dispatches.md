# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-06
ACTIVE_DISPATCH_ID: 0028-CODEX-06
BALL: CHATGPT
STATUS: REVIEW
MODE: INVESTIGATION
PHASE: A1.8 / LIGHT NAVIGATION + WORKSPACE CONSOLIDATION / DESIGN ONLY

## Current ball and review state

CODEX-06 returned on Draft PR #43 after consolidating the selected Light navigation and Workspace while preserving PR #42 visual/style decisions. ChatGPT controller technical review passed. The user has now requested a further bounded Light correction, so final Light acceptance is not yet granted.

Controller judgment: `TECHNICAL_REVIEW_PASS / USER_LIGHT_ACCEPTANCE_CORRECTIONS_REQUESTED`.

Draft PR #43:

- branch: `codex/0028-light-navigation-consolidation`
- head: `cd43591b65b22e52aea10dd52107850fff4aed7f`
- base source recorded by CODEX-06: `c5aa1c189c1e915a44f676ac1a8358a5f189e4bb`
- design-only / Draft / unmerged
- production `src/**`, `dist/**`, runtime, deployment, provider/credential/backend/data contract: unchanged

## Accepted technical evidence for this review gate

- 16 visual pages render; 1366×768 horizontal overflow 0/16;
- active sidebar destination exactly 1 per page;
- sidebar base `#182124`;
- ordinary UI `#E1001F` usage 0; active left strip exactly 1 per page;
- PR #42 visual system preserved: cool slate Light surface, white cards, restrained gold, local thin-line SVG icons, dense 92px sayagata;
- `記録を追加` is one top-level destination with `面談 / 資料` internal tabs, while Meeting/Pitchbook contracts remain separate;
- `過去の記録` is one top-level destination with separate `面談 / 資料` maintenance surfaces and separate semantics;
- Meeting Type checkboxes remain the existing three values and are visible;
- quick-add counterparty is inline on desktop;
- `Workspace` is one top-level destination; GP and non-GP views preserve their current specialized content while future implementation may route to the existing GP or Entity read facade rather than merging server contracts;
- Product Design QA found one duplicate Workspace target-control P2, corrected it in the single allowed correction pass, and reported no remaining actionable P0/P1/P2;
- browser console warning/error 0 in the static design harness;
- `git diff --check` PASS;
- static design evidence does not claim keyboard/focus/contrast/screen-reader/Apps Script runtime/provider/server-mapping PASS.

## Preserved selected Light direction

The following remains closed unless the user explicitly changes it:

- persistent left sidebar / desktop-first wide workspace;
- sidebar `#182124`;
- cool light slate page / white cards / cool borders;
- restrained gold accents;
- local refined thin-line SVG icon family;
- clean dense gold sayagata lower-left fading upper-right;
- active sidebar item left strip only `#E1001F` plus non-red active cue;
- no other `#E1001F` ordinary UI use;
- Knowledge Search one visible model/profile selector and no normal-user Thinking;
- current Gemini qualified-disabled / normal-user hidden baseline;
- compact Meeting/Pitchbook/Workspace layouts;
- future Dark charts `CHART_SURFACE_THEME: LIGHT_FIXED`;
- Work 0027 and Work 0029 accepted behavior.

## User-requested Light corrections after PR #43

These decisions are now closed at the navigation-label level and must be included in the next fresh Light correction dispatch after the merged analytics page structure is confirmed:

1. Remove sidebar group headings `探す / 記録する / 振り返る / 設定する`. Show a flat destination list only. Keep icons, spacing, active treatment, colors and sayagata.
2. Merge standalone `面談履歴` capability into the analytics destination. The merged user-facing destination/page name is `面談実績の集計`.
3. Rename `マスター管理` to `プルダウンの管理`. Internal master IDs/contracts/operations remain unchanged.
4. Rename `AIプロバイダ設定` to `管理者ページ`. Existing shared-admin password/session/logout/provider/model-policy behavior remains unchanged.
5. Do not issue CODEX-07 until ChatGPT/user confirm the full information architecture of the merged `面談実績の集計` page. This avoids duplicated date/month controls and vertical bloat.

## `面談実績の集計` source surfaces to reconcile

Current PR #43 standalone `面談履歴` contains:

- YYYY-MM month selector;
- Display action;
- individual Meeting list for that selected month;
- columns for date/Meeting ID, counterparty, Asset Class, Team/Meeting Type, Fund/Strategy and source action;
- design mapping to existing Meeting date-range search or Activity Analytics monthly+drill; no new backend.

Current PR #43 `面談活動の集計` contains:

- period unit;
- breakdown dimension;
- start/end dates;
- optional filters for counterparty type/entity, related GP, Asset Class, Team, Meeting Type and status;
- headline summary;
- period trend chart + table;
- selected-dimension breakdown table;
- matching Meeting drill table.

The next design must keep the useful capabilities of both without duplicating controls or adding a new dataset/backend endpoint.

## Dispatch history

| Dispatch ID | Disposition |
|---|---|
| N/A | Route A planning/reconciliation. |
| 0028-CODEX-01 | Historical tombstone from superseded shared-admin line; never reuse. |
| 0028-CODEX-02 | Historical tombstone from superseded shared-admin PR #38; never reuse. |
| 0028-CODEX-03 | Product Design A/B/C Light comparison; RETURNED PARTIAL on Draft PR #40. |
| 0028-CODEX-04 | Selected Light cross-page family; RETURNED on Draft PR #41; technical review PASS. |
| 0028-CODEX-05 | Bounded Light visual refinement; RETURNED on Draft PR #42; visual/style baseline. |
| 0028-CODEX-06 | Light navigation/Workspace consolidation; RETURNED on Draft PR #43; controller technical review PASS; further user Light corrections requested. |

## Next gate

ChatGPT and the user first confirm the full-page information architecture for `面談実績の集計`. After that, allocate fresh `0028-CODEX-07` for the bounded final Light correction. Do not append new work to returned CODEX-06.

If the corrected Light family is accepted after CODEX-07, Light design closes and the next fresh dispatch may create only the selected Dark family.

Production implementation remains unauthorized until selected Light and Dark are both approved and the user explicitly authorizes BUILD. Deployment remains separately scoped.

## Evidence state

```text
USER_DIRECTION_SELECTED: YES
SELECTED_LIGHT_VISUAL_LANGUAGE: FIXED
CODEX_06_RETURNED: YES
DRAFT_PR_43: OPEN / DESIGN ONLY / UNMERGED
CONTROLLER_TECHNICAL_REVIEW: PASS
USER_LIGHT_ACCEPTANCE: CORRECTIONS_REQUESTED
SIDEBAR_GROUP_HEADINGS: REMOVE
MEETING_HISTORY_STANDALONE_DESTINATION: REMOVE / MERGE INTO ANALYTICS
MERGED_ANALYTICS_LABEL: 面談実績の集計
MASTER_PAGE_LABEL: プルダウンの管理
ADMIN_PAGE_LABEL: 管理者ページ
MERGED_ANALYTICS_PAGE_STRUCTURE: PENDING USER/CHATGPT CONFIRMATION
NEXT_FRESH_DISPATCH: 0028-CODEX-07 AFTER STRUCTURE CONFIRMATION
REGISTER_NAV_CONSOLIDATION: PASS
PAST_RECORD_NAV_CONSOLIDATION: PASS
MEETING_TYPE_CHECKBOXES: PASS / EXISTING VALUES PRESERVED
COUNTERPARTY_QUICK_ADD_INLINE: PASS
WORKSPACE_CONSOLIDATION: PASS
GP_CONTEXT_PRESERVED: PASS
NON_GP_CONTEXT_PRESERVED: PASS
GP_AND_ENTITY_READ_CONTRACTS: PRESERVE / DO NOT MERGE BACKEND
SIDEBAR_BASE_COLOR: #182124
ACTIVE_MENU_ACCENT: #E1001F / THIN LEFT STRIP ONLY
OTHER_E1001F_USAGE: NONE
SELECTED_DARK_MOCK: NOT_STARTED
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-06
ACTIVE_DISPATCH_ID: 0028-CODEX-06
BALL: CHATGPT
STATUS: REVIEW
