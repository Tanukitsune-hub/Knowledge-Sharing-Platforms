# Work 0064 dispatch control

WORK_ID: 0064
DISPATCH_ID: 0064-CODEX-01
ACTIVE_DISPATCH_ID: 0064-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: SECONDARY TEXT CONTRAST

## Primary Outcome

既定の補助文字contrastを主要背景で4.5:1以上にし、Theme設定でも`text.secondary`の低contrastをwarningできるようにする。

## Sources of Truth

- `AGENTS.md`
- `docs/planning/work0060-0065-ux-hardening-roadmap.md`
- `docs/handoffs/0064-secondary-text-contrast-requirements.md`
- accepted main including Work0060–0063
- accepted Work0055 theme behavior

## Scope / Boundaries

Work固有要件はrequirementsを参照する。恒久ルールはAGENTS.mdに従う。

default secondary color + existing contrast-warning logicのみ。persisted custom palette migration、Theme redesign、provider、deployment変更なし。

## Required Validation

TIER_2_STANDARD。

- focused default / ratio / persistence / warning tests
- Theme browser desktop + 390px
- Work0055 color-tool relevant regression
- canonical `npm run check` 1回
- bundle validationはgenerated bundle更新時のみ
- provider call / target-runtime deployment不要

## Delivery

branch: `work/0064-secondary-text-contrast`
Draft PRを使用。
report: `docs/handoffs/0064-CODEX-01-secondary-text-contrast-report.md`

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0064-CODEX-02
WORK_0064_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0064
DISPATCH_ID: 0064-CODEX-01
BALL: CODEX
STATUS: READY
