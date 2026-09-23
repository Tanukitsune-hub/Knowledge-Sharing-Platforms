# Work 0058 — visible brand migration inventory

Status: INVESTIGATION / ChatGPT final review待ち
基準: `origin/main` `df807e2833bca5c61b14ec582c2feff88bc63d0f`（2026-09-23取得）
対象: 現行`src/`、配布・導入経路、現行operator文書、ローカルUIツール。実runtimeの名称や設定は読み取っていない。

## 結論と分類規則

通常Web Appのbrandとbrowser titleは既に`Private Assets Intelligence`。現行`src/*.html`に旧product名の表示文言はない。今回の調査で、既存Drive / Spreadsheet / backup resourceの名称を安全な一括rename対象とは判定できなかった。保存済みIDを使う通常経路があっても、installerのID欠落時の回復経路は親・名称完全一致・MIMEで探す。表示名の変更は回復・重複防止・backup所有判定へ波及する。

以下では、各項目を主たる面で一つの分類に置く。`変更候補`は次のBUILDの検討範囲を示し、このWorkでの変更許可や実行を意味しない。operatorに見えるidentifierも、実行・配布contractであれば変更候補から外す。

| 分類 | 判定 |
|---|---|
| `USER_VISIBLE` | 通常Web App、browser title、印刷・出力で利用者が見る文言 |
| `OPERATOR_VISIBLE_SAFE` | 運用者に見える説明・推奨表示名。調査したcall graphで名称参照のcontractがない範囲 |
| `OPERATOR_VISIBLE_CONTRACT` | 人に見えてもresource発見、復旧、検証、実行entrypointに使う名称 |
| `INTERNAL_CONTRACT` | API、property、schema、namespace、生成artifact名、test fixture等の機械的な契約 |
| `HISTORICAL_DOC` | 過去の設計・判断・qualificationの記録 |

## `USER_VISIBLE` — 現行表示

| 面 | 現状 | 判定・推奨表示 | 根拠 |
|---|---|---|---|
| Main Web App brand / browser title | `Private Assets Intelligence` | 変更不要 | `src/Index.html:7,14`; `src/90_WebApp.gs:23` |
| Standalone Knowledge Search title | `ナレッジ検索 \| Private Assets Intelligence` | 変更不要 | `src/KnowledgeSearch.html:7`; `src/90_WebApp.gs:15` |
| Operator security page browser title | `デプロイ設定の確認 \| Private Assets Intelligence` | 変更不要 | `src/90_WebApp.gs:7` |
| 印刷 / Knowledge Exportの表題 | Entity Workspaceは`window.print()`、Full Outputの表題は`面談記録の全文出力` | 旧product brandのrename対象なし | `src/ClientEntityWorkspace.html:106`; `src/155_KnowledgeExportContracts.gs:451,499` |

`src/*.html`に`Knowledge Share`、`Knowledge Sharing Platforms`、`PRIVATE ASSETS KNOWLEDGE`、`Knowledge Platform`、`Private Assets Knowledge`の表示literalは検出されなかった。`confirmKnowledgeShareDeploymentSecurity`等のRPC identifierは別分類とする。既存のWork0053受入れ結果は`docs/handoffs/0053-completion-report.md`にあるが、この調査ではbrowser再実行を行っていない。

## `OPERATOR_VISIBLE_SAFE` — 表示だけの候補

| 現在の名称・面 | 変更可能な範囲 / 推奨表示 | 根拠と条件 |
|---|---|---|
| `Knowledge Sharing Platforms` — `README.md:1` | READMEのproduct見出しを`Private Assets Intelligence`へ | 本文表示。GitHub repository名・path・実resource名は別contract。README全体の古いWork statusは別途鮮度確認が必要。 |
| `Knowledge Sharing Platforms` — `docs/README.md:5`、`docs/operations/runtime-policy.md:15` | 現行文書のproductを指す説明文だけ`Private Assets Intelligence`へ | 技術用語、resource名、過去の決定文言は置換しない。 |
| `Knowledge Share` — `docs/operations/company-bundle-installation.md:1,25` | guideの見出し・導入対象を指す説明文だけ`Private Assets Intelligence`へ | 同じguide内のbundle名、関数名、sheet名、resource treeはcontract。guideの古い運用記述は別途整合確認が必要。 |
| `Knowledge Share Control` — 同guide`:30,169` | **将来の新規hostに対する推奨名の文書表示**を`Private Assets Intelligence Control`等へ | bound SpreadsheetはIDと親で特定される（`src/20_LiveEnvironment.gs:347-359`）。名称は`src/15_Installer.gs:121,154`の`spreadsheetName`へ写すだけで後続参照がない。既存hostの実renameは対象外。 |
| `Knowledge Sharing Platforms` — `package.json:5` | npmの`description`だけ`Private Assets Intelligence`へ | package `name`やscript名は維持。 |
| `Knowledge Sharing Platforms` / `KNOWLEDGE SHARE` — `tools/ui-layout-lab/index.html:7,14,91`、同`README.md:3`、`layout-model.js:544` | **local-only**ツールの表示・生成handoff見出しを現brandへ | UI Layout Labはproductionから独立。出力本文の見出しであり、layout spec・JSON key・画面動作には使用しない。既存handoff成果物は書き換えない。 |
| `Private Assets Knowledge` / `Private Assets Knowledge - OpenAI` — `src/130_AiConstants.gs:55,57` | **新規作成するstoreのdisplay nameだけ**`Private Assets Intelligence` / `Private Assets Intelligence - OpenAI`候補 | Geminiは保存済み`storeName`があればIDで取得し、ない場合だけdisplay nameを作成に渡す（`src/160_AiEnvironment.gs:44-55`; `src/131_AiFileSearchContracts.gs:1-6`）。OpenAIも作成後の`OPENAI_VECTOR_STORE_ID`を保存・参照する（`src/165_AiProviderAdmin.gs:151-155,1948-1962`; `src/164_AiProviderCore.gs:627-647`）。provider-facing production defaultとtest fixtureの変更になるため、文書だけの最小BUILDからは分けて検証する。既存store、設定ID、provider resourceはrenameしない。 |

## `OPERATOR_VISIBLE_CONTRACT` — 見えても単純renameしない

| 現在の名称 | 表示される場所 | 名称依存と判定 | 推奨表示 |
|---|---|---|---|
| `Private Assets Knowledge` | authoritative Drive root | `KSP_RESOURCE_NAMES.KNOWLEDGE_ROOT`。setupのID欠落時に名称完全一致で発見・作成する | 維持 |
| `Meeting Records` | Drive folder | 上記rootの子を名称完全一致で発見・作成する | 維持 |
| `Pitchbooks` | Drive folder | 上記rootの子を名称完全一致で発見・作成する | 維持 |
| `Knowledge Exports` | derived Drive folder | 親folder直下で名称完全一致のsetup回復。Knowledge Exportは保存IDと親境界を検証する | 維持 |
| `Knowledge Platform Backups` | control folder直下のbackup folder | setup回復が名称完全一致。backup jobは保存folder IDと親境界を使う | 維持 |
| `Knowledge Platform Backend` | Backend Spreadsheet | setup回復が名称完全一致。保存IDにschema・Settings・backup sourceを結び付ける | 維持 |
| `Knowledge Platform Audit` | Audit Spreadsheet | setup回復が名称完全一致。保存IDにAudit schemaを結び付ける | 維持 |
| `Knowledge Platform Backend Backup YYYY-MM-DD` | daily snapshot名 | `kspBackendBackupOwned_`がmarker、source ID、親、MIMEと共に**完全一致の名称**を要求。同日再利用・retention対象の判定に使う | 維持 |
| `KnowledgeShare_Installation` | host Spreadsheet tab | `getSheetByName`で探し、なければ同名tabを作る。単純renameで旧名tabが再作成され得る | 維持 |
| `installKnowledgeShare` | Apps Script editor function picker / guide | installer public entrypoint →`kspRunInstaller_`。public-surface allowlistとguideに直結する | 維持 |
| `checkKnowledgeShareReadiness` | editor function picker / guide | readiness public entrypoint。allowlistとguideに直結する | 維持 |
| `confirmKnowledgeShareDeploymentSecurity` | editor function picker / guide / operator page RPC | attestation entrypoint。allowlistと`DeploymentSecurityOperator.html`のRPCに直結する | 維持 |

Drive/Spreadsheet名の定義は`src/00_Core.gs:15-22`、setup経路は`src/10_Setup.gs:118-236`、liveの完全一致Drive queryは`src/20_LiveEnvironment.gs:55-76`。保存ID経路では名称相違が`STORED_RESOURCE_RENAMED`警告で済む（`src/10_Setup.gs:173-200`）が、ID欠落時の発見・作成には旧default名が必要（同`:203-236`）。`tests/setup.test.cjs:429-505`も作成、ID保存、再利用、重複候補を固定名で検証する。backup名称判定は`src/21_BackendBackup.gs:2-16,50-86`、status tab作成は`src/15_Installer.gs:1` → `src/20_LiveEnvironment.gs:390-410`。entrypointは`src/99_EntryPoints.gs:46-58`、`scripts/public-surface.cjs:39-43`、`scripts/build-apps-script-bundle.cjs:139-146`。

## `INTERNAL_CONTRACT` — 維持

| 対象 | 理由 / 根拠 |
|---|---|
| `dist/KnowledgeShare.bundle.gs` | 配布artifact key。builder、validator、parity tests、導入手順が同名を要求（`scripts/build-apps-script-bundle.cjs:145-149`; `scripts/validate-apps-script-bundle.cjs:45-53`; `tests/bundle-generation.test.cjs:28,57`）。見た目のbrandとして改名しない。 |
| `KSP_*` / `ksp...`、`KSP_RESOURCE_KEYS` | source全体のnamespaceとID key。関数/API/RPC名、generated bundle global、source order profileを含む（`src/00_Core.gs:1-32`; `scripts/build-apps-script-bundle.cjs:95-96`; `scripts/bundle-source-order.json:3`）。 |
| Script Properties / Settings keys | `KSP_INSTALLATION_STATE_JSON`等の永続property、`BACKEND_SPREADSHEET_ID`等のSettings key、`OPENAI_VECTOR_STORE_ID`等のprovider IDは既存状態の参照contract（`src/00_Core.gs:7-12,551-567`; `src/130_AiConstants.gs:40`）。 |
| Backend / Audit sheet names・schema | `Counterparty_Master`、`Option_Master`、`Meeting_Index`、`Pitchbook_Index`、`Settings`、`Audit_Log`等はschema contract（`src/00_Core.gs:40-47,376-418`）。`KnowledgeShare_Installation`は上記operator-visible contractでもある。 |
| repository名、paths、filenames、npm `name` | `Knowledge-Sharing-Platforms`や`knowledge-sharing-platforms`はproduct表示名と別のrepository/package識別子。`package.json:2`、既存pathを維持。 |
| `Knowledge Sharing Platforms synthetic connection test...` | `src/165_AiProviderAdmin.gs:203`の一時provider test本文。`contentHash`とcitationの検証に使用され、`tests/ai-provider-admin.test.cjs:83`に同一本文fixtureがある。通常利用者のbrandではなく、provider接続試験のfixtureとして扱う。brand文言の一括置換対象外。 |
| `KSP Work 0027 temporary ...`、`KSP-OPENAI-CONNECTION-TEST` | provider qualification用の一時resource名・source ID（`src/165_AiProviderAdmin.gs:202,1096,1363`）。brandではなく試験識別子。 |

`dist/INSTALL.md:1`の生成guide見出しと`dist/release-manifest.json:2`の`product`は既に`Private Assets Intelligence`。生成物は`src/`・builderから再生成するcontractであり、手編集しない。

## `HISTORICAL_DOC` — 記録として維持

- 過去Workのhandoff、completion report、旧PR evidence、当時の決定・計画はその時点の名称・versionを示すため一括置換しない。例: `docs/handoffs/0053-completion-report.md`、`docs/planning/work0050-0053-overnight-stack.md`。
- `docs/operations/runtime-artifact-locator.md`は`LAST_RUNTIME_EVIDENCE_AT: 2026-09-05`とversion75を明示する過去snapshot。現行運用文書としてbrandだけ書き換えない。
- `docs/design/0028/selected-light-family/`の静的design referenceにある旧名称・subtitleはproduction sourceではない。過去の選定資料として維持する。
- accepted resource境界を記した`docs/decisions/shared-drive-production-root.md`、`docs/design/product-brand.md`は当時の判断と現行contractを示す。新しいBUILDが必要なら明示的な決定で改訂し、無差別に置換しない。

## 次のBUILDの最小境界

1. 第一候補は現行の説明文だけ: `README.md`、`docs/README.md`、`docs/operations/runtime-policy.md`、`docs/operations/company-bundle-installation.md`の**非contract文言**、`package.json`の`description`。hostの推奨名は新規host向け文書例に限る。guideの内容の鮮度は同時に確認する。
2. local-only UI Layout Labの表示・handoff見出しは別の小さい表示変更候補。spec、JSON key、過去のexportは維持する。
3. provider storeの**新規作成時display name**はID参照上は変更可能な候補だが、provider lifecycleのproduction source・fixtureを伴う。変更する場合は別途focused testsと明確なside-effect境界を設ける。既存storeに触れない。
4. 既存Drive / Spreadsheet / backup snapshot、installation tab、entrypoint、bundle、namespace、schema、property、repository、historical docsは今回の表面的なbrand BUILDから除外する。名称回復contractの設計変更やmigrationを先行させない。

この調査はsource/call graphによるrename安全性判断である。実runtimeに存在する各resourceの現在名を証明したものではない。実resource rename・provider call・deployment・browser qualificationは行っていない。
