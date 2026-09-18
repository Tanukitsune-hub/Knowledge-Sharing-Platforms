# Work Registry and Delivery Order

Current as of: 2026-09-18
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
| 7 | 0029 | Portable shared-password administrator mode | ACCEPTED | Work 0028 preserved | Preserve PR #39 / version-75 evidence |
| 8 | 0030 | Company Azure OpenAI provider transition + File Search qualification | DEFERRED | Work 0028 accepted provider-neutral baseline | User hold 2026-09-17; explicit reactivation decisionまで開始しない |
| 9 | Unassigned future Work | Representative large-file qualification/recovery | DEFERRED | Small synthetic path qualified | Allocate separate Work if needed |
| 10 | Unassigned future Work | Historical-material migration | PLANNED | Provider/installer stable | Select approach from actual corpus |
| 11 | Unassigned future Work | Final company qualification and rollout | PLANNED | Company credentials, Shared Drive, permissions, migration ready | Qualify approved company environment/providers |

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
