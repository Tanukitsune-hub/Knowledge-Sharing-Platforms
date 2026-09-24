# Work 0063 dispatch control

WORK_ID: 0063
DISPATCH_ID: 0063-CODEX-01
ACTIVE_DISPATCH_ID: 0063-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: ACCESSIBLE REORDER AND FOCUS FLOW

## Primary Outcome

dragに依存しないマスター並び替え操作と、主要page/detail/edit遷移後の意味のあるfocus flowを追加する。

## Sources of Truth

- `AGENTS.md`
- `docs/planning/work0060-0065-ux-hardening-roadmap.md`
- `docs/handoffs/0063-accessible-reorder-focus-requirements.md`
- accepted main including Work0060–0062

## Scope / Boundaries

Work固有要件はrequirementsを参照する。恒久ルールはAGENTS.mdに従う。

client-side reorder alternative / focus behaviorのみ。master API / schema / navigation IA / modal focus / deployment変更なし。

## Required Validation

TIER_2_STANDARD。

- focused reorder + focus tests
- relevant browser: Master + Past Records + representative navigation、desktop + 390px
- keyboard interaction proof
- canonical `npm run check` 1回
- bundle validationはgenerated bundle更新時のみ
- provider call / target-runtime deployment不要

## Delivery

branch: `work/0063-accessible-reorder-focus`
Draft PRを使用。
report: `docs/handoffs/0063-CODEX-01-accessible-reorder-focus-report.md`

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0063-CODEX-02
WORK_0063_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0063
DISPATCH_ID: 0063-CODEX-01
BALL: CODEX
STATUS: READY
