# Work 0042 CODEX-01 — right-pane design unification report

WORK_ID: 0042
DISPATCH_ID: 0042-CODEX-01
MODE: BUILD

## Baseline / Work Contract

- `BASELINE_MAIN`: `e518df9ebf1a5ae8de04bd396b0dbc83e0c0aaa5`
- `BASELINE_PRODUCT`: Work0041 / owner-only Web App version21
- `TARGET_RUNTIME`: same existing Apps Script project / same single owner-only versioned Web App
- `PRIMARY_OUTCOME`: 全normal pageと通常操作後に現れる右ペインsurfaceを、ivory / champagne + restrained goldの共通design languageへ統一する。
- `NON_GOALS`: sidebar visual redesign、schema / migration / provider / security / storage変更。
- `EXECUTION_BUDGET`: speculative repair 2 cycles、source sync 1、immutable version 1、same deployment update 1。

## Reachable UI Surface Inventory（実装前）

| Page | Surface / state | Trigger | Source file / function | Initial visibility | User reachable? | Work0042 design action | Preserved / intentionally hidden reason |
|---|---|---|---|---|---|---|---|
| ナレッジ検索 | filter / mode / action form | navigation | `KnowledgeSearchPage.html` | visible | yes | card / field / action / status language | behavior preserved |
| ナレッジ検索 | comparison multi-entity controls | mode=`比較` | `kApplyMode` | hidden | yes | shared inset field treatment | mode semantics preserved |
| ナレッジ検索 | pending / recheck / retry status | long-running AI search | `kShowPendingStatus`, `kSetBusy` | hidden | yes | shared info/warning/busy state | provider calls are not exercised in this Work |
| ナレッジ検索 | answer / evidence / citations | successful search | `kRenderResult`, `kRenderCitations` | hidden | yes | content card, inset answer, citation rows | source/citation semantics preserved |
| ナレッジ検索 | full-output preview / hard-stop / prompt preview / artifact result | `全文出力` then preview/copy/export | `kPreviewExport`, `kRenderExportPreview`, `kCopyExportPrompt`, `kRenderExportArtifact` | hidden | yes | card, preview inset, statuses, action hierarchy | provider-independent export behavior preserved |
| 記録を追加 | create form / ready / validation / success / error | navigation / submit | `Index.html`, `submitMeetingWithFiles` | visible | yes | primary card, field and status language | 12-column geometry preserved |
| 記録を追加 | new Counterparty modal | `未登録の面談先を追加` | `openCounterpartyModal` | hidden | yes | modal header, fields, actions, loading/error | authorization/focus semantics preserved |
| 記録を追加 | attachment selection / upload progress / registered-parent / retry | file select / register | `ClientPitchbookFiles.html`, `ClientPitchbookFlow.html` | partly hidden | yes | drop area, file rows, busy/warning/success | file and retry semantics preserved |
| 過去の記録 | search / loading / empty / results / error | navigation / search | `MaintenancePages.html`, `searchMeetings` | visible | yes | card, filters, table, states | Active-only behavior preserved |
| 過去の記録 | Meeting detail / body / related materials | row `詳細` | `renderMeetingDetail` | empty shell | yes | reference hero, label/value rows, content inset, actions | Work0040/0041 behavior preserved |
| 過去の記録 | Meeting editor / save busy / success / error | `記録を編集` | `openMeetingEdit`, edit submit | disabled shell | yes | editor card, field grouping, state language | optimistic version and legacy preservation unchanged |
| 過去の記録 | material picker modal / loading / empty / linking / error | `既存資料を関連付ける` | `openMeetingMaterialPicker` | hidden | yes | modal / candidate rows / states | existing relation path preserved |
| 過去の記録 | add-file attachment flow | `資料を追加` | `bindPitchbookParent`, shared attachment controller | hidden/moved | yes | same attachment primitives | same parent and retry path preserved |
| 過去の記録 | material classification editor | related row `分類を編集` | `openPitchbookEdit` | hidden/moved | yes | editor card / fields / actions / status | Document identity preserved |
| 面談先サマリー | selector loading/error / summary / cards / tables / empty | select Counterparty | `loadEntityWorkspace`, `entityWorkspaceRender` | content hidden | yes | card headers, stat cards, tables, empty states | read-only facade preserved |
| 面談先サマリー | Fund drill-down / detail | select Fund / row action | `loadEntityWorkspaceFund`, `entityWorkspaceRenderDrill` | empty | yes | inset drill card / status | read-only semantics preserved |
| 面談実績の集計 | filters / loading / success / error | navigation / 集計 | `loadActivityAnalytics` | visible | yes | card header, controls, status | analytics semantics preserved |
| 面談実績の集計 | headline / chart / breakdown / Meeting drill / monthly checkbox busy | data load / checkbox | `activityRender*`, `updateActivityAdminCheck` | empty | yes | gold chart accents, tables, stat cards, state | Work0039 autosave semantics preserved |
| マスター管理 | 4 tabs / add / rename / status / empty / success / error | tab/action | `renderMasters`, `selectMasterTab` | visible | yes | tabs, table, actions, shared states | per-tab draft ownership preserved |
| マスター管理 | option drag / insertion / saving / authoritative refresh / rollback | handle pointer/drag | Work0042 client implementation | absent | yes after implementation | handle, floating row, insertion line, busy/error | existing `OPTION_REORDER` / `Option_Order` only |
| 管理者ページ | AI provider panel / loading / disabled / success / warning / error | navigation / provider actions | `AiProviderSettingsPage.html`, `loadAiProviderAdminData` | visible | yes | default tabpanel, nested cards, state language | provider behavior and credentials unchanged |
| 管理者ページ | deleted records filter / empty / loading / restore / error | second tab / search / restore | `searchAdminDeletedMeetings`, `restoreAdminDeletedMeeting` | visible pre-Work0042 | yes | second tabpanel, table and state language | Work0041 restore semantics preserved |
| Shared | info / success / warning / error / disabled / busy | async actions across pages | `showStatus`, `.status`, `[aria-busy]` | conditional | yes | shared gold/green/amber/red state tokens | message and state logic preserved |
| Shared | backend-only Meeting/Pitchbook fields | internal compatibility | `Index.html`, `MaintenancePages.html` | hidden | no | remain hidden | capital type, legacy follow-up, raw relation selectors are compatibility-only |
| ナレッジ検索 | route/provider, Counterparty Type, capital/fund/follow-up/Meeting Type and Thinking controls | internal policy | `KnowledgeSearchPage.html` hidden groups | hidden | no | remain hidden | provider/policy/backend-only controls |
| Compatibility | standalone Pitchbook maintenance / Relationship Explorer nav | legacy compatibility | `page-pitchbook-past`, `page-relationship-explorer`, `showPage` redirect | hidden / no normal nav | no | no new exposure; shared style applies if embedded editor is moved into detail | normal IA intentionally excludes them |
| Operator | deployment security confirmation page | unlinked direct operator route | `DeploymentSecurityOperator.html` | not in normal app | authorized operator only | out of Work0042 normal right-pane scope | security/operator surface remains isolated |

## Implementation

- `src/Styles.html`へright-pane専用のivory / champagne / restrained-gold tokenと、card / inset / table / status / modal / tab / detail / editor / result / drill-downの共通presentationを追加した。sidebar selectorは変更対象から除外した。
- 全7 normal pageと、操作後に現れるdetail / editor / picker / result / preview / drill-down / loading / empty / busy / success / warning / error stateへ共通languageを適用した。
- sidebarは既存visualを維持し、navigation labelだけを`マスター管理`へ変更した。
- マスター管理の`アセットクラス / 面談場所 / チーム`は、numeric Sort Order操作を撤去し、drag handle、insertion indicator、busy state、authoritative refresh、失敗時rollbackを備えたdirect reorderへ変更した。保存は既存`OPTION_REORDER` facadeだけを使用する。
- 管理者ページを`AIプロバイダ設定 / 削除記録の管理`の2 tabへ整理し、default tab、keyboard navigation、focus、tab state preservationを実装した。
- 通常UIの`Team / Asset Class / Meeting Type`を`チーム / アセットクラス / MTG種別`へ収束した。
- actual Full Output state walkで生成メタデータとpromptに旧英語labelが残ることを直接観測したため、application head `811c60858edf61147355c7a8d4a36116a1582be9`で生成表示と利用者向けsafe messageを限定修正した。stored fields、API、enum、Google Docs本文のcanonical keyは変更していない。
- deterministic bundleを再生成した。

### Changed files

- Production UI: `src/Styles.html`、全7 page/client HTMLのpresentationおよびinteraction wiring。
- Terminology repair: `src/00_Core.gs`、`src/100_MaintenanceCore.gs`、`src/150_KnowledgeSearchModels.gs`、`src/152_KnowledgeFilterContracts.gs`、`src/155_KnowledgeExportContracts.gs`、`src/164_AiProviderCore.gs`、`src/30_MeetingCore.gs`、`src/61_PitchbookValidation.gs`。
- Tests: Work0042 focused testと関連する既存UI/export tests。
- Distribution: `dist/KnowledgeShare.bundle.gs`、`dist/release-manifest.json`、`dist/INSTALL.md`。
- Evidence: `design-qa.md`、`docs/design/0042/qa-evidence/**`、本report。

## Terminology residual classification

- `Team_ID`、`Meeting_Type_Codes`等: internal identifierとして維持。
- `src/30_MeetingCore.gs`の`Asset Class:` / `Team:` / `Meeting Type:`: 既存Google Docs原本のcanonical本文contractとして維持。既存Docs本文を表示上の都合でrewriteしない。
- `src/100_MaintenanceCore.gs`の`values['Asset Class']`: canonical Docs本文readback keyとして維持。
- current application headのFull Output生成メタデータ、prompt、safe error message: `アセットクラス / チーム / MTG種別`へ修正済み。
- served version22: Full Output生成メタデータに旧英語labelが残ることをactual runtimeで観測。後述のdeployment budgetにより修正版は未配備。

## Validation

### Logic / deterministic

- initial focused tests: `38/38 PASS`。
- runtime defect repair focused tests: `35/35 PASS`。
- `npm run check`: `597/597 PASS`。
- canonical bundle regeneration: PASS（1,213,741 bytes / 19,294 lines）。
- `npm run check:bundle`: `30/30 PASS`。
- `git diff --check`: PASS。
- local synthetic browser state walk: 2560 / 1440 / 1280 / 390、全7 pageと代表dynamic stateを確認、material console error/warn 0。
- Design QA: PASS。P0 / P1 / P2 = 0。代表evidenceは`docs/design/0042/qa-evidence/`。

### Target-runtime preflight / deployment

- same existing Apps Script target: confirmed。
- baseline served version: 21。
- source sync: 1。
- immutable version create: 1（version22）。
- same existing WEB_APP deployment update: 1。
- authoritative metadata: same deployment identity / `WEB_APP` / `USER_DEPLOYING` / `MYSELF` / versioned `/exec` / version22。
- source parity: saved source = immutable version22 = application commit `420b871bbe60315092517421350da5b871ed1f2e`。
- new target 0 / second deployment 0 / permission broadening 0 / public exposure 0。

### Actual owner-only runtime state walk（served version22）

- normal navigation: 2560 / 1440 / 1280 / 390の各viewportで7/7 nonblank。
- 記録を追加: form、status、responsive layout、attachment、Counterparty modalを確認。server record/file mutation 0。
- 過去の記録: synthetic recordのdetail / editor、existing-material picker modal、loading/resultを確認。保存・link mutation 0。
- 面談先サマリー: synthetic Counterparty summaryとFund drill-downを確認。
- 面談実績の集計: result / chart / Meeting drill / inline checkbox surfaceを確認。checkbox mutation 0。
- マスター管理: 4 tabを確認。`アセットクラス / 面談場所 / チーム`でdrag、insertion、busy、既存`OPTION_REORDER`保存、authoritative refresh、reload保持を確認し、同じ経路で元順序へ復元した。
- 管理者ページ: default provider tabと削除記録tabを確認。provider設定mutation / restore mutation 0。
- provider-independent Full Output: synthetic Meeting 6件を1 bounded passで生成し、provider call 0を確認。このstateで生成メタデータに旧`Asset Class / Team / Meeting Type`が残るmaterial presentation defectを直接観測した。
- browser console material error/warn: 0。
- horizontal overflow: 2560 / 1440 / 1280 / 390で0。

### Strategy Reset / unserved repair

Full Output defectはapplication head `811c60858edf61147355c7a8d4a36116a1582be9`で最小修正し、全deterministic gateを再PASSした。ただしcontractのimmutable version create 1回 / deployment update 1回をversion22作成時に消費済みである。追加versionまたはdeployment updateを独断で実行せず、修正版のtarget-runtime qualificationは`NOT RUN`とした。

historical Google Docs本文に含まれる旧英語keyはauthoritative business contentであり、今回のpresentation repairのためにmutationしていない。

## Shared Knowledge

- `KNOWLEDGE_RETRIEVAL`: RULE-0001, RULE-0002, PAT-0004
- `KNOWLEDGE_APPLIED`: RULE-0001, RULE-0002, PAT-0004
- `NEW_KNOWLEDGE_CANDIDATE`: NONE

## Final state

- `APPLICATION_HEAD`: `811c60858edf61147355c7a8d4a36116a1582be9`
- `SERVED_VERSION`: 22（application commit `420b871bbe60315092517421350da5b871ed1f2e`）
- `LOGIC_VALIDATION`: PASS（597/597、bundle 30/30）
- `TARGET_RUNTIME_QUALIFICATION`: PARTIAL / FAIL（design/state walkはPASS、Full Output生成metadataのterminology defectをversion22で直接観測。修正版は未配備）
- `SIDE_EFFECT_STATE`: provider calls 0 / AI sync unchanged / confidential data 0 / physical delete 0 / real business record mutation 0
- `DEPLOYMENT_MUTATIONS`: source sync 1 / immutable version 1 / same deployment update 1 / new target 0 / second deployment 0
- `BLOCKER`: `REPAIRED_TERMINOLOGY_NOT_SERVED` — contract上のimmutable version / deployment update budgetを消費済みのため、修正版のactual runtime evidenceが未取得。
- `READY_FOR_CHATGPT_FINAL_REVIEW`: NO
