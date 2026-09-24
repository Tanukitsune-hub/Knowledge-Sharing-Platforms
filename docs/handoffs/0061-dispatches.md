# Work 0061 dispatch control

WORK_ID: 0061
DISPATCH_ID: 0061-CODEX-01
ACTIVE_DISPATCH_ID: 0061-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: RESULT FRESHNESS

## Primary Outcome

Knowledge SearchとEntity Workspaceで、current input / selected entityと表示resultのidentityを一致させ、古いresponseをcurrent resultとして見せない。

## Sources of Truth

- `AGENTS.md`
- `docs/planning/work0060-0065-ux-hardening-roadmap.md`
- `docs/handoffs/0061-result-freshness-requirements.md`
- accepted main including Work0060

## Scope / Boundaries

Work固有要件はrequirementsを参照する。恒久ルールはAGENTS.mdに従う。

client-side request identity / stale-result presentationのみ。provider logic / schema / API / deployment変更なし。

## Required Validation

TIER_2_STANDARD。

- focused async / stale / race tests
- relevant browser: Knowledge Search + Entity Workspace desktop + 390px
- canonical `npm run check` 1回
- bundle validationはgenerated bundle更新時のみ
- provider call / target-runtime deployment不要

## Delivery

branch: `work/0061-result-freshness`
Draft PRを使用。
report: `docs/handoffs/0061-CODEX-01-result-freshness-report.md`

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0061-CODEX-02
WORK_0061_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0061
DISPATCH_ID: 0061-CODEX-01
BALL: CODEX
STATUS: READY
