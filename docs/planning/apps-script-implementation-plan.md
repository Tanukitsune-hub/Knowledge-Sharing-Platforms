# Apps Script-first Implementation Plan

Work ID: 0003

Date: 2026-08-16

Status: Accepted implementation plan

## 1. Goal

採用済みKnowledge Sharing Platforms設計を、Apps Script中心で機能実装を先に連続して進め、feature-complete後に実機qualificationをまとめて行う方式で完成させる。

開発全体はChatGPTが所有し、GitHub上の設計、scope、Work ID、handoff、review、completionを管理する。Codexは非自明なApps Script実装、local test、最終実機検証、runtime debugging等、ChatGPTだけでは安全に完了できない残作業へ限定して使用する。

本番利用者 / 管理者にNode.js、clasp、外部server等を要求せず、通常導入はApps Script / Google Workspaceで完結させる。

## 2. Core delivery principle

標準フローは以下とする。

```text
Design fixed
   ↓
Implement features continuously
   ↓
Local / static / mock / contract tests
   ↓
Feature complete
   ↓
Feature freeze
   ↓
Final DEV live qualification
   ↓
Fix only observed defects
   ↓
Production readiness
```

開発途中ではApps Script / Shared Drive / Geminiのlive validationを原則として行わない。

例外は、公式仕様・mock・contract testだけでは解消できず、実装継続が安全に不可能なBLOCKERがある場合の最小live probeのみとする。

Detailed decision: `docs/decisions/implementation-first-final-live-qualification.md`

## 3. Target runtime

```text
Authorized users
      |
      v
Apps Script HTML Service Web App
  ├─ Meeting: New / Past
  ├─ Pitchbook: New / Past
  ├─ Knowledge Search
  │    └─ 自由質問 / 要約 / 時系列 / 比較 / 面談準備
  └─ Master Management
      |
      v
Google Apps Script
      |
 +----+------------------------------+
 |                                   |
 v                                   v
Backend Spreadsheet             Shared Drive sources
5 sheets                        Meeting Records / Pitchbooks
                                     |
                                     v
                              Gemini File Search
                                     |
                                     v
                              Gemini Flash
                                     |
                                     v
                       grounded output + citations

Separate restricted Audit Spreadsheet
```

## 4. Responsibility model

### ChatGPT

- outcome / scope / design / acceptance
- GitHub source of truth
- Work ID / handoff / PR / Issue coordination
- implementation ambiguity resolution before Codex
- safe documentation / configuration updates
- Codex result review
- BLOCKER / FIX SOON / BACKLOG classification
- final completion judgment

### Codex

Codex is used only for residual work requiring:

- non-trivial Apps Script implementation
- multi-file local edits
- test harness and executable validation
- clasp / DEV Apps Script synchronization when useful
- final Google Workspace / Gemini API live qualification
- code + runtime debugging

### Model routing

- Default: Luna Max — bounded implementation, tests, routine debugging / verification
- Sol High — unresolved cross-cutting Gemini / permission / runtime diagnosis where architecture-level reasoning is materially useful
- Sol Max — only exceptional hard-to-reverse architecture change or critical final review

Every Codex run must read applicable `AGENTS.md` first and actively use subagents according to repository policy.

## 5. Apps Script-first setup

### 5.1 Manual prerequisites

管理者の手動作業は組織 / OAuth / deployment境界に限定する。

1. organization-controlled standalone Apps Script projectを作成 / 指定
2. standard Google Cloud projectを紐付け
3. Advanced Drive Service / Drive APIを有効化
4. Shared Drive上のknowledge parent folderを用意
5. backend / auditを置く管理者専用control folderを用意し、Drive共有をRestrictedにする
6. 初回OAuth consent
7. Web App deploymentを作成し、許可された利用者へ公開
8. Gemini phase開始時に会社承認済みGemini API / Google Cloud環境とcredentialを設定

これらは最終live qualification開始時まで原則として要求しない。開発中はコード、mock、fixture、contract testで進める。

初期構成はWeb Appをデプロイ主体として実行し、backend権限をアプリ側へ集約する方式を第一選択とする。実利用者emailを取得できることは本番条件にしない。

### 5.2 Bootstrap configuration

組織固有IDやcredentialをsource codeへ埋め込まず、Script Propertiesの`BOOTSTRAP_CONFIG_JSON`から初期化する。

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

credentialはbootstrap JSONへ入れない。

### 5.3 Setup entry points

```text
setupKnowledgePlatform()
validateInstallation()
getInstallationStatus()
```

`setupKnowledgePlatform()`は次をcreate / reuse / migrateする。

- `Private Assets Knowledge / Meeting Records / Pitchbooks`
- Backend Spreadsheet
- separate Audit Spreadsheet
- `GP_Master / Option_Master / Meeting_Index / Pitchbook_Index / Settings`
- Master seeds
- schema version / settings
- required installable triggers

Setupはidempotentとする。2回目以降をrepair / migration pathとして使えるようにする。

### 5.4 Setup safety

- stored resource IDを優先する
- IDがない場合だけconfigured parent内をexact nameで検索する
- duplicate candidateが複数ある場合は推測で選ばずfailureにする
- `SCHEMA_VERSION`によるforward migrationを使う
- seedはstable IDでupsertする
- triggerはhandler + typeでdeduplicateする
- generic production reset / destructive teardownを提供しない

## 6. Resource topology

```text
Shared Drive parent
└─ Private Assets Knowledge
   ├─ Meeting Records
   └─ Pitchbooks

Restricted admin-only control folder
├─ Knowledge Platform Backend   (Spreadsheet: 5 sheets)
└─ Knowledge Platform Audit     (separate Spreadsheet)
```

通常利用者にはbackend / Audit Spreadsheetを直接操作させない。

Audit SpreadsheetはDrive共有権限で管理者限定にする。初期版ではWeb App内Audit Viewerや独自password認証を実装しない。

## 7. Actor / audit model

Audit Actorはbest-effortとする。

1. emailを安全に取得できる場合: email
2. email不可、temporary active user key可: `TEMP_USER:<key>`
3. どちらも不可: `UNIDENTIFIED`

恒久的本人識別ができないことはrelease blockerではない。

監査の目的はoperation trace / change history / failure investigationであり、strict non-repudiationではない。

詳細: `docs/decisions/audit-access-and-user-attribution.md`

## 8. Upload policy

初期上限:

```text
25MB / file
10 files / selection
100MB / selection total
```

- client / server両方で同じ上限を検証する
- file-granularに処理する
- 100MB/file専用chunk uploadやCloud fallbackは初期実装に含めない
- 25MBでもApps Script実機上限が確認された場合は、architecture追加より上限引下げを優先する

詳細: `docs/decisions/pitchbook-upload-limits.md`

## 9. Runtime source strategy

- Apps Script V8 compatible plain JavaScript
- `.gs / .html / appsscript.json`をGitHubで管理
- TypeScript / bundler / frameworkをruntime必須にしない
- Advanced Drive Serviceと必要最小限OAuth scopeをmanifestで管理
- Apps Script service依存を薄いadapterへ分離する
- pure logicは軽量local testで検証可能にする
- external servicesはmock / fixture / contract test可能な境界に置く
- claspはdeveloper / Codex用の任意tooling
- GitHub Actionsはfinal / integration validation中心

Initial module boundaries:

```text
Web entry / HTML rendering
Setup / schema migration
Configuration / settings
Actor / authorization
Drive repository
Sheet repository
Document generation
Meeting service
Pitchbook service
Master service
Audit service
AI sync worker
Gemini File Search client
Knowledge Search service / templates
Validation / diagnostics
```

## 10. Environment strategy

- DEV / PRODは別Apps Script project、deployment、Shared Drive resources、backend / audit Spreadsheetを使う
- DEVは匿名化 / 合成データのみ
- PRODへ実データを投入する前にfinal DEV live qualificationを完了する
- production credential / resource IDをGitHubへ保存しない

## 11. Implementation sequence

### Work 0004 — Scaffold, setup engine, and local foundation

Route: Codex implementation after ChatGPT handoff
Recommended model: Luna Max

Outcome:

- Apps Script scaffold / manifest
- bootstrap config contract
- `setupKnowledgePlatform / validateInstallation / getInstallationStatus`
- folder / backend / audit / 5-sheet adapters
- schema / migration / Master seed / trigger registry logic
- structured setup report
- mockable Apps Script service adapters
- local tests for schema, migration, filename normalization, seed upsert, trigger deduplication

Acceptance:

- setup logic passes local tests against mocks / fixtures
- second-run idempotency is proven in tests
- duplicate / inaccessible resource becomes explicit failure
- secrets / real data are not stored in GitHub
- no live Apps Script deployment required for completion

### Work 0005 — Meeting feature implementation

Recommended model: Luna Max

Outcome:

- Web App shell / navigation
- Meeting registration
- shared browser context
- Google Docs generation logic
- Meeting_Index persistence logic
- stable Meeting ID / deterministic filename
- 24h draft retention
- audit event
- past Meeting search / edit / Active / Inactive / Reactivate
- optimistic-lock behavior

Acceptance:

- Date / GP / Asset Class-only registration path passes tests
- optional fields / line breaks map correctly into generated Doc representation
- Meeting body is not duplicated into Index
- draft survives modeled failure paths
- Actor failure does not block save
- stale save is rejected by Version tests
- no live Workspace write required for completion

### Work 0006 — Pitchbook feature implementation

Recommended model: Luna Max

Outcome:

- drag & drop / multiple files UI logic
- 25MB/file, 10 files, 100MB total validation
- Batch ID / Document ID / sequence
- Drive save / rename orchestration logic
- Pitchbook_Index
- file-granular status / retry
- past Pitchbook search / metadata edit / Active / Inactive / Reactivate
- audit event

Acceptance:

- UI / server upload-limit logic agrees
- sequence / context-move behavior passes tests
- one-file failure does not rollback successful files
- retry does not create duplicate modeled Drive file / Index row
- no live Drive upload required for completion

### Work 0007 — Masters, audit, concurrency, and Phase 1 code-complete

Recommended model: Luna Max

Outcome:

- GP / Option Master management
- quick-add / duplicate normalization
- LockService critical-section abstraction
- restricted Audit Spreadsheet integration logic
- best-effort Actor fallback
- five-year audit-retention cleanup logic
- Phase 1 local integration suite

Acceptance:

- Master add / rename / reorder / deactivate / reactivate passes tests
- audit payloads and redaction rules pass
- email / temp key / UNIDENTIFIED paths all work
- modeled concurrency / retry cases preserve invariants
- Phase 1 is code-complete without live deployment

### Work 0008 — Gemini File Search client, sync engine, and free question implementation

Recommended model: Luna Max

Outcome:

- credential provider boundary
- File Search Store client
- Meeting text / source indexing request mapping
- AI status fields
- metadata filter builder
- Pending / Failed / Indexed state transitions
- 15-minute worker logic
- idempotent re-index / delete / reactivate logic
- `自由質問`
- citation / Drive link mapping
- AI query audit
- mocked Gemini API fixtures / contract tests

Acceptance:

- request / response mappings pass fixture-based contract tests
- metadata filters are deterministic
- retry / re-index does not create duplicate modeled active AI Documents
- Inactive removes modeled retrieval availability
- AI failure does not rollback authoritative save
- answer / retrieved chunks are not copied into audit
- no live Gemini request required for completion

### Work 0009 — Six formats, EML, four presets, feature freeze

Recommended model: Luna Max

Outcome:

- `.pdf / .pptx / .xlsx / .docx / .txt / .eml` source handling logic
- EML Subject / From / To / Cc / Date / Body normalization
- embedded EML attachments excluded from automatic indexing
- `要約 / 時系列 / 比較 / 面談準備`
- one shared retrieval / citation path across all five modes
- mode-specific prompt / output templates
- local end-to-end integration suite with mocks / fixtures
- operator / deployment documentation draft
- feature freeze candidate

Acceptance:

- all six format paths are represented in tests / fixtures
- EML normalization passes representative cases
- five modes share the same retrieval service
- insufficient-evidence behavior is enforced in templates
- citations map to modeled source IDs / Drive links
- full local/static suite passes
- feature-complete status is reached before live qualification

### Work 0010 — Final DEV live qualification and defect remediation

Recommended model: Luna Max; use Sol High only if a material cross-cutting runtime issue remains unresolved

This is the first standard live-validation Work.

Outcome:

- create / configure DEV Apps Script / Google Workspace resources
- run `setupKnowledgePlatform()` live
- deploy DEV Web App
- Meeting end-to-end live validation
- Pitchbook end-to-end live validation and practical upload-limit confirmation
- Master / Past Records / concurrency live checks
- restricted Audit Spreadsheet check
- best-effort Actor behavior observation
- Gemini File Search Store / indexing / query live validation
- six formats / EML live path validation
- 15-minute worker / retry / re-index / Inactive / Reactivate validation
- five Knowledge Search modes
- citation / Drive link verification
- AI outage-isolation check
- fix observed defects within scope
- final operator / production setup documentation

Acceptance:

- primary workflows work end-to-end in DEV
- setup is idempotent live
- accepted practical upload limit is observed; lower it if needed rather than add architecture
- six source formats have observed evidence
- five modes use one retrieval path
- citations return to correct Drive sources
- Audit Spreadsheet remains restricted
- AI failure cannot corrupt authoritative records
- no BLOCKER remains for approved production deployment

## 12. Validation strategy

### During Works 0004–0009

Run local / static validation only by default:

- syntax / static checks
- pure unit tests
- schema / migration tests
- ID / sequence tests
- filename normalization tests
- filter / validation tests
- partial-failure / retry idempotency tests
- audit payload / redaction tests
- Actor fallback tests
- EML normalization tests
- Gemini request / response contract tests using mocks / fixtures
- UI logic tests where practical
- representative regression tests

Do not routinely:

- deploy DEV Apps Script
- write live Shared Drive / Sheets / Docs
- call Gemini File Search live
- wait for live 15-minute triggers
- run live OAuth / permission qualification

### Work 0010 final live qualification

Run one consolidated qualification cycle after feature freeze.

When a defect is found, fix it and rerun affected cases plus one representative regression. Repeat the full matrix only if a common foundation materially changes.

Hosted CI unavailability alone is not a blocker.

## 13. Genuine implementation choices

Remaining choices are limited to:

- concrete Gemini Flash model ID
- organization-approved production credential storage / provider
- retry batch size / backoff / rate-limit / cost guardrail values
- comparison mode multi-select UI need

The following are not open decisions:

- actual-user email is not mandatory
- Web App internal Audit Viewer is not required initially
- Audit Spreadsheet is separate and Drive-restricted
- upload limit is 25MB/file, 10 files, 100MB total unless final live qualification proves a lower safe limit is needed
- 100MB/file transport / Cloud fallback is not initial scope
- routine live validation is deferred until Work 0010

## 14. Stop / escalation conditions

Before Work 0010, stop only when implementation cannot safely continue because official documentation / mocks / contract tests cannot resolve a material API ambiguity.

During Work 0010, stop only when:

- approved Gemini permission / credential is unavailable for safe validation
- accepted Apps Script / Gemini design is shown infeasible by reproducible evidence
- data loss / duplicate authoritative records / confidential-data exposure cannot be prevented
- required change materially alters Shared Drive / Index contracts

Do not stop because:

- user email cannot be obtained
- temporary actor key rotates
- hosted CI is unavailable
- 25MB limit must be lowered to a safer practical value
- optional UX improvements remain

## 15. Completion condition

Implementation is done when feature-complete code has passed local/static validation, final DEV live qualification shows primary workflows working end-to-end, critical checks pass, confidential data / credentials are handled safely, Audit Spreadsheet is restricted, citations return to correct Drive sources, AI failure cannot corrupt authoritative records, and no BLOCKER remains.

Work ID: 0003
