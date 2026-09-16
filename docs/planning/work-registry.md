# Work Registry and Delivery Order

Current as of: 2026-09-17
Status: Active planning source of truth

## Purpose and identity rules

Work IDs identify stable outcomes, not execution order. Never renumber or reuse an issued ID. Keep the same Work through implementation, qualification, repair and PR convergence while its outcome remains unchanged. Give each new Codex execution a new Dispatch ID. Current ball is authoritative in `docs/handoffs/<WORK_ID>-dispatches.md`.

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
| 6 | 0028 | 単一記録Light UIとproduction contractのend-to-end実装・検証 | ACTIVE (BUILD) | Accepted PR #50 + PR #51 source | CODEX-18でinstaller identity scopeを限定修復し、existing fresh-bound targetでR1-R8まで再開 |
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

Accepted final company installation architecture:

```text
new Google Spreadsheet
-> container-bound Apps Script
-> exact generated bundle
-> installKnowledgeShare()
-> owner-restricted WEB_APP deployment
-> readiness/security confirmation
-> Web App
```

The installer intentionally requires bound Spreadsheet context and uses its parent folder as the safe installation boundary.

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

## Work 0028 current contract

### Accepted design

PR #50 squash merge:
`98bd1f233a5a462c55a9a3f9e4bc0dda6c705067`

Closed UI direction:

- Light-only, sidebar7, accepted dark sidebar/gold material family.
- `記録を追加`: single Meeting form + optional new/existing related files; no standalone資料tab/record type/Data Receipt route.
- `過去の記録`: single Meeting list/detail with related file add/unlink/relink.
- visible file `削除` = unlink from current Meeting, not physical/Pitchbook-wide delete.
- Knowledge Search: 面談先 / 情報ソース / period -> 検索モード / AIモデル -> 質問.
- dedicated `全文出力`: Meeting-only / non-AI.
- analytics 9-column Meeting list, summary/admin contracts preserved.

### PR #51 production implementation

Branch:
`codex/0028-production-contract-build`

Current return HEAD:
`5188d4497c4d626adbc6d8c67e1fbb9630404dfd`

Accepted pre-runtime implementation evidence:

```text
frozen source: 5842a07255a10415d39d524fd8ec174450248855
bundle commit: 2ab8b262c7211af5464f3201a77c6e45484cdc6c
focused: 78/78 PASS
canonical: 515/515 PASS
bundle: 27/27 PASS
prepare lifecycle: PASS / 160 batch continuity + bounded replay safety
```

Production scope implemented:

- Active Meeting parent binding before new file registration;
- file/link partial-failure stable-ID recovery;
- non-GP parent/counterparty context;
- relation-only add/unlink/relink without Meeting Docs regeneration;
- parent-bound retrieval eligibility/citation revalidation;
- independent Meeting-only non-AI Full Output;
- accepted Light production UI;
- schema7 / Pitchbook_Index four append-only columns.

### Historical standalone qualification — superseded

CODEX-13/14/15 established that historical version75 is a standalone project and is not the final installer architecture.

Closed observations:

1. Execution API private function -> 403 authorization boundary.
2. bound installer against standalone -> expected `INSTALLER_BOUND_SPREADSHEET_REQUIRED`.
3. private `_` functions existed but observed editor Run surface did not expose the required execution path.

No application defect was established from those historical attempts. Historical version75 project/deployment must not be mutated for Work 0028.

### CODEX-16 interruption / CODEX-17 recovery

CODEX-16 had no durable GitHub return. CODEX-17 performed read-only recovery and established:

```text
CODEX16_RECOVERY_STATE: NOT_STARTED_CONFIRMED
```

CODEX-17 then created exactly one fresh container-bound synthetic qualification target, installed the accepted generated source/manifest, and after user OAuth executed the initial installer once.

Direct target-runtime result:

```text
INSTALLER_EXECUTION_HISTORY: COMPLETED
INSTALLATION_STATUS_SHEET: ABSENT
BACKEND_AND_INSTALLER_RESOURCES: ABSENT
SCRIPT_PROPERTIES_AFTER_I1: EMPTY
TRIGGERS: 0
QUALIFICATION_WEB_APP: 0
TARGET_RUNTIME_R1_R8: NOT_RUN
PROVIDER_CALLS: 0
READY: NO
```

CODEX-17 stopped on this first non-consent runtime failure without I2, deployment, R1-R8, patch or retry. The target is retained and must be reused.

Controller review:
`docs/handoffs/0028-CODEX-17-controller-review.md`

### CODEX-18 active repair

Source review narrowed the failure to the initial installer authorization/identity path before setup mutation.

Current active hypothesis:

```text
explicit manifest lacks https://www.googleapis.com/auth/userinfo.email
-> Session identity unavailable/empty at installer identity gate
-> ACTION_REQUIRED fail-closed before resource/status mutation
```

The hypothesis is not yet a confirmed root cause because CODEX-17 did not directly observe the returned safe error code.

CODEX-18 is authorized to make only the bounded repair needed to test this hypothesis:

- add minimum `userinfo.email` scope through canonical manifest source/generator;
- add safe error-code observability without logging identity/private values or weakening fail-closed behavior;
- add focused regression coverage;
- regenerate and validate deterministic distribution;
- update the existing CODEX-17 bound target source/manifest once;
- run repaired I1 once after any required Google consent;
- if I1 PASS, run I2 once, create one owner-only qualification WEB_APP, then run R1-R8 once;
- if repaired I1 fails, stop without a second repair/retry.

Active instruction:
`docs/handoffs/0028-CODEX-18-installer-identity-scope-repair-instruction.md`

Current BALL/STATUS:
`docs/handoffs/0028-dispatches.md`

### Work 0028 completion gate

Work 0028 completes only after reviewable target-runtime evidence proves:

- repaired fresh installer + idempotency;
- schema7 / 5-sheet backend;
- one owner-only WEB_APP / readiness;
- GP + non-GP parent-first Meeting flow;
- parent-bound file + follow-up file;
- unlink/relink with stable IDs and physical delete0;
- exact Meeting Docs body preservation across relation-only mutation;
- dedicated Meeting-only non-AI Full Output;
- AI sync disabled / provider calls0 / confidential writes0.

If PASS, ChatGPT reconciles/merges PR #51 and applies Completion Latch. Then development stops and the user moves to hands-on real-device/user verification.

Non-goals remain: real confidential data, broad/company rollout, historical orphan migration, new relation table, Dark/System, physical delete, provider qualification.

## Work 0030 deferred contract

User decision 2026-09-17: Azure OpenAI transition is on hold.

```text
WORK_ID: 0030
STATUS: DEFERRED
ACTIVE_DISPATCH: NONE
REACTIVATION: explicit later user decision required
```

No Azure implementation, credential setup, synthetic qualification, Vector Store creation, provider code change, or dispatch starts automatically after Work 0028.

Decision:
`docs/decisions/company-azure-openai-provider.md`

Plan:
`docs/planning/work0030-azure-openai-provider-transition.md`

## Scope discipline

Only primary-flow failure, source/data integrity, credentials/authorization, material irreversible side effects, required target-runtime evidence, or evidence contamination may block delivery. Cosmetic work, broad benchmarks, provider migration and unrelated hardening remain FOLLOW_UP/OPTIONAL.
