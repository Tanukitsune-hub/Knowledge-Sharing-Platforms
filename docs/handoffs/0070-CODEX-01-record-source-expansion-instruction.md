# Work 0070 CODEX-01 — Source-aware record layer implementation

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-01
BALL: CODEX
STATUS: READY
MODE: BUILD
VALIDATION_TIER: TIER_3_HIGH

## Goal

Work0069で確定したAPI非依存record layerをproduction sourceへ実装する。

利用者が `面談メモ / 保存資料 / ニュース / 評価（ICメモ、社内整理等）` を `記録を追加` / `過去の記録` から扱えるsource implementationを完成させ、schema9 / 7-sheet migration、Drive folder contract、team concurrency、branding、distributionをdeterministic validationまで通す。

このDispatchではtarget runtimeを変更しない。Draft PRを返し、ChatGPT review後に別Dispatchでisolated target-runtime qualificationを行う。

## Read First

1. nearest `AGENTS.md`
2. `docs/planning/work0070-record-source-expansion.md`
3. `docs/planning/work0069-source-aware-knowledge-expansion-plan.md`
4. `docs/product/source-aware-knowledge-expansion.md`
5. `docs/agent-governance/work-control.md`
6. `docs/agent-governance/dispatch-control.md`
7. current source/test/distribution code directly touched by the change

恒久ルールはAGENTS.md等に従い、このinstructionへ再展開しない。

## Work-specific override

current root `AGENTS.md` の5-sheet baseline / no sixth storage layerはWork0069の明示決定でsupersedeされる。

このWorkではschema9 / exactly 7 authoritative Backend sheetsを実装してよい。

実装が成立する同一PRで、root `AGENTS.md` とcurrent architecture/product docsも7-sheet baselineへ更新する。historical evidenceは書き換えない。

## Required Scope

### A. Schema / setup / migration

- bump schema to 9.
- target authoritative Backend sheets:
  - `Counterparty_Master`
  - `Option_Master`
  - `Meeting_Index`
  - `Pitchbook_Index`
  - `News_Index`
  - `Internal_Assessment_Index`
  - `Settings`
- add News / Assessment counters.
- add resource keys/state/settings for News / Assessment folders.
- implement idempotent schema8 -> schema9 migration.
- preserve existing IDs, rows, Docs/files, relations, folder IDs, provider state.
- update backup/setup/readiness/schema assertions that assume exactly 5 sheets.
- do not add a generic eighth storage sheet.

Use the exact News/Assessment initial schemas in Work0070 plan.

### B. Drive folders

Fresh target:

```text
記録・資料
├─ 面談記録
├─ 保存資料
├─ ニュース
└─ 評価（ICメモ、社内整理等）
```

Migration:

- exact legacy names only are renamed in place by stored IDs:
  - `Private Assets Knowledge` -> `記録・資料`
  - `Meeting Records` -> `面談記録`
  - `Pitchbooks` -> `保存資料`
- manually customized names are preserved.
- News / Assessment folders are created under the authoritative root.
- no file move/copy and no duplicate source root/child creation.
- Knowledge Exports stays outside the authoritative source root.

### C. Product title

Change current user-visible product title to:

`Alternative Assets Intelligence`

Cover browser title, main header and current user-facing output/print branding where that exact product title is shown.

Do not rename `KSP_*`, `ksp...`, public/private function contracts, stable IDs, sheet tab names, bundle filenames, installer entrypoints or historical Work evidence merely for branding.

### D. Add-page 4 tabs and state

```text
面談メモ | 資料保存 | ニュース | 評価（ICメモ、社内整理等）
```

- default = 面談メモ.
- preserve current Meeting form behavior and related-material upload.
- shared fields: date / assetClassId / fundStrategy.
- keep hidden capitalTypeId internal.
- no 24h normal-input auto restore.
- use tab/session-local in-memory normal input state.
- tab switch keeps shared + each tab's unsaved specific state.
- success clears only active tab specific inputs/files; shared and other-tab drafts remain.
- global `クリア` clears normal unsaved state/files across all 4 tabs + shared fields.
- unresolved retry/unknown-outcome/partial upload prevents unsafe clear.
- Add selected tab is independent from Past selected tab.

### E. Standalone 資料保存

Refactor/reuse the existing Pitchbook flow so `Parent_Meeting_ID` is optional for standalone save while preserving current parent-bound behavior.

- same `DOC-` identity and `Pitchbook_Index`.
- same uploader contract.
- Meeting-linked Pitchbook semantics and relation-only updates must not regress.
- Past 保存資料 shows both standalone and Meeting-linked records.

Do not duplicate upload architecture.

### F. News source

Implement `NEWS-` stable ID, News service/live environment/facade, Index persistence, Drive authoritative source and lifecycle.

- DIRECT_TEXT -> Google Doc.
- UPLOAD_FILE -> one uploaded original.
- required/optional fields exactly as Work0070 plan.
- one or more Counterparties via canonical `Counterparty_IDs`.
- Active / Inactive / Reactivate.
- edit metadata; direct-text body edit updates authoritative Doc under optimistic concurrency.
- upload original bytes are immutable in initial Work.
- past search/list/detail/edit/lifecycle/restore.

### G. Assessment source

Implement `ASMT-` stable ID and the same end-to-end lifecycle with canonical Source Type `Internal Assessment`.

User-facing label everywhere in this Work:

`評価（ICメモ、社内整理等）`

Implement stable English Assessment Type codes behind Japanese labels. Do not implement Digest.

### H. Common uploader registry

Converge upload extension/MIME policy for all upload surfaces:

`.pdf / .pptx / .xlsx / .docx / .txt / .eml`

Prefer one shared server/source contract and derive browser `accept` / help / validation from it where practical.

Do not weaken MIME/size validation to achieve parity.

### I. Team concurrency / integrity

Preserve and generalize durable contracts:

- short ScriptLock sections only.
- ID allocation / reservation atomic.
- no long file/Doc work while holding global ScriptLock.
- same-record edit claim/CAS and stale-write rejection.
- server-side current-master/reference validation at commit.
- no cross-tab/browser input bleed.
- no last-write-wins.
- Audit failure does not roll back authoritative save.
- semantic duplicate new records are not auto-merged.

### J. Current docs / generated distribution

Update current non-historical docs whose baseline changes, including root `AGENTS.md`, target architecture and current product/implementation docs.

Regenerate:

- `dist/KnowledgeShare.bundle.gs`
- `dist/company-multifile/`

Keep `src/` authoritative and generated artifacts reproducible.

Target release: `0.2.0`.

## Non-Goals

Do not implement:

- Knowledge Search 4-source checkboxes
- News/Assessment provider sync or AI retrieval
- Full Output 4-source changes
- Internal Assessment Digest
- News crawler/RSS/API
- historical corpus migration
- user-level source ACL
- company production rollout
- provider credential/configuration/billing work
- unrelated visual refactor

## Authorization / Side Effects

Repository changes only in CODEX-01.

Allowed:

- source
- tests
- deterministic local/synthetic harnesses
- generated bundle/package
- current planning/architecture/AGENTS documentation
- branch / Draft PR / report

Not authorized in CODEX-01:

- Apps Script deployment
- installer/setup against any live Workspace
- Drive/Sheets mutation outside local/synthetic test doubles
- company production data
- company folder rename
- Web App access changes
- triggers
- provider calls / Store mutation / billing
- credentials
- destructive operations

If runtime evidence becomes necessary to proceed, stop and return it as the next decisive action; do not self-authorize deployment.

## Execution Strategy

This is a cross-cutting BUILD. Before editing, produce a compact implementation map of touched source modules, migration path and test surfaces in your working notes; do not create a second design process.

Implement the shortest coherent vertical order:

1. schema/resource/identity primitives
2. source services + persistence
3. Add/Past UI and state
4. concurrency/lifecycle/admin restore
5. current-doc baseline updates
6. bundle/package regeneration
7. focused -> canonical deterministic validation

Do not branch into Work B/C/D concerns.

## Required Validation — CODEX-01

TIER_3_HIGH Work, but target-runtime qualification is intentionally deferred to CODEX-02. CODEX-01 must establish deterministic logic readiness.

Required:

- focused schema8 -> schema9 migration tests
  - data/ID/resource preservation
  - exactly 7 target sheets
  - second-run idempotency
  - legacy exact folder rename rules
  - custom-name preservation
- focused stable ID/concurrency tests for NEWS/ASMT and existing MTG/DOC paths
- Meeting regression tests for create/edit/past/material relation/recovery
- standalone Pitchbook create + current parent-bound regression
- News direct/upload/edit/lifecycle/restore tests
- Assessment direct/upload/edit/lifecycle/restore tests
- multi-Entity normalization/validation tests
- 24h draft removal + shared/tab/global-clear state tests
- common uploader extension/MIME contract tests
- admin deleted-record management coverage for new sources
- synthetic client/browser checks for changed Add/Past pages at 1440px and 390px
  - tab behavior
  - long assessment label
  - no horizontal overflow
  - no material console/page errors
- concurrency harness:
  - near-simultaneous distinct creates -> unique IDs / no lost rows
  - same-record stale write -> rejected
  - cross-session state bleed -> 0
- generated bundle validation
- company 7-file package reconstruction/parity
- `npm run check` once after focused tests
- `git diff --check`

Explicitly report:

```text
LOGIC_VALIDATION
SCHEMA8_TO_9_MIGRATION
SECOND_RUN_IDEMPOTENCY
BACKEND_SHEET_COUNT_TARGET
LEGACY_FOLDER_RENAME_RULES
CUSTOM_FOLDER_NAME_PRESERVATION
MEETING_REGRESSION
PITCHBOOK_STANDALONE
PITCHBOOK_PARENT_BOUND_REGRESSION
NEWS_DIRECT
NEWS_UPLOAD
NEWS_LIFECYCLE
ASSESSMENT_DIRECT
ASSESSMENT_UPLOAD
ASSESSMENT_LIFECYCLE
MULTI_ENTITY
DRAFT_RESTORE_REMOVED
SHARED_TAB_STATE
GLOBAL_CLEAR
UPLOADER_FORMAT_PARITY
CONCURRENCY_DISTINCT_CREATE
CONCURRENCY_STALE_EDIT
BROWSER_1440
BROWSER_390
HORIZONTAL_OVERFLOW
BUNDLE_VALIDATION
MULTIFILE_PACKAGE_PARITY
CANONICAL_CHECK
DIFF_CHECK
TARGET_RUNTIME_QUALIFICATION
DEPLOYMENT_MUTATION_COUNT
PROVIDER_CALL_COUNT
COMPANY_DATA_MUTATION_COUNT
BLOCKER
```

For this Dispatch:

`TARGET_RUNTIME_QUALIFICATION: NOT RUN (planned CODEX-02)`

must not be reported as PASS.

## Execution Budget / Strategy Reset

- one implementation strategy
- same failure class speculative repairs: max 2
- live/deployment mutations: 0
- canonical full check: once after focused checks, rerun only after material subsequent source change

Strategy Reset and return if:

- schema9 requires destructive rewrite of existing authoritative Meeting/Pitchbook data
- parent-optional Pitchbook would require parallel duplicate upload architecture rather than a coherent refactor
- a current accepted recovery/concurrency invariant cannot be preserved
- same material failure recurs after 2 distinct fixes
- required work expands into provider/Full Output/Digest scope
- deterministic evidence indicates the Work0069 schema/contract is internally inconsistent

## Delivery

Branch:

`work/0070-source-record-layer`

Open a Draft PR.

Report:

`docs/handoffs/0070-CODEX-01-record-source-expansion-report.md`

Update:

`docs/handoffs/0070-dispatches.md`

Do not mark Work0070 ACCEPTED or apply Completion Latch. Final Work acceptance requires CODEX-02 target-runtime qualification and ChatGPT review.

## Mandatory final chat identity

Begin and end the Codex final response with:

```text
WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-01
BALL: CHATGPT
STATUS: RETURNED
```

If a native user action is actually required, use `BALL: USER / STATUS: ACTION_REQUIRED` instead.

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-01
BALL: CODEX
STATUS: READY
