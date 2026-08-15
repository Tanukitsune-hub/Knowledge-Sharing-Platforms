# Apps Script-first Implementation Plan

Work ID: 0003

## Status

Status: Accepted implementation plan

Date: 2026-08-15

本書は、採用済みプロダクト設計を実装へ移すための実行計画を定める。

開発は引き続きChatGPTが全体責任を持ち、GitHub上の設計、Work ID、scope、handoff、レビュー、完了判定を管理する。Codexは、ローカル実装、Apps Scriptコードの作成、テスト、実機依存の検証・デバッグ等、ChatGPTだけでは安全に完了できない残作業に限定して使用する。

本番runtimeはGoogle Apps Scriptを中心とし、通常の導入作業では利用者がSheets、フォルダ、トリガー、初期Masterを手作業で組み立てない。管理者がApps Scriptの初期化関数を実行することで、必要なGoogle Workspace資源を作成・検証できる構成を目標とする。

## 1. Implementation outcome

最終的に以下を満たす。

1. 組織管理下のApps Script projectからWeb Appをデプロイできる。
2. 初期化関数がShared Drive内の保管領域、backend Spreadsheet、Audit Spreadsheet、5つのbackend Sheet、Master seed、Settings、必要なtime-driven triggerを作成または再利用する。
3. 初期化関数はidempotentであり、再実行しても重複フォルダ、重複Sheet、重複seed、重複triggerを作らない。
4. Meeting、Pitchbook、Past Records、Master Management、AuditがApps Script Web App内で動く。
5. Gemini File Searchへの同期、15分worker、6形式、Citation、5モードKnowledge Searchが同じApps Script Web Appへ統合される。
6. Node.js、clasp、外部Web server、独自database等を本番利用者のセットアップ必須条件にしない。
7. 開発者は必要に応じてclaspやローカルテストを利用できるが、runtimeと本番導入手順はApps Script / Google Workspaceで完結させる。

## 2. Delivery ownership and routing

### ChatGPT owns

- project outcome、scope、design、acceptance criteria
- GitHub上のsource of truth、Work ID、handoff、Issue / PR管理
- product / architecture / runtime / security上の判断
- Codexへ渡す前の曖昧性解消
- safeなdocumentation、configuration contract、review指摘のGitHub反映
- Codex成果のdiff、report、tests、CI、実機evidenceのレビュー
- BLOCKER / FIX SOON / BACKLOG分類と完了判定

### Codex is used only for residual work requiring

- 非自明なApps Script実装
- ローカルファイル編集と複数ファイルの整合
- unit / static test harnessの実装・実行
- clasp等を使うdevelopment projectへの同期
- Apps Script / Gemini / Drive APIの実機検証
- 原因がコードとruntimeをまたぐdebugging

### Codex model routing

- Default: Luna Max
  - 既決仕様に沿う実装、test、bounded debugging、routine verification
- Escalate to Sol High only when needed
  - Apps Script identity、Shared Drive permission、Gemini File Search、100MB resumable transport等で原因不明のcross-cutting failureが残る場合
- Sol Maxは、重大でhard-to-reverseなarchitecture変更またはcritical final reviewで追加推論が結果を変え得る場合に限る。

すべてのCodex作業は、該当する`AGENTS.md`を先に読み、repository-specific subagent policyに従ってsubagentsを積極的かつ比例的に使用する。

## 3. Apps Script-first setup strategy

### 3.1 Minimal manual prerequisites

次の操作だけは組織権限、OAuth、deployment境界のため管理者が明示的に行う。

1. 組織管理下のstandalone Apps Script projectを作成または指定する。
2. standard Google Cloud projectを紐付ける。
3. Drive advanced serviceと基盤となるDrive APIを有効化する。
4. Gemini phase開始時に、会社承認済みGemini API / Google Cloud利用環境を有効化する。
5. Apps Scriptが資源を作成できるShared Drive parent folderと、管理者専用control folderを用意し、それぞれのFolder IDを取得する。
6. 初回実行時のOAuth consentを完了する。
7. Web App deploymentを作成し、対象domain / usersへ公開する。
8. execute-as方式は実利用者識別テスト後に確定する。

Shared Drive自体の作成、Google Cloud projectの組織承認、API有効化、credential発行、OAuth consent、Web App deploymentを、アプリ自身が暗黙に自動化しようとしない。

### 3.2 Bootstrap configuration

初回設定はsource codeへ組織固有IDやcredentialを埋め込まず、Apps ScriptのScript Propertiesに一時的な`BOOTSTRAP_CONFIG_JSON`を設定して行う。

初期config例:

```json
{
  "environment": "DEV",
  "knowledgeParentFolderId": "...",
  "controlFolderId": "...",
  "adminEmails": ["admin@example.com"],
  "timezone": "Asia/Tokyo",
  "aiSyncEnabled": false
}
```

- `knowledgeParentFolderId`: `Private Assets Knowledge`を作成または再利用するShared Drive上のparent folder
- `controlFolderId`: backend SpreadsheetとAudit Spreadsheetを置く管理者専用folder
- credentialはこのJSONへ入れない。
- 成功後、必要なnon-secret設定は`Settings`へ移し、bootstrap propertyは削除またはconsumed状態にする。
- backend Spreadsheetの位置を解決する最小限のIDだけをScript Propertiesへ保持できる。

### 3.3 Setup entry points

初期実装では少なくとも以下を提供する。

```text
setupKnowledgePlatform()
validateInstallation()
getInstallationStatus()
```

`setupKnowledgePlatform()`は以下を行う。

1. Script Lockを取得する。
2. bootstrap configとcaller権限を検証する。
3. `Private Assets Knowledge`、`Meeting Records`、`Pitchbooks`をexact nameで作成または再利用する。
4. control folder内にbackend Spreadsheetとadmin-only Audit Spreadsheetを作成または再利用する。
5. `GP_Master / Option_Master / Meeting_Index / Pitchbook_Index / Settings`をschema versionに従って作成またはmigrationする。
6. Master seedをstable ID付きでupsertする。
7. Settingsとresource IDsを保存する。
8. 必要なinstallable triggerを重複なく作成する。
9. installation validationを実行する。
10. created / reused / migrated / skipped / warning / failureを含むstructured reportを返す。

### 3.4 Idempotency and repair

- Setupの再実行を通常のrepair手段とする。
- 保存済みresource IDを優先し、IDがない場合だけ設定済みparent内をexact nameで検索する。
- exact nameの重複候補が複数ある場合は、推測で選ばず停止して管理者へ報告する。
- Sheet列を破壊的に再作成せず、`SCHEMA_VERSION`に基づくforward migrationを使用する。
- seedはstable IDでupsertし、表示名変更で重複行を作らない。
- triggerはhandler名とtypeを確認し、同一triggerを複数作らない。
- production用の一般的なreset / teardown機能は提供しない。
- DEV専用cleanupが必要な場合は、環境判定と明示confirmを必須とする別機能として扱う。

## 4. Resource topology

```text
Existing Shared Drive parent
└─ Private Assets Knowledge
   ├─ Meeting Records
   └─ Pitchbooks

Existing admin-only control folder
├─ Knowledge Platform Backend
│  ├─ GP_Master
│  ├─ Option_Master
│  ├─ Meeting_Index
│  ├─ Pitchbook_Index
│  └─ Settings
└─ Knowledge Platform Audit
```

- source rootにはMeeting RecordsとPitchbooks以外の運用資源を置かない。
- backend / auditは利用者向けsource rootと分離する。
- backend Sheets、Audit Spreadsheet、File Search Storeを通常利用者へ直接操作させない。

## 5. Codebase strategy

### Runtime source

- Apps Script V8 compatible plain JavaScriptを使用する。
- `.gs`と`.html`をApps Script editorへそのまま配置できる構成とする。
- 初期実装ではTypeScript transpilation、bundler、frameworkをruntime必須にしない。
- Apps Script project manifestをGitHubで管理する。
- Advanced Drive Serviceはmanifestで宣言する。
- OAuth scopeは必要最小限を明示する。

### Development tooling

- GitHub上にApps Script sourceを保持する。
- claspはCodex / developerの同期手段として使用可能だが、通常管理者のセットアップ必須条件にはしない。
- pure logicはApps Script serviceから分離し、Node標準test runner等の軽量なlocal testで検証可能にする。
- Drive、Sheets、Docs、UrlFetch、Session、Lock、Properties、Triggersは薄いadapterで包み、domain logicと分離する。
- GitHub Actionsはfinal / integration validation中心とし、開発中の反復はlocal targeted validationを優先する。
- Actions quotaやrunner障害だけを理由に作業を停止しない。

### Initial module boundaries

実際のfile名は実装時にrepository conventionsへ合わせるが、責任は最低限以下へ分ける。

```text
Web entry / HTML rendering
Setup / schema migration
Configuration / settings
Identity / authorization
Drive repository
Sheet repository
Document generation
Meeting service
Pitchbook service
Master service
Audit service
AI sync queue / worker
Gemini File Search client
Knowledge Search service / mode templates
Validation / diagnostics
```

同じ処理をMeeting、Pitchbook、5つのsearch modeごとに重複実装しない。

## 6. Environment strategy

- DEVとPRODは別のApps Script project、deployment、Shared Drive resources、backend / audit Spreadsheetを使用する。
- DEVは匿名化または合成データだけを使用する。
- PRODへ実データを入れる前にDEVでPhase 1とPhase 2のqualificationを完了する。
- 同一project内のenvironment switchでDEV / PRODを書き分ける方式を初期運用にしない。
- production credentialやresource IDをGitHubへ保存しない。

## 7. Implementation sequence

### Work 0004 — Repository scaffold and idempotent core setup

Route: Codex implementation after ChatGPT handoff

Recommended model: Luna Max

Outcome:

- Apps Script source scaffold
- manifest
- Script Properties bootstrap config contract
- `setupKnowledgePlatform / validateInstallation / getInstallationStatus`
- knowledge folders、backend / audit Spreadsheet、5 sheets、schema version、Master seeds、trigger registryの作成・再利用
- structured setup report
- local tests for schema、filename normalization、seed upsert、trigger deduplication

Acceptance:

- empty DEV environmentでsetupが完了する。
- 2回目のsetupで重複が発生しない。
- duplicate / inaccessible resourceはsilent fallbackせず明示failureになる。
- no secrets / real data in GitHub。

### Work 0005 — Meeting vertical slice

Route: Codex implementation after ChatGPT handoff

Recommended model: Luna Max

Outcome:

- Web App shell / navigation
- Meeting新規登録
- shared browser context
- Google Docs生成
- Meeting_Index登録
- deterministic filename / stable Meeting ID
- 24時間draft retention
- registration audit

Acceptance:

- 日付、GP、Asset Classだけで登録できる。
- optional fieldsと本文改行を正しくDocsへ反映する。
- Meeting bodyをIndexへ全文重複保存しない。
- failure時にdraftが消えない。

### Work 0006 — Pitchbook vertical slice

Route: Codex implementation after ChatGPT handoff

Recommended model: Luna Max

Outcome:

- drag & drop / multi-file registration
- upload prevalidation
- Batch ID / Document ID / Sequence
- Shared Drive save / rename
- Pitchbook_Index
- file-granular Pending / Active / Failed
- retry with same identity / reserved sequence
- registration / retry audit

Acceptance:

- 10 files / 500MB batch、100MB per fileのUI / server validationが一致する。
- 1ファイル失敗で成功済みファイルをrollbackしない。
- retryでduplicate Drive file / Index rowを作らない。

### Work 0007 — Maintenance, concurrency, masters, and Phase 1 qualification

Route: Codex implementation after ChatGPT handoff

Recommended model: Luna Max

Outcome:

- Meeting / Pitchbook past-record search
- edit / Active / Inactive / Reactivate
- GP / Option Master management
- optimistic locking
- LockService critical sections
- admin-only audit access
- actual-user attribution diagnostics
- DEV Phase 1 smoke / integration matrix

Acceptance:

- stable IDs / Drive File IDsを維持する。
- stale Meeting saveを拒否する。
- all Master changes are audited。
- user identityが取得できない構成をPROD-readyと判定しない。
- Phase 1のprimary workflowがend-to-endで動く。

### Work 0008 — Gemini File Search thin slice and free question

Route: Codex implementation after ChatGPT handoff

Recommended model: Luna Max; Sol High only if unresolved API / identity / permission diagnosis becomes cross-cutting

Outcome:

- credential provider boundary
- File Search Store create / reuse
- small `.txt` and Meeting text indexing
- AI status fields
- metadata filter
- `自由質問`
- citations / Drive links
- AI query audit
- indexing failure remains non-blocking to source registration

Acceptance:

- synthetic sourceをindexし、質問、citation、Drive source mappingまで動く。
- Inactive sourceが通常検索へ出ない。
- answer / retrieved chunksをauditへ複製しない。

### Work 0009 — AI synchronization, six formats, EML, and 100MB path

Route: Codex implementation after ChatGPT handoff

Recommended model: Luna Max; Sol High for unresolved 100MB / quota / runtime root-cause work

Outcome:

- 15-minute AI worker
- Pending / retryable Failed processing
- idempotent re-index / delete / reactivate
- `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- EML header / body normalization
- resumable / chunked File Search upload
- Apps Script transport qualification
- approved fallback-runtime decision only if actual validation requires it

Acceptance:

- all six paths have observed evidence。
- EML embedded attachments are not automatically indexed。
- 100MB path is validated or the narrow fallback transport is implemented and validated。
- source registration remains successful during AI outage。

### Work 0010 — Preset modes and production qualification

Route: Codex implementation and final independent review after ChatGPT handoff

Recommended model: Luna Max for implementation; Sol High for final high-value cross-check if material risk remains

Outcome:

- `要約 / 時系列 / 比較 / 面談準備`
- one shared retrieval / citation layer
- mode-specific prompt / output templates
- final permissions / identity / audit / retention / error-handling review
- deployment and operator documentation
- production setup checklist

Acceptance:

- all five modes use the same source / retrieval path。
- unsupported inference and insufficient evidence are surfaced。
- source citations and Drive links remain correct。
- no BLOCKER remains for approved production deployment。

## 8. Validation strategy

### Development validation

- pure unit tests first
- schema / config / filename / ID / filter / retry / audit-redaction tests
- targeted Apps Script DEV smoke tests for each changed workflow
- affected-case validation plus one representative regression path
- local validation before hosted CI

### Phase qualification

Phase 1 qualification:

- setup idempotency
- Meeting / Pitchbook registration and update
- stable IDs / sequence
- partial failure / retry
- concurrency
- Master permissions
- audit and user identity

Phase 2 qualification:

- File Search source-to-index consistency
- six formats and EML normalization
- 15-minute worker
- metadata filter
- re-index / Inactive / Reactivate
- 100MB transport
- free question and four presets
- citation / Drive link correctness
- AI query audit
- AI outage isolation

### Final release rule

- development中はtargeted validationを優先する。
- common source / formula / schema equivalentがfreezeした後にfull qualificationを1回行う。
- infrastructure failureとimplementation failureを分離する。
- CI unavailable alone is not a blocker。
- primary useがend-to-endで動き、critical checksがpassし、BLOCKERがなければ完了する。

## 9. Genuine implementation choices retained

以下は既決product designを変えない範囲で実装時に確定する。

- concrete Gemini Flash model ID
- production credential provider / storage mechanism
- retry batch size、backoff、rate-limit / cost guardrail values
- Apps Scriptで100MB pathが成立しない場合のapproved Google Cloud fallback runtime
- comparison modeのmulti-select UI要否
- final execute-as configuration that simultaneously satisfies backend access and actual-user attribution

これらの実機判断を理由に、Shared Drive正本、5-sheet backend、15分sync、6形式、全利用者共通Active検索、5モード等の既決事項を再オープンしない。

## 10. Stop and escalation conditions

次の場合だけ該当Workを止め、ChatGPTへscope / design escalationする。

- organization-approved permission / credentialがなくsafeな実機検証ができない。
- actual-user attributionとrequired backend accessを両立できない。
- approved Apps Script / Gemini APIではaccepted requirementを実現できない一次資料または再現可能なevidenceが得られた。
- data loss、duplicate authoritative records、confidential-data exposureのriskを除去できない。
- required changeがShared Drive / Index contractsをmaterially変更する。

非阻害のUX改善、将来のperformance optimization、optional admin convenienceは後続Workへ記録し、primary deliveryを止めない。

## 11. Official implementation references

- Apps Script Web Apps: https://developers.google.com/apps-script/guides/web
- Apps Script Advanced Services: https://developers.google.com/apps-script/guides/services/advanced
- Apps Script Drive Service / Shared Drive guidance: https://developers.google.com/apps-script/reference/drive
- Apps Script installable triggers: https://developers.google.com/apps-script/guides/triggers/installable
- Apps Script clock trigger builder: https://developers.google.com/apps-script/reference/script/clock-trigger-builder
- Apps Script quotas: https://developers.google.com/apps-script/guides/services/quotas
- Apps Script best practices: https://developers.google.com/apps-script/guides/support/best-practices
- Apps Script Cloud projects: https://developers.google.com/apps-script/guides/cloud-platform-projects
- Gemini File Search: https://ai.google.dev/gemini-api/docs/file-search

## 12. Completion condition for this plan

本計画は、各Workが独立してreviewableかつreversibleであり、Apps Script-first setup、ChatGPT / Codex責任分担、実装順序、acceptance、validation、manual boundary、escalation conditionが明確であれば完了とする。

Work ID: 0003
