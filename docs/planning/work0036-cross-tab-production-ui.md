# Work 0036 — Cross-tab production UI optimization

WORK_ID: 0036
STATUS: ACCEPTED
MODE: BUILD

## Primary Outcome

Work0034/version10をbaselineに、Equity/DebtとCounterparty Typeのuser selection surfaceを全体から除去し、`記録を追加`のlayout languageをnormal navigation tabsへ展開してproduction UIを一度収束する。

Decision:
`docs/decisions/production-ui-cross-tab-convergence.md`

## Acceptance Evidence

1. source/test: user-facing selectors removed / compatibility preserved
2. deterministic browser: all normal tabs responsive + no overflow
3. actual owner-only Web App: 2560 / 1440 / 1280 / 390 + normal navigation
4. representative create/search/edit flows: regressionなし
5. console material error/warn0

## Common layout rules

- `width:100%; max-width:2000px; margin-left:0`
- 12-column desktop grids
- 14px column/row gap
- controls normally fill assigned cell; arbitrary `30ch`/`17ch` capsを必要箇所以外から外す
- common control height 約37px
- labels / actions / cardsはWork0034 Light UI toneを維持
- 1440/1280で無意味なreflowを避ける
- <=720pxはsafe one-column/stack

## Screen targets

### ナレッジ検索

Primary row:
- 面談先 span4
- 情報ソース span2
- 開始日 span2
- 終了日 span2
- 全期間 span2

Mode row:
- 検索モード span3
- AIモデル span3
- 残りintentional blank

質問textarea: full 12。

詳細条件:
- Asset Class span2
- Team span2
- Fund / Strategy span4
- 要フォロー span2
- Meeting Type span2
- Equity / Debtは表示しない。

### 記録を追加

Accepted Work0034 topologyを変更しない。今回の共通CSS変更でregressしないこと。

### 過去の記録

Work0034のclean 12-column baselineを維持。results/detail/editもcontrol widthとcard alignmentをMeeting-create基準へ整える。

Meeting edit:
- Date2 / Time1 / Location2 / Team2 / Asset Class2
- Counterparty6 / Fund4
- Meeting Type full row
- participants6 / 6
- notes full width
- Equity / Debt selectorは非表示だが既存値をpreserve。

Pitchbook-related nested maintenance surfaceもEquity / Debt selectorを非表示・preserve。

### 面談先サマリー

- 面談先selector: span6程度、left aligned
- summary cardsは揃った高さ/spacing
- Fund/Strategy selectorはspan6程度
- tables/list sectionsはfull width
- 2-column contentはdesktop 6/6、mobile stack
- Counterparty Type selectionは引き続き無し

### 面談実績の集計

Filters 12-col:
- 期間 span2
- 開始日 span2
- 終了日 span2
- 内訳 span2
- 面談先 span4

next row:
- Asset Class span2
- Team span2
- Meeting Type span3
- Status span2

Counterparty Type filterと`counterpartyType`内訳optionは表示しない。

charts/tablesはfull width。headline/stat cardsのspacing/heightを揃える。

### プルダウンの管理

2-panel desktop layoutは6/6を基本。

Counterparty add:
- inline type selectorは表示しない
- `新規面談先を追加` actionから専用modalを開く
- modal内で`面談先種別`をrequired select、`面談先名`をrequired textとして入力
- typeはGP / LP_ASSET_OWNER / NISSAY_INTERNAL / GROUP_COMPANY / CONSULTANT_GATEKEEPER / OTHERから選択
- default OTHERへ自動決定しない
- Meeting-createのquick-addと同じmodal component / workflowを再利用

Option add:
- `CAPITAL_TYPE`を選択肢から外す
- Asset Class / Location / Teamは維持

existing master data/schemaは変更しない。

### 管理者ページ

設定cardを12-column/6-column単位で揃え、極端に横長なinputを避ける。read-only/disabled semanticsやprovider logicは変更しない。

## Safety boundary

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_BEHAVIOR_CHANGE: 0
SECURITY_CHANGE: 0
PHYSICAL_DELETE: 0
CONFIDENTIAL_DATA: 0
WORK_0030: DEFERRED_BY_USER
```

## Runtime

same existing owner-only target / same single deploymentを使用。Work0034 version10から次のimmutable versionへ進める。

## Completion

全normal tabがMeeting-createと同じlayout languageで一貫し、Equity/Debt selectionは0、Counterparty Typeは新規面談先登録modalだけに限定され、主要flowがactual runtimeでPASSした状態。
## New Counterparty modal acceptance

- native `prompt()`を使わない
- centered modal + backdrop
- required type select + required name input
- Cancel / Escape / backdrop close
- keyboard focusをmodal内に保ち、close後triggerへ戻す
- Meeting-createから登録成功時は新規Counterpartyを即選択
- Mastersから登録成功時は一覧をrefresh
- duplicate/errorは既存service errorをmodal内statusとして表示し、page top overlayへ飛ばさない
## Final Acceptance

PR #58 merge: `9537b499ed05698ab1e981a51534fe86807d910d`

Owner-only Web App version11で全7 normal tabs、2560/1440/1280/390、shared Counterparty modal、Equity/Debt preservation、analytics/maintenance flowsを認定。

```text
TARGET_RUNTIME_QUALIFICATION: PASS
LOGIC_VALIDATION: 561/561 PASS
BUNDLE_VALIDATION: 30/30 PASS
CONSOLE_MATERIAL_ERROR_WARN: 0
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
```

Completion: `docs/handoffs/0036-completion-report.md`