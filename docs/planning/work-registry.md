# Work Registry and Delivery Order

Current as of: 2026-09-08
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
| 6 | 0028 | 単一記録Light UIとproduction contractのend-to-end実装・検証 | ACTIVE (BUILD) | Accepted design PR #50 + Work 0027/0029 | Execute CODEX-15 on PR #51 using standalone editor private setup/validation + provider-independent `/exec` qualification |
| 7 | 0029 | Portable shared-password administrator mode | ACCEPTED | Work 0028 preserved | Preserve PR #39 / version-75 evidence |
| 8 | 0030 | Company Azure OpenAI provider transition + File Search qualification | PLANNED | Work 0028 accepted provider-neutral baseline | After Work 0028 acceptance, start `0030-CODEX-01` with Azure synthetic qualification first |
| 9 | Unassigned future Work | Representative large-file qualification/recovery | DEFERRED | Small synthetic path qualified | Allocate separate Work if needed |
| 10 | Unassigned future Work | Historical-material migration | PLANNED | Provider/installer stable | Select approach from actual corpus |
| 11 | Unassigned future Work | Final company qualification and rollout | PLANNED | Company credentials, Shared Drive, permissions, migration ready | Qualify approved company environment/providers |

## Accepted boundaries

### Work 0021

PR #34 merge `533c849bd1229827ec77cd5ad6506312ea286940`; private version 66. Core filters/five modes, multi-Entity/advanced filters, OpenAI six-format matrix 6/6 and FULL_OUTPUT parity accepted.

### Work 0023

PR #35 merge `8b0a2ccde4746b061c232f45b6d1d59c7cc5a54f`. Deterministic bundle/installer, owner latch, deployment attestation, source parity and idempotent install evidence accepted.

### Work 0027

PR #37 merge `9cd5d2984d0d584ed05c447ed09d2ddf0e1e2366`; final branch head `497ecff400624330f1d5041de166f6c6e3485220`.

```text
PRIVATE_WEB_APP_VERSION: 73
MODEL: gemini-3.7-flash / explicit low / 2048 / Interactions + File Search
TERMINAL_OUTCOME: QUALIFIED_DISABLED
LOGIC_VALIDATION: PASS / 448 of 448
BUNDLE_VALIDATION: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
TARGET_RUNTIME_QUALIFICATION: PASS
AUTHORITATIVE_CITATION: PASS
GEMINI_ENABLED: false
NORMAL_USER_GEMINI_VISIBILITY: false
BLOCKER: NONE
```

### Work 0029

PR #39 merge `872dbec83d17e6dfe1f33d8260006c2124d38a6c`; final branch head `b29ee3e538e72c4641f8d825e304fea1c186a265`.

```text
PRIVATE_WEB_APP_VERSION: 75
FOCUSED_TESTS: PASS / 59 of 59
LOGIC_VALIDATION: PASS / 456 of 456
BUNDLE_VALIDATION: PASS / 27 of 27
SOURCE_READBACK: PASS / 82 of 82
TARGET_RUNTIME_QUALIFICATION: PASS
SHARED_ADMIN_CREDENTIAL: configured
FINAL_ADMIN_STATE: locked
ACCOUNT_INDEPENDENT_ADMIN_SESSION: PASS
SESSIONSTORAGE_RELOAD_AND_SERVER_REVALIDATION: PASS
EXPLICIT_LOGOUT: PASS
PROVIDER_DATA_MUTATIONS: 0
BLOCKER: NONE
```

## Work 0028 current contract

### Design phase accepted

PR #50 was accepted by the user as the current Light production baseline with minor polish deferred, then squash-merged:

- PR #50 merge: `98bd1f233a5a462c55a9a3f9e4bc0dda6c705067`
- design/controller review: `docs/handoffs/0028-CODEX-11-controller-review.md`
- acceptance / Strategy Reset: `docs/handoffs/0028-design-acceptance-and-build-reset.md`

Closed UI direction:

- Light-only, sidebar 7, `#182124`, active `#E1001F` left strip, metallic gold, 紗綾形.
- `記録を追加`: single Meeting form with optional new files + existing Document link; no Meeting/資料 tab, record-type selector, Data Receipt surface, standalone Pitchbook route.
- `過去の記録`: single Meeting list/detail; original, edit, Meeting delete/reactivate, related files, add/unlink/relink, classification edit in parent context.
- related-file visible `削除` means unlink from current Meeting, not Pitchbook-wide Inactive or physical delete.
- Knowledge Search: Row1 `面談先 / 情報ソース / 開始日 / 終了日 / 全期間`; Row2 `検索モード / AIモデル`; Row3 wide `質問`.
- source options: `面談記録・資料 / 面談記録のみ / 資料のみ`.
- `全文出力` is a dedicated Meeting-only / non-AI action, not a model option.
- analytics approved 9-column Meeting list, GP/Entity summary read facades, admin preset/shared-admin behavior are preserved.

### PR #51 production implementation

PR #51 implements the accepted production delta on `codex/0028-production-contract-build`.

Current CODEX-14 return:

- HEAD: `0aeced527ca0efe93d41c337dc10db17613b79cc`
- frozen source: `5842a07255a10415d39d524fd8ec174450248855`
- bundle commit: `2ab8b262c7211af5464f3201a77c6e45484cdc6c`
- schema 7: `Pitchbook_Index` 4 append-only columns
- focused 78/78 PASS
- `npm run check` 515/515 PASS
- bundle 27/27 PASS
- prepare lifecycle finite-lifetime blocker CLOSED
- frozen source was pushed once to existing Apps Script project
- remote saved source parity 83/83 PASS
- existing versioned `/exec` remains version 75 / deployment unchanged
- CODEX-14 editor `checkKnowledgeShareReadiness()` stopped at `INSTALLER_BOUND_SPREADSHEET_REQUIRED`
- setup/version/deployment/business/provider mutations after push: 0
- R1-R8: NOT RUN

Production scope retained:

- saved Active Meeting parent binding before new file registration;
- file/link partial failure recovery with stable IDs and no duplicate blind retry;
- non-GP parent context in filename/index/provider-neutral metadata;
- relation-only add/unlink/relink with CAS and no Meeting Docs regeneration;
- parent-bound retrieval eligibility and citation context revalidation;
- independent Meeting-only / non-AI Full Output;
- accepted Light production UI.

### CODEX-14 controller review

Controller review:
`docs/handoffs/0028-CODEX-14-controller-review.md`

The CODEX-14 stop is classified as an expected installer precondition / wrong operator for this target, not an application or installer defect.

The Work 0023 installer is intentionally container-bound: a fresh company operator creates a Spreadsheet in the intended Shared Drive folder, opens its bound Apps Script, runs the installer, then deploys the Web App. `installKnowledgeShare()` and `checkKnowledgeShareReadiness()` use the active bound Spreadsheet and parent folder as the installation/authorization boundary. That contract must not be weakened merely to qualify the historical standalone target.

The existing version-75 target is a standalone Apps Script project inherited from earlier Works. It already has standalone-compatible private editor entrypoints:

```text
getInstallationStatus_()
validateInstallation_()
setupKnowledgePlatform_()
```

These use `kspCreateAppsScriptEnvironment_()` and existing installation state/config/resource IDs rather than `SpreadsheetApp.getActiveSpreadsheet()`.

### CODEX-15 standalone runtime qualification

CODEX-15 continues the same PR #51 and must:

1. recheck remote saved-source/deployment continuity read-only; no second source push.
2. run `getInstallationStatus_()` and `validateInstallation_()` directly from the owner Apps Script editor.
3. if and only if existing installation state/resources are intact and failure is expected append-only schema drift, run `setupKnowledgePlatform_()` once.
4. re-run `validateInstallation_()` and require schema/resource integrity PASS.
5. create one immutable version from the frozen saved source.
6. update the positively identified existing WEB_APP exactly once; no new deployment.
7. run provider-independent synthetic R1-R8 through the verified `/exec`.
8. prove schema 7, GP/non-GP parent-first file registration, same-Meeting follow-up, unlink/relink, exact Docs body preservation, dedicated Full Output, Gemini-disabled/shared-admin non-regression.
9. keep Direct OpenAI/Gemini/Azure provider calls at 0.

Active instruction:
`docs/handoffs/0028-CODEX-15-standalone-runtime-qualification-instruction.md`

Current BALL/STATUS:
`docs/handoffs/0028-dispatches.md`

Historical orphan Pitchbook bulk migration, new relationship table/Record_Index, Data Receipt schema, broad rollout, real confidential data, Dark/System are non-goals.

## Work 0030 planned contract

User clarified that the company-provided OpenAI-family credential is Azure OpenAI, not Direct OpenAI.

Work 0030 is intentionally separate so provider-neutral product/backend qualification and Azure transport/provider qualification do not contaminate each other's evidence.

Closed direction:

- company OpenAI-family provider = Azure OpenAI;
- Azure v1 Responses / Files / Vector Stores / `file_search` are the target provider APIs;
- company API-key auth is the first qualification route;
- Azure `model` value maps to approved deployment name/profile rather than assuming a public Direct OpenAI model ID;
- Direct OpenAI is not a company fallback;
- Azure provider state/resource identity is distinct from historical Direct `OPENAI` state;
- no new provider-state sheet/database; append-only provider state in the existing five-sheet architecture is preferred;
- normal-user Knowledge Search UI remains provider-neutral; admin provider settings identify Azure OpenAI;
- synthetic Responses + File Search lifecycle must PASS before any real source indexing;
- FULL_EXPORT remains non-AI and independent of Azure availability.

Authoritative decision:
`docs/decisions/company-azure-openai-provider.md`

Implementation plan:
`docs/planning/work0030-azure-openai-provider-transition.md`

Work 0028 CODEX-15 keeps provider calls at zero and defers actual File Search/citation runtime evidence to Work 0030. Once Work 0028 provider-independent source/runtime baseline is accepted/merged, allocate `0030-CODEX-01`.

## Next gate

CODEX-15 returns on existing PR #51 with standalone installation continuity, schema 7 setup/validation, exact remote/version/deployment continuity and provider-independent target-runtime R1-R8 evidence. ChatGPT reviews the final state. If no BLOCKER remains, merge PR #51 and apply Completion Latch to Work 0028. Then activate Work 0030 for Azure OpenAI synthetic qualification and adapter transition.

## Work 0029 collision recovery and dispatch tombstones

Historical `0028-CODEX-01` and `0028-CODEX-02` remain consumed identifiers and are never reused. Work 0029 remains the canonical accepted shared-admin implementation.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain FOLLOW_UP/OPTIONAL.
