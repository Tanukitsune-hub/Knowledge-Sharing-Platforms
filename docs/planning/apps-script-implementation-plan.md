# Apps Script-first Implementation Plan

Work ID: 0003

Date: 2026-08-16

Status: Accepted implementation plan

## 1. Goal

採用済みKnowledge Sharing Platforms設計を、Apps Script中心の最短・単純な実装経路で完成させる。

開発全体はChatGPTが所有し、GitHub上の設計、scope、Work ID、handoff、review、completionを管理する。Codexは非自明なApps Script実装、local test、実機検証、runtime debugging等、ChatGPTだけでは安全に完了できない残作業へ限定して使用する。

本番利用者 / 管理者にNode.js、clasp、外部server等を要求せず、通常導入はApps Script / Google Workspaceで完結させる。

## 2. Target runtime

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

## 3. Responsibility model

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
- Google Workspace / Gemini API runtime validation
- code + runtime debugging

### Model routing

- Default: Luna Max — bounded implementation, tests, routine debugging / verification
- Sol High — unresolved cross-cutting Gemini / permission / runtime diagnosis where architecture-level reasoning is materially useful
- Sol Max — only exceptional hard-to-reverse architecture change or critical final review

Every Codex run must read applicable `AGENTS.md` first and actively use subagents according to repository policy.

## 4. Apps Script-first setup

### 4.1 Manual prerequisites

管理者の手動作業は組織 / OAuth / deployment境界に限定する。

1. organization-controlled standalone Apps Script projectを作成 / 指定
2. standard Google Cloud projectを紐付け
3. Advanced Drive Service / Drive APIを有効化
4. Shared Drive上のknowledge parent folderを用意
5. backend / auditを置く管理者専用control folderを用意し、Drive共有をRestrictedにする
6. 初回OAuth consent
7. Web App deploymentを作成し、許可された利用者へ公開
8. Gemini phase開始時に会社承認済みGemini API / Google Cloud環境とcredentialを設定

初期構成はWeb Appをデプロイ主体として実行し、backend権限をアプリ側へ集約する方式を第一選択とする。実利用者emailを取得できることは本番条件にしない。

### 4.2 Bootstrap configuration

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

### 4.3 Setup entry points

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

### 4.4 Setup safety

- stored resource IDを優先する。
- IDがない場合だけconfigured parent内をexact nameで検索する。
- duplicate candidateが複数ある場合は推測で選ばずfailureにする。
- `SCHEMA_VERSION`によるforward migrationを使う。
- seedはstable IDでupsertする。
- triggerはhandler + typeでdeduplicateする。
- generic production reset / destructive teardownを提供しない。

## 5. Resource topology

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

## 6. Actor / audit model

Audit Actorはbest-effortとする。

1. emailを安全に取得できる場合: email
2. email不可、temporary active user key可: `TEMP_USER:<key>`
3. どちらも不可: `UNIDENTIFIED`

恒久的本人識別ができないことはrelease blockerではない。

監査の目的はoperation trace / change history / failure investigationであり、strict non-repudiationではない。

詳細: `docs/decisions/audit-access-and-user-attribution.md`

## 7. Upload policy

初期上限:

```text
25MB / file
10 files / selection
100MB / selection total
```

- client / server両方で同じ上限を検証する。
- file-granularに処理する。
- 100MB/file専用chunk uploadやCloud fallbackは初期実装に含めない。
- 25MBでもApps Script実機上限が確認された場合は、architecture追加より上限引下げを優先する。

詳細: `docs/decisions/pitchbook-upload-limits.md`

## 8. Runtime source strategy

- Apps Script V8 compatible plain JavaScript
- `.gs / .html / appsscript.json`をGitHubで管理
- TypeScript / bundler / frameworkをruntime必須にしない
- Advanced Drive Serviceと必要最小限OAuth scopeをmanifestで管理
- Apps Script service依存を薄いadapterへ分離する
- pure logicは軽量local testで検証可能にする
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

## 9. Environment strategy

- DEV / PRODは別Apps Script project、deployment、Shared Drive resources、backend / audit Spreadsheetを使う。
- DEVは匿名化 / 合成データのみ。
- PRODへ実データを投入する前にphase qualificationを完了する。
- production credential / resource IDをGitHubへ保存しない。

## 10. Implementation sequence

### Work 0004 — Apps Script scaffold and idempotent setup

Route: Codex implementation after ChatGPT handoff
Recommended model: Luna Max

Outcome:

- Apps Script scaffold / manifest
- bootstrap config contract
- `setupKnowledgePlatform / validateInstallation / getInstallationStatus`
- folder / backend / audit / 5-sheet creation-reuse
- schema / Master seed / trigger registry
- structured setup report
- local tests for schema, filename normalization, seed upsert, trigger deduplication

Acceptance:

- empty DEV environmentでsetupが完了
- 2回目setupでduplicateなし
- duplicate / inaccessible resourceは明示failure
- restricted control folderへbackend / auditを配置
- secrets / real dataをGitHubへ保存しない

### Work 0005 — Meeting vertical slice

Recommended model: Luna Max

Outcome:

- Web App shell / navigation
- Meeting registration
- shared browser context
- Google Docs generation
- Meeting_Index
- stable Meeting ID / deterministic filename
- 24h draft retention
- audit event

Acceptance:

- Date / GP / Asset Classだけで登録可能
- optional fields / line breaksをDocsへ反映
- Meeting bodyをIndexへduplicateしない
- failure時にdraftを失わない
- Actor取得不能でも登録をblockしない

### Work 0006 — Pitchbook vertical slice

Recommended model: Luna Max

Outcome:

- drag & drop / multiple files
- 25MB/file, 10 files, 100MB total validation
- Batch ID / Document ID / sequence
- Drive save / rename
- Pitchbook_Index
- file-granular status / retry
- audit event

Acceptance:

- UI / server upload limits一致
- 1 file failureで成功fileをrollbackしない
- retryでduplicate Drive file / Index rowを作らない

### Work 0007 — Maintenance, concurrency, masters, Phase 1 qualification

Recommended model: Luna Max

Outcome:

- Meeting / Pitchbook past-record search
- edit / Active / Inactive / Reactivate
- GP / Option Master management
- optimistic locking / short LockService sections
- Audit Spreadsheet restricted-access validation
- best-effort Actor diagnostics
- Phase 1 integration matrix

Acceptance:

- stable IDs / Drive File IDs維持
- stale Meeting save拒否
- Master changes audited
- Actorがemail / temp key / UNIDENTIFIEDのいずれでもoperation継続可能
- Audit Spreadsheetが通常利用者から直接閲覧できない
- Phase 1 primary workflow end-to-end PASS

### Work 0008 — Gemini File Search thin slice + 自由質問

Recommended model: Luna Max; unresolved cross-cutting Gemini/API issue only Sol High

Outcome:

- credential provider boundary
- File Search Store create / reuse
- Meeting text + small TXT indexing
- AI status fields
- metadata filter
- `自由質問`
- citation / Drive link mapping
- AI query audit

Acceptance:

- synthetic source: index → question → grounded answer → citation → Drive mapping
- Inactive sourceが通常retrievalへ出ない
- AI indexing failureでauthoritative saveをrollbackしない
- answer / retrieved chunksをauditへ複製しない

### Work 0009 — AI sync + six formats + EML

Recommended model: Luna Max; unresolved quota/runtime root cause only Sol High

Outcome:

- 15-minute worker
- Pending / retryable Failed handling
- idempotent re-index / delete / reactivate
- `.pdf / .pptx / .xlsx / .docx / .txt / .eml`
- EML header / body normalization
- accepted <=25MB Apps Script source path qualification

Acceptance:

- six source paths observed
- EML attachments are not automatically indexed
- accepted file path works at practical limit
- AI outage does not break source registration

### Work 0010 — Four presets + production qualification

Recommended model: Luna Max; final Sol High review only if material risk remains

Outcome:

- `要約 / 時系列 / 比較 / 面談準備`
- one shared retrieval / citation layer
- mode-specific prompt / output templates
- final permissions / credential / audit / retention / error review
- deployment / operator docs
- production setup checklist

Acceptance:

- all five modes use same retrieval path
- insufficient evidence is surfaced instead of invented
- citations / Drive links correct
- common-access model works for authorized Web App users
- no BLOCKER remains for approved production deployment

## 11. Validation strategy

### Development

- pure unit tests first
- schema / config / filename / ID / filter / retry / audit-redaction tests
- targeted DEV smoke tests
- affected cases + representative regression
- local validation before hosted CI

### Phase 1 qualification

- setup idempotency
- Meeting / Pitchbook registration / update
- 25MB/file / 10 files / 100MB total validation
- stable IDs / sequence
- partial failure / retry
- concurrency
- Master permissions
- audit writes / restricted access
- best-effort Actor fallback

### Phase 2 qualification

- source-to-index consistency
- six formats / EML normalization
- 15-minute worker
- metadata filter / semantic retrieval
- re-index / Inactive / Reactivate
- <=25MB practical source path
- free question + four presets
- citation / Drive link correctness
- AI query audit
- AI outage isolation

## 12. Genuine implementation choices

Remaining choices are limited to:

- concrete Gemini Flash model ID
- organization-approved production credential storage / provider
- retry batch size / backoff / rate-limit / cost guardrail values
- comparison mode multi-select UI need

The following are no longer open decisions:

- actual-user email is not mandatory
- Web App internal Audit Viewer is not required initially
- Audit Spreadsheet is separate and Drive-restricted
- upload limit is 25MB/file, 10 files, 100MB total
- 100MB/file transport / Cloud fallback is not initial scope

## 13. Stop / escalation conditions

Stop only when:

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

## 14. Completion condition

Implementation is done when primary user workflows work end-to-end, critical phase checks pass, confidential data / credentials are handled safely, Audit Spreadsheet is restricted, citations return to correct Drive sources, AI failure cannot corrupt authoritative records, and no BLOCKER remains.

Work ID: 0003
