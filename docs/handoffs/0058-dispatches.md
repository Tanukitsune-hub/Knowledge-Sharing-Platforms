# Work 0058 dispatch control

WORK_ID: 0058
DISPATCH_ID: 0058-CODEX-01
ACTIVE_DISPATCH_ID: 0058-CODEX-01
BALL: CODEX
STATUS: READY
MODE: INVESTIGATION
VALIDATION_TIER: TIER_1_LOW
PHASE: VISIBLE BRAND INVENTORY

## Primary Outcome

Private Assets Intelligenceへの表面的なブランド統一に先立ち、旧名称をUSER_VISIBLE / OPERATOR_VISIBLE_SAFE / OPERATOR_VISIBLE_CONTRACT / INTERNAL_CONTRACT / HISTORICAL_DOCへ分類し、安全にrenameできる範囲だけを確定する。

## Sources of Truth

- `AGENTS.md`
- `docs/handoffs/0058-visible-brand-inventory-plan.md`
- Work0053 brand decision
- accepted main

## Scope / Boundaries

Work固有方針はplanを参照する。恒久ルールはAGENTS.mdに従い、本handoffへ再掲しない。

このDispatchはread-only investigation。production source、runtime resource、Drive/Spreadsheet名、deploymentを変更しない。

## Required Validation

TIER_1_LOW。

- current source / call graph inventory
- rename safety classification
- relevant current docsとの整合確認
- runtime mutation / deploy / browser regression / canonical full testは不要

## Delivery

branch: `work/0058-visible-brand-inventory`
Draft PRを使用。
report: `docs/handoffs/0058-CODEX-01-visible-brand-inventory-report.md`
inventory: `docs/decisions/visible-brand-migration-inventory.md`

ChatGPT final reviewまでBUILDへ進めず、renameを実行しない。

```text
NEXT_UNUSED_DISPATCH: 0058-CODEX-02
WORK_0058_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0058
DISPATCH_ID: 0058-CODEX-01
BALL: CODEX
STATUS: READY
