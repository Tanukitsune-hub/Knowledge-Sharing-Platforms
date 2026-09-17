# Work Registry and Delivery Order

Current as of: 2026-09-17
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
| 6 | 0028 | 単一記録Light UIとproduction contractのend-to-end実装・検証 | ACTIVE (BUILD) | Accepted PR #50 + PR #51 source/runtime | CODEX-21でdurable guarded versioned-admin confirmation surfaceを追加し、same deploymentでattestation MATCH/READY後final R1-R8 |
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

Installer uses the bound Spreadsheet parent as the safe installation boundary. Deployment security remains fail-closed and administrator-attested.

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

Current returned HEAD:
`4488d9b`（CODEX-21開始時にexact remote SHAをread backする）

Accepted implementation/runtime evidence retained:

```text
pre-repair frozen source: 5842a07255a10415d39d524fd8ec174450248855
pre-repair bundle commit: 2ab8b262c7211af5464f3201a77c6e45484cdc6c
userinfo.email + safe outcome logging: accepted
installer pre/post-deployment stage separation: accepted
installer/I2: READY_FOR_DEPLOYMENT / duplicate0
Backend: exactly 5 sheets / schema7
AI sync: FALSE
triggers: 0
owner-only versioned WEB_APP: exactly1 / version1 / WEB_APP / USER_DEPLOYING / MYSELF
canonical after CODEX-19: 518/518 PASS
bundle after CODEX-19: 30/30 PASS
prepare lifecycle: CLOSED
provider calls: 0
```

Production scope implemented before CODEX-21:

- Active Meeting parent binding before new file registration;
- file/link partial-failure stable-ID recovery;
- non-GP parent/counterparty context;
- relation-only add/unlink/relink without Meeting Docs regeneration;
- parent-bound retrieval eligibility/citation revalidation;
- independent Meeting-only non-AI Full Output;
- accepted Light production UI;
- schema7 / Pitchbook_Index four append-only columns;
- explicit `userinfo.email` installer identity scope;
- closed-vocabulary installer outcome log;
- installer success after identity/setup/validation returns pre-deployment `READY_FOR_DEPLOYMENT`.

### Historical standalone qualification — superseded

CODEX-13/14/15 established that historical version75 is a standalone project and is not the final installer architecture. Historical version75 project/deployment must not be mutated for Work 0028.

### Fresh bound qualification — CODEX-16 through CODEX-20

CODEX-16 had no durable return. CODEX-17 recovered `NOT_STARTED_CONFIRMED` and created exactly one fresh container-bound synthetic target.

CODEX-18 repaired installer identity scope and established identity/setup/validation, installer resources, Backend exactly5, schema7, AI sync FALSE, triggers0.

CODEX-19 repaired pre-deployment stage ordering. Installer rerun/I2 became `READY_FOR_DEPLOYMENT` with duplicate0. It then created exactly one owner-only versioned WEB_APP. Authoritative metadata confirmed version1 / WEB_APP / USER_DEPLOYING / MYSELF. Pre-attestation readiness correctly returned `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED`.

CODEX-19 then executed confirmation once from native editor. Persisted attestation hash did not match the authoritative versioned `/exec` hash, so it stopped before post-readiness/R1-R8.

CODEX-20 attempted the cheapest source-free test of the execution-context hypothesis. It confirmed target/deployment/source parity read-only, but the available browser harness permits arbitrary JavaScript evaluation only in read-only page scope. Because normal UI had no confirmation control, `google.script.run` mutation could not be invoked safely. CODEX-20 stopped with `AUTOMATION_TOOLING_LIMITATION`; confirmation calls0, Google mutations0. This is not an application failure or a repeated hash mismatch.

Controller review:
`docs/handoffs/0028-CODEX-20-controller-review.md`

### CODEX-21 active repair

Strategy Reset conclusion: a repeatable deployment procedure cannot depend on Developer Tools, javascript URLs, hidden RPC, or automation-tool bypass. The application needs a minimal durable versioned-context operator path for its already-guarded deployment security confirmation.

CODEX-21 adds exactly one unlinked operator-only deployment-security route/page:

- not linked from normal product navigation;
- GET/render is read-only;
- explicit button click calls existing guarded `confirmKnowledgeShareDeploymentSecurity()` via `google.script.run`;
- existing owner/admin fail-closed server authorization remains authoritative;
- no arbitrary function runner/eval/debug bridge;
- no private identifier/URL/hash/account/raw error exposure.

After deterministic validation, CODEX-21 may sync the same existing target once, create one new immutable version, and update the same existing WEB_APP deployment once. It must not create a second deployment.

Then normal browser UI click from the updated versioned `/exec` must produce:

```text
ATTESTATION_TO_AUTHORITATIVE_VERSIONED_EXEC: MATCH
POST_ATTESTATION_READINESS: READY
```

Only then may final provider-independent R1-R8 run once.

Active instruction:
`docs/handoffs/0028-CODEX-21-versioned-admin-confirmation-surface-instruction.md`

Current BALL/STATUS:
`docs/handoffs/0028-dispatches.md`

### Work 0028 completion gate

Work 0028 completes only after reviewable target-runtime evidence proves:

- installer `READY_FOR_DEPLOYMENT` + idempotent duplicate0;
- schema7 / exactly 5 Backend sheets;
- one restricted versioned WEB_APP with authoritative `/exec` identity;
- deployment security attestation privately MATCHES the actual current versioned identity;
- post-attestation readiness READY;
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
