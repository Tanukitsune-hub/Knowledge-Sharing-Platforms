# Apps Script-first Implementation Plan

Work ID: 0003

## Status

Status: Accepted implementation plan

Date: 2026-08-15

本書は、採用済みプロダクト設計を実装へ移すための実行計画を定める。

開発はChatGPTが全体責任を持ち、GitHub上の設計、Work ID、scope、handoff、review、completionを管理する。Codexは、非自明なApps Script実装、local test、実機検証、runtime debugging等、ChatGPTだけでは安全に完了できない残作業へ限定して使用する。

本番runtimeはGoogle Apps Scriptを中心とする。通常導入時に利用者がSheets、フォルダ、trigger、初期Masterを手作業で組み立てず、管理者がApps Scriptの初期化関数を実行することで必要なGoogle Workspace資源を作成・検証できる構成を目標とする。

## 1. Implementation outcome

最終的に以下を満たす。

1. 組織管理下のApps Script projectからWeb Appをdeployできる。
2. 初期化関数がShared Drive保管領域、backend Spreadsheet、Audit Spreadsheet、5 backend Sheets、Master seed、Settings、必要なtime-driven triggerを作成または再利用する。
3. 初期化関数はidempotentで、再実行しても重複folder、Sheet、seed、triggerを作らない。
4. Meeting、Pitchbook、Past Records、Master Management、AuditがApps Script Web App内で動く。
5. Gemini File Search同期、15分worker、6形式、Citation、5モードKnowledge Searchが同じWeb Appへ統合される。
6. Node.js、clasp、外部Web server、独自database等をproduction setupの必須条件にしない。
7. developer / Codexは必要に応じてclaspやlocal testを利用できるが、runtimeと通常導入はApps Script / Google Workspace中心で完結させる。

## 2. Delivery ownership and routing

### ChatGPT owns

- outcome、scope、design、acceptance criteria
- GitHub source of truth、Work ID、handoff、Issue / PR管理
- product / architecture / runtime / security判断
- Codexへ渡す前の曖昧性解消
- safeなdocumentation / configuration contractの更新
- Codex成果のdiff、report、tests、CI、実機evidenceのreview
- BLOCKER / FIX SOON / BACKLOG分類とcompletion判定

### Codex is used only for residual work requiring

- 非自明なApps Script実装
- 複数ファイルのlocal editing
- unit / static test harnessの実装・実行
- clasp等を使うdevelopment project同期
- Apps Script / Gemini / Drive APIの実機検証
- codeとruntimeをまたぐdebugging

### Codex model routing

- Default: Luna Max — 既決仕様に沿う実装、test、bounded debugging、routine verification
- Sol High — identity / permission / Gemini API等で原因不明のcross-cutting failureが残る場合
- Sol Max — hard-to-reverseなarchitecture変更またはcritical final reviewで追加推論が結果を変え得る場合のみ

すべてのCodex作業は、該当する`AGENTS.md`を先に読み、repository-specific subagent policyに従ってsubagentsを積極的かつ比例的に使用する。

## 3. Apps Script-first setup strategy

### 3.1 Minimal manual prerequisites

管理者の明示操作として以下だけを残す。

1. 組織管理下のstandalone Apps Script projectを作成または指定する。
2. standard Google Cloud projectを紐付ける。
3. Drive advanced serviceとDrive APIを有効化する。
4. Gemini phase開始時に会社承認済みGemini API / Google Cloud利用環境を有効化する。
5. Apps Scriptが資源を作成できるShared Drive parent folderと管理者専用control folderを用意し、それぞれのFolder IDを取得する。
6. 初回OAuth consentを完了する。
7. Web App deploymentを作成し、対象domain / usersへ公開する。
8. execute-as方式は実利用者識別test後に確定する。

Shared Drive自体の作成、Google Cloud projectの組織承認、API有効化、credential発行、OAuth consent、Web App deploymentをアプリ自身が暗黙に自動化しない。

### 3.2 Bootstrap configuration

組織固有IDやcredentialをsource codeへ埋め込まず、Script Propertiesの`BOOTSTRAP_CONFIG_JSON`から初期化する。

例:

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

credentialはこのJSONへ入れない。成功後、必要なnon-secret設定は`Settings`へ移し、bootstrap propertyは削除またはconsumed状態にする。

### 3.3 Setup entry points

初期実装では少なくとも以下を提供する。

```text
setupKnowledgePlatform()
validateInstallation()
getInstallationStatus()
```

`setupKnowledgePlatform()`は、Script Lock配下でconfig / authorityを確認し、knowledge folders、backend / audit Spreadsheet、5 sheets、schema、Master seed、Settings、triggerを作成または再利用し、最後にvalidation reportを返す。

### 3.4 Idempotency and repair

- setup再実行を通常のrepair手段とする。
- 保存済みresource IDを優先し、IDがない場合だけ設定済みparent内をexact nameで検索する。
- exact nameの重複候補が複数ある場合は推測で選ばず停止する。
- `SCHEMA_VERSION`に基づくforward migrationを使い、既存Sheetを破壊的に作り直さない。
- seedはstable IDでupsertする。
- triggerはhandler名とtypeでdeduplicateする。
- production向けgeneric reset / destructive teardownは提供しない。

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

source rootにはMeeting RecordsとPitchbooks以外の運用資源を置かず、backend / auditは分離する。

## 5. Codebase strategy

### Runtime source

- Apps Script V8 compatible plain JavaScript
- `.gs / .html / appsscript.json`をGitHubで管理
- 初期実装ではTypeScript transpilation、bundler、frameworkをruntime必須にしない
- manifestでAdvanced Drive Serviceと必要最小限scopeを管理

### Development tooling

- claspはdeveloper / Codex用の任意toolingとする。
- pure logicはApps Script service依存から分離し、軽量なlocal testで検証できるようにする。
- Drive、Sheets、Docs、UrlFetch、Session、Lock、Properties、Triggersは薄いadapterで包む。
- GitHub Actionsはfinal / integration validation中心。開発中はlocal targeted validationを優先する。

### Initial module boundaries

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

Meeting、Pitchbook、5 search modesごとに同じ処理を重複実装しない。

## 6. Environment strategy

- DEVとPRODは別Apps Script project、deployment、Shared Drive resources、backend / audit Spreadsheetを使用する。
- DEVは匿名化または合成データのみ使用する。
- PRODへ実データを入れる前にDEVでPhase qualificationを完了する。
- production credentialやresource IDをGitHubへ保存しない。

## 7. Upload policy

Pitchbook / source-material uploadは初期実装で以下を上限とする。

```text
25MB / file
10 files / selection
100MB / selection total
```

これは従来の`100MB / file、500MB / batch`を置き換える。

- client-sideとserver-sideで同じ上限を検証する。
- 複数ファイルはfile-granularに処理し、1つの巨大requestへまとめない。
- 初期実装では100MB専用chunk upload、複雑なresumable transport、upload上限維持のためのCloud fallbackを作らない。
- 25MB以内でもApps Script実機上限が観測された場合は、上限をさらに下げることを優先し、architectureを複雑化して上限を維持しない。
- 将来25MB超が実務上必要と確認された場合のみ、上限引上げを別Workで扱う。

Detailed decision: `docs/decisions/pitchbook-upload-limits.md`

## 8. Implementation sequence

### Work 0004 — Repository scaffold and idempotent core setup

Route: Codex implementation after ChatGPT handoff

Recommended model: Luna Max

Outcome:

- Apps Script source scaffold / manifest
- Script Properties bootstrap contract
- `setupKnowledgePlatform / validateInstallation / getInstallationStatus`
- knowledge folders、backend / audit Spreadsheet、5 sheets、schema version、Master seeds、trigger registry
- structured setup report
- local tests for schema、filename normalization、seed upsert、trigger deduplication

Acceptance:

- empty DEV environmentでsetupが完了する。
- 2回目setupで重複が発生しない。
- duplicate / inaccessible resourceはsilent fallbackせず明示failureになる。
- no secrets / real data in GitHub。

### Work 0005 — Meeting vertical slice

Recommended model: Luna Max

Outcome:

- Web App shell / navigation
- Meeting新規登録
- shared browser context
- Google Docs生成 / Meeting_Index登録
- deterministic filename / stable Meeting ID
- 24時間draft retention
- registration audit

Acceptance:

- 日付、GP、Asset Classだけで登録できる。
- optional fieldsと本文改行をDocsへ正しく反映する。
- Meeting bodyをIndexへ全文重複保存しない。
- failure時にdraftが消えない。

### Work 0006 — Pitchbook vertical slice

Recommended model: Luna Max

Outcome:

- drag & drop / multi-file registration
- 25MB/file、10 files、100MB total prevalidation
- Batch ID / Document ID / Sequence
- Shared Drive save / rename
- Pitchbook_Index
- file-granular Pending / Active / Failed
- retry with same identity / reserved sequence
- registration / retry audit

Acceptance:

- UI / server validationが同じupload limitsを使う。
- 1ファイル失敗で成功済みfileをrollbackしない。
- retryでduplicate Drive file / Index rowを作らない。

### Work 0007 — Maintenance, concurrency, masters, and Phase 1 qualification

Recommended model: Luna Max

Outcome:

- Meeting / Pitchbook past-record search
- edit / Active / Inactive / Reactivate
- GP / Option Master management
- optimistic locking / LockService critical sections
- admin-only audit access
- actual-user attribution diagnostics
- DEV Phase 1 smoke / integration matrix

Acceptance:

- stable IDs / Drive File IDsを維持する。
- stale Meeting saveを拒否する。
- all Master changes are audited。
- user identityを取得できない構成をPROD-readyと判定しない。
- Phase 1 primary workflowがend-to-endで動く。

### Work 0008 — Gemini File Search thin slice and free question

Recommended model: Luna Max; unresolved cross-cutting API / identity / permission diagnosis時のみSol High

Outcome:

- credential provider boundary
- File Search Store create / reuse
- small `.txt` and Meeting text indexing
- AI status fields / metadata filter
- `自由質問`
- citations / Drive links
- AI query audit
- indexing failure remains non-blocking to source registration

Acceptance:

- synthetic sourceをindexし、質問、citation、Drive mappingまで動く。
- Inactive sourceが通常検索へ出ない。
- answer / retrieved chunksをauditへ複製しない。

### Work 0009 — AI synchronization, six formats, and EML

Recommended model: Luna Max; unresolved quota / runtime root-cause workのみSol High

Outcome:

- 15-minute AI worker
- Pending / retryable Failed processing
- idempotent re-index / delete / reactivate
- `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- EML header / body normalization
- 25MB/fileまでのApps Script upload/index path qualification

Acceptance:

- all six paths have observed evidence。
- EML embedded attachments are not automatically indexed。
- accepted 25MB/file pathを実機確認する。
- source registration remains successful during AI outage。

### Work 0010 — Preset modes and production qualification

Recommended model: Luna Max for implementation; material riskが残るfinal cross-checkのみSol High

Outcome:

- `要約 / 時系列 / 比較 / 面談準備`
- one shared retrieval / citation layer
- mode-specific prompt / output templates
- permissions / identity / audit / retention / error-handling final review
- deployment / operator documentation
- production setup checklist

Acceptance:

- all five modes use the same source / retrieval path。
- unsupported inference and insufficient evidence are surfaced。
- source citations and Drive links remain correct。
- no BLOCKER remains for approved production deployment。

## 9. Validation strategy

### Development validation

- pure unit tests first
- schema / config / filename / ID / filter / retry / audit-redaction tests
- targeted Apps Script DEV smoke tests for changed workflow
- affected-case validation plus representative regression
- local validation before hosted CI

### Phase 1 qualification

- setup idempotency
- Meeting / Pitchbook registration and update
- 25MB/file / 10 files / 100MB total upload validation
- stable IDs / sequence
- partial failure / retry
- concurrency
- Master permissions
- audit / user identity

### Phase 2 qualification

- File Search source-to-index consistency
- six formats / EML normalization
- 15-minute worker
- metadata filter
- re-index / Inactive / Reactivate
- accepted 25MB/file source path
- free question and four presets
- citation / Drive link correctness
- AI query audit
- AI outage isolation

### Final release rule

開発中はtargeted validationを優先し、common source / schemaがfreezeした後にfull qualificationを1回行う。CI unavailable aloneはblockerにせず、primary useがend-to-endで動き、critical checksがpassし、BLOCKERがなければ完了する。

## 10. Genuine implementation choices retained

- concrete Gemini Flash model ID
- production credential provider / storage mechanism
- retry batch size、backoff、rate-limit / cost guardrail values
- comparison modeのmulti-select UI要否
- final execute-as configuration that satisfies backend access and actual-user attribution

100MB transportやCloud fallback runtimeは、初期のgenuine implementation choiceから外す。25MB超の実需が確認された場合のみ将来Workとして再検討する。

## 11. Stop and escalation conditions

次の場合だけ該当Workを止め、ChatGPTへscope / design escalationする。

- organization-approved permission / credentialがなくsafeな実機検証ができない。
- actual-user attributionとrequired backend accessを両立できない。
- approved Apps Script / Gemini APIではaccepted requirementを実現できない再現可能なevidenceが得られた。
- data loss、duplicate authoritative records、confidential-data exposure riskを除去できない。
- required changeがShared Drive / Index contractsをmaterially変更する。

25MB uploadが実機で成立しない場合は、まず安全なより低い上限への変更を検討し、upload上限維持だけを目的とするarchitecture追加は行わない。

## 12. Official implementation references

- Apps Script Web Apps: https://developers.google.com/apps-script/guides/web
- Apps Script Advanced Services: https://developers.google.com/apps-script/guides/services/advanced
- Apps Script Drive Service / Shared Drive guidance: https://developers.google.com/apps-script/reference/drive
- Apps Script installable triggers: https://developers.google.com/apps-script/guides/triggers/installable
- Apps Script quotas: https://developers.google.com/apps-script/guides/services/quotas
- Apps Script best practices: https://developers.google.com/apps-script/guides/support/best-practices
- Apps Script Cloud projects: https://developers.google.com/apps-script/guides/cloud-platform-projects
- Gemini File Search: https://ai.google.dev/gemini-api/docs/file-search

## 13. Completion condition for this plan

本計画は、各Workがreviewableかつreversibleであり、Apps Script-first setup、ChatGPT / Codex責任分担、implementation sequence、acceptance、validation、manual boundary、upload policy、escalation conditionが明確であれば完了とする。

Work ID: 0003
