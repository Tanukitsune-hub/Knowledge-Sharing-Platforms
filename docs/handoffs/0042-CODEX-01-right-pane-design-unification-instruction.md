# Work 0042 CODEX-01 — right-pane design unification + master direct manipulation

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD

## Primary Outcome

Work0041 version21をaccepted baselineとして、sidebarのvisual designを変更せず、右側コンテンツ領域の全user-facing surfaceを、ユーザー選定済みの「記録の詳細」mockupのdesign languageへ統一する。

同時に以下を完成させる。

- 管理者ページを2 tab化
- `プルダウンの管理` -> `マスター管理`
- Asset Class / 面談場所 / Teamの数値Sort Order操作をdrag-and-dropへ置換
- user-facing `Team / Asset Class / Meeting Type`を日本語labelへ統一
- 初期表示だけでなく、操作後に初めて現れるreachable UIを漏れなく同じdesign languageへ収束

## 推奨モデル

GPT-5.6 Sol / reasoning high。

理由: 要件自体はfreeze済みだが、複数画面・dynamic state・hidden/reachable surfaceを横断して漏れなく収束させる必要があり、単純な局所実装よりcodebase exploration / design convergence / regression reviewの比重が高い。

## Baseline

```text
BASELINE_MAIN: latest main at dispatch start
BASELINE_PRODUCT: Work0041
FINAL_SERVED_VERSION: 21
WORK_0040: ACCEPTED
WORK_0041: ACCEPTED
WORK_0030: DEFERRED_BY_USER
```

開始時に必ずlatest `main`をfetch/rebase確認し、exact baseline SHAをreportに記録する。

## Authoritative sources

- `docs/handoffs/0042-right-pane-design-unification-requirements.md`
- `docs/planning/work0042-right-pane-design-unification.md`
- `docs/handoffs/0042-dispatches.md`
- `docs/planning/work-registry.md`
- `docs/handoffs/0041-completion-report.md`
- `docs/handoffs/0040-completion-report.md`

Selected visual directionはrequirements内のcanonical visual descriptionを正とする。会話上選定されたmockupの意図は、flatで境界が曖昧なpresentationを避け、white / very-light-blue、明確なcard boundary、薄いheader band、subtle border/radius/shadow、読みやすいlabel/value、dedicated inset body、明確なaction hierarchyを右ペイン全体に適用すること。

## Critical pre-implementation step — Reachable UI Surface Inventory

コード変更前に、user-facing UIのstate inventoryを作ること。

初期表示のHTMLだけを見て実装を始めない。

### 必須探索

`src/*.html`のpage templatesとclient event/state transitionsを横断し、次を洗い出す。

1. 7 normal navigation pages
   - ナレッジ検索
   - 記録を追加
   - 過去の記録
   - 面談先サマリー
   - 面談実績の集計
   - マスター管理
   - 管理者ページ

2. 通常操作後に初めて出るsurface
   - search result / answer / evidence
   - full output / export preview / prompt preview
   - pending / recheck / retry
   - detail / related materials
   - record editor
   - material picker modal
   - counterparty modal
   - attachment flow / registered-parent state
   - classification editor
   - pitchbook / material metadata editor等、通常操作から到達するeditor
   - entity / analytics drill-down
   - admin tab panels
   - master tab panels
   - loading / empty / disabled / success / warning / error state

3. `hidden`, `hidden-panel`, `display:none`, `classList.remove(...)`, tab switch, modal open, row action, mode switch等のstate transitionを検索する。

### Known examples — これだけで十分とは考えない

現mainには少なくとも以下のdynamic surfaceが存在するため、見落とし防止のseedとして使う。

- Knowledge Search:
  - `knowledge-result`
  - `knowledge-export-section`
  - `knowledge-export-prompt-preview`
  - pending `knowledge-recheck`
  - mode-dependent / source-dependent controls
- Past records / maintenance:
  - Meeting detail / related material / edit states
  - material picker modal
  - material metadata edit card
- Entity workspace:
  - drill-down / detail states
- Master management:
  - tab-dependent option panel
- Admin:
  - AI provider / 削除記録の管理 tabpanels
- shared modals / file attachment / retry-related states

一方、backend-only / compatibility-only hidden controls（例: internal IDs、provider route、legacy fields等）はvisible化しない。inventory上で「intentionally hidden / non-user-facing」と分類する。

### Inventory artifact

実装前またはreport内に、少なくとも以下の列を持つ一覧を残す。

- Page
- Surface / state
- Trigger
- Source file / function
- Initial visibility
- User reachable?
- Work0042 design action
- Preserved / intentionally hidden reason

このinventoryをimplementation checklistとして使用し、最終review時に全行を再確認する。

## Design system / visual implementation

局所的なpageごとのCSS貼り足しではなく、既存component contractを壊さない範囲でshared right-pane design primitivesへ収束させる。

### Canonical visual language

- page background: existing light baseを維持
- main section: clearly bounded white cards
- card header: pale blue / blue-gray header band
- subtle border + radius + shadow
- section spacing / heading hierarchyを統一
- label/valueの区切りを明確化
- long-form bodyはinset panel
- tablesはheader / row / action alignmentを統一
- primary = blue emphasis
- secondary = neutral / blue outline
- destructive = red outline / red emphasis
- empty/loading/disabled/success/warning/errorも統一
- major section header iconを使う場合はsmall/simpleで統一し、外部icon dependencyを追加しない
- nested card過多にせず、information hierarchyが見える最小構造にする

### Sidebar boundary

sidebarのvisual design、width、background、icons、interactionは変更しない。

唯一のuser-facing変更:
- `プルダウンの管理` -> `マスター管理`

sidebarのCSS refactorをright-pane変更に巻き込まない。

## User-facing terminology convergence

normal UI全体で以下へ統一する。

- `Team` -> `チーム`
- `Asset Class` -> `アセットクラス`
- `Meeting Type` -> `MTG種別`

対象:
- form label
- filter label
- table header
- detail attribute
- tab label
- helper / empty textで同概念を示す箇所
- dynamically generated HTML / JS string

Boundary:
- code identifiers / object field / API / schema / enum / stored valuesは変更しない。
- `TEAM`, `ASSET_CLASS`, `Meeting_Type_Codes`等はそのまま。
- test名やfixture keyもinternal contractとして必要ならそのまま。

実装後にuser-facing sourceをgrepし、意図しない`Team` / `Asset Class` / `Meeting Type`残存を確認する。internal-only occurrenceは理由を分類する。

## Admin page tabs

管理者ページは2 tab構成へ変更する。

Desktop order:
1. 左: `AIプロバイダ設定`
2. 右: `削除記録の管理`

Behavior:
- default active = AIプロバイダ設定
- client-side switch
- page reloadなし
- one active panel at a time
- tab switchでform/filter/result stateを保持
- `role=tablist / tab / tabpanel`, `aria-selected`, keyboard navigationを適切に実装
- mobileでも2 tabが明確に選択可能
- Work0041 delete / restore behaviorを変更しない
- AI provider/model behavior、権限、credential semanticsを変更しない

## Master management rename + drag-and-drop reorder

### Rename

- sidebar label: `マスター管理`
- page titleも`マスター管理`
- existing `面談先 / Asset Class / 面談場所 / Team` tab labelsのうちuser-facing terminology ruleを反映:
  - `Asset Class` -> `アセットクラス`
  - `Team` -> `チーム`
  - `面談場所`は維持
  - `面談先`は維持

### Reorder scope

対象:
- アセットクラス
- 面談場所
- チーム

対象外:
- 面談先

### Direct manipulation behavior

現在の`順序`button -> numeric prompt / raw Sort Order操作をnormal UIから撤去する。

各option row:
- 左端にdrag handle
- handleにmouse affordance（grab / grabbing）
- handle経由でdrag開始
- drag中は対象rowを少し浮かせる
- drop targetをinsertion line / placeholderで明示
- destinationに応じてneighbor rowsを短いtransitionでshift
- drop後はoptimistic visual orderを表示し、`並び順を保存中…` busy state
- success後はauthoritative server responseで再描画
- failure時はpre-drag authoritative orderへrollback + error
- save中duplicate drag禁止
- tabを跨ぐmove禁止
- Statusを変更しない
- reduced motion preferenceではanimationを抑制

### Backend semantics

既存`OPTION_REORDER` / `Option_Order`を第一選択で再利用する。

まずcurrent reorder implementation / `mutateMasterAtomic`を読んで、1回のdropを最小mutationで正しく表現できることを確認する。

新schema / new storage / separate ordering serviceは作らない。

既存single-item reorder semanticsでtarget positionを表現できる場合はそのまま利用する。もしexact semantics上不可能な場合は、勝手にbackend contractを広げずreportでBLOCKERとして返す。

Audit semanticsを維持する。

## Functional preservation

壊してはいけないもの:

- Work0041 delete -> admin restore E2E
- Work0040 Meeting detail/edit/related-material workflow
- Meeting ID / Google Doc identity
- related-material add / unlink / relink
- material classification
- record add + attachment flow
- Knowledge Search modes / result / citations / full output
- Entity summary / drill-down
- analytics / admin check workflow
- master add / rename / activate / deactivate
- provider settings / model policy
- optimistic concurrency
- Audit
- owner-only deployment security
- AI provider calls remain unchanged
- Work0030 remains DEFERRED_BY_USER

## Tests / static validation

変更前にrelevant existing testsを確認し、必要なfocused regression testsを追加する。

最低限:
- shared design classes / right-pane page coverage
- admin tabs behavior / accessibility
- terminology convergence
- master drag reorder helper logic
- reorder success / failure rollback
- existing OPTION_REORDER contract
- hidden/reachable UI inventory coverageのsource-level guard（過度にimplementation-copyにならない範囲）
- sidebar visual contract not changed（label text除く）
- Work0041 delete/restore regression
- Work0040 detail/edit regression

実行:
- relevant focused tests
- `npm run check`
- canonical bundle regeneration
- `npm run check:bundle`
- `git diff --check`

## Actual runtime qualification

same existing owner-only Web Appのみを使用する。

### Preflight

mutation前に:
- same existing target
- current served version21
- baseline saved source / immutable source parity
- deployment type / execute-as / access boundary
をread-only確認。

### Visual / interaction matrix

2560 / 1440 / 1280 / 390で7 normal pagesを確認する。

単に7ページがnonblankで終えず、Reachable UI Surface Inventoryにあるuser-reachable statesを実際に必要な操作で開き、representative stateを確認する。

特に:
- Knowledge Search result / export / prompt preview / pending state
- Past record detail / related / edit / material picker / reachable metadata editor
- record-add attachment states
- entity/analytics drill-down
- master 4 tabs、うち3 option tabsでdrag reorder
- admin 2 tabs
- modal states
- empty/loading/error/disabled states

全stateを1画面ずつスクリーンショット保存する必要はないが、漏れのないstate walkをreportへ記録し、代表screenshotsを保存してよい。

### Master reorder runtime

isolated synthetic optionsまたは安全なexisting non-business test optionを用い、
- drag A -> destination
- visual insertion indicator
- save busy
- authoritative order readback
- dropdown actual orderへの反映
- reload後もorder保持
を確認。

可能なら元順序へ戻して終了する。戻す場合もAuditを汚染しないとは限らないため、test dataで行う。

### Regression runtime

- Work0041 delete -> restore path
- provider settings tab opens without mutation
- normal navigation 7/7
- console material error/warn 0

## Deployment boundary

実装 / tests PASS後のみ:
- same Apps Script targetへsource sync
- immutable version createは1回まで
- same deployment updateは1回まで
- new target 0
- second deployment 0
- permission broadening 0
- public exposure 0

同じ失敗を繰り返さない。runtime qualificationで中核前提が否定された場合はStrategy ResetしてCHATGPTへ返す。

## Safety

```text
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
NEW_STORAGE: 0
PHYSICAL_DELETE: 0
PROVIDER_BEHAVIOR_CHANGE: 0
AI_SYNC_CHANGE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
SIDEBAR_REDESIGN: 0
WORK_0030: DEFERRED_BY_USER
```

## Output / GitHub artifacts

Branch:
- `codex/0042-right-pane-design-unification`

Draft PR:
- base `main`
- human-facing title/bodyは日本語中心

Report:
- `docs/handoffs/0042-CODEX-01-right-pane-design-unification-report.md`

Update:
- `docs/handoffs/0042-dispatches.md`

Report must include:
- exact baseline SHA / final head
- changed files
- Reachable UI Surface Inventory summary
- intentional hidden controls classification
- terminology residual scan
- master reorder semantics / evidence
- admin tabs evidence
- focused tests / full checks
- served version / deployment mutation counts
- viewport/state walk
- console error/warn
- side-effect state
- BLOCKER
- READY_FOR_CHATGPT_FINAL_REVIEW

PRはmergeしない。Completion LatchはChatGPT final review後。

## Done when

- frozen requirementsを全て満たす
- reachable user-facing surfaceにdesign更新漏れがない
- selected right-pane design languageが全画面で一貫
- dynamic / sequential surfacesも同じlanguageへ収束
- sidebar visual unchanged
- master reorderがmouse dragだけで完結
- user-facing labelsが日本語へ統一
- admin tabsが期待どおり
- regression / runtime evidence PASS
- BLOCKERなし

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-01
BALL: CODEX
STATUS: READY
