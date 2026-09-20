# Work 0042 — Right-pane design unification requirements

WORK_ID: 0042
STATUS: ACCEPTED
MODE: BUILD
PHASE: COMPLETE
BALL: NONE
ACTIVE_DISPATCH: NONE

## Baseline

```text
APPLICATION_BASELINE: Work0041
FINAL_SERVED_VERSION: 21
WORK_0041: ACCEPTED
WORK_0030: DEFERRED_BY_USER
```

## Primary Outcome

サイドバーを変更せず、右側の全ページを、ユーザー選定済みの「記録の詳細」mockupのdesign languageへ統一する。

フラットで境界が曖昧なpresentationを減らし、section / information group / action hierarchyを視覚的に明確化する。既存機能・データsemantics・security boundaryは維持する。

## Canonical visual direction

ユーザー選定済みmockupを右ペインの基準とする。

- right-paneの面はwhite / ivory / champagneを基調とし、既存sidebarのgold familyをaccentとして使う。genericなblue SaaS paletteへ寄せない。
- sectionは明確なcard boundaryを持つ。
- card headerに薄い色帯を使用し、本文との境界を分かりやすくする。
- subtle border / radius / shadowで階層を示す。
- label/valueは視認しやすいrowまたはgroupとして整理する。
- long-form bodyはdedicated inset panelで表示する。
- primary / secondary / destructive actionのvisual hierarchyを統一する。
- destructive actionは赤系outline等で明確化する。
- loading / empty / disabled / success / error stateも同じdesign languageへ統一する。
- sidebar designは変更しない。

## Concrete visual reference

文章指示だけに依存せず、selected mockupを具体化したreferenceをGitHubに置く。

- `docs/design/0042/right-pane-reference.css`
- `docs/design/0042/right-pane-reference.html`
- `docs/design/0042/README.md`

CSS referenceには、既存sidebarと調和するivory/champagne + restrained goldの具体的なtokens / card / header / row / inset / button / status / tabs / drag stateを定義する。

これはproductionへ丸ごとcopyするものではない。既存component contractへ翻訳し、右ペイン全体へ一貫して適用する。

## Scope

右ペインのnormal pagesを横断して統一する。

- ナレッジ検索
- 記録を追加
- 過去の記録
- 面談先サマリー
- 面談実績の集計
- マスター管理
- 管理者ページ

必要に応じてmodal / detail / editor / result listも同一component languageへ寄せる。

## Closed decision — マスター管理の名称 / drag reorder

### 名称

- sidebarのuser-facing label `プルダウンの管理`を`マスター管理`へ変更する。
- page headingは既存の`マスター管理`を維持する。
- sidebarのvisual design / size / placement / icon styleは変更しない。今回のsidebar変更はlabel textのみ。

### Asset Class / 面談場所 / Team の並び替え

対象tab:
- `Asset Class`
- `面談場所`
- `Team`

通常利用者向けの数値`Sort Order`手入力 / prompt操作を廃止し、click & dragによるdirect manipulationへ置換する。

Interaction:
- 各row左端にdrag handleを表示する。
- row全体ではなくdrag handleを掴んで移動することで、名称変更 / Status操作との誤操作を避ける。
- drag開始時、対象rowを少し浮かせるvisual（shadow / slight scale / opacity等）を出す。
- pointer移動中、drop先が分かるinsertion line / placeholderを明示する。
- 他rowはdestinationに応じて滑らかにshiftし、短いtransition animationで挿入位置を視覚化する。
- drop時はclient側で新しい順序を即時表示し、`並び順を保存中…`等のbusy stateを出す。
- 保存成功後はserver authoritative orderで再描画する。
- 保存失敗時はdrag前のauthoritative orderへrollbackし、errorを表示する。
- 保存中のduplicate dragを防止する。

Data semantics:
- existing `OPTION_REORDER` / `Option_Order` mutation semanticsを再利用する。
- clientはdrop位置から既存reorder mutationに必要なtarget position / sort orderを導出する。
- schema / storage / Audit modelを変更しない。
- current category内だけでreorderし、tabを跨ぐmoveは行わない。
- Statusはreorderによって変更しない。
- Inactive itemを含むcurrent categoryのauthoritative ordering semanticsを維持する。

Normal UI:
- raw numeric sort orderの手入力UIを表示しない。
- `順序`button / numeric promptを撤去する。
- raw sort-order numberを利用者のprimary visible conceptにしない。
- primary operationはdrag-and-dropとする。
- Counterparty（面談先）tabのordering behaviorは今回変更しない。

### Animation quality

- animationは短く控えめにし、業務UIとして邪魔にならない。
- drag中に「どこへ入るか」が一目で分かることを優先する。
- reduced-motion preferenceが利用可能な場合はanimationを抑制する。
- desktop mouse操作をAcceptanceの主対象とする。mobile layoutを壊さない。

## Closed decision — 管理者ページ tabs

管理者ページは、既存の2つの機能を同一縦ページに連結表示せず、tabで分ける。

Desktop order:
1. 左: `AIプロバイダ設定`
2. 右: `削除記録の管理`

### Behavior

- default active tabは`AIプロバイダ設定`。
- tab switchはclient-sideで行い、page reloadは不要。
- 一度読み込んだ各tabのform/filter/result stateはtab切替で不用意に消さない。
- 同時に両panelを縦並び表示しない。
- active tabは視覚的に明確にする。
- keyboard / accessibility上、tablist / tab / tabpanel semanticsを使用する。
- mobileでも2 tabを明確に選べる配置を維持する。必要ならequal-width 2-columnとする。
- `削除記録の管理`の既存filter / restore semanticsはWork0041 accepted behaviorをそのまま維持する。
- `AIプロバイダ設定`のprovider/model behavior・権限・保存semanticsは変更しない。

## Closed decision — user-facing Japanese labels

利用者向けの表面表示では英語labelを減らし、次の表記へ統一する。

- `Team` -> `チーム`
- `Asset Class` -> `アセットクラス`
- `Meeting Type` -> `MTG種別`

適用範囲:
- 記録を追加
- 過去の記録
- 記録の詳細
- 面談記録を修正
- 面談先サマリー
- 面談実績の集計
- マスター管理
- 管理者ページ
- table header / filter label / form label / detail attribute / tab label / empty-stateや補助文で同じ概念を示す箇所

Boundary:
- user-facing textのみ変更する。
- code identifier / object field / API / schema / enum / stored value / test fixture key等のinternal namesは変更しない。
- `ASSET_CLASS` / `TEAM` / `Meeting_Type_Codes` 等のcanonical internal identifiersは維持する。
- `MTG種別`は表示labelであり、stored Meeting Type codesは変更しない。

## Exhaustive reachable-state coverage

初期表示だけでなく、通常操作を順に進めた後に初めて現れるuser-facing surfaceも全て対象にする。

Codexは `hidden` / `hidden-panel` / `display:none` / tab switch / modal open / row action / mode switch / result render等を横断し、reachable UI surface inventoryを作成してから実装する。

対象例:
- Knowledge Search result / export / prompt preview / pending / recheck
- Past records detail / related / edit / material picker / metadata editor
- attachment / classification / retry state
- entity / analytics drill-down
- master tab-dependent panels
- admin tabpanels
- loading / empty / disabled / warning / error / success

backend-only / compatibility-only hidden controlsはvisible化せず、inventory上でintentionally hiddenとして分類する。

## Preserve

- sidebar / navigation IA
- Work0041 delete/restore semantics
- Work0040 detail/edit/related-material semantics
- Meeting / Document identity
- optimistic concurrency / Audit
- provider configuration semantics
- owner-only deployment boundary
- existing routing / URLs
- mobile usability

## Safety / Non-Goals

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
NEW_STORAGE: 0
PHYSICAL_DELETE: 0
PROVIDER_BEHAVIOR_CHANGE: 0
AI_SYNC_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
SIDEBAR_REDESIGN: 0
WORK_0030: DEFERRED_BY_USER
```

Non-Goals:
- sidebar redesign
- information architecture rework
- backend/data model changes
- provider transition
- new admin permissions
- unrelated feature additions

## Acceptance Evidence

1. Visual consistency
- 右側全normal pagesが同一card/header/action/state languageで統一される。
- user-selected record-detail styleがreferenceとして確認できる。
- flatでsection boundaryが不明瞭な主要領域が残らない。

2. Admin tabs
- 左`AIプロバイダ設定` / 右`削除記録の管理`。
- default = AIプロバイダ設定。
- one active panel at a time。
- tab switchで状態保持。
- accessibility semantics PASS。

3. Master management
- sidebar labelが`マスター管理`。
- Asset Class / 面談場所 / Teamでnumeric promptなし。
- drag handleからreorderできる。
- drag中にinsertion targetが明示され、neighbor rowsが短いanimationでshiftする。
- drop後にexisting OPTION_REORDER pathで保存され、authoritative refresh後もorder一致。
- failure時rollback。
- Counterparty tab regression 0。

4. User-facing labels
- normal UIで`Team`表示が残らず`チーム`へ統一。
- normal UIで`Asset Class`表示が残らず`アセットクラス`へ統一。
- normal UIで`Meeting Type`表示が残らず`MTG種別`へ統一。
- internal identifiers / stored values / API semanticsは不変。

5. Regression
- Work0041 delete -> restore E2E維持。
- provider settings behavior unchanged。
- normal navigation 7/7 nonblank。
- 2560 / 1440 / 1280 / 390でlayout確認。
- console material error/warn 0。

## Dispatch policy

Requirements frozen。Authoritative implementation instructionは `docs/handoffs/0042-CODEX-01-right-pane-design-unification-instruction.md`。
