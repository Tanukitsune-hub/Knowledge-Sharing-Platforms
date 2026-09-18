# Work 0033 dispatch control

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
ACTIVE_DISPATCH_ID: 0033-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD
PHASE: UI LAYOUT LAB / LOCAL STATIC TOOL

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
- 12-col drag/resize
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

## Current transition

Implementation / deterministic validation / Draft PR `#55` are complete. Chrome automation could not open the required `file://` surface under its security policy, but the user completed the exact bounded manual checklist through `tools/ui-layout-lab/open-layout-lab.bat` and returned `確認完了`. Work 0033 is ready for ChatGPT final review.

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
