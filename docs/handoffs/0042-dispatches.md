# Work 0042 dispatch control

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-02
ACTIVE_DISPATCH_ID: 0042-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: STRATEGY RESET / REPAIRED TERMINOLOGY RUNTIME CLOSURE

## Primary Outcome

Sidebarを維持し、右ペイン全体をselected record-detail designへ統一する。

## Authoritative instruction

- `docs/handoffs/0042-CODEX-01-right-pane-design-unification-instruction.md`
- `docs/handoffs/0042-CODEX-02-serve-terminology-repair-instruction.md`

## Concrete visual reference

- `docs/design/0042/right-pane-reference.css`
- `docs/design/0042/right-pane-reference.html`
- `docs/design/0042/README.md`

## Current closed decisions

- sidebar unchanged
- selected record-detail mockup + concrete CSS/HTML fixture = canonical right-pane visual direction
- palette = ivory/champagne + restrained gold aligned with existing sidebar; avoid generic blue
- user-facing navigation label: プルダウンの管理 -> マスター管理（visual unchanged）
- Asset Class / 面談場所 / Team: drag-and-drop reorder; no numeric prompt
- reorder visual: drag handle + insertion indicator + short shift animation + save/rollback state
- existing OPTION_REORDER semantics preserved
- admin tabs:
  - left: AIプロバイダ設定
  - right: 削除記録の管理
  - default: AIプロバイダ設定
- user-facing terminology:
  - Team -> チーム
  - Asset Class -> アセットクラス
  - Meeting Type -> MTG種別
  - internal identifiers unchanged
- existing behavior / data semantics preserved
- Work0030 remains DEFERRED_BY_USER

```text
NEXT_UNUSED_DISPATCH: 0042-CODEX-03
WORK_0042_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-02
BALL: CODEX
STATUS: READY


## Strategy Reset — CODEX-02

CODEX-01 version22 actual runtime found generated Full Output terminology drift after the one allowed deployment update.
Repair is already present and deterministic checks pass, but it is not served.

```text
SERVED_VERSION: 22
REPAIRED_APPLICATION_COMMIT: 811c60858edf61147355c7a8d4a36116a1582be9
RETURN_HEAD: 04dba794690082be16cf567a7b63e391e33b1fed
BLOCKER: REPAIRED_TERMINOLOGY_NOT_SERVED
CODEX_02_ADDITIONAL_VERSION_BUDGET: 1
CODEX_02_ADDITIONAL_DEPLOYMENT_UPDATE_BUDGET: 1
EXPECTED_FINAL_SERVED_VERSION: 23
```

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-02
BALL: CODEX
STATUS: READY
