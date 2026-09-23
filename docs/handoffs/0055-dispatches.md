# Work 0055 dispatch control

WORK_ID: 0055
DISPATCH_ID: 0055-CODEX-01
ACTIVE_DISPATCH_ID: 0055-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: COLOR TOOL VISUAL REFINEMENT

## Primary Outcome

テーマ設定のcolor toolについて、hue controlを虹色bar + movable vertical indicatorへ改善し、selected-color swatchを約116×58pxへ拡大する。既存の色選択・preview/save semanticsとmobile fitを維持する。

## Sources of Truth

- `AGENTS.md`
- `docs/agent-governance/work-control.md`
- `docs/handoffs/0055-color-tool-visual-refinement-requirements.md`
- Work0054 / Work0057 accepted main

## Scope / Boundaries

Work固有要件はrequirementsを参照する。AGENTS.mdの恒久ルールを本promptへ再掲しない。

- Theme color-toolのUI/interactionに限定
- backend/storage/schema/API変更なし
- Work0056へ入らない
- live provider / business-data mutation / permission変更なし
- evidence作成だけを目的としたdeployなし

## Required Validation

TIER_2_STANDARD。変更面に必要な範囲だけ行う。

- focused color-tool tests
- canonical `npm run check` 1回
- bundle validation（generated bundleを更新する場合）
- relevant browser: Theme tab desktop + 390px
- 390px Theme tab horizontal overflow 0
- 全7画面、過去Work全件、provider、backup、target-runtime deploymentは具体的な新規依存・反証がない限り不要

## Delivery

既存branch `work/0055-color-tool-visual-refinement` を使用する。
report: `docs/handoffs/0055-CODEX-01-color-tool-visual-refinement-report.md`

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0055-CODEX-02
WORK_0055_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0055
DISPATCH_ID: 0055-CODEX-01
BALL: CODEX
STATUS: READY
