# Work Registry and Delivery Order

Current as of: 2026-09-20
Status: Active planning source of truth

## Purpose and identity rules

Work IDs identify stable outcomes, not execution order. Never renumber or reuse an issued ID. Keep the same Work through implementation, validation, repair and PR stabilization while its outcome remains unchanged. Give each new Codex execution a new Dispatch ID. Current ball is authoritative in `docs/handoffs/<WORK_ID>-dispatches.md`.

Statuses: ACCEPTED, ACTIVE, READY, PLANNED, DEFERRED, BLOCKED, SUPERSEDED.

## Current delivery sequence

| Order | Work ID | Outcome | Status | Dependency | Next action |
|---:|---|---|---|---|---|
| 0 | 0020 | Provider core, OpenAI File Search, citations, lifecycle, full output | ACCEPTED | — | Preserve accepted evidence |
| 1 | 0025 | Administrator model/thinking policy | ACCEPTED | 0020 | Preserve exact tuple policy |
| 2 | 0021 | Structured search, five modes, multi-Entity, six formats | ACCEPTED | 0025 | Preserve PR #34 / version-66 evidence |
| 3 | 0023 | Deterministic single-file bundle and installer | ACCEPTED | 0021 | Preserve PR #35 / installer security |
| 4 | 0026 | Current Gemini API requalification and fail-closed safety | ACCEPTED | 0023 | Preserve PR #36 historical boundary |
| 5 | 0027 | Personal-DEV Gemini File Search baseline and citation integrity | ACCEPTED | 0026 | Preserve PR #37 / version-73 qualified-disabled evidence |
| 6 | 0028 | 単一記録Light UIとproduction contractのend-to-end実装・検証 | ACCEPTED | PR #50 + #51 + #52 | version5でpre-rollout UI/interaction再認定。Completion Latch再適用。次は会社PC移行準備 |
| 7 | 0029 | Portable shared-password administrator mode | ACCEPTED (HISTORICAL) | Work 0028 preserved | PR #39 / version75 evidenceを履歴として保持。current productのshared-password behaviorはWork0037で明示的にsupersede |
| 8 | 0031 | GP中心モデルを廃止しCounterparty Masterへ統合 | ACCEPTED | Work 0028 version5 accepted baseline | PR #53 / schema8 / version7 accepted。Completion Latch済み。次は会社PC移行準備 |
| 9 | 0032 | 記録追加 / 過去の記録の最終UI polish | ACCEPTED | Work 0031 schema8 / version7 | PR #54 / version8 accepted。Completion Latch済み |
| 10 | 0033 | UI Layout Lab — drag/resize/presetで配置を決めるlocal sandbox | ACCEPTED | Work 0032 version8 accepted UI baseline | PR #55 / Layout Lab v2 accepted。Meeting-create candidateをproduction反映する次Workへ |
| 11 | 0034 | Meeting-create production反映・shared sidebar refresh・adjacent UI convergence | ACCEPTED | Work 0033 accepted candidate / Work0032 baseline | PR #56 / version10 accepted。Completion Latch済み。次は他タブを1画面ずつLayout Labで調整 |
| 12 | 0035 | Multi-screen UI Studio — 全7タブ一括design + fine positioning | SUPERSEDED | Work0034 version10 / Work0033 Layout Lab | User strategy reset 2026-09-19。UI Studio追加開発は停止、Work0036へ |
| 13 | 0036 | Cross-tab production UI convergence — selection simplification + layout optimization | ACCEPTED | Work0034 version10 | PR #58 / version11 accepted。Completion Latch済み |
| 14 | 0037 | Post-version11 UI refinement — six-screen convergence + admin password gate removal | ACCEPTED | Work0036 version11 | PR #59 / version13 accepted。Completion Latch済み |
| 15 | 0038 | Post-version13 UI refinement — Knowledge Search + Meeting-create | ACCEPTED | Work0037 version13 | PR #60 / version18 accepted。Completion Latch済み |
| 16 | 0039 | Monthly admin review restoration — Meeting Type + autosave checkbox | ACCEPTED | Work0017 capability / Work0038 version18 | PR #61 / version19 accepted。Completion Latch済み |
| 17 | 0040 | Past Meeting edit form cleanup — hide unused follow-up / internal ID controls | ACCEPTED | Work0039 version19 | PR #62 / version20 accepted。Completion Latch済み |
| 18 | 0041 | 過去の記録 usability + loading UX + 削除記録の管理 / 復元 | ACCEPTED | Work0040 version20 accepted baseline | PR #63 / version21 accepted。Completion Latch済み |
| 19 | 0042 | Right-pane design unification — selected detail-card language + admin tabs | ACTIVE (BUILD) | Work0041 version21 | CODEX-01 implementation + exhaustive reachable-state runtime qualification |
| 20 | 0030 | Company Azure OpenAI provider transition + File Search qualification | DEFERRED | Counterparty-centered baseline acceptance後もuser holdを維持 | User hold 2026-09-17; explicit reactivation decisionまで開始しない |
| 21 | Unassigned future Work | Representative large-file qualification/recovery | DEFERRED | Small synthetic path qualified | Allocate separate Work if needed |
| 22 | Unassigned future Work | Historical-material migration | PLANNED | Provider/installer stable | Select approach from actual corpus |
| 23 | Unassigned future Work | Final company qualification and rollout | PLANNED | Company credentials, Shared Drive, permissions, migration ready | Qualify approved company environment/providers |

## Accepted boundaries

### Work 0021

PR #34 merge `533c849bd1229827ec77cd5ad6506312ea286940`; private version66. Core filters/five modes, multi-Entity/advanced filters, OpenAI six-format matrix and FULL_OUTPUT parity accepted.

### Work 0023

PR #35 merge `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`.

Accepted installation architecture:

```text
new Google Spreadsheet
-> container-bound Apps Script
-> exact generated bundle
-> installKnowledgeShare()
-> owner-restricted WEB_APP deployment
-> readiness/security confirmation
-> Web App
```

Installer uses the bound Spreadsheet parent as safe installation boundary. Deployment security remains fail-closed and administrator-attested.

### Work 0027

PR #37 merge `9cd5d2984d0d584ed05c447ed09d2ddf0e1e2366`.

```text
TERMINAL_OUTCOME: QUALIFIED_DISABLED
TARGET_RUNTIME_QUALIFICATION: PASS
AUTHORITATIVE_CITATION: PASS
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
BLOCKER: NONE
```

### Work 0029

PR #39 merge `872dbec83d17e6dfe1f33d8260006c2124d38a6c`.

```text
PRIVATE_WEB_APP_VERSION: 75
TARGET_RUNTIME_QUALIFICATION: PASS
SHARED_ADMIN_CREDENTIAL: configured
FINAL_ADMIN_STATE: locked
BLOCKER: NONE
```

## Work 0028 accepted outcome / pre-rollout version5

PR #50 Light design:
`98bd1f233a5a462c55a9a3f9e4bc0dda6c705067`

PR #51 production implementation / runtime:
`89a2e94c9fc845157744c011333e16d9a32ffd34`

PR #52 pre-rollout UI polish / runtime:
`60927ab9a1ef3f705a2451fe70a662112a3cfd5e`

Final target-runtime state:

```text
FINAL_SERVED_VERSION: 5
UI_POLISH_5: PASS
R1_R8_BASELINE: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
LOGIC_VALIDATION: 529/529 PASS
BUNDLE_VALIDATION: 30/30 PASS
BACKEND: exactly5 sheets / schema7
AI_SYNC: FALSE
TRIGGERS: 0
PROVIDER_CALLS: 0
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
BLOCKER: NONE
COMPLETION_LATCH: REAPPLIED
```

Accepted production behavior:

- Light-only single-record Meeting UI。
- GP / non-GP parent-first Meeting。
- new/existing related file attachment、follow-up file add。
- visible delete = unlink only、relinkでsame stable Document_ID / File_ID。
- relation-only mutationでMeeting Docs本文を再生成しない。
- parent-bound retrieval/citation。
- dedicated Meeting-only non-AI Full Output。
- Business Date/Timeはversion4でauthoritative valueとsearch/detail表示が一致。元セル・Docs・business fields保持。
- single restricted WEB_APP / USER_DEPLOYING / MYSELF。
- deployment-security confirmation READY/NONE + authoritative attestation MATCH。
- provider-independent baseline。AI sync disabled。

Final reports:
- `docs/handoffs/0028-CODEX-23-temporal-recovery-autonomous-completion-report.md`
- `docs/handoffs/0028-CODEX-24-pre-rollout-ui-polish-report.md`

Current ball/status:
`docs/handoffs/0028-dispatches.md`

ResidualsはBLOCKERではない。mobile/other-browser visual sweep、任意locale日時表示、real/company rollout、historical migration、provider transition、Dark/Systemは別scope。

ユーザー実機確認で再オープン後、PR #52 / version5で5件のpre-rollout UI/interaction課題をactual owner-only runtimeでPASS。Completion Latch再適用済み。Work 0030は明示的な再開判断までDEFERRED。

## Work 0030 deferred contract

User decision 2026-09-17: Azure OpenAI transition is on hold.

```text
WORK_ID: 0030
STATUS: DEFERRED
ACTIVE_DISPATCH: NONE
REACTIVATION: explicit later user decision required
```

No Azure implementation, credential setup, synthetic qualification, Vector Store creation, provider code change, or dispatch starts automatically after Work 0028.

Decision: `docs/decisions/company-azure-openai-provider.md`

Plan: `docs/planning/work0030-azure-openai-provider-transition.md`

## Scope discipline

Only primary-flow failure, source/data integrity, credentials/authorization, material irreversible side effects, required target-runtime evidence, or evidence contamination may block delivery. Cosmetic work, broad benchmarks, provider migration and unrelated hardening remain FOLLOW_UP/OPTIONAL.

## Work 0031 planned contract

User decision 2026-09-18: GPを独立master/entity classとして扱う設計を廃止し、すべての面談先をCounterparty Masterへ統合する。

WORK_ID: 0031
STATUS: ACCEPTED
PRIMARY_MASTER: Counterparty_Master
GENERIC_ID: CP-*
GP_ROLE: Counterparty_Type value only
RELATED_GP_USER_CONCEPT: REMOVE
BACKEND_SHEETS: remain exactly 5
TARGET_SCHEMA: 8
WORK_0030: remains DEFERRED_BY_USER

Decision: `docs/decisions/counterparty-master-unification.md`
Plan: `docs/planning/work0031-counterparty-master-transition.md`
Active dispatch: `docs/handoffs/0031-dispatches.md`
Final reports: `docs/handoffs/0031-CODEX-01-counterparty-master-transition-report.md`, `docs/handoffs/0031-CODEX-02-user-facing-wording-convergence-report.md`
Completion: `docs/handoffs/0031-completion-report.md`
## Work 0031 accepted outcome

PR #53 merge: `ed47161bc6380c3289f1554d1d7419c575497f53`

```text
FINAL_SERVED_VERSION: 7
TARGET_SCHEMA: 8
BACKEND_SHEETS: EXACTLY_5
PRIMARY_MASTER: Counterparty_Master
GENERIC_ID: CP-*
GP_ROLE: Counterparty_Type only
R1_R10: PASS
LOGIC_VALIDATION: 520/520 PASS
BUNDLE_VALIDATION: 30/30 PASS
PROVIDER_CALLS: 0
AI_SYNC: DISABLED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
```

normal productの主語は`面談先`。`GP`は`GP / 運用会社`というCounterparty Typeの1値。`GP Master` / `GP Workspace` / `GPサマリー` / user-facing `関連GP`は廃止。

Work 0030はDEFERRED_BY_USERのまま。
## Work 0032 accepted outcome

PR #54 merge: `fafc944be05cf28055834e46fe02477a6495e53b`

```text
FINAL_SERVED_VERSION: 8
R1_R6: PASS
LOGIC_VALIDATION: 524/524 PASS
BUNDLE_VALIDATION: 30/30 PASS
PROVIDER_CALLS: 0
AI_SYNC: DISABLED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
```

Completion: `docs/handoffs/0032-completion-report.md`
Current ball/status: `docs/handoffs/0032-dispatches.md`
## Work 0033 active contract

UI Layout Lab is a local-only static design sandbox.

```text
WORK_ID: 0033
STATUS: ACCEPTED
PRODUCTION_SOURCE_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
NETWORK_CALLS: 0
BASELINE: Work0032 / version8
PRESETS: Current v8 / Compact Institutional / Balanced Professional / Memo First
```

Decision: `docs/decisions/ui-layout-lab.md`
Plan: `docs/planning/work0033-ui-layout-lab.md`
Dispatch: `docs/handoffs/0033-dispatches.md`
Active instruction: `docs/handoffs/0033-CODEX-02-direct-manipulation-enhancement-instruction.md`
## Work 0033 accepted outcome

PR #55 merge: `24c8e78b0a446eddf0f1540885eb10db0bc865fa`

```text
LAYOUT_LAB: USABLE
SPEC_VERSION: 2
CURRENT_CANDIDATE: 12 columns / width100% / max2000
DIRECT_2D_PLACEMENT: PASS
EIGHT_DIRECTION_RESIZE: PASS
STANDARD_FINE_12_24: PASS
V1_TO_V2_MIGRATION: PASS
USER_BROWSER_QUALIFICATION: PASS
PRODUCTION_SRC_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
```

Completion: `docs/handoffs/0033-completion-report.md`
Current candidate: `docs/handoffs/0033-user-layout-candidate-current.json`

## Work 0034 active contract

```text
WORK_ID: 0034
STATUS: ACCEPTED
MODE: BUILD
CURRENT_ACCEPTED_RUNTIME_EVIDENCE: version10 / CODEX-02
ACTIVE_DISPATCH: 0034-CODEX-02
PR: #56
TARGET_RUNTIME: same existing owner-only versioned Web App
UI_CONVERGENCE: PASS
MEETING_CREATE_LAYOUT: PASS
PAST_MEETING_NONE_SINGLE_MULTI_OR: PASS
COUNTERPARTY_SUMMARY_SIMPLIFICATION: PASS
TARGET_RUNTIME_QUALIFICATION: PASS
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
WORK_0030: DEFERRED_BY_USER
BLOCKER: NONE
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

Dispatch: `docs/handoffs/0034-dispatches.md`

Active instruction: `docs/handoffs/0034-CODEX-02-ui-convergence-instruction.md`

Report: `docs/handoffs/0034-CODEX-02-ui-convergence-report.md`

## Work 0034 accepted outcome

PR #56 merge: `154a9e1ff7dba8b2a3d57890c8909507cb088c95`

```text
FINAL_SERVED_VERSION: 10
SIDEBAR_HORIZONTAL_SCROLLBAR: 0
NORMAL_PAGES_MAX_WIDTH_2000: 7/7 PASS
MEETING_CREATE_LAYOUT: PASS
PAST_MEETING_NONE_SINGLE_MULTI_OR: PASS
COUNTERPARTY_SUMMARY_SIMPLIFICATION: PASS
LOGIC_VALIDATION: 555/555 PASS
BUNDLE_VALIDATION: 30/30 PASS
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
PERMISSION_BROADENING: 0
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
```

Completion: `docs/handoffs/0034-completion-report.md`
Current ball/status: `docs/handoffs/0034-dispatches.md`
## Work 0035 superseded contract

```text
WORK_ID: 0035
STATUS: SUPERSEDED_BY_USER
MODE: BUILD
BASELINE: Work0034 version10 + Work0033 Layout Lab
SCREENS: 7
PRODUCTION_SRC_MODIFICATION: 0
APPS_SCRIPT_DEPLOYMENT: 0
WORK_0030: DEFERRED_BY_USER
```

Decision: `docs/decisions/multi-screen-ui-studio.md`
Plan: `docs/planning/work0035-multi-screen-ui-studio.md`
Dispatch: `docs/handoffs/0035-dispatches.md`
Instruction: `docs/handoffs/0035-CODEX-01-multi-screen-ui-studio-instruction.md`
## Work 0036 active contract

```text
WORK_ID: 0036
STATUS: ACCEPTED
MODE: BUILD
BASELINE: Work0034 version10
EQUITY_DEBT_USER_SELECTION: REMOVE
COUNTERPARTY_TYPE_USER_SELECTION: NEW_COUNTERPARTY_MODAL_ONLY
LAYOUT_REFERENCE: Meeting-create accepted 12-column language
WORK_0035: SUPERSEDED_BY_USER
WORK_0030: DEFERRED_BY_USER
FINAL_SERVED_VERSION: 11
TARGET_RUNTIME_QUALIFICATION: PASS
READY_FOR_CHATGPT_FINAL_REVIEW: YES
```

Decision: `docs/decisions/production-ui-cross-tab-convergence.md`
Plan: `docs/planning/work0036-cross-tab-production-ui.md`
Dispatch: `docs/handoffs/0036-dispatches.md`
Instruction: `docs/handoffs/0036-CODEX-01-cross-tab-ui-convergence-instruction.md`
Report: `docs/handoffs/0036-CODEX-01-cross-tab-ui-convergence-report.md`

## Work 0036 accepted outcome

PR #58 merge: `9537b499ed05698ab1e981a51534fe86807d910d`

```text
FINAL_SERVED_VERSION: 11
CROSS_TAB_UI_CONVERGENCE: PASS
NEW_COUNTERPARTY_MODAL: PASS
NORMAL_NAVIGATION: 7/7 PASS
VIEWPORTS: 2560 / 1440 / 1280 / 390 PASS
LOGIC_VALIDATION: 561/561 PASS
BUNDLE_VALIDATION: 30/30 PASS
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
SECURITY_CHANGE: 0
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
```

Selection policy:
- Equity / Debt: normal user selectionなし、existing backend valueをpreserve。
- Counterparty Type: normal filter/analytics selectionなし。新規面談先modalのみrequired選択。

Completion: `docs/handoffs/0036-completion-report.md`
Current ball/status: `docs/handoffs/0036-dispatches.md`
## Work 0037 active contract

```text
WORK_ID: 0037
STATUS: ACCEPTED
MODE: BUILD
FINAL_SERVED_VERSION: 13
PR: #59
MERGE: 6e9fc1d1d6a3578fc101fa2eef5849b62e0cd255
TARGET_RUNTIME_QUALIFICATION: PASS
MASTER_TAB_DRAFT_OWNERSHIP: CLOSED
COMPLETION_LATCH: APPLIED
WORK_0030: DEFERRED_BY_USER
```

Requirements: `docs/handoffs/0037-ui-refinement-requirements.md`
Plan: `docs/planning/work0037-ui-refinement.md`
Dispatch: `docs/handoffs/0037-dispatches.md`
Reports: `docs/handoffs/0037-CODEX-01-ui-refinement-report.md`, `docs/handoffs/0037-CODEX-02-master-tab-state-repair-report.md`
Completion: `docs/handoffs/0037-completion-report.md`
## Work 0037 accepted outcome

PR #59 merge: `6e9fc1d1d6a3578fc101fa2eef5849b62e0cd255`

```text
FINAL_SERVED_VERSION: 13
NORMAL_NAVIGATION: 7/7 PASS
VIEWPORTS: 2560 / 1440 / 1280 / 390 PASS
MASTER_TAB_DRAFT_OWNERSHIP: CLOSED
LOGIC_VALIDATION: 567/567 PASS
BUNDLE_VALIDATION: 30/30 PASS
CONSOLE_MATERIAL_ERROR_WARN: 0
PROVIDER_CALLS: 0
AI_SYNC: DISABLED / UNCHANGED
CONFIDENTIAL_DATA: 0
PHYSICAL_DELETE: 0
PERMISSION_BROADENING: 0
PUBLIC_EXPOSURE: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
```

Current admin behavior: in-app shared-password gateは撤去済み。security boundaryはsame owner-only authenticated Web App deployment。Work0029はhistorical evidenceとして保持する。
## Work 0038 active intake

```text
WORK_ID: 0038
STATUS: ACCEPTED
MODE: BUILD
FINAL_SERVED_VERSION: 18
PR: #60
MERGE: 27fb5ca200cdb4d26f7111555cde33c8c2956892
TARGET_RUNTIME_QUALIFICATION: PASS
COMPLETION_LATCH: APPLIED
WORK_0030: DEFERRED_BY_USER
```

Requirements: `docs/handoffs/0038-ui-refinement-requirements.md`
Plan: `docs/planning/work0038-ui-refinement.md`
Dispatch: `docs/handoffs/0038-dispatches.md`
Reports: `docs/handoffs/0038-CODEX-01-ui-refinement-report.md`, `docs/handoffs/0038-CODEX-02-meeting-header-status-report.md`, `docs/handoffs/0038-CODEX-03-knowledge-help-line-report.md`
Completion: `docs/handoffs/0038-completion-report.md`
## Work 0039 planned contract

```text
WORK_ID: 0039
STATUS: ACCEPTED
MODE: BUILD
ROOT_CAUSE: RESOLVED
BACKEND_ADMIN_CHECK_CAPABILITY: PRESERVED
PRIMARY_REPAIR: INLINE_MEETING_TYPE_LABELS + AUTOSAVE_CHECKBOX
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
ACTIVE_DISPATCH: NONE
MERGE: 4fe28048e90df1a264dea836e8909d80ada0be57
FINAL_SERVED_VERSION: 19
COMPLETION_LATCH: APPLIED
BALL: NONE
```

Investigation: `docs/investigations/work0039-monthly-admin-review-regression.md`
Plan: `docs/planning/work0039-monthly-admin-review-restoration.md`
Dispatch: `docs/handoffs/0039-dispatches.md`
## Work 0038 accepted outcome

PR #60 merge: `27fb5ca200cdb4d26f7111555cde33c8c2956892`

```text
FINAL_SERVED_VERSION: 18
TARGET_RUNTIME_QUALIFICATION: PASS
LOGIC_VALIDATION: 574/574 PASS
BUNDLE_VALIDATION: 30/30 PASS
NORMAL_NAVIGATION: 7/7 NONBLANK
CONSOLE_MATERIAL_ERROR_WARN: 0
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
```
## Work 0039 accepted outcome

PR #61 merge: `4fe28048e90df1a264dea836e8909d80ada0be57`

```text
FINAL_SERVED_VERSION: 19
TARGET_RUNTIME_QUALIFICATION: PASS
LOGIC_VALIDATION: 579/579 PASS
BUNDLE_VALIDATION: 30/30 PASS
CHECK_SEQUENCE: false -> true -> reload -> true -> false PASS
AUDIT_EVENTS: EXACTLY_2
MEETING_BUSINESS_FIELDS_UNCHANGED: PASS
VIEWPORTS: 2560 / 1440 / 1280 / 390 PASS
CONSOLE_MATERIAL_ERROR_WARN: 0
PROVIDER_CALLS: 0
SCHEMA_CHANGE: 0
MIGRATION_CHANGE: 0
BLOCKER: NONE
COMPLETION_LATCH: APPLIED
```

Completion: `docs/handoffs/0039-completion-report.md`
## Work 0040 accepted outcome

```text
WORK_ID: 0040
STATUS: ACCEPTED
MODE: BUILD
BASELINE: Work0039 version19
FINAL_SERVED_VERSION: 20
PR: #62
MERGE: f4283c6b57c6413178d6a2c4173d4970604ee751
ACTIVE_DISPATCH: NONE
BALL: NONE
TARGET_RUNTIME_QUALIFICATION: PASS
LEGACY_FOLLOW_UP_PRESERVATION: PASS
RELATED_PITCHBOOK_IDS_PRESERVATION: PASS
COMPLETION_LATCH: APPLIED
BLOCKER: NONE
WORK_0030: DEFERRED_BY_USER
```

Requirements: `docs/handoffs/0040-past-meeting-edit-cleanup-requirements.md`
Dispatch: `docs/handoffs/0040-dispatches.md`
Plan: `docs/planning/work0040-past-meeting-edit-cleanup.md`
Instruction: `docs/handoffs/0040-CODEX-01-past-meeting-edit-cleanup-instruction.md`
Runtime evidence closure: `docs/handoffs/0040-CODEX-02-runtime-legacy-preservation-qualification-instruction.md`
PR: #62
Completion: `docs/handoffs/0040-completion-report.md`
## Work 0041 accepted outcome

```text
WORK_ID: 0041
STATUS: ACCEPTED
MODE: BUILD
BASELINE: Work0040 version20
FINAL_SERVED_VERSION: 21
PR: #63
MERGE: a039d57e80aed2652dc310840b21dc3697baf185
ACTIVE_DISPATCH: NONE
BALL: NONE
TARGET_RUNTIME_QUALIFICATION: PASS
DELETE_RESTORE_E2E: PASS
LIFECYCLE_AUDIT_SEQUENCE: PASS
COMPLETION_LATCH: APPLIED
BLOCKER: NONE
WORK_0030: DEFERRED_BY_USER
```

Requirements: `docs/handoffs/0041-past-meeting-usability-and-delete-record-management-requirements.md`
Plan: `docs/planning/work0041-past-meeting-usability-and-delete-record-management.md`
Dispatch: `docs/handoffs/0041-dispatches.md`
Instruction: `docs/handoffs/0041-CODEX-01-past-meeting-usability-and-delete-record-management-instruction.md`
Report: `docs/handoffs/0041-CODEX-01-past-meeting-usability-report.md`
Completion: `docs/handoffs/0041-completion-report.md`

Closed user decision 2026-09-20:
- 管理者section名は`削除記録の管理`。
- normal Past Meetingには復元workflowを混在させない。
- detail / related / editは未選択empty-stateを含め初期から見せる。
- async operationsにはvisible busy/loading stateを付与。
- list action labelは`無効化`ではなく`削除`。
- restoreはexisting Active/Inactive status semanticsを再利用する。


## Work 0042 active requirements intake

```text
WORK_ID: 0042
STATUS: ACTIVE
MODE: BUILD
PHASE: IMPLEMENTATION / EXHAUSTIVE UI QUALIFICATION
BASELINE: Work0041 version21
ACTIVE_DISPATCH: 0042-CODEX-01
BALL: CODEX
SIDEBAR_REDESIGN: 0
PRIMARY_SCOPE: right-pane visual unification + master drag reorder + admin tabs
WORK_0030: DEFERRED_BY_USER
```

Requirements: `docs/handoffs/0042-right-pane-design-unification-requirements.md`
Plan: `docs/planning/work0042-right-pane-design-unification.md`
Dispatch: `docs/handoffs/0042-dispatches.md`
Instruction: `docs/handoffs/0042-CODEX-01-right-pane-design-unification-instruction.md`

Closed user decisions 2026-09-20:
- selected record-detail mockupをright-pane全体のcanonical visual directionとする。
- sidebarは変更しない。
- 管理者ページはtab化。
- 左tab: `AIプロバイダ設定`。
- 右tab: `削除記録の管理`。
- default active tabは`AIプロバイダ設定`。
- sidebar label `プルダウンの管理`を`マスター管理`へ変更する（visual designは不変）。
- Asset Class / 面談場所 / Teamの並び替えはnumeric Sort Order入力を廃止し、drag handleによるclick & drag操作へ変更する。
- drag中はinsertion targetを明示し、neighbor rowsを短いanimationでshiftさせる。
- existing `OPTION_REORDER` / `Option_Order` semanticsを再利用し、schema/storageは変更しない。
- user-facing labelを日本語へ統一: `Team -> チーム`、`Asset Class -> アセットクラス`、`Meeting Type -> MTG種別`。internal identifiersは変更しない。
