# Work 0046 CODEX-01 — user-facing cleanup, Analytics tabs, staged Master reorder

WORK_ID: 0046
DISPATCH_ID: 0046-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Work0045 version27 accepted baselineを維持しながら、ユーザー画面のノイズを減らし、面談先サマリー / 面談実績の集計 / Master並べ替えUXを整理する。

## Recommended model

GPT-5.6 Sol High。

理由: visible-surface横断cleanupに加え、Master reorderを即時1件保存からdraft + batch commitへ変更するため、client/server/auditの整合を同時に扱う必要がある。

## Read first

- `docs/handoffs/0046-ui-cleanup-analytics-master-reorder-requirements.md`
- `docs/planning/work0046-ui-cleanup-analytics-master-reorder.md`
- `docs/handoffs/0045-completion-report.md`
- `docs/design/theme-palette-registry.md`

## Closed decisions — do not reinterpret

### Counterparty internal IDs

Visible UIから以下を除去:
- `CP-000008`のようなCounterparty internal ID
- `COUNTERPARTY:CP-...`

Internal value / RPC payload / data attribute / server relation keyとしては維持。

Meeting ID / Document IDは表示を維持する。

### Follow-up

`要フォロー` / `Follow-up` / `Follow-ups` のvisible surfaceを全normal UIとprint/PDFから0にする。

ただし:
- Follow_Up_Required
- Follow_Up_Note
- historical values
- schema / backend logic
は削除・migrationしない。

UI非表示化によって既存follow-up値をfalse/emptyへ書き換えない。

### 面談先サマリー

Top summary cards exactly 3:

```text
面談件数 | 保存資料数 | 最後の面談日
```

- equal height / equal padding / aligned label/value
- desktop 3 columns
- mobile natural stack
- Counterparty ID visible 0
- follow-up card 0
- relationships summary card 0

English user-facing headings within this screen should be Japanese where natural.
`Fund / Strategy`, `Status`, Meeting ID, Document IDは保持可。

### 面談実績の集計

Top title:
`面談実績の集計`

Top filter cardの直下にtabs:

```text
グラフ | 面談一覧
```

default = グラフ

グラフ:
1. 選択した内訳
2. 集計サマリー

面談一覧:
- 該当Meeting

Tab switchだけではRPC / aggregationを再実行しない。
同一data resultのpresentation切替だけにする。

Follow-up columns / metrics / badges visible 0。

AnalyticsのCounterparty / Team / Asset Class等はinternal IDをdisplayせず、master名 / user-facing labelを返す・表示する。
必要ならservice responseへdisplay label fieldを追加してよいが、internal ID contractは保持する。

### Master reorder

Targets:
- ASSET_CLASS
- LOCATION
- TEAM

Counterparty tabはmanual reorder対象外。

Current:
drag/drop → immediate `mutateMaster(REORDER)`

New:
drag/drop → local draft only → explicit `並び順を保存` → one server mutation

Requirements:
- multiple drag/drop before save
- drag causes server mutation 0
- per-tab unsaved draft preserved across tab switching
- dirty state visible
- save disabled when unchanged
- save busy / success / failure states
- one Save = one RPC / one lock
- reload after Save preserves final order

When active tab has dirty reorder draft:
- add / rename / deactivate / reactivate for that tab must not silently invalidate draft
- prefer disabling those mutation controls until save/reload
- `再読込` must confirm draft discard

## Batch reorder server contract

Implement the smallest safe batch mutation in existing Master pathway.

Recommended:
```text
entity: OPTION
action: REORDER_BATCH
type: ASSET_CLASS | LOCATION | TEAM
expectedOrderIds: [current canonical IDs at draft start]
orderedIds: [complete desired order]
```

Server validation under one script lock:
- type is one of the 3 reorderable types
- orderedIds unique
- orderedIds exact current same-type Option_ID set
- expectedOrderIds exact canonical order at draft start
- if current canonical order no longer equals expectedOrderIds -> conflict, write 0 rows
- no foreign type IDs
- no missing IDs
- assign Sort_Order 1..N

Persistence:
- one RPC
- one lock
- deterministic complete-order update
- avoid partial writes; use a single bounded sheet write for the complete canonical Option_Master data or equivalent atomic-within-lock implementation
- return refreshed masters

Audit:
- one `OPTION_REORDER` / equivalent batch audit event per Save
- before/after affected order snapshot
- `Changed_Fields: Option_Order`

Do not emit one audit event per drag or one RPC per item.

## Visible ID cleanup implementation notes

Current known surfaces include:
- Entity Workspace selector currently includes `name / id`
- Entity Workspace identity line shows Counterparty ID
- Activity Analytics filter/breakdown/drill can expose `COUNTERPARTY:CP-...`
- analytics drill currently can fall back to `counterpartyEntityKey` / `teamId`

Replace visible text with authoritative master names / labels while preserving internal values.

Do a browser-visible sweep rather than only source grep.

## Follow-up cleanup implementation notes

Known visible surfaces include:
- Past Meeting list badge
- Entity summary metrics
- Fund/Strategy table column
- Mixes / Follow-ups section
- print/PDF summary and section
- Activity headline / breakdown / series
- Activity drill badge

Hidden/internal fields may remain if required for update compatibility.

For edit submit, do not accidentally overwrite historical follow-up values because the controls are hidden. Preserve current record values or omit fields according to existing update contract so UI cleanup does not mutate hidden business data.

## Tests first

Add focused tests that fail on current main for:
- visible Counterparty ID leakage
- visible Follow-up text
- Entity summary exactly 3 labels
- Analytics 2-tab DOM / keyboard behavior / no-refetch-on-tab-switch
- Master drag mutation count 0 before Save
- multiple drags + one Save = exactly one mutation
- per-tab draft retention
- conflict fail-closed
- unchanged Save disabled
- Meeting ID / Document ID still present

Then run:
- focused Work0046 tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## Runtime qualification

Same existing owner-only Web App.

Deployment budget:
```text
SOURCE_SYNC: <=1
IMMUTABLE_VERSION: <=1
EXISTING_DEPLOYMENT_UPDATE: <=1
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
EXPECTED_FINAL_SERVED_VERSION: 28
ACCESS_CHANGE: 0
```

Required:
- all 7 normal pages
- 2560 / 1440 / 1280 / 390
- Work0045 Theme Settings still works / default palette preserved
- visible Counterparty internal ID leakage: 0
- visible 要フォロー / Follow-up / Follow-ups: 0
- Entity summary 3 equal cards
- Analytics tabs + content placement PASS
- tab switch RPC count 0
- Master reorder:
  - 3 reorderable tabs
  - at least two drag operations before Save
  - pre-save server mutation count 0
  - one Save mutation
  - reload order exact
  - dirty draft survives tab switch
- console material error/warn 0

For live master reorder qualification:
- use only a harmless reversible ordering change in non-business sample/dev master data
- restore original order before final state unless user data itself is intentionally being changed
- final canonical business data should equal pre-qualification ordering unless explicitly authorized otherwise

## Hard safety boundary

```text
FOLLOW_UP_DATA_DELETE: 0
FOLLOW_UP_DATA_MIGRATION: 0
MEETING_ID_VISIBILITY_CHANGE: 0
DOCUMENT_ID_VISIBILITY_CHANGE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
PROVIDER_CALLS: 0
AI_SYNC_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
WORK_0030: DEFERRED_BY_USER
```

If schema/migration/provider/access changes become necessary, STOP and return to ChatGPT.

## Delivery

Branch:
`codex/0046-ui-cleanup-staged-reorder`

Draft PR against main.
Do not merge.

Report:
`docs/handoffs/0046-CODEX-01-ui-cleanup-staged-reorder-report.md`

Update:
`docs/handoffs/0046-dispatches.md`

Report must include:
- final source scope
- visible ID sweep evidence
- Follow-up visible surface sweep
- Entity summary evidence
- Analytics tabs + RPC count evidence
- Master draft/save mutation counts
- batch reorder validation/conflict evidence
- audit evidence
- final master order parity/restoration
- Work0045 theme regression evidence
- tests / bundle / runtime
- served version
- side effects
- BLOCKER / READY_FOR_CHATGPT_FINAL_REVIEW

WORK_ID: 0046
DISPATCH_ID: 0046-CODEX-01
BALL: CODEX
STATUS: READY
