# Work 0070 CODEX-03 — Isolated target-runtime qualification

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION
VALIDATION_TIER: TIER_3_HIGH

## Strategy Reset / Phase Change

Work0070のPrimary OutcomeとClosed Decisionsは維持する。

CODEX-01でsource implementation、CODEX-02でChatGPT review findingsのdeterministic repairが完了し、ChatGPT source reviewではCODEX-02の5件を受入れた。ここからは新しい設計・追加実装ではなく、exact candidateをactual Apps Script / Workspace / Web Appでqualificationする。

Accepted deterministic evidenceは再度広げない。target-runtimeでmaterial contradictionが出た場合だけ該当結論を再開する。

## Primary Outcome

Draft PR #103のexact candidateについて、isolated synthetic targetで以下を直接観測し、schema9 / 4-source record layerがApps Script / Google Workspace / browser上でend-to-end成立することを証明する。

- schema8 -> schema9 in-place migration
- legacy folder identity-preserving rename
- exactly 7 Backend sheets
- existing Meeting / Pitchbook preservation
- standalone 保存資料
- News / 評価のDIRECT_TEXT / UPLOAD_FILE
- Past/detail/edit/lifecycle
- multi-session concurrent create
- stale same-record edit rejection
- browser 4-tab/state behavior
- Audit traceability
- provider call 0 / confidential data 0

会社production migration / rolloutは行わない。

## Read First

- nearest AGENTS.md
- docs/planning/work0070-record-source-expansion.md
- docs/planning/work0069-source-aware-knowledge-expansion-plan.md
- docs/handoffs/0070-dispatches.md
- docs/handoffs/0070-CODEX-02-source-review-repair-report.md
- docs/decisions/target-runtime-first-development.md
- docs/agent-governance/work-control.md
- Draft PR #103 current head

恒久ルールはAGENTS.md等に従い、このinstructionへ再展開しない。

## Preflight 0 — Reconcile PR with current main

PR #103 currently diverges from main because controller-side Work0070 handoff/dispatch commits were added to main while Codex worked on the branch.

Before any runtime mutation:

1. fetch latest origin/main.
2. merge origin/main into work/0070-source-record-layer using a normal non-force merge.
3. do not rebase shared history and do not force-push.
4. expected overlapping files are Work0070 plan/handoff/dispatch docs.
5. preserve CODEX-01 / CODEX-02 reports and history.
6. resolve dispatch to CODEX-03 active READY/IN_PROGRESS as appropriate.
7. if any conflict reaches production source, tests, generated artifacts, AGENTS.md, or architecture decisions rather than the expected Work-control docs, STOP and return to ChatGPT.
8. after reconciliation, confirm PR #103 is mergeable or that no content conflict remains.
9. record the reconciled exact HEAD. That HEAD is the only candidate eligible for runtime qualification.

Do not silently alter source behavior during conflict resolution.

## Evidence Hierarchy

Strongest first:

1. actual target Workspace persisted-state readback / native browser observation
2. exact Apps Script project/deployment source identity readback
3. actual Web App RPC/browser behavior in the isolated target
4. CODEX-02 deterministic 716/716 evidence
5. static inspection

Mocks/synthetic local browser do not substitute for target-runtime observations.

## Target Runtime / Isolation

Use actual Apps Script V8 + Google Workspace + Web App semantics.

Preferred target:

- an existing isolated owner-controlled synthetic target from prior accepted work, only if it can be safely used without touching company/production/confidential data or destroying accepted evidence.

If migration rehearsal cannot be safely performed there, one temporary isolated Apps Script/Workspace target is authorized because schema migration rehearsal is a material staging/isolation reason.

Requirements:

- owner-only / self-only Web App access
- synthetic/anonymized data only
- isolated parent/control folders/resources
- no company production folders, spreadsheets, files, users, or private data
- no broad/domain access
- no provider credentials or provider calls
- AI sync remains disabled
- no physical delete
- no confidential source content
- no IDs/private URLs/account identifiers committed to GitHub or chat/report

Store exact runtime IDs/URLs only in the existing local/private operator mechanism.

If the target identity or isolation boundary cannot be verified before mutation, STOP with BALL: USER or BLOCKED as appropriate.

## Baseline Migration Fixture

Qualification must prove an actual schema8 -> schema9 migration, not just a fresh schema9 install.

Use the accepted pre-Work0070 baseline from commit:

ebfd13b3b2b7b806a0da17956d95b6c7b3ff3c62

Baseline release/schema:

- release 0.1.2
- schema 8
- 5 Backend sheets
- root Private Assets Knowledge
- child Meeting Records / Pitchbooks

Prepare one isolated baseline installation with synthetic data only.

Before candidate migration, record authoritative readback of:

- exact 5 Backend sheet names
- SCHEMA_VERSION / APP_VERSION
- knowledge root folder ID/name
- Meeting Records folder ID/name
- Pitchbooks folder ID/name
- one synthetic Meeting stable ID, Index row identity, Doc file ID
- one synthetic parent-bound Pitchbook stable ID, Index row identity, File ID, parent relation
- AI_SYNC_ENABLED=false
- current trigger/deployment boundary

Use normal production paths where possible. Do not invent a test-only business API.

## Migration Qualification

Sync the reconciled PR #103 candidate to the same isolated Apps Script project, create/update the owner-only candidate deployment as needed, then run the authorized setup/migration once.

Required readback after first migration:

- SCHEMA_VERSION = 9
- APP_VERSION / release = 0.2.0
- exactly 7 Backend sheets:
  - Counterparty_Master
  - Option_Master
  - Meeting_Index
  - Pitchbook_Index
  - News_Index
  - Internal_Assessment_Index
  - Settings
- same knowledge root folder ID, renamed to 記録・資料
- same Meeting folder ID, renamed to 面談記録
- same Pitchbook folder ID, renamed to 保存資料
- new ニュース folder under same root
- new 評価（ICメモ、社内整理等） folder under same root
- no duplicate root / child folders
- existing synthetic Meeting ID / row / Doc ID unchanged
- existing synthetic Pitchbook ID / row / File ID / parent relation unchanged
- existing source bodies/files still readable
- provider settings preserved
- AI sync still disabled

Then run setup exactly one more time for idempotency and confirm:

- no additional sheet
- no duplicate folder/resource
- no counter reset
- no existing record rewrite
- resource IDs remain stable

### Custom-name preservation smoke

After the exact legacy rename PASS is captured, use one isolated source child folder only:

1. rename it to a clearly synthetic custom name.
2. run setup once.
3. confirm same folder ID and custom name are preserved, with no duplicate canonical folder created.

Do not use this custom-name check before legacy exact-name rename evidence is captured.

No physical cleanup is required. If you restore the synthetic name, do it only by exact stored ID and record it as TEST_ONLY.

## Record-layer Runtime Matrix

Use small synthetic fixtures. Prefer text/TXT/EML to minimize runtime cost.

Create two synthetic Counterparties for multi-Entity testing if needed. Do not reuse real/company-specific entities for synthetic statements.

### Meeting / Pitchbook preservation + standalone material

Verify through actual Web App / Workspace readback:

- preexisting Meeting and parent-bound Pitchbook remain visible and usable.
- parent-bound attachment path still works for a small synthetic file or preserves the preexisting fixture without mutation if direct add is not needed for a decision.
- standalone 資料保存 requires Date / Counterparty / Asset Class / file before prepare.
- save one standalone small TXT through the normal user flow.
- read back one new DOC-* row with Parent_Meeting_ID blank, Active, correct Counterparty / Asset Class, real Drive File ID and expected folder.
- no Meeting relation RPC/update for standalone path.

### News

Exercise both authoritative routes in the real target:

1. one DIRECT_TEXT News
2. one UPLOAD_FILE News using a tiny synthetic TXT or EML

At least one News must link to two synthetic Counterparties.

Read back:

- NEWS-* unique stable IDs
- canonical sorted unique Counterparty_IDs
- exact input mode
- one authoritative Doc/file only
- correct ニュース folder
- Index row / source URL / file metadata
- Past search/detail
- direct-text body readback

Perform one direct-text metadata/body edit and one Active -> Inactive -> Reactivate cycle. Confirm Version/CAS progression and same source ID/file identity.

### 評価（ICメモ、社内整理等）

Exercise both routes:

1. one DIRECT_TEXT Assessment
2. one UPLOAD_FILE Assessment using a tiny synthetic TXT or EML

Use at least one stable Assessment Type code and one optional relation to a synthetic source if practical.

Read back:

- ASMT-* unique stable IDs
- canonical Counterparty_IDs
- exact Assessment_Type code and Japanese label in UI
- correct 評価（ICメモ、社内整理等） folder
- one authoritative Doc/file only
- Past search/detail
- direct-text body readback

Perform one direct-text edit and one lifecycle Inactive -> Reactivate. Confirm same stable ID/file identity and Version progression.

### Browser behavior

On actual Web App:

- browser title / header = Alternative Assets Intelligence
- Add tabs:
  - 面談メモ
  - 資料保存
  - ニュース
  - 評価（ICメモ、社内整理等）
- Past tabs use corresponding labels.
- desktop and 390px-equivalent viewport have no material horizontal overflow caused by changed source tabs/forms.
- actual upload accept tokens resolve to:
  .pdf,.pptx,.xlsx,.docx,.txt,.eml
- standalone Asset Class missing blocks before prepare RPC.
- shared date / Asset Class / Fund Strategy propagate across Add tabs in-session.
- successful save clears only active source-specific input while preserving shared fields and another tab's unsaved source-specific input.
- reload/new session does not silently restore normal 24h draft.
- global クリア resets all normal unsaved 4-tab state.
- unresolved recovery state remains fail-closed.

Do not repeat unrelated pages/viewports already accepted.

## Actual Concurrency Matrix

This is decision-relevant because the product is team-first.

### Distinct create

Use two independent browser contexts/sessions against the same isolated Web App and start two distinct source creates near-simultaneously.

Accept only if readback shows:

- both operations complete or return a safe retryable result
- unique stable IDs
- both rows persist
- no lost row
- no duplicate source file
- no counter corruption
- no cross-session input bleed

Same authenticated owner is acceptable for this phase because the purpose is shared Apps Script/LockService execution contention, not final real-user authorization.

### Same-record stale edit

Open the same News or Assessment record in two independent contexts at the same Version.

- context A commits a valid edit
- context B then commits its stale edit without reloading

Accept only if:

- A remains authoritative
- B is rejected with STALE_RECORD_VERSION / corresponding safe user message
- Version increments once for the accepted change
- no silent last-write-wins
- authoritative Doc/file and Index remain consistent

## Audit / Attribution

For representative Meeting/Pitchbook/News/Assessment mutations, read the Restricted Audit resource through the authorized operator path and confirm:

- Target_Type / Target_ID correspond to the operation
- Result is correct
- Actor follows existing best-effort policy and is non-empty
- no source body or sensitive payload was duplicated into Audit unexpectedly

Do not copy private user identity into GitHub/report; report only classification such as EMAIL / TEMP_USER / UNIDENTIFIED.

UNIDENTIFIED alone is not automatically a blocker if that is the actual permitted Session behavior, but empty/missing actor or cross-target audit corruption is a blocker.

## Provider / Trigger / Side-effect Checks

Required final state:

- provider calls: 0
- provider Store mutation: 0
- credentials changed: 0
- AI_SYNC_ENABLED=false
- AI indexing calls: 0
- company production data mutation: 0
- broad Web App access change: 0
- physical delete: 0

Baseline/setup may create the existing daily backup trigger in the isolated target. Treat it as TEST_ONLY and report it explicitly. Do not create/enable an AI sync trigger.

Do not exercise backup retention, email delivery, provider search, Full Output source expansion, Digest, or unrelated admin features.

## Qualification Stop Rules

This is a QUALIFICATION dispatch.

Stop the affected matrix at the first material application/data-integrity defect if retry could contaminate evidence.

Do not patch production source inside this Dispatch.

Classify:

- application/source defect -> BLOCKER; return for a new repair Dispatch
- target/runtime/platform limitation -> record separately; choose one cheapest decisive observation only
- browser automation/file-picker limitation -> do not call it an app defect; if normal upload evidence cannot be completed without native user selection, return BALL: USER / ACTION_REQUIRED with the exact prepared step
- unrelated issue -> FOLLOW_UP / OPTIONAL

Do not turn NOT RUN into PASS.

## Execution Budget

Repository reconciliation:

- normal merge from origin/main: max 1
- force push/rebase: 0

Target resources:

- new isolated Apps Script target: max 1 if no safe existing target is suitable
- candidate runtime resource set: max 1

Source/deployment:

- baseline source sync: max 1
- candidate source sync: max 1
- immutable versions: max 2 total (baseline + candidate)
- Web App deployments: one owner-only deployment; update same deployment max 1

Setup:

- baseline setup: max 1
- migration setup: max 1
- idempotency setup: max 1
- custom-name preservation setup: max 1

Data:

- synthetic source records: keep to the minimum matrix above; target <= 8 new source records
- concurrency distinct-create pair: 1 pair
- stale-edit scenario: 1 record / 2 contexts

No blind retry of the same failed stateful mutation.

## Required Report

Create:

docs/handoffs/0070-CODEX-03-target-runtime-qualification-report.md

Update branch copy of:

docs/handoffs/0070-dispatches.md

Report at minimum:

~~~text
PR_RECONCILED_WITH_MAIN
PR_MERGEABLE
QUALIFIED_HEAD
TARGET_RUNTIME_IDENTITY: PRIVATE / NOT_REPORTED
BASELINE_SCHEMA8
BASELINE_5_SHEETS
MIGRATION_SCHEMA9
BACKEND_7_SHEETS
LEGACY_ROOT_SAME_ID_RENAME
LEGACY_MEETING_FOLDER_SAME_ID_RENAME
LEGACY_PITCHBOOK_FOLDER_SAME_ID_RENAME
NEWS_FOLDER_CREATED
ASSESSMENT_FOLDER_CREATED
MIGRATION_EXISTING_MEETING_PRESERVED
MIGRATION_EXISTING_PITCHBOOK_PRESERVED
SECOND_SETUP_IDEMPOTENT
CUSTOM_NAME_PRESERVED
PRODUCT_TITLE
ADD_4_TABS
PAST_4_TABS
BROWSER_DESKTOP
BROWSER_390
UPLOAD_ACCEPT_REAL
STANDALONE_ASSET_REQUIRED
STANDALONE_PITCHBOOK
NEWS_DIRECT
NEWS_UPLOAD
NEWS_MULTI_ENTITY
NEWS_EDIT_LIFECYCLE
ASSESSMENT_DIRECT
ASSESSMENT_UPLOAD
ASSESSMENT_EDIT_LIFECYCLE
CONCURRENT_DISTINCT_CREATE
STALE_EDIT_REJECTED
CROSS_SESSION_INPUT_BLEED
AUDIT_TARGET_TRACE
AUDIT_ACTOR_CLASS
AI_SYNC
PROVIDER_CALL_COUNT
AI_INDEX_CALL_COUNT
TRIGGER_STATE
COMPANY_DATA_MUTATION_COUNT
CONFIDENTIAL_DATA_COUNT
PHYSICAL_DELETE_COUNT
LOGIC_VALIDATION
TARGET_RUNTIME_QUALIFICATION
SIDE_EFFECT_STATE
BLOCKER
FOLLOW_UP
READY
~~~

Do not rerun the entire local suite unless branch reconciliation changes production source or a target-runtime finding materially contradicts deterministic evidence. CODEX-02's 716/716 remains accepted logic evidence otherwise.

## Delivery

Continue on:

- branch: work/0070-source-record-layer
- Draft PR: #103

Do not merge the PR.

If all required qualification evidence passes:

- BALL: CHATGPT
- STATUS: RETURNED
- READY: YES_FOR_CHATGPT_FINAL_REVIEW

Do not mark Work0070 ACCEPTED and do not apply Completion Latch. ChatGPT owns final diff/evidence review and merge decision.

## Mandatory final chat identity

Begin and end final response with:

~~~text
WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
~~~

If native user file selection is required, use BALL: USER / STATUS: ACTION_REQUIRED instead and keep the same Dispatch ID.

WORK_ID: 0070
DISPATCH_ID: 0070-CODEX-03
BALL: CODEX
STATUS: READY
