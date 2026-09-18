# Multi-screen UI Studio — all tabs / fine positioning

Status: ACCEPTED_DESIGN_DIRECTION
Work ID: 0035
Date: 2026-09-19

## Decision

Work0033で完成したMeeting-create専用UI Layout Labを、Knowledge Sharing Platformsのnormal navigation 7画面を一つのprojectとして編集できる`UI Studio`へ拡張する。

対象:
- ナレッジ検索
- 記録を追加
- 過去の記録
- 面談先サマリー
- 面談実績の集計
- プルダウンの管理
- 管理者ページ

`記録を追加`も新Studioに含め、Work0033/0034で確定したcandidate / production version10をbaselineとして引き継ぐ。

## Product boundary

UI Studioはproduction Web Appではなく、local-only static design sandbox。

```text
PRODUCTION_SRC_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
NETWORK_CALLS: 0
GOOGLE_CALLS: 0
PROVIDER_CALLS: 0
CONFIDENTIAL_DATA: 0
```

production反映は別Workでscreen単位または小さなcoherent groupごとに行う。

## Project model

単一screen JSONではなく、1つのUI projectがshared shellと7 screen specsを持つ。

Canonical project concept:

```json
{
  "projectSpecVersion": 1,
  "baseline": "work0034-version10",
  "shared": {
    "page": {"widthPercent": 100, "maxWidthPx": 2000, "align": "left"},
    "sidebar": {"widthPx": 236}
  },
  "screens": {
    "knowledge": {},
    "meeting-create": {},
    "meeting-past": {},
    "counterparty-summary": {},
    "activity-analytics": {},
    "masters": {},
    "admin": {}
  }
}
```

## Editing levels

### Shared shell

全screen共通で編集可能:
- page max width / alignment
- sidebar width
- sidebar gold intensity
- icon depth
- ornament opacity / scale
- common card gap / radius
- common form control height

Shared changeは全screen previewへ即反映する。

### Per-screen

各screenは独立layout specを持つ。

screen switchによって他screenのdraft stateを失わない。

## Fine positioning model

Work0033の12/24 columnだけではなく、より細かい直接操作を可能にする。

Macro precision:
- 12 columns
- 24 columns
- 48 columns

Micro precision:
- 8px
- 4px (default)
- 2px
- 1px

Field/block canonical properties:
- order
- colStart
- colSpan
- breakBefore
- topGapPx
- heightPx
- xOffsetPx
- yOffsetPx
- widthAdjustPx

`xOffsetPx` / `yOffsetPx` / `widthAdjustPx`はgridでは表現しきれない最終微調整専用。large offsetはlintでwarningを出し、可能ならmacro grid移動を推奨する。

## Direct manipulation

Selected blockはcanvas上で:
- direct drag placement
- N/S/E/W + 4 corners resize
- mouse move中live preview
- alignment guides
- collision / bounds preview
- micro snap
- one gesture = one undo entry

Arrow nudge:
- Arrow = current micro snap 1 step
- Shift+Arrow = 4 steps
- form control focus中は発火しない

## Screen modeling

全画面を完全なHTML複製として固定せず、layout decisionに必要なvisual blockをscreen definitionとしてモデル化する。

必要に応じて2 level編集:
- major section/card block
- selected form/filter section内のfield/control block

Tableのcell単位やchart内部series等、layout decisionに不要な内部structureは編集対象にしない。

## Screen baseline

source of truthはWork0034 accepted production version10。

`meeting-create`はWork0033 current candidateを忠実にbaselineへ取り込む。

`meeting-past` / `counterparty-summary`はWork0034で整理済みのversion10 UIをbaselineにする。

他screenはcurrent production version10のvisible surfaceをbaselineにする。

## Compatibility

Work0033 Layout Lab dataを失わない。

- standalone meeting-create specVersion1/v2 import
- v2 -> new screen spec migration
- existing localStorage Meeting variants import/migration
- Work0033 current candidate import

existing user variantsを自動削除しない。

## Presets

Presetsはproject-wideとscreen-specificの両方を持てる。

Project-wide initial presets:
- Current Production v10
- Compact Institutional
- Balanced Professional
- Memo / Data Focus

Preset適用後も通常editable state。

## Multi-screen UX

Top toolbarにscreen selectorを置く。

追加:
- Overview mode: 7 screen thumbnail / status
- unsaved marker per screen
- `次の画面` / `前の画面` navigation
- reset current screen
- reset all
- copy current screen spec
- duplicate named project variant

## Export / handoff

Export:
- current screen JSON
- entire project JSON
- current screen Codex handoff
- all-screen design summary

Production handoffにはshared settingsと対象screen specを明確に分離する。

## Design lint

Project-wide:
- page max-width inconsistency
- common control height drift
- sidebar token inconsistency

Per-screen:
- collision / bounds
- too-large micro offsets
- excessive empty gap
- narrow label/control
- mobile projection risk
- screen-specific density warnings

numeric design scoreは出さない。

## Success condition

ユーザーが1つのUI Studioから全7タブを切り替え、記録を追加を含む各screenをdrag/resize/micro-nudgeし、project全体を保存/exportできること。production side effect0。