# Work 0033 dispatch control

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
ACTIVE_DISPATCH_ID: 0033-CODEX-02
BALL: USER
STATUS: ACTION_REQUIRED
MODE: BUILD
PHASE: UI LAYOUT LAB / DIRECT MANIPULATION V2 / USER FILE QUALIFICATION

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

## CODEX-02 transition

- Direct-manipulation v2 implementation: COMPLETE
- Implementation commit: `3a21af3`
- Revised candidate implementation commit: `c6e15fc`
- Current authoritative candidate: 12 columns / width100% / max1680 / left / gap14-14
- Superseded candidate: 77% / 24 columns / NOT USED
- Candidate parity: PASS
- Desktop viewport placement mutation: 0
- Focused tests: `20/20 PASS`
- Canonical check: `544/544 PASS`
- Production source / deployment / external calls: `0`
- Actual Chrome `file://` qualification: USER ACTION REQUIRED
- Report: `docs/handoffs/0033-CODEX-02-direct-manipulation-report.md`

USERは`tools/ui-layout-lab/open-layout-lab.bat`からactual local surfaceを開き、reportの改訂13項目を確認する。特にWide → Laptop → Compact → Wideでtopologyとexport JSONが不変であることを確認する。全項目に問題がなければ`確認完了`、問題があれば項目番号と症状だけを返す。private JSONや画像の共有は不要。

## Revised user-selected candidate

Current authoritative candidate: `docs/handoffs/0033-user-layout-candidate-current.json`

Supplement: `docs/handoffs/0033-CODEX-02-revised-layout-candidate-supplement.md`

Earlier 77% / 24-column candidate is superseded. Current preferred layout uses 12 columns / width100% / max1680 and preserves identical desktop topology across Wide / Laptop / Compact.

## CODEX-01 closed evidence

Initial Layout Lab functionality and user manual qualification are accepted baseline evidence. CODEX-01 RETURNED at branch head `405cf7f4579b7413df3de36dab4f2675176ceafa`.

New user feedback after RETURNED required CODEX-02, which adds direct 2D placement, 8-direction resize, 12/24-column precision, and spec v2 backward compatibility without reopening production boundaries.

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-02
BALL: USER
STATUS: ACTION_REQUIRED
