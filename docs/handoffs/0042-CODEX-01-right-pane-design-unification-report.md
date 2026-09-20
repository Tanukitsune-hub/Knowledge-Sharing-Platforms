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

実装後に更新する。

## Validation

実装後に更新する。

## Shared Knowledge

- `KNOWLEDGE_RETRIEVAL`: RULE-0001, RULE-0002, PAT-0004
- `KNOWLEDGE_APPLIED`: RULE-0001, RULE-0002, PAT-0004
- `NEW_KNOWLEDGE_CANDIDATE`: NONE

## Final state

- `LOGIC_VALIDATION`: NOT RUN
- `TARGET_RUNTIME_QUALIFICATION`: NOT RUN
- `SIDE_EFFECT_STATE`: provider calls 0 / confidential data 0 / physical delete 0
- `BLOCKER`: PENDING
- `READY_FOR_CHATGPT_FINAL_REVIEW`: NO

