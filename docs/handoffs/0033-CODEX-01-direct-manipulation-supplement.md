# CODEX-01 supplement — direct manipulation and fine placement

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## User feedback

ユーザーが初版Layout Labを確認し、次を追加要求した。

1. fieldをマウスで直接、縦・横・両方向へresizeしたい。
2. 配置を単なる並べ替えではなく、より柔軟に細かく調整したい。

これはmanual qualification中の同一outcomeに対するUI feedbackなので、新Dispatchへ分けず`0033-CODEX-01`を継続する。

## Goal

Layout Labを「drag to reorder + limited resize」から、selected fieldをcanvas上で直接操作できるvisual editorへ強化する。

production source / Apps Scriptは引き続き変更しない。

## Direct resize

Selected fieldに明確な8方向handleを表示する。

- N / S / E / W
- NE / NW / SE / SW

Pointer captureでlive previewし、pointerup時に1 history entryとしてcommitする。

### Horizontal

- right edge: width拡大縮小
- left edge: start位置 + widthを同時調整し、右端を可能な限り維持
- corner: horizontal + verticalを同時に変更

### Vertical

- bottom edge: field/control heightを直接変更
- top edge: top spacingとheightを連動させ、bottom edgeを可能な限り維持
- notes / attachmentだけでなく、全field blockでvertical sizingを許可する
- standard input/selectの最低実用heightを下回らない
- notes/attachmentはより大きいmax heightを許可する

Resize中は現在値を小さなfloating badgeで表示する。

## Flexible placement

単なる`order`だけでなく、horizontal start positionをlayout specへ追加する。

Field canonical placement properties:

- `order`
- `colStart`
- `colSpan`
- `breakBefore`
- `topGapPx`
- optional `heightPx`

### Direct drag positioning

fieldを掴んでcanvas上のdesired row/columnへdragする。

Drag中:
- grid cell / insertion rowをpointer位置から計算
- drop ghostを表示
- intended start columnとspanをvisual preview
- row insertion lineを表示

Dropで:
- orderを更新
- colStartを更新
- 必要ならbreakBeforeを更新
- intentional empty spaceを保持できる

既存fieldの上に単純swapするだけのbehaviorをやめ、pointer位置をplacement intentとして使う。

## Precision modes

Canvasにprecision selectorを追加する。

- Standard: 12 columns
- Fine: 24 columns

Current v8 presetは12-column baselineを維持する。
Fine modeへ切替時は現在の見た目を保つようspan/startを2倍して変換する。
12へ戻す際はnearest safe positionへnormalizeし、変換前にpreview/warningを出してよい。

Inspectorに少なくとも以下の数値controlを持たせる。

- start column
- width / colSpan
- top gap px
- height px
- row break

Direct mouse operationがprimaryで、inspectorはprecision補助。

## Fine nudge

Selected fieldを細かく調整できるnudgeを追加する。

- Arrow Left/Right: start columnを1 unit
- Arrow Up/Down: order/row intentを1 step
- Shift + Arrow: larger step

Form element操作と競合しないよう、canvas selected stateでのみactiveにする。

必要ならtopGapPxを4px incrementで増減するsmall controlsも提供する。

## Alignment aids

editing中に以下を表示する。

- current grid lines
- nearby field left/right edge alignment guides
- container center/left guide
- collision/overflow warning

Guideはvisual aidのみで、export specには不要。

## Spec version

Layout specをversion2へ上げてよい。

Version2 minimum:

```json
{
  "specVersion": 2,
  "container": {
    "gridColumns": 24,
    "widthPercent": 68,
    "maxWidthPx": 1680,
    "align": "left",
    "columnGapPx": 16,
    "rowGapPx": 16
  },
  "fields": [
    {
      "id": "meeting-counterparty",
      "order": 8,
      "visible": true,
      "colStart": 1,
      "colSpan": 12,
      "breakBefore": true,
      "topGapPx": 0,
      "heightPx": 92
    }
  ]
}
```

Backward compatibility:
- existing specVersion1 JSON/local variants must import successfully
- v1 -> v2 migration must be deterministic
- Current v8 / all presets must emit valid v2 after migration
- export remains deterministic

Do not discard user local variants merely because spec schema changed.

## Collision and responsive behavior

Lab must not silently overlap fields.

When placement would collide:
- either show invalid/collision preview and block commit, or
- deterministic push/reflow to next safe position

Choose the interaction that feels most natural, but test it.

Mobile preview continues to normalize to one column visually without destroying desktop placement spec.

## Design lint additions

Add warnings for:
- explicit placement collision
- field beyond grid bounds
- excessive intentional gap
- standard field unusually tall
- 24-column placement that will lose fidelity when normalized to 12

## Revised browser qualification

Old USER checklist is superseded until this enhancement is complete.

After implementation, manual user pass should verify:

1. field drag can place a field into a different row and horizontal start position
2. right/left edges resize horizontally
3. bottom/top edges resize vertically
4. corner handle resizes width + height together
5. notes can be made much taller by direct mouse drag
6. standard field can also be made taller/shorter within safe limits
7. Standard 12 / Fine 24 switch works
8. inspector numeric placement and mouse result stay synchronized
9. undo/redo treats a drag/resize gesture as one change
10. JSON export/import preserves direct placements exactly
11. existing preset/variant/hide-show/Codex handoff/reference image functions remain PASS

## Tests

Expand focused tests for:
- spec v1 -> v2 migration
- colStart/gridColumns validation
- 12<->24 conversion
- bounds/collision handling
- edge/corner resize model math
- topGap/height constraints
- direct placement update
- exact JSON roundtrip v2
- undo history gesture semantics where practical

Run canonical checks already used by CODEX-01.

## Safety / boundaries

Unchanged:

```text
PRODUCTION_SRC_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
NETWORK_CALLS: 0
GOOGLE_CALLS: 0
PROVIDER_CALLS: 0
REAL_CONFIDENTIAL_DATA: 0
WORK_0030: DEFERRED_BY_USER
```

Continue on existing branch / Draft PR #55.
Do not merge.

Update report in-place or append an enhancement section to:
`docs/handoffs/0033-CODEX-01-ui-layout-lab-report.md`

Final successful response remains:

WORK_ID: 0033
DISPATCH_ID: 0033-CODEX-01
BALL: USER
STATUS: ACTION_REQUIRED

Only return USER after the enhanced manual checklist is ready.