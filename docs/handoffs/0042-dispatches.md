# Work 0042 dispatch control

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-01
ACTIVE_DISPATCH_ID: 0042-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: IMPLEMENTATION / EXHAUSTIVE UI QUALIFICATION

## Primary Outcome

Sidebarを維持し、右ペイン全体をselected record-detail designへ統一する。

## Authoritative instruction

- `docs/handoffs/0042-CODEX-01-right-pane-design-unification-instruction.md`

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
NEXT_UNUSED_DISPATCH: 0042-CODEX-02
WORK_0042_COMPLETE: NO
COMPLETION_LATCH: NOT_APPLIED
```

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-01
BALL: CODEX
STATUS: READY
