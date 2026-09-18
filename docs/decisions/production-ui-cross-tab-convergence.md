# Production UI simplification and cross-tab layout convergence

Status: ACCEPTED_DESIGN_DIRECTION
Work ID: 0036
Date: 2026-09-19

## Decision

Work0035のMulti-screen Studio開発を停止し、Work0034/version10のproduction UIを直接改善する。

`記録を追加`で受け入れたlayout languageを他のnormal navigation tabへ展開する。

共通design language:
```text
desktop grid: 12 columns
column gap: 14px
row gap: 14px
control height: about 37px
page width: 100%
page max-width: 2000px
alignment: left
desktop: 2560 / 1440 / 1280で意図したtopologyを維持
mobile <=720: one-columnまたは安全なstack projection
```

## Dimension simplification

### Equity / Debt

Equity / Debt (`Capital_Type_ID`) はbackend/schema/historical dataとして保持するが、normal user-facing UIで選択させない。

削除対象:
- create/edit formsのvisible selector
- search/filter selector
- Knowledge Search detailed filter
- Pitchbook search/edit selector
- Option Masterの新規`CAPITAL_TYPE`選択肢

既存値を持つrecordのeditでは、hidden/preserved valueを維持してsave時にblankへ上書きしない。

### Counterparty Type

`Counterparty_Type`もbackend/schema/existing metadataとして保持するが、normal user-facing UIで選択させない。

削除対象:
- Counterparty Type filter/select
- Activity AnalyticsのCounterparty Type filter
- Activity Analyticsの内訳option `counterpartyType`
- quick-add時のtype prompt
- Counterparty Master新規追加時のtype selector

新規Counterpartyはuser selectionなしで`OTHER`をsafe defaultとする。既存Counterparty typeは変更しない。

read-only metadata/table columnはこのWorkで必ずしも削除しない。主対象はuser selection surface。

## Cross-tab optimization

記録を追加のlayoutをreferenceに、各tabを12-columnベースで整理する。目的は過度な空白・不揃いなcontrol width・旧30ch capを減らし、短い視線移動と一貫したdensityを作ること。

Production behavior / data model / securityは変更しない。