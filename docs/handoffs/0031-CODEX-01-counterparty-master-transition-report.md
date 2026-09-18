# CODEX-01 — Counterparty Master schema8 transition report

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-01
BALL: CODEX
STATUS: IN_PROGRESS
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

実行後に追記する。

## Shared Knowledge

KNOWLEDGE_RETRIEVAL: RULE-0001, RULE-0002, PAT-0004, OBS-0016
KNOWLEDGE_APPLIED: RULE-0001, RULE-0002, PAT-0004, OBS-0016
NEW_KNOWLEDGE_CANDIDATE: PENDING

WORK_ID: 0031
DISPATCH_ID: 0031-CODEX-01
BALL: CODEX
STATUS: IN_PROGRESS
