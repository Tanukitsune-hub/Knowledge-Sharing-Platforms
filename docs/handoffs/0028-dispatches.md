# Work 0028 dispatch control

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
ACTIVE_DISPATCH_ID: 0028-CODEX-17
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.5 / INTERRUPTED DISPATCH RECOVERY / FRESH BOUND TARGET QUALIFICATION

## Current state

PR #50のLight designはaccepted/merged済み。Draft PR #51でproduction implementationを収束中。

Accepted PR #51 implementation evidence:

- remote PR HEAD observed 2026-09-17: `751df8350b9f08cb5a6650e5bd21d1e7793f8ab7`
- frozen source: `5842a07255a10415d39d524fd8ec174450248855`
- bundle commit: `2ab8b262c7211af5464f3201a77c6e45484cdc6c`
- focused 78/78 PASS
- canonical 515/515 PASS
- bundle 27/27 PASS
- prepare lifecycle blocker: CLOSED
- historical standalone saved source: frozen source 83/83 parity
- historical deployed `/exec`: immutable version75 unchanged
- provider calls in accepted evidence: 0

Historical standalone runtime strategy remains SUPERSEDED. Do not return to version75 qualification.

## CODEX-16 interruption / controller finding

CODEX-16 was issued on 2026-09-09 for a fresh container-bound synthetic qualification target. Because the remote Codex chat is not reliably readable, its execution state cannot be trusted from chat history.

GitHub readback on 2026-09-17 shows:

- PR #51 remote branch HEAD is still the CODEX-15 return commit `751df8350...`;
- no CODEX-16 report exists on the remote PR branch;
- no later PR-branch commit proving CODEX-16 completion is visible;
- the durable main/PR instruction remained `0028-CODEX-16 / BALL: CODEX / STATUS: READY`.

Therefore:

```text
CODEX16_DURABLE_GITHUB_RETURN: NONE
CODEX16_EXTERNAL_SIDE_EFFECT_STATE: UNKNOWN
CODEX16_ACTIVE_EXECUTION: SUPERSEDED_BY_CODEX17
APPLICATION_DEFECT_FROM_CODEX16: NOT ESTABLISHED
```

The absence of GitHub output does not prove that no Google Workspace / Apps Script mutation occurred. CODEX-17 must recover actual state read-only before any new mutation.

## Primary Outcome

Accepted Light UI + production backend contractがfinal target architectureでend-to-end成立することを証明する。

Target acceptance remains:

1. fresh container-bound installer succeeds / idempotent.
2. schema7 / 5-sheet backend / accepted resources established.
3. GP/non-GP Meeting parent-first registration.
4. parent-bound tiny file / metadata readback.
5. existing Meeting follow-up file add.
6. visible file delete=unlink / relink / stable IDs / physical delete 0.
7. relation-only mutation preserves authoritative Meeting Google Docs body exactly.
8. dedicated Meeting-only / non-AI Full Output works without AI provider.
9. provider calls 0 / AI sync disabled / owner-only qualification access.

## CODEX-17 recovery rule

Before creating anything, CODEX-17 classifies the interrupted CODEX-16 state as exactly one of:

```text
RECOVERED_COMPLETE
RECOVERED_PARTIAL
NOT_STARTED_CONFIRMED
AMBIGUOUS_EXTERNAL_STATE
```

The one-target/deployment/mutation budgets are cumulative across CODEX-16 + CODEX-17. If a fresh target already exists, it must be adopted rather than recreated. If absence cannot be established safely, do not create a second target.

Local unpushed/uncommitted CODEX-16 work must not be reset, cleaned, discarded, or silently overwritten. Unexpected application source changes require return to ChatGPT before runtime continuation.

## Accepted evidence retained

- PR #51 source direction
- schema7 4-column Pitchbook append contract
- prepare lifecycle bounded safety
- focused 78/78
- canonical 515/515
- bundle 27/27
- historical saved source parity 83/83

Do not re-open without direct contradiction from the fresh target or recovered interrupted state.

## Fresh target authorization boundary

Allowed, subject to cumulative CODEX-16 + CODEX-17 budgets:

- at most one isolated qualification folder
- at most one host Spreadsheet
- at most one container-bound Apps Script project
- one exact generated distribution install path
- installer-created accepted resources inside isolated parent
- at most one owner-only qualification WEB_APP deployment
- synthetic/anonymized records/files/exports

Not allowed:

- real confidential data
- company/broad rollout
- access expansion beyond qualification owner
- existing historical version75 deployment mutation/rollback
- physical delete/destructive cleanup
- second qualification target merely because CODEX-16 chat is unreadable
- Direct OpenAI/Gemini/Azure provider calls
- source repair in the same Dispatch after a fresh-target application defect; on defect STOP and return
- merge/rebase/reset solely to resolve PR/main control-doc divergence during runtime qualification

## Provider / Azure boundary

User decision 2026-09-17: Azure OpenAI transition is deferred for now.

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
actual File Search/citation provider runtime: OUT_OF_SCOPE_FOR_WORK_0028
WORK_0030: DEFERRED_BY_USER
```

A fresh qualification target may remain retained after Work 0028, but CODEX-17 must not activate, prepare, or begin Work 0030.

## Dispatch history

| Dispatch | Disposition |
|---|---|
| 0028-CODEX-01 / 02 | historical tombstone; never reuse |
| 0028-CODEX-03..09 | Light design iterations |
| 0028-CODEX-10 | PR #47/#48/#49 consumed history |
| 0028-CODEX-11 | PR #50 accepted/merged Light baseline |
| 0028-CODEX-12 | PR #51 production BUILD / deterministic PASS / runtime incomplete |
| 0028-CODEX-13 | prepare lifecycle blocker CLOSED / Execution API 403 |
| 0028-CODEX-14 | saved source push 83/83 / wrong bound-installer path |
| 0028-CODEX-15 | private editor Run path unavailable / historical strategy superseded |
| 0028-CODEX-16 | fresh-bound qualification issued; no durable GitHub return; execution/side-effect state unknown; superseded for recovery |
| 0028-CODEX-17 | recover interrupted state read-only, then resume single fresh-bound target qualification / READY |

## Active instruction

`docs/handoffs/0028-CODEX-17-interrupted-runtime-recovery-instruction.md`

Continue same branch / Draft PR #51. New implementation PRを作らない。main control docsをbranchから上書きしない。

## Completion gate

CODEX-17 must first reconcile CODEX-16 actual state, then return reviewable provider-independent fresh-bound installer + owner-only WEB_APP + R1-R8 runtime evidence, or stop safely on an identified application defect / ambiguous external state / required native user action.

ChatGPT reviews the final evidence. If no BLOCKER remains, ChatGPT will reconcile PR #51, merge it, and apply Completion Latch to Work 0028.

After Work 0028 acceptance, stop. Work 0030 remains deferred until a later explicit user decision.

```text
THEME_SCOPE: LIGHT_ONLY
DESIGN_BASELINE: PR_50_MERGED
PR_51: OPEN_DRAFT
MODE: BUILD
ACTIVE_DISPATCH: 0028-CODEX-17
BALL: CODEX
STATUS: READY
PREPARE_LIFECYCLE_BLOCKER: CLOSED
HISTORICAL_STANDALONE_RUNTIME_STRATEGY: SUPERSEDED
TARGET_RUNTIME_STRATEGY: RECOVER_THEN_FRESH_CONTAINER_BOUND
CODEX16_EXTERNAL_STATE: UNKNOWN
PROVIDER_RUNTIME: OUT_OF_SCOPE
PROVIDER_CALLS_AUTHORIZED: NO
WORK_0030: DEFERRED_BY_USER
REAL_DATA_ROLLOUT_AUTHORIZED: NO
BROAD_DEPLOYMENT_AUTHORIZED: NO
NEXT_UNUSED_DISPATCH: 0028-CODEX-18
WORK_0028_COMPLETE: NO
```

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: CODEX
STATUS: READY
