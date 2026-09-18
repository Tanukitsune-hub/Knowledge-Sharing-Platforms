# CODEX-01 — Counterparty Master schema8 transition report

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
MODE: BUILD

## Work Contract

- Primary outcome: GP専用entity classを廃止し、全Meeting/Material主体を`Counterparty_Master`とgeneric `CP-*`へ統合する。
- Evidence hierarchy: authoritative Sheets/Drive + actual owner-only Web App、exact served parity、deterministic production-source tests、mock/inferenceの順。
- Target/runtime: Work 0028から継続する同一isolated target / same single owner-only deployment。
- Test data: synthetic only。
- Side effects: provider0、AI sync disabled、機密0、physical delete0、permission broadening0。
- Budget: 最大3 coherent cycles、source sync4、immutable version/update3、migration initial1 + idempotency rerun1。
- Reset: target実データがmigration仮説と矛盾、同repair approachがruntimeで2回失敗、stable ID/data preservationを満たせない場合。

## Source-wide GP dependency inventory（source mutation前）

latest `origin/main` `df660e4a2e527c6584a3b4c0ccd45ed0897c6f63`で、`GP_Master|GP_ID|GP_Name|Related_GP_IDs|gpId|relatedGp|GP:|GP Workspace|GPサマリー`をsource/test/current docs全体から検索した。分類は以下。

| Area | 主なfiles / dependency | 分類 | schema8 action |
|---|---|---|---|
| sheet/schema | `00_Core.gs`, `10_Setup.gs`, `20_LiveEnvironment.gs` | REPLACE_NOW | schema8、`Counterparty_Master`、CP seeds、rename/reshape、explicit migration |
| setup/migration | `10_Setup.gs`, setup fake/live adapters | REPLACE_NOW | GP rows + non-GP optionsをprovenance付きCPへ移行、Meeting/Pitchbook references rewrite、rerun duplicate0 |
| Meeting | `30_MeetingCore.gs`, `40_MeetingService.gs`, `Index.html`, `ClientCore.html` | REPLACE_NOW | single counterparty selector、typeはattribute、関連GP UI/normal write除去、same-ID material choices |
| Material/Pitchbook | `61`, `62`, `70`–`84`, client attachment flow | REPLACE_NOW | Counterparty_IDをreservation/fingerprint/namingの正本にし、parentからCP継承 |
| maintenance/master | `100`, `110`–`121`, `MaintenancePages.html`, `ClientMaintenance*` | REPLACE_NOW | 面談先master CRUD、generic CP search/edit、type filter、legacy fields非依存 |
| Search/export | `131`, `132`, `140`–`164`, `181`, `182`, Knowledge Search UI | REPLACE_NOW | `COUNTERPARTY:CP-*`、counterparty/type filter、Related GP business line/filter除去 |
| summary/workspace | `125_GpWorkspaceService.gs`, `129_EntityWorkspaceService.gs`, `GpWorkspace*`, `EntityWorkspace*` | REPLACE_NOW | GP parallel workspaceをnormal nav/sourceから外し、面談先サマリーへ統合 |
| analytics | `126_ActivityAnalyticsService.gs`, Activity UI | REPLACE_NOW | counterparty / Counterparty Type dimensionsへ統一、relatedGp filter/dimension除去 |
| relationship explorer | `128_RelationshipExplorerService.gs`, Relationship UI | REPLACE_NOW | Meeting/Pitchbook双方をCounterparty_IDで表示/filter、Related GP表示除去 |
| bundle/public surface | bundle order/generator、`90_WebApp.gs`, validators | REPLACE_NOW | source inventory/parity/securityを維持してcanonical regeneration |
| persistent legacy columns | `Meeting_Index.GP_ID`, `Related_GP_IDs`, legacy `Counterparty_Type`; `Pitchbook_Index.GP_ID`, `Related_GP_IDs` | LEGACY_COMPATIBILITY | physical deleteせずmigration/read fallback専用。new writes/normal readsは非依存 |
| provenance source rows | Option_Master `COUNTERPARTY_*` rows、renamed sheetのlegacy GP columns | LEGACY_COMPATIBILITY | 削除せずprovenanceとして保持。normal catalogから除外 |
| Audit historical fields | `GP_Filter`と過去metadata | LEGACY_COMPATIBILITY | historical evidenceを保持。new requestsはgeneric counterparty中心 |
| old work reports/plans | Work0014–0028のhandoffs、historical planning/docs/tests fixtures | HISTORICAL_INACTIVE | 履歴は書換えず、current durable docsだけ更新 |
| labels/names | safe error default、current architecture/product/AGENTS wording、GP Workspace labels | LABEL_ONLY | 面談先へ改称またはnormal navigationから除去。identifier compatibilityは必要範囲のみ保持 |

Inventoryから、storageだけのrenameでは不足し、storage→Meeting→Material→Search/Export→Master/Summaryまで同じvertical sliceで切り替える方針を確定した。以後のnormal product sourceはCounterparty Masterを正本とし、GP固有tokenはschema7 migration/legacy readbackまたはhistorical testsに限定する。

## Implementation / validation / runtime

### Implementation outcome

- schemaを`7`から`8`へ更新し、exact five Backend sheetsを`Counterparty_Master`, `Option_Master`, `Meeting_Index`, `Pitchbook_Index`, `Settings`へ確定した。
- `src/06_CounterpartyMigration.gs`にschema7 -> schema8のidempotent migrationを実装した。旧`GP_Master` 30件と旧non-GP option 1件をprovenance付きgeneric `CP-*`へ移行し、Meeting/Pitchbook referenceを同じmappingでrewriteする。name inferenceは使用しない。
- seed ID rangeを予約し、既存migration IDと将来seedが衝突しないようにした。migration再実行はsame CP IDs / duplicate0 / extra mutation0。
- Meetingのprimary selectorを単一`面談先`へ統合し、new writeの`GP_ID` / `Related_GP_IDs`依存を除去した。GPは`Counterparty_Type = GP`としてのみ扱う。
- Material/Pitchbookのreservation、fingerprint、filename、metadata、search/editを`Counterparty_ID`中心へ変更した。parent-bound資料はauthoritative parent MeetingのCPを継承する。
- Search、Meeting-only Full Output、Relationship Explorer、Activity Analytics、面談先サマリーをCounterparty中心へ統一し、normal user-facing `関連GP`と独立GP Workspaceを除去した。
- `src/`を正本としてbundle/manifestをcanonical regenerationした。generated bundleを手編集していない。
- current architecture/product/plan/AGENTS wordingをschema8 Counterparty contractへ更新した。historical Work recordsは書換えていない。

Final served application sourceはimplementation commit `0774b30f3521b840a74a5e0fcffe5fef389662f8`と一致する。report-only final commitはapplication source/bundleを変更しない。

### Deterministic validation

| Gate | Result |
|---|---|
| focused Meeting/Material/maintenance tests | `65/65 PASS` |
| `npm run check` | `519/519 PASS` |
| `npm run check:bundle` | `30/30 PASS` |
| Apps Script inventory | `60` GS / `22` HTML / manifest validated |
| public facade inventory | normal `31` / guarded operator `3` / private `795` |
| bundle parity | modular source / bundle public surface and embedded resources PASS |
| `git diff --check` | PASS |

Provider transport testsはlocal deterministic executionであり、live provider callではない。Direct OpenAI / Gemini / Azure OpenAI callはすべて`0`。

### Migration and deployment

Read-only pre-migration baseline:

- same existing isolated target / same single owner-only `WEB_APP`
- schema `7`
- exact five sheets: `GP_Master`, `Option_Master`, `Meeting_Index`, `Pitchbook_Index`, `Settings`
- legacy GP rows `30`、legacy non-GP option rows `1`、Meeting `3`、Pitchbook `2`
- AI sync `FALSE`、trigger `0`
- baseline Meeting ID / Document ID / Drive File ID / Docsをprivate evidenceとして固定

Execution/readback:

- source/manifest sync `1`
- initial installer/migration `1`
- installer/migration idempotency rerun `1`
- immutable version `1`件（current version `6`）
- same existing deployment update `1`
- new target `0`、second deployment `0`
- authoritative deployment metadata: `WEB_APP / USER_DEPLOYING / MYSELF`
- saved source / immutable version / served deployment parity: exact match
- post-migration: schema `8`、exact five sheets、`Counterparty_Master` present、`GP_Master` absent、AI sync `FALSE`
- legacy GP migration `30/30`、legacy non-GP migration `1/1`、generic CP duplicate `0`、unresolved Meeting/Pitchbook reference `0`
- baseline Meeting ID / Document ID / File ID / Docs IDはすべてpreserved
- idempotency rerun前後でsheet/row/CP ID/resource stateは同一、duplicate delta `0`

### Actual owner-only Web App qualification

| Gate | Result | Direct evidence |
|---|---|---|
| R1 | PASS | schema8、exactly5、`Counterparty_Master` present、`GP_Master` absent、AI disabled |
| R2 | PASS | legacy GP `30/30` + non-GP `1/1`、stable generic CP mapping、rerun duplicate0、unresolved ref0 |
| R3 | PASS | normal UIの同じ単一selectorでsynthetic GP typeとOTHER typeのMeetingを各1件作成。new rowsはgeneric CPでlegacy GP fields blank |
| R4 | PASS | 両Meetingをsearch/detail/readbackし、`面談先`とtype attributeを確認。Fund/Strategy edit後Version `2`、user-facing `関連GP`なし |
| R5 | PASS | actual UIでOTHER parent Meetingへsynthetic TXTを追加し、parent CP継承、new stable Document/File identity、Pitchbook activeをauthoritative readback。deployed Counterparty catalogはgeneric GP/OTHER CPを含み、standalone classification/edit production pathはstable Document/File IDを保つdeterministic testでPASS。accepted record-centric architectureに従いstandalone file-only create routeは追加していない |
| R6 | PASS | same Document IDをrelation-only unlink -> readback -> relink。解除中もPitchbook `Active`、File ID、parent/CP contextを維持。最終relation ID setを復元し、Meeting Docs bodyは前後byte-level exact equality。Date/Time readback維持、physical delete0 |
| R7 | PASS | generic Counterparty searchで両synthetic Meetingを確認。OTHER CounterpartyのMeeting-only non-AI Full OutputはMeeting `3`件 / `931`文字、Related GP business lineなし、provider calls0 |
| R8 | PASS | 面談先マスター/サマリーは32 entities（GP type `31` / OTHER `1`）。AnalyticsはMeeting `5` / Active `5` / Counterparty `3`、type breakdown OTHER `3` / GP `2`。GP専用primary experienceなし |
| R9 | PASS | same single owner-only deployment、permission broadening0、AI sync disabled、provider credential/store状態は未設定、trigger0、confidential0、physical delete0 |
| R10 | PASS | final saved/immutable/served source parity exact、same target、same deployment、version6、canonical logic/bundle gates PASS |

R5のstandalone evidenceは、既存のaccepted single-record UI contractを変更しないよう、deployed catalog readbackとproduction-source service mutation testを組み合わせた。standalone file-only create UIを実行したという主張はしていない。

### Final state / side effects

```text
R1_R10: PASS
TARGET_SCHEMA: 8
BACKEND_SHEETS: EXACTLY_5
PRIMARY_MASTER: Counterparty_Master
GENERIC_ID: CP-*
GP_ROLE: Counterparty_Type only
LOGIC_VALIDATION: PASS (519/519)
BUNDLE_VALIDATION: PASS (30/30)
TARGET_RUNTIME_QUALIFICATION: PASS
SOURCE_SYNCS: 1
IMMUTABLE_VERSIONS: 1
DEPLOYMENT_UPDATES: 1
COHERENT_CYCLES: 1/3
PROVIDER_CALLS: 0
AI_SYNC: DISABLED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
PERMISSION_BROADENING: 0
NEW_TARGET: 0
SECOND_DEPLOYMENT: 0
WORK_0030: DEFERRED_BY_USER
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

Draft PR: `#53`。mergeしていない。final review / merge / Work Completion LatchはChatGPTへ返す。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0004, OBS-0016
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004, OBS-0016
NEW_KNOWLEDGE_CANDIDATE: YES

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
