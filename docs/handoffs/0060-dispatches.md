# Work 0060 dispatch control

WORK_ID: 0060
DISPATCH_ID: 0060-CODEX-01
ACTIVE_DISPATCH_ID: 0060-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: UNSAVED EDIT PROTECTION

## Primary Outcome

過去の記録の面談編集で、未保存入力の意図しない破棄と編集対象の取り違えを防ぐ。

## Sources of Truth

- `AGENTS.md`
- `docs/planning/work0060-0065-ux-hardening-roadmap.md`
- `docs/handoffs/0060-unsaved-edit-protection-requirements.md`
- accepted main

## Scope / Boundaries

Work固有要件はrequirementsを参照する。恒久ルールはAGENTS.mdに従い、本handoffへ再掲しない。

production source変更はこのWork範囲内で可。runtime resource / provider / deployment / schema変更は不可。

## Required Validation

TIER_2_STANDARD。

- focused dirty-state / destructive-transition tests
- relevant browser: 過去の記録 desktop + 390px
- canonical `npm run check` 1回
- bundle validationはgenerated bundle更新時のみ
- 他画面・過去Work全件・target runtime deployはDecision-Impact理由がない限り不要

## Delivery

branch: `work/0060-unsaved-edit-protection`
Draft PRを使用。
report: `docs/handoffs/0060-CODEX-01-unsaved-edit-protection-report.md`

CODEX-01は実装・local validation結果を`0060-CODEX-01-unsaved-edit-protection-report.md`に記録して返却した。ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0060-CODEX-02
WORK_0060_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0060
DISPATCH_ID: 0060-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
