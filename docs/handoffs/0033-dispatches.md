# Work 0033 dispatch control

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
ACTIVE_DISPATCH_ID: 0033-CODEX-02
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: UI LAYOUT LAB / DIRECT MANIPULATION V2

## Outcome

production UIを直接反復修正する前に、ユーザーがdrag/resize/presetで配置を決め、machine-readable specをCodexへ渡せるLayout Labを作る。

## Active instruction
`docs/handoffs/0033-CODEX-02-direct-manipulation-enhancement-instruction.md`

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
NEXT_UNUSED_DISPATCH: 0033-CODEX-03
WORK_0033_COMPLETE: NO
```

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
BALL: CODEX
STATUS: READY

## User feedback before qualification

Initial build reached USER manual qualification, but user requested more direct mouse resizing and more flexible placement before acceptance. Manual checklist is superseded. Same Dispatch remains active and ball returns to CODEX until direct-manipulation enhancement is complete.

Supplement: `docs/handoffs/0033-CODEX-01-direct-manipulation-supplement.md`

## CODEX-01 closed evidence

Initial Layout Lab functionality and user manual qualification are accepted baseline evidence. CODEX-01 RETURNED at branch head `405cf7f4579b7413df3de36dab4f2675176ceafa`.

New user feedback after RETURNED requires a new Dispatch. CODEX-02 adds direct 2D placement, 8-direction resize, 12/24-column precision, and spec v2 backward compatibility without reopening production boundaries.

## User-selected layout candidate / responsive lock

Candidate: `docs/handoffs/0033-user-layout-candidate-v1.json`

Supplement: `docs/handoffs/0033-CODEX-02-responsive-shape-lock-supplement.md`

Wide 2560 / Laptop 1440 / Compact 1280は同じ24-column row/column topologyを保持。720px以下だけ1-column。

## Revised user-selected candidate

Current authoritative candidate: `docs/handoffs/0033-user-layout-candidate-current.json`

Supplement: `docs/handoffs/0033-CODEX-02-revised-layout-candidate-supplement.md`

Supersedes earlier 77% / 24-column candidate. Current: 12 columns / width100% / max1680 / same desktop topology across Wide-Laptop-Compact.

## Latest candidate revision

Current candidate remains `docs/handoffs/0033-user-layout-candidate-current.json`.

Latest change: `maxWidthPx = 2000` (supersedes 1680). Width remains 100%, 12-column canonical layout unchanged.

One stale `1680px` sentence in the user's pasted responsive prose was explicitly reconciled to 2000 because the handoff header and canonical JSON both specify 2000.
