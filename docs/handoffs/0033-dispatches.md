# Work 0033 dispatch control

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
ACTIVE_DISPATCH_ID: 0033-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: UI LAYOUT LAB / DIRECT MANIPULATION ENHANCEMENT

## Outcome

production UIを直接反復修正する前に、ユーザーがdrag/resize/presetで配置を決め、machine-readable specをCodexへ渡せるLayout Labを作る。

## Active instruction
`docs/handoffs/0033-CODEX-01-ui-layout-lab-instruction.md`

## Fixed boundary

```text
PRODUCTION_SRC_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
NETWORK_CALLS: 0
GOOGLE_CALLS: 0
PROVIDER_CALLS: 0
REAL_CONFIDENTIAL_DATA: 0
WORK_0030: DEFERRED_BY_USER
```

## Required features

- Current v8 + 3 design presets
- direct row/column drag placement
- 8-direction edge/corner resize
- Standard 12 / Fine 24 precision
- hide/show
- viewport preview
- auto tidy + design lint
- undo/redo
- local variants
- JSON import/export
- Codex handoff
- local screenshot reference

```text
NEXT_UNUSED_DISPATCH: 0033-CODEX-02
WORK_0033_COMPLETE: NO
```

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
BALL: CODEX
STATUS: READY

## User feedback before qualification

Initial build reached USER manual qualification, but user requested more direct mouse resizing and more flexible placement before acceptance. Manual checklist is superseded. Same Dispatch remains active and ball returns to CODEX until direct-manipulation enhancement is complete.

Supplement: `docs/handoffs/0033-CODEX-01-direct-manipulation-supplement.md`
