# Work 0062 dispatch control

WORK_ID: 0062
DISPATCH_ID: 0062-CODEX-01
ACTIVE_DISPATCH_ID: 0062-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_2_STANDARD
PHASE: FIELD-LEVEL VALIDATION

## Primary Outcome

面談登録・面談編集のrequired field errorを、利用者が修正箇所を即座に理解できるfield-level validationへ改善する。

## Sources of Truth

- `AGENTS.md`
- `docs/planning/work0060-0065-ux-hardening-roadmap.md`
- `docs/handoffs/0062-field-validation-requirements.md`
- accepted main including Work0060 / Work0061

## Scope / Boundaries

Work固有要件はrequirementsを参照する。恒久ルールはAGENTS.mdに従う。

registration / editのclient validation presentationのみ。required policy、server validation、schema、API、deploymentは変更しない。

## Required Validation

TIER_2_STANDARD。

- focused field-validation tests
- relevant browser: registration + past-record edit、desktop + 390px
- canonical `npm run check` 1回
- bundle validationはgenerated bundle更新時のみ
- provider call / target-runtime deployment不要

## Delivery

branch: `work/0062-field-validation`
Draft PRを使用。
report: `docs/handoffs/0062-CODEX-01-field-validation-report.md`

ChatGPT final reviewまでACCEPTED / Completion Latchは適用しない。

```text
NEXT_UNUSED_DISPATCH: 0062-CODEX-02
WORK_0062_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0062
DISPATCH_ID: 0062-CODEX-01
BALL: CODEX
STATUS: READY
