# Work 0042 — Right-pane design unification requirements

WORK_ID: 0042
STATUS: ACTIVE
MODE: BUILD
PHASE: REQUIREMENTS_INTAKE
BALL: CHATGPT
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

- white / very-light-blueを基調とする。
- sectionは明確なcard boundaryを持つ。
- card headerに薄い色帯を使用し、本文との境界を分かりやすくする。
- subtle border / radius / shadowで階層を示す。
- label/valueは視認しやすいrowまたはgroupとして整理する。
- long-form bodyはdedicated inset panelで表示する。
- primary / secondary / destructive actionのvisual hierarchyを統一する。
- destructive actionは赤系outline等で明確化する。
- loading / empty / disabled / success / error stateも同じdesign languageへ統一する。
- sidebar designは変更しない。

## Scope

右ペインのnormal pagesを横断して統一する。

- ナレッジ検索
- 記録を追加
- 過去の記録
- 面談先サマリー
- 面談実績の集計
- プルダウンの管理
- 管理者ページ

必要に応じてmodal / detail / editor / result listも同一component languageへ寄せる。

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

3. Regression
- Work0041 delete -> restore E2E維持。
- provider settings behavior unchanged。
- normal navigation 7/7 nonblank。
- 2560 / 1440 / 1280 / 390でlayout確認。
- console material error/warn 0。

## Dispatch policy

ユーザーが順次追加するUI要件をこのWork0042へ集約し、requirementsがfreezeするまでCodex Dispatchを開始しない。
