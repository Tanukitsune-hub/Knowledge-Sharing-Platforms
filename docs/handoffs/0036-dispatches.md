# Work 0036 dispatch control

WORK_ID: 0036
DISPATCH_ID: 0036-CODEX-01
ACTIVE_DISPATCH_ID: 0036-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: CROSS-TAB PRODUCTION UI CONVERGENCE

## Outcome

Work0034/version10を基準に、Equity/Debt・Counterparty Typeのuser selection surfaceを除去し、Meeting-createのlayout languageを全normal tabへ展開する。

## Active instruction

`docs/handoffs/0036-CODEX-01-cross-tab-ui-convergence-instruction.md`

## Closed Conclusions

- Work0035 UI Studio: SUPERSEDED_BY_USER
- Work0034 version10: accepted production baseline
- Meeting-create topology: preserve
- Sidebar gold/3D/ornament: preserve
- Work0030: DEFERRED_BY_USER

## Fixed boundary

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_BEHAVIOR_CHANGE: 0
SECURITY_CHANGE: 0
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
```

```text
NEXT_UNUSED_DISPATCH: 0036-CODEX-02
WORK_0036_COMPLETE: NO
```

WORK_ID: 0036
DISPATCH_ID: 0036-CODEX-01
BALL: CODEX
STATUS: READY
## Latest user refinement — Counterparty registration modal

Previous `new Counterparty => OTHER without type choice` assumption is SUPERSEDED.

New rule:
- filters/analytics still hide Counterparty Type
- new Counterparty creation is the sole user-facing type selection exception
- Meeting quick-add and Masters use one custom modal
- modal requires Type + Counterparty name
- no native prompt

Authoritative detail is appended to `docs/handoffs/0036-CODEX-01-cross-tab-ui-convergence-instruction.md`.
