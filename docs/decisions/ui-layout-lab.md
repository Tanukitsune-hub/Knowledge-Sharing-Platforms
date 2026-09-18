# UI Layout Lab — visual tuning workflow

Status: ACCEPTED_DESIGN_DIRECTION
Work ID: 0033
Date: 2026-09-18

## Decision

Knowledge Sharing PlatformsのUI調整を、production sourceへ直接微修正を繰り返す方式から、独立したlocal-only `UI Layout Lab`を使う方式へ移行する。

Layout Labはproduction runtimeに接続しない静的sandboxであり、ユーザーがform fieldの順序・幅・高さ・表示/非表示・canvas幅・余白を視覚的に調整し、その結果をmachine-readableなlayout specとしてCodexへ渡す。

## Why

- チャットだけで「2倍」「もう少し左」等を反復する限界を減らす。
- UI調整を見た目で判断できるようにする。
- user choiceをstable specへ落とし、Codex implementationを機械的にする。
- production source / Apps Script / Backendを壊さずに試行する。

## Product boundary

Layout Labはproduction appではない。

- no Google Workspace calls
- no Apps Script runtime dependency
- no provider calls
- no network requirement
- no credentials
- no company/private runtime IDs
- no production mutation

Repository内の`tools/ui-layout-lab/`に置き、普通のbrowserで開けるstatic toolとする。

## Interaction model

完全なabsolute freeform配置ではなく、production responsive CSSへ安全に移植できるgrid-based direct manipulationをauthoritative editing modelとする。標準は12-column、精密調整は24-columnを選択できる。

User can:
- drag to reorder / row-column placement
- direct edge/corner resize for width and height
- Standard 12-column / Fine 24-column precision
- explicit colStart / breakBefore / topGap fine placement
- hide/show fields
- change form max width / percentage
- left / center alignment
- adjust horizontal/vertical gap
- switch desktop/laptop/mobile preview
- reset to production baseline
- apply presets
- save/load user variants
- undo/redo
- export/import layout JSON
- generate Codex handoff text

自由度は高くするが、export時は必ずresponsive grid specへ正規化する。specVersion2では`gridColumns`, `colStart`, `colSpan`, `breakBefore`, `topGapPx`, `heightPx`を保持し、旧specVersion1をdeterministicにmigrateする。

## Initial screens

v1のauthoritative editable surfaceは`記録を追加`を中心とする。

Past Meetingsはv1でreadonly/reference previewまたはminimal filter-layout editingまで許可するが、主要acceptanceはMeeting create。

Production version8のvisible fieldsをbaseline mockとして使用する。

## Presets

### 0. Current v8

現在のproduction layoutを再現するbaseline。比較・reset用。

### A. Compact Institutional

目的: 機関投資家向け業務ツールらしい情報密度と短い視線移動。

- canvas width 約64–66%
- left aligned
- gap 12–14px
- metadataを2行へ圧縮
- participantsはwide
- notesはfull width / medium-tall

### B. Balanced Professional

目的: 密度と余白のバランス。

- canvas width 約70–72%
- left aligned
- gap 16–18px
- controlsを論理的に揃える
- participants / notesを広め
- desktopで呼吸感を残す

### C. Memo First

目的: 面談メモ入力を最優先。

- canvas width 約66–70%
- basic identityをcompact top block
- notesを早い位置へ配置
- notes height large
- secondary metadataは後段

## Auto tidy

`整える` actionを実装する。

AI/network callではなくdeterministic heuristicで:
- 12-col snap
- row overflow解消
- common control widths統一
- label長に対する極端なnarrow field警告
- excessive full-width field削減
- common gapsへnormalization
- textarea minimum height確保
- large desktop form width過剰時の調整

を行う。

## Design lint

numeric scoreではなくwarnings/suggestionsを表示する。

Examples:
- canvasがwide desktopで80%超
- 1行のcontrolが多すぎる
- participant fieldが狭すぎる
- notesが低すぎる
- inconsistent gaps
- mobileでoverflow risk

## Layout spec

Export JSONのcanonical contract例:

```json
{
  "specVersion": 1,
  "screen": "meeting-create",
  "baseline": "work0032-version8",
  "viewport": "desktop",
  "container": {"widthPercent": 66, "maxWidthPx": 1680, "align": "left", "gapPx": 16},
  "fields": [
    {"id": "meeting-date", "order": 1, "colSpan": 2, "visible": true},
    {"id": "meeting-time", "order": 2, "colSpan": 2, "visible": true},
    {"id": "meeting-counterpartyId", "order": 3, "colSpan": 4, "visible": true},
    {"id": "meeting-notes", "order": 12, "colSpan": 12, "heightPx": 420, "visible": true}
  ]
}
```

Field IDsはproduction DOM IDと一致させる。

## Codex handoff

`Codexに渡す` actionはlayout JSONに加えてhuman-readable summaryを生成する。

Codex側の実装はspecをCSS/HTMLへ反映し、production business logicを変更しない。

## Local persistence

- browser localStorageにuser variantsを保存
- import/export JSON
- reference screenshotをoptional local-onlyで読み込める
- imported image bytesはrepositoryへ自動保存しない

## Non-goals

- Figma replacement
- full visual design system
- production data editing
- runtime API calls
- arbitrary absolute-position production CSS generation
- automatic production commit/merge
- AI-generated style changes without user choice

## Success condition

ユーザーがLayout Labをbrowserで開き、presetを切替し、fieldをdrag/resizeし、layoutを保存/exportし、Codex handoffを生成できること。production appへ副作用0。