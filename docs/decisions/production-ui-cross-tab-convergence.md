# Production UI simplification and cross-tab layout convergence

Status: IMPLEMENTED_ACCEPTED
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

`Counterparty_Type`もbackend/schema/existing metadataとして保持する。検索・分析・通常filterでは選択させないが、新規面談先を登録する専用modalでは必須入力として種別を選択する。

削除対象:
- Counterparty Type filter/select
- Activity AnalyticsのCounterparty Type filter
- Activity Analyticsの内訳option `counterpartyType`
- native browser promptによるquick-add type入力
- Counterparty Masterのinline type selector

新規Counterpartyは専用modalで`Counterparty_Type`を必須選択し、相手先名称と合わせて登録する。defaultで`OTHER`へ自動決定しない。既存Counterparty typeは変更しない。

read-only metadata/table columnはこのWorkで必ずしも削除しない。主対象はuser selection surface。

## Cross-tab optimization

記録を追加のlayoutをreferenceに、各tabを12-columnベースで整理する。目的は過度な空白・不揃いなcontrol width・旧30ch capを減らし、短い視線移動と一貫したdensityを作ること。

Production behavior / data model / securityは変更しない。
## New Counterparty registration modal

新規面談先登録はnative `prompt()` / browser promptを使用しない。

Meeting-createの`未登録の面談先を追加`、およびMaster画面からの新規面談先追加は、同一の専用modal formを再利用する。

Modal fields:
- `面談先種別` — required select
- `面談先名` — required text input

Type options:
- `GP` — GP / 運用会社
- `LP_ASSET_OWNER` — LP / Asset Owner
- `NISSAY_INTERNAL` — 日本生命
- `GROUP_COMPANY` — グループ会社
- `CONSULTANT_GATEKEEPER` — Consultant / Gatekeeper
- `OTHER` — その他

Modal actions:
- `キャンセル`
- `登録`

登録成功後、Meeting-create起点の場合は新規Counterpartyを面談先selectorへ即時反映・選択する。Master起点の場合はmaster一覧をrefreshする。

Backdrop、Escape、Cancelで安全に閉じ、focusを起点buttonへ戻す。modal open中のbackground interactionは抑止する。
## Implementation Result

Implemented and accepted in PR #58.

```text
MERGE: 9537b499ed05698ab1e981a51534fe86807d910d
FINAL_SERVED_VERSION: 11
CROSS_TAB_UI_CONVERGENCE: PASS
NEW_COUNTERPARTY_MODAL: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
BLOCKER: NONE
```

Equity / Debtはnormal user selectionから除去し既存backend値を保持。Counterparty Typeは新規面談先登録modalだけをuser-selectable exceptionとして維持する。