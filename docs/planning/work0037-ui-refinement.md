# Work 0037 — Post-version11 UI refinement

WORK_ID: 0037
STATUS: ACTIVE
MODE: BUILD
PHASE: READY_FOR_CODEX

## Primary Outcome

Work0036/version11をaccepted baselineとして、ユーザーが実機で指定した6画面のUI refinementを一括実装し、同じowner-only Web Appでend-to-end認定する。

Authoritative requirements:
`docs/handoffs/0037-ui-refinement-requirements.md`

## Work Contract

### Primary Outcome

- 過去の記録、ナレッジ検索、面談実績の集計、プルダウンの管理、管理者ページ、記録を追加を指定どおり収束する。
- business data / schema / provider behavior / deployment exposureを変えずに、layoutとrequested interactionを改善する。

### Acceptance Evidence

Evidence hierarchy:
1. actual owner-only Web App rendered UI / native interaction / console
2. target/deployment/source parity
3. focused deterministic tests + canonical `npm run check` / bundle
4. source inspection

Required actual evidence:
- 2560 / 1440 / 1280 / 390
- normal navigation 7/7 nonblank
- six changed screens satisfy frozen requirements
- representative search/create/master/admin flows
- console material error/warn0

### Fastest Safe Decisive Action

1. latest main/version11 sourceをread-only確認
2. scoped UI + client contract changes
3. focused tests / canonical validation
4. same targetへsource sync1、immutable version1、same deployment update1
5. actual owner-only browser qualification

### Required Scope

- frozen requirements fileの全項目
- necessary source/client/tests/bundle
- admin shared-password active gate removal
- same existing deployment update

### Non-Goals

- schema/migration changes
- provider transition
- Work0030
- public/shared deployment exposure
- historical metadata deletion
- Layout Lab/UI Studio再開
- unrelated design redesign

### Authorization / side-effect boundary

```text
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
PERMISSION_BROADENING: 0
PROVIDER_CALLS: 0 unless existing UI action explicitly exercised for read-only state; do not introduce provider calls for qualification
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
WORK_0030: DEFERRED_BY_USER
```

Shared admin password removal is authorized only inside the already owner-only Web App boundary.

### Closed Conclusions

- baseline is Work0036/version11 / PR #58 accepted
- Meeting Counterparty modal remains accepted
- Equity/Debt selection remains hidden
- Counterparty Type selection remains new-Counterparty-modal-only
- sidebar gold/3D/ornament remains
- page max-width2000 remains

### Retry cap

Maximum 3 coherent repair/runtime cycles.
Each runtime mutation cycle: source sync1 / immutable version1 / same deployment update1 max.

### Strategy Reset conditions

- same failure class repeats
- target/deployment identity mismatch
- owner-only access cannot be preserved
- requested admin simplification requires public permission broadening
- schema/migration/provider changes become necessary
- evidence contamination or retry cap reached

### Completion Latch

After all required UI and actual runtime evidence PASS, perform one final consistency check, merge only after ChatGPT review, update GitHub completion state, then stop.

## Screen acceptance summary

### 過去の記録
- Date From/To => 開始日/終了日 + `対象期間` label
- start/end/Asset Class/Team left compact
- Counterparty below Start
- Fund hidden
- Status hidden + always Active payload

### ナレッジ検索
- 詳細条件 always visible
- Fund / Follow-up / Meeting Type hidden
- Row1 dates + all-period
- Row2 Counterparty wide + Asset + Team + existing Source compact at right
- Row3 Search Mode(default 要約) + 全文出力 immediately right + AI model
- Row4 label `AI検索 指示入力欄`
- Row5 left actions `AI検索を実行` + `条件クリア`

### 面談実績の集計
- compact left controls + left 集計 button
- `期間` => `期間粒度`
- initial start date = initial end date minus 1 calendar year, leap-safe
- result order: 選択した内訳 -> 該当Meeting -> 集計サマリー

### プルダウンの管理
- page tabs: 面談先 / Asset Class / 面談場所 / Team
- initial tab 面談先
- type-specific add/list/edit only
- CAPITAL_TYPE tabなし
- shared Counterparty modal reuse

### 管理者ページ
- shared admin password UI/gate/session removed from active product
- owner-only deployment remains
- password prompt/unlock/lock/init/change 0
- provider-specific disabled logic preserved

### 記録を追加
- Meeting Type to Row1 right-side space
- Register button next to 当社側
- attachment drop area shorter + clear/retry buttons stacked at right
- textarea height preserved

## Completion target

All frozen requirements implemented, version11 behavior preserved, next owner-only immutable version actual-qualified, BLOCKER NONE.