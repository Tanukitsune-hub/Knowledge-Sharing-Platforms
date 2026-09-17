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
| 6 | 0028 | 単一記録Light UIとproduction contractのend-to-end実装・検証 | ACTIVE (BUILD / QUALIFICATION) | Accepted PR #50 + PR #51 source/runtime | CODEX-22がsame targetでR1-R8まで自律完了。局所failureでは返さない |
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

## Work 0028 current contract

### Accepted design

PR #50 squash merge `98bd1f233a5a462c55a9a3f9e4bc0dda6c705067`.

Closed UI direction:

- Light-only, sidebar7, accepted dark sidebar/gold material family.
- `記録を追加`: single Meeting form + optional new/existing related files.
- `過去の記録`: single Meeting list/detail with related file add/unlink/relink.
- visible file `削除` = unlink from current Meeting, not physical delete.
- Knowledge Search: 面談先 / 情報ソース / period -> 検索モード / AIモデル -> 質問.
- dedicated `全文出力`: Meeting-only / non-AI.
- analytics 9-column Meeting list, summary/admin contracts preserved.

### PR #51 production implementation / runtime

Branch: `codex/0028-production-contract-build`

Current returned HEAD: `985b9ad`（CODEX-22開始時にexact remote SHAをread back）

Accepted production scope:

- parent-first Meeting before file registration;
- partial-failure stable-ID recovery;
- non-GP parent/counterparty context;
- relation-only add/unlink/relink without Meeting Docs regeneration;
- parent-bound retrieval/citation revalidation;
- Meeting-only non-AI Full Output;
- accepted Light production UI;
- schema7 / Pitchbook_Index append columns;
- installer identity scope + safe outcome logging;
- installer pre/post-deployment stage separation;
- durable unlinked deployment-security operator page.

Accepted deterministic/runtime evidence:

```text
installer/idempotency: PASS / duplicate0
Backend: exactly5 sheets / schema7
AI sync: FALSE
triggers: 0
provider calls: 0
operator/source validation: 522/522 PASS
bundle: 30/30 PASS
single restricted WEB_APP: USER_DEPLOYING / MYSELF
versioned confirmation: READY / NONE
attestation vs authoritative current versioned /exec: MATCH
deployment-security readiness: ACCEPTED
```

Native editorの `DEPLOYMENT_SECURITY_ATTESTATION_STALE` はeditor/head context-specific evidenceであり、actual versioned Web App readinessを反証しない。今後production readiness gateにeditor-context checkを使用しない。

Controller review:
`docs/handoffs/0028-CODEX-21-controller-review.md`

Autonomous completion strategy:
`docs/handoffs/0028-autonomous-completion-strategy-reset.md`

### CODEX-22 active autonomous completion

Remaining acceptance evidenceはprovider-independent R1-R8のみ。

CODEX-22は最大3 repair/qualification cyclesまで、同一PR / 同一isolated target / 同一single deployment / 同一Outcome内で、diagnose -> minimal repair -> tests -> sync/version update -> runtime verificationを自己判断して継続する。

局所的なapplication defect、test failure、runtime mismatchではChatGPTへ返さない。

STOPはUSER native action、permission拡大、real/confidential/destructive operation、new target/second parallel deployment、architecture変更、same failure class連続2回、3 cycles消費、evidence contamination、provider call/Work0030必要時のみ。

Active instruction:
`docs/handoffs/0028-CODEX-22-autonomous-completion-instruction.md`

### Work 0028 completion gate

R1-R8:

- schema7 / exactly 5 Backend sheets / AI disabled;
- GP + non-GP parent-first Meeting;
- parent-bound tiny file + follow-up file;
- unlink/relink with stable IDs and physical delete0;
- exact Meeting Docs body preservation across relation-only mutation;
- dedicated Meeting-only non-AI Full Output;
- single restricted deployment / provider calls0 / confidential data0.

CODEX-22がR1-R8 PASS、BLOCKER NONEを返したら、ChatGPTがfinal diff/evidenceをreviewし、PR #51をmergeしてCompletion Latchを適用する。その後は開発を止め、ユーザー実機確認へ移る。

Non-goals: real confidential data, broad/company rollout, historical orphan migration, new relation table, Dark/System, physical delete, provider qualification.

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
