# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-09
ACTIVE_DISPATCH_ID: 0028-CODEX-09
BALL: CHATGPT
STATUS: RETURNED
MODE: INVESTIGATION
PHASE: A1.12 / LIGHT-ONLY FINAL USER CORRECTIONS / DESIGN ONLY

## Current state

CODEX-08 returned Draft PR #45 at head `2a1843048f76b6a48cec35fcdfe2c5b116c7e3dd`; controller technical review PASS. User visual acceptance remains pending because bounded final Light corrections were requested.

CODEX-09はLight最終修正とreview packageを完成し、以下のbranchから新規Draft PRで返却する。

`codex/0028-final-light-user-corrections`

返却先: [Draft PR #46](https://github.com/Tanukitsune-hub/Knowledge-Sharing-Platforms/pull/46)。Design artifact commit: `933111ce96cd170210f80ca7bada862cbdfe310c`。15画面・8 review画像・456 tests PASS。Production readinessは未認定。

Instruction:

`docs/handoffs/0028-CODEX-09-final-light-user-corrections-instruction.md`

PR #45 remains the visual baseline / review history. CODEX-09 must create a fresh Draft PR from the prepared branch to `main` and must not overwrite current controller files with stale PR #45 branch versions.

## Closed user corrections for CODEX-09

Authoritative detail:

- `docs/handoffs/0028-CODEX-09-analytics-meeting-type-columns-decisions.md`
- `docs/handoffs/0028-CODEX-09-knowledge-search-layout-and-mode-policy-decisions.md`

Summary:

1. `面談実績の集計` lower Meeting table columns:
   `日付 / 面談先 / Asset Class / Team / 原資料 / 年1回面談 / オフィス訪問 / 年次総会 / 確認済み`。
   Existing `meetingTypeCodes`を`○ / —`で表示し、複数該当を許容。`確認済み`はexisting contractのまま右端。
2. Sidebar iconsはPR #45より明確に強いgold metallic presenceへ。必要ならpermissive-license外部SVG familyをlocal vendor可。runtime remote dependencyは禁止。
3. Knowledge Search user-facing source labelは`情報ソース`。optionsは`面談記録・資料 / 面談記録のみ / 資料のみ`。通常AI検索のMeeting/Pitchbook File Search contractは維持。
4. `全文出力（AIを使わない）`は`面談記録のみ`固定。Pitchbook本文・Pitchbook参照リンクは含めない。
5. Knowledge Search primary layout:
   - Row 1: `GP / 情報ソース / 開始日 / 終了日 / 全期間`
   - default rolling 3 years / `全期間` OFF
   - Row 2: `検索モード / AIモデル`
   - Row 3: wide / larger `質問`
   - current `使用モデル` labelは`AIモデル`へ改称。Thinkingはnormal user hidden。
6. Search mode preset design:
   - `自由質問`はeditable / protected baseline
   - non-free modeはadmin-defined fixed promptをgray read-onlyで表示
   - admin pageに`検索モード設定`section designを追加し、表示名 / 固定質問・指示文 / enabled / sort order / generic preset追加を表現
   - existing `比較` 2–5 Entity semantics、`面談準備` target requirementを維持
   - admin-managed persistence / server-side canonical prompt resolutionはfuture BUILD requirementで、CODEX-09では実装しない

## Preserved accepted evidence / boundaries

- Work 0027 Gemini qualified-disabled / normal-user hidden
- Work 0029 shared-admin security behavior
- Light only; Dark/System/theme selector canceled
- sidebar destinations exactly 7
- sidebar base `#182124`
- active `#E1001F` thin left strip only; ordinary UI redなし
- Past Records explicit Meeting↔Pitchbook relationship integration
- production `src/**` / `dist/**`, runtime, deployは未許可

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
| 0028-CODEX-09 | 最終Light修正・15画面検証・screenshots・report完成。RETURNED。 |

## Next gate

ChatGPTがCODEX-09のDraft PR、`docs/design/0028/selected-light-family/final-user-corrections/`の画像・検証、および`0028-CODEX-09-final-light-user-corrections-report.md`をreviewし、ユーザーの最終Light visual acceptanceへ進む。

Do not implement production source or deploy.

```text
THEME_SCOPE: LIGHT_ONLY
DRAFT_PR_45: VISUAL_BASELINE / UNMERGED
CONTROLLER_TECHNICAL_REVIEW_CODEX_08: PASS
USER_LIGHT_ACCEPTANCE: PENDING
ACTIVE_DISPATCH: 0028-CODEX-09
CODEX_09_INSTRUCTION: EXECUTED / RETURNED
CODEX_09_BRANCH: codex/0028-final-light-user-corrections
PRODUCTION_IMPLEMENTATION_AUTHORIZED: NO
SOURCE_CODE_CHANGED: NO
RUNTIME_CHANGED: NO
READY_FOR_PRODUCTION_BUILD: NO
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-09
BALL: CHATGPT
STATUS: RETURNED
