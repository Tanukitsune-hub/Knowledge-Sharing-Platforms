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
| 6 | 0028 | 単一記録Light UIとproduction contractのend-to-end実装・検証 | ACTIVE (QUALIFICATION) | Accepted PR #50 + PR #51 source/runtime | CODEX-20でexisting version1 `/exec` contextからattestation bindingを再認定し、MATCH/READYならfinal R1-R8 |
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

The installer intentionally requires bound Spreadsheet context and uses its parent folder as the safe installation boundary. Deployment security remains fail-closed and administrator-attested.

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
`0a678cc`（CODEX-20開始時にexact remote SHAをread backする）

Accepted implementation/runtime evidence retained:

```text
pre-repair frozen source: 5842a07255a10415d39d524fd8ec174450248855
pre-repair bundle commit: 2ab8b262c7211af5464f3201a77c6e45484cdc6c
userinfo.email + safe outcome logging: accepted
installer stage separation: accepted
canonical after CODEX-19: 518/518 PASS
bundle after CODEX-19: 30/30 PASS
prepare lifecycle: CLOSED
```

Production scope implemented:

- Active Meeting parent binding before new file registration;
- file/link partial-failure stable-ID recovery;
- non-GP parent/counterparty context;
- relation-only add/unlink/relink without Meeting Docs regeneration;
- parent-bound retrieval eligibility/citation revalidation;
- independent Meeting-only non-AI Full Output;
- accepted Light production UI;
- schema7 / Pitchbook_Index four append-only columns;
- explicit `userinfo.email` installer identity scope;
- closed-vocabulary installer outcome log that does not expose identity/private payloads;
- installer success after identity/setup/validation returns pre-deployment `READY_FOR_DEPLOYMENT` without conflating post-deployment attestation readiness.

### Historical standalone qualification — superseded

CODEX-13/14/15 established that historical version75 is a standalone project and is not the final installer architecture. Historical version75 project/deployment must not be mutated for Work 0028.

### Fresh bound qualification — CODEX-16 through CODEX-19

CODEX-16 had no durable return. CODEX-17 performed bounded recovery and established `NOT_STARTED_CONFIRMED`, then created exactly one fresh container-bound synthetic qualification target.

CODEX-18 repaired the minimum identity scope and established:

```text
IDENTITY_AUTHORIZATION: PASS
SETUP: PASS
VALIDATION: PASS
INSTALLER_RESOURCES: PRESENT
BACKEND_SHEETS: EXACTLY_5
SCHEMA_VERSION: 7
AI_SYNC_ENABLED: FALSE
TRIGGERS: 0
PROVIDER_CALLS: 0
```

CODEX-19 separated pre-deployment installer completion from post-deployment security readiness. Existing targetへの1回のsource sync後、installer rerun / I2はPASS:

```text
INSTALLER_RESULT: READY_FOR_DEPLOYMENT
INSTALLER_IDEMPOTENCY_I2: PASS
RESOURCE_DUPLICATES: 0
BACKEND_SHEETS: EXACTLY_5
SCHEMA_VERSION: 7
AI_SYNC_ENABLED: FALSE
TRIGGERS: 0
```

その後、owner-only versioned WEB_APPを1件だけ作成し、authoritative metadataで以下を確認:

```text
VERSIONED_WEB_APP_COUNT: 1
VERSION: 1
ENTRYPOINT: WEB_APP
EXECUTE_AS: USER_DEPLOYING
ACCESS: MYSELF
AUTHORITATIVE_EXEC: PRESENT
```

pre-attestation readinessは期待どおり `ACTION_REQUIRED / DEPLOYMENT_SECURITY_ATTESTATION_REQUIRED`。

しかしnative editorから`confirmKnowledgeShareDeploymentSecurity()`を1回実行した後、persisted attestation hashとauthoritative versioned `/exec` identity hashのprivate独立比較がMISMATCH。CODEX-19はpost-readinessとR1-R8を実行せず停止した。

### CODEX-20 active qualification

Current blockerはsource defect確定ではなく、attestation confirmationのexecution context差を最短で切り分ける段階。

Apps Script `ScriptApp.getService().getUrl()` はcontext-sensitiveで、development mode web app実行時にはdevelopment URLを返す。HEAD/test deploymentとversioned deploymentは別物である。

Active hypothesis:

```text
editor/head-context confirmation
-> non-versioned context identity is hashed
-> authoritative versioned /execとの比較がMISMATCH

actual owner-only versioned /exec browser-context confirmation
-> actual versioned WEB_APP identity is hashed
-> authoritative versioned /execとの比較がMATCH
```

CODEX-20はsource変更なしでexisting owner-only version1 `/exec` を開き、browser page contextの`google.script.run`からexisting guarded confirmationを1回だけ実行する。

- MATCH時のみ同じversioned contextでpost-attestation readinessを1回確認し、READYならR1-R8を1 bounded pass。
- MISMATCH再発時はSTOPし、`getService().getUrl()` bindingを不十分と判断。explicit authoritative deployment-binding mechanismは別Dispatchで設計。
- browser harness limitationでpage context invocationできない場合もsource変更せずSTOPし、tooling limitationとして分類。ユーザーにDeveloper Tools操作を要求しない。

Active instruction:
`docs/handoffs/0028-CODEX-20-versioned-runtime-attestation-qualification-instruction.md`

Controller review:
`docs/handoffs/0028-CODEX-19-controller-review.md`

Current BALL/STATUS:
`docs/handoffs/0028-dispatches.md`

### Work 0028 completion gate

Work 0028 completes only after reviewable target-runtime evidence proves:

- installer `READY_FOR_DEPLOYMENT` + idempotent duplicate0;
- schema7 / exactly 5 Backend sheets;
- one owner-only versioned WEB_APP with authoritative `/exec` identity;
- deployment security attestation privately MATCHES that actual versioned identity;
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
