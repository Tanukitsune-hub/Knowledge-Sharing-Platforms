# Work Registry and Delivery Order

Current as of: 2026-09-09
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
| 6 | 0028 | 単一記録Light UIとproduction contractのend-to-end実装・検証 | ACTIVE (BUILD) | Accepted PR #50 + PR #51 source | Execute CODEX-16 fresh container-bound synthetic qualification on PR #51 |
| 7 | 0029 | Portable shared-password administrator mode | ACCEPTED | Work 0028 preserved | Preserve PR #39 / version-75 evidence |
| 8 | 0030 | Company Azure OpenAI provider transition + File Search qualification | PLANNED | Work 0028 accepted provider-neutral baseline | Reuse accepted fresh bound target where safe; start Azure synthetic qualification |
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

Current returned HEAD:
`751df8350b9f08cb5a6650e5bd21d1e7793f8ab7`

Accepted implementation evidence:

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

### Historical standalone qualification attempts — superseded

CODEX-13/14/15 established that the historical version75 Apps Script target is a standalone project and is a poor fit for the final installer architecture.

Observed stops:

1. Execution API private function -> 403 authorization boundary.
2. `checkKnowledgeShareReadiness()` -> expected `INSTALLER_BOUND_SPREADSHEET_REQUIRED` because target is standalone.
3. private `_` status/setup functions exist but observed editor Run surface does not list them.

No application defect was established.

Historical standalone current state:

- saved source was updated once to frozen source and verified 83/83;
- immutable version75 / served deployment remains old accepted source and unchanged;
- no setup/version/deployment/business/provider mutation occurred after that source push.

Controller Strategy Reset:
`docs/handoffs/0028-CODEX-15-controller-review.md`

Historical standalone strategy is SUPERSEDED. Do not keep adding execution surfaces or wrappers.

### CODEX-16 fresh container-bound qualification

Use final intended architecture directly.

Create exactly one isolated synthetic qualification target:

```text
isolated DEV folder
-> new host Spreadsheet
-> bound Apps Script
-> exact accepted generated distribution
-> installKnowledgeShare()
-> installer idempotency check
-> one owner-only WEB_APP deployment
-> deployment security/readiness
-> /exec R1-R8
```

CODEX-16 verifies:

- fresh schema7 / 5-sheet backend / installer idempotency;
- GP + non-GP parent-first Meeting creation;
- tiny non-GP parent-bound file + metadata readback;
- follow-up file on existing Meeting;
- unlink/relink / stable IDs / physical delete0;
- exact Meeting Docs body equality across relation-only mutation;
- dedicated Meeting-only Full Output without AI model/question;
- AI sync disabled / provider calls0 / owner-only access.

Fresh target may be retained for Work0030 Azure synthetic qualification.

Active instruction:
`docs/handoffs/0028-CODEX-16-fresh-bound-runtime-qualification-instruction.md`

Current BALL/STATUS:
`docs/handoffs/0028-dispatches.md`

Non-goals remain: real confidential data, broad/company rollout, historical orphan migration, new relation table, Dark/System, physical delete.

## Work 0030 planned contract

Company OpenAI-family provider = Azure OpenAI.

Closed direction:

- Azure v1 Responses / Files / Vector Stores / file_search;
- company API-key auth as first qualification route;
- raw Azure deployment names stay internal behind model profile policy;
- no Direct OpenAI/Gemini automatic fallback;
- Azure resource state isolated from historical Direct OPENAI state;
- synthetic Azure qualification before real corpus indexing;
- FULL_EXPORT stays non-AI.

Decision:
`docs/decisions/company-azure-openai-provider.md`

Plan:
`docs/planning/work0030-azure-openai-provider-transition.md`

## Next gate

CODEX-16 returns provider-independent fresh bound runtime evidence. ChatGPT reviews. If no BLOCKER remains, merge PR #51 and apply Completion Latch to Work0028. Then activate Work0030.

## Scope discipline

Only normal primary-flow failure, source/data integrity, credentials/authorization, authoritative citations, material irreversible side effects or required runtime evidence may block delivery. Cosmetic work, broad benchmarks and unrelated hardening remain FOLLOW_UP/OPTIONAL.
