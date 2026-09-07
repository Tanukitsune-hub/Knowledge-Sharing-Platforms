# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
ACTIVE_DISPATCH_ID: 0028-CODEX-08
BALL: CHATGPT
STATUS: REVIEW
MODE: INVESTIGATION
PHASE: A1.10 / LIGHT-ONLY FINAL POLISH / DESIGN ONLY

## Current state

CODEX-08 returned Draft PR #45 from `codex/0028-light-only-final-polish` at head `2a1843048f76b6a48cec35fcdfe2c5b116c7e3dd`.

PR #45 is the current Light visual review target and supersedes PR #44 as the latest design reference. PR #44 remains unmerged review history.

ChatGPT controller technical review: `TECHNICAL_REVIEW_PASS / USER_LIGHT_ACCEPTANCE_PENDING`.

No technical BLOCKER was found.

## Accepted CODEX-08 evidence

- base main: `960d225c388912791443cbc68efe5e5426f2a9d2`;
- Draft PR #45: open / Draft / mergeable / unmerged;
- design render: PASS / 14 of 14;
- 1366×768 horizontal overflow: 0 / 14;
- sidebar destinations: exactly 7;
- active destination: exactly 1 / page;
- text group headings: 0;
- standalone `面談と資料の関連`: removed;
- `過去の記録 / 面談`: `関連資料 n件` + resolved / Inactive / unresolved detail;
- `過去の記録 / 資料`: `関連面談 n件` + explicit Document ID reverse lookup;
- relationship truth remains `Meeting_Index.Related_Pitchbook_IDs`; GP-name inference is not used;
- Past Records relation mutation: none; relation changes remain in existing Meeting registration/edit flow;
- system/tool separator: exactly 1 between `面談実績の集計` and `プルダウンの管理`;
- gold polish: brand / thin-line icons / separator / small accents use restrained champagne–antique metallic treatment;
- sidebar base `#182124`;
- ordinary `#E1001F` usage: 0; active left strip only;
- Product Design QA: P0/P1/P2 = 0;
- browser console warning/error: 0 in static harness;
- deterministic validator: PASS;
- `npm run check`: PASS / 456 tests;
- `git diff --check`: PASS;
- production `src/**` / `dist/**` changes: NONE;
- runtime / deploy / Dark / System: NONE.

Static evidence does not qualify keyboard navigation, focus order, measured contrast, screen-reader behavior, Apps Script runtime, server mapping or admin-check persistence.

## Closed Light-only direction

- production starts at `ナレッジ検索`;
- `Sidebar reference` / former `Light navigation` is review-only, not a product page;
- persistent left sidebar / desktop-first wide workspace;
- final sidebar destinations:
  1. ナレッジ検索
  2. 記録を追加
  3. 過去の記録
  4. 面談先サマリー
  5. 面談実績の集計
  6. プルダウンの管理
  7. 管理者ページ
- no sidebar text group headings;
- tool/system separator remains presentation-only;
- Light only; Dark/System/theme selector/persistence are canceled;
- Work 0027 Gemini qualified-disabled / normal-user hidden remains closed;
- Work 0029 shared-admin behavior remains closed;
- Meeting/Pitchbook datasets, handlers, validation, lifecycle and GP/non-GP read facades remain separate.

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

## Next gate

USER VISUAL REVIEW of Draft PR #45.

If user accepts PR #45 Light family:
1. record Light acceptance in GitHub;
2. apply Completion Latch to the Work 0028 design phase;
3. do not start production automatically;
4. production BUILD requires explicit user authorization and a Strategy Reset.

If user requests another Light correction, use fresh Dispatch ID `0028-CODEX-09`; do not reuse CODEX-08.

```text
THEME_SCOPE: LIGHT_ONLY
DRAFT_PR_45: OPEN / DRAFT / CURRENT LIGHT VISUAL REVIEW TARGET
CONTROLLER_TECHNICAL_REVIEW: PASS
USER_LIGHT_ACCEPTANCE: PENDING
PRODUCTION_START_SURFACE: ナレッジ検索
FINAL_SIDEBAR_DESTINATIONS: 7
RELATIONSHIP_STANDALONE_DESTINATION: REMOVED
PAST_RECORD_RELATIONSHIP_INTEGRATION: PASS
SYSTEM_TOOL_SEPARATOR: PASS
GOLD_METALLIC_POLISH: PASS
SOURCE_CONTRACT_PARITY: PASS
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
NEXT_UNUSED_DISPATCH: 0028-CODEX-09
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-08
BALL: CHATGPT
STATUS: REVIEW
