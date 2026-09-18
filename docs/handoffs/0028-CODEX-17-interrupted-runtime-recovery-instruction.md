# CODEX-17 — interrupted runtime recovery and fresh-bound qualification resume

WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: CODEX
STATUS: READY
MODE: BUILD
PHASE: B1.5 / INTERRUPTED DISPATCH RECOVERY / FRESH BOUND TARGET QUALIFICATION

## Why this Dispatch exists

`0028-CODEX-16` was issued on 2026-09-09, but the remote Codex chat is not reliably readable. The controller cannot determine from chat state whether CODEX-16 never started, partially executed, completed external Google mutations without committing a report, or stopped before return.

GitHub readback on 2026-09-17 establishes only the following:

- Draft PR #51 is still open.
- remote PR branch `codex/0028-production-contract-build` still points to `751df8350b9f08cb5a6650e5bd21d1e7793f8ab7`.
- there is no `0028-CODEX-16-fresh-bound-runtime-qualification-report.md` on the remote PR branch.
- no PR-branch commit after the CODEX-15 return is visible remotely.
- the last durable controller instruction is CODEX-16 `READY` on main / PR conversation.

This proves that CODEX-16 did not return durable GitHub evidence. It does **not** prove that no external Google Workspace / Apps Script side effect occurred.

Therefore CODEX-16 is superseded as the active execution request, but its mutation budget and any actual external side effects carry forward. Do not assume a clean slate.

## Primary Outcome

Unchanged from CODEX-16: qualify the accepted PR #51 provider-independent production implementation end-to-end on the final fresh container-bound installation architecture.

Before any new mutation, recover the actual execution state left by CODEX-16. Then either:

1. adopt and safely resume the exact partially created fresh qualification target; or
2. if read-only evidence positively establishes that CODEX-16 never created a target, execute the original CODEX-16 fresh-target qualification once; or
3. if state cannot be established safely, stop before any new mutation and return the ambiguity.

Azure OpenAI transition / provider qualification is explicitly deferred by the user. Work 0030 must not be activated or prepared in this Dispatch.

## Start point

Repository:
`Tanukitsune-hub/Knowledge-Sharing-Platforms`

Continue existing branch / Draft PR #51:

```text
branch: codex/0028-production-contract-build
PR: #51
remote HEAD observed by controller: 751df8350b9f08cb5a6650e5bd21d1e7793f8ab7
frozen source commit: 5842a07255a10415d39d524fd8ec174450248855
bundle commit: 2ab8b262c7211af5464f3201a77c6e45484cdc6c
accepted focused: 78/78 PASS
accepted canonical: 515/515 PASS
accepted bundle: 27/27 PASS
```

Read first from current `origin/main` without merging/rebasing it into the PR branch merely to import control docs:

- `AGENTS.md`
- `docs/agent-governance/dispatch-control.md`
- `docs/handoffs/0028-dispatches.md`
- `docs/handoffs/0028-CODEX-16-fresh-bound-runtime-qualification-instruction.md`
- this instruction
- `docs/planning/work-registry.md`
- `docs/decisions/modular-source-single-bundle-distribution.md`
- `docs/operations/apps-script-web-app-deployment.md`

PR #51 currently diverges from main and may not be mergeable until controller-owned control-doc conflicts are reconciled later. Do not solve that by merge/rebase/reset in this Dispatch. Runtime evidence comes first; ChatGPT will own final PR convergence.

## Closed Conclusions / Accepted Evidence

Preserve without reopening absent direct contradictory evidence:

- PR #50 Light design baseline is accepted/merged.
- PR #51 provider-independent source direction is accepted for runtime qualification.
- schema 7 / Pitchbook append contract is accepted.
- prepare lifecycle blocker is CLOSED.
- focused 78/78, canonical 515/515, bundle 27/27 are accepted for the frozen source/bundle.
- historical standalone version75 strategy is SUPERSEDED.
- historical standalone project/deployment must not be mutated.
- Direct OpenAI / Gemini / Azure OpenAI calls are outside Work 0028.
- Azure Work 0030 is now user-deferred and is not the automatic next action after Work 0028.

## Phase 0 — recovery preflight (READ-ONLY first)

Do not create, edit, deploy, install, delete, upload, sync, or write business data until Phase 0 classification is complete.

### 0A. Local / Git recovery

Inspect read-only first:

- current working directory and branch;
- `git status` including untracked files;
- local HEAD and recent local commits;
- remote branch HEAD after a normal fetch/readback;
- any local-only commits or uncommitted files attributable to CODEX-16;
- whether a CODEX-16 report or notes exist only locally.

Guardrails:

- do not `reset --hard`, `clean`, discard, overwrite, or silently stash unknown work;
- do not force-push or rewrite history;
- do not merge/rebase main simply to pick up control docs;
- if local-only CODEX-16 changes include application source changes, do not push/continue runtime qualification: preserve them and return to ChatGPT for review;
- if local-only material is report/evidence only, preserve and inspect it before deciding the resume point.

### 0B. External target recovery

Using the already authenticated owner context, perform a bounded read-only inventory for any synthetic fresh qualification target that CODEX-16 may have created.

Search only where safe and relevant, using creation time / synthetic naming / parent relationships / bound-project relationship / deployment metadata as available. Do not inspect unrelated confidential file contents.

Determine whether there is positively identifiable evidence of any of the following:

- isolated qualification folder;
- host Spreadsheet;
- container-bound Apps Script project;
- installed Knowledge Share resources;
- installer state / schema state;
- qualification WEB_APP deployment;
- synthetic Meeting / tiny file / export artifacts.

Do not put private IDs, URLs, account identifiers, deployment IDs, credentials, or organization-specific locations into GitHub or chat.

Absence of a Git commit/report is not evidence of absence of these external resources.

### 0C. Recovery classification

Classify exactly one state before mutation:

```text
CODEX16_RECOVERY_STATE: RECOVERED_COMPLETE
CODEX16_RECOVERY_STATE: RECOVERED_PARTIAL
CODEX16_RECOVERY_STATE: NOT_STARTED_CONFIRMED
CODEX16_RECOVERY_STATE: AMBIGUOUS_EXTERNAL_STATE
```

Definitions:

- `RECOVERED_COMPLETE`: the exact fresh target exists and direct readback shows CODEX-16 already completed the required qualification evidence sufficiently; do not rerun passed mutations merely to recreate a report.
- `RECOVERED_PARTIAL`: the exact fresh target exists and can be positively identified, but one or more acceptance steps are unproven/incomplete. Resume the same target from the earliest unproven safe step.
- `NOT_STARTED_CONFIRMED`: bounded read-only evidence positively supports that no CODEX-16 fresh target/deployment was created. Only then may a new target be created under the original one-target budget.
- `AMBIGUOUS_EXTERNAL_STATE`: the run may have created/mutated a target but it cannot be identified or excluded with adequate confidence. Stop before new mutation. Do not create a second target to escape ambiguity.

If one narrowly scoped native Google UI action by the user can resolve ambiguity or consent, return `BALL: USER / STATUS: ACTION_REQUIRED` with only the necessary UI steps. Do not request private IDs/URLs/tokens in chat.

Otherwise return `BALL: CHATGPT / STATUS: RETURNED` with `BLOCKER: AMBIGUOUS_EXTERNAL_STATE`.

## Phase 1 — resume the qualification

After Phase 0 only, use `docs/handoffs/0028-CODEX-16-fresh-bound-runtime-qualification-instruction.md` as the unchanged acceptance contract for installer qualification, one owner-only WEB_APP, and R1-R8.

The following recovery rules override any assumption that CODEX-17 starts a new mutation budget:

- CODEX-16 + CODEX-17 together may create at most one fresh qualification target.
- Any existing target created by CODEX-16 counts as that one target.
- Any installer call already performed counts against the CODEX-16 initial/idempotency call budget.
- Any WEB_APP deployment already created counts against the max-one deployment budget.
- Any business-flow mutation already completed must not be repeated unless the original step is not safely observable and repetition is explicitly idempotent under the accepted contract.
- if you cannot determine whether a non-idempotent mutation already occurred, stop rather than duplicate it.
- do not create a second folder/Spreadsheet/bound project/deployment for convenience.
- historical standalone version75 mutations remain 0.
- source repair remains 0. A directly observed fresh-target application defect -> STOP and return; do not patch in the same run.

If `NOT_STARTED_CONFIRMED`, execute CODEX-16 from its Fresh target boundary onward exactly once.

If `RECOVERED_PARTIAL`, resume only the same exact target and only from the earliest safely unproven step.

If `RECOVERED_COMPLETE`, validate only the minimum readback needed to make the recovered evidence reviewable and proceed to reporting. Do not recreate evidence through duplicate side effects.

## Provider / Azure boundary

```text
Direct OpenAI calls: 0
Gemini calls: 0
Azure OpenAI calls: 0
AI sync: disabled
Work 0030: DEFERRED_BY_USER
provider File Search/citation runtime: NOT PART OF WORK 0028
```

Do not prepare Azure credentials, endpoints, Vector Stores, tests, code, or a Work 0030 dispatch after Work 0028 acceptance. Stop with the Work 0028 return.

## Validation scope

If application source/dist are unchanged from accepted frozen source/bundle, do not rerun broad deterministic suites merely because the Codex chat was interrupted. Reuse accepted deterministic evidence and run only the target-runtime qualification/recovery checks needed for this outcome.

If application source/dist differ unexpectedly from the accepted frozen state, classify the difference before execution. Do not normalize it away. If it is not an already-reviewed CODEX-16 report-only change, stop and return to ChatGPT.

## Required report

Create/update on the PR #51 branch:

`docs/handoffs/0028-CODEX-17-interrupted-runtime-recovery-report.md`

Report at minimum:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
CODEX16_RECOVERY_STATE
REMOTE_PR_HEAD_AT_START
LOCAL_HEAD_AT_START
LOCAL_UNPUSHED_STATE
EXTERNAL_TARGET_STATE
RESUME_POINT
INSTALLER_QUALIFICATION
BUNDLE_IDENTITY
TARGET_RUNTIME_R1_R8
PROVIDER_RUNTIME_QUALIFICATION: OUT_OF_SCOPE / CALLS_0
AZURE_WORK_0030: DEFERRED_BY_USER
SIDE_EFFECT_STATE_CODEX16_PLUS_CODEX17
RESIDUAL_SYNTHETIC_RESOURCES
BLOCKER
READY
```

Do not record private IDs/URLs/accounts/credentials.

Commit only the report/evidence needed for this Dispatch unless a prior CODEX-16 report-only artifact is being preserved. No new application source change is expected.

## Completion gate

Return to ChatGPT after one of:

1. R1-R8 provider-independent target-runtime qualification is reviewably complete on the single fresh bound target; or
2. a direct fresh-target application defect is observed; or
3. external state is ambiguous enough that another mutation risks duplicate/corrupt side effects; or
4. a narrowly defined user OAuth/native UI action is required.

Do not merge PR #51. Do not activate Work 0030.

Final response MUST begin and end with the same exact identity block:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: CHATGPT
STATUS: RETURNED
```

If native user action is genuinely required, use instead:

```text
WORK_ID: 0028
DISPATCH_ID: 0028-CODEX-17
BALL: USER
STATUS: ACTION_REQUIRED
```
