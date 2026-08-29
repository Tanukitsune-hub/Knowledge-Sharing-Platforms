# Structured Execution Handoff — Version 4

Use this template when work crosses agent runs, worktrees, machines, or external execution contexts. Delete fields that genuinely do not apply.

WORK_ID: `<zero-padded 4-digit ID or Not assigned>`
DISPATCH_ID: `<WORK_ID>-CODEX-<NN> | N/A for ChatGPT-only work>`
MODE: `<BUILD | INCIDENT_RECOVERY | INVESTIGATION | QUALIFICATION>`
BALL: `<CHATGPT | CODEX | USER | NONE>`
STATUS: `<PREPARING | READY | IN_PROGRESS | ACTION_REQUIRED | RETURNED | REVIEW | ACCEPTED | BLOCKED | SUPERSEDED>`

For Codex work, create/update `docs/handoffs/<WORK_ID>-dispatches.md` under `docs/agent-governance/dispatch-control.md`.

## Primary Outcome

State the usable user-visible or operator-visible end state.

## Acceptance Evidence and Hierarchy

List completion evidence strongest first. Identify any authorized user-assisted or native evidence that outranks automation harnesses.

## Fastest Safe Decisive Action

State the cheapest reversible action most likely to settle the next decision or restore use.

## Target Runtime, Test Data, and Side Effects

- `TARGET_RUNTIME`: actual Apps Script / Workspace / Web App / browser / Gemini surface that must work.
- `ISOLATED_TEST_DATA`: synthetic/anonymized data and segregated folder, Spreadsheet, Doc, record, account, ID, or namespace.
- `SIDE_EFFECT_STATE`: disabled, dry-run, guarded, test-only, or enabled triggers, billing, exposure, recipients, production data, destructive actions, and permissions.
- `STAGING_DECISION`: `Not required`, or the material safety/regulatory/blast-radius/rollback/platform reason for a separate runtime and the unique evidence it provides.

Use of the target runtime does not authorize confidential/production data, real users, billing, public exposure, destructive operations, or uncontrolled external effects.

## Sources of Truth and Closed Conclusions

- Authoritative paths, refs, schemas, or external systems:
- Already-proven facts that must not be reopened without material contradictory evidence:

## Required Scope

State only work needed now. For `BUILD`, identify the shortest coherent target-runtime slice that should persist/read back before the feature surface expands.

## Non-Goals and Follow-ups

- Explicit non-goals:
- Known follow-ups that must not block this Work:

## Authorization and Write Boundaries

Identify allowed paths, target Apps Script/resource identity, external actions, deployment/data/exposure boundaries, approvals, and prohibited operations.

## Active Hypothesis

Required for `INVESTIGATION`; optional otherwise.

- Hypothesis:
- Confirming observation:
- Falsifying observation:

## Execution Budget and Strategy Reset

- Retry / speculative patch / external mutation / deployment / evaluator limits:
- Reset or escalation trigger:
- Rollback or safe-stop route:

## Required Validation

### Logic Validation

List focused deterministic checks of algorithms, transformations, schemas, contracts, security rules, redaction, IDs, retries, and invariants.

### Target-Runtime Qualification

List the smallest native Apps Script / Workspace / browser / Gemini smoke/readback required using isolated data. A mock, simulator, test loader, CI run, alternate runtime, or local synthetic harness is not a substitute for platform-dependent behavior.

### Side-Effect Enablement

State which effects remain disabled/guarded and the separate authorization/evidence needed to enable them.

## Delivery

State branch, exact source ref, Apps Script synchronization/deployment boundary, commit, pull request, artifact, report, Work ID, Dispatch ID, and dispatch-register expectations.

## Completion Latch

State the condition that closes the primary outcome:

- `LOGIC_VALIDATION: PASS | FAIL | NOT RUN | NOT APPLICABLE`
- `TARGET_RUNTIME_QUALIFICATION: PASS | FAIL | NOT RUN | NOT APPLICABLE`
- `SIDE_EFFECT_STATE: DISABLED | GUARDED | TEST_ONLY | ENABLED | NOT APPLICABLE`
- `READY: YES | NO`

Once required evidence passes, do not add success criteria or reopen weaker evidence.

## Completion Report

The report retains the same Work/Dispatch IDs and changes ownership to the next actor.

### Mandatory Codex final chat response contract

The Codex final chat response MUST begin with this exact four-line block before any other text:

```text
WORK_ID: <same Work ID>
DISPATCH_ID: <same Dispatch ID>
BALL: CHATGPT
STATUS: RETURNED
```

Repeat the same four lines at the end of the response. If Codex stops for a native user action, use `BALL: USER` and `STATUS: ACTION_REQUIRED` instead.

Do not omit, abbreviate, translate away, or replace this block with a table, prose status sentence, commit SHA, branch, PR number, or validation matrix. The report file must carry the same Work ID and Dispatch ID. Missing either the opening or closing identity block is a reporting-contract failure.

Report:

- primary outcome and mode;
- target runtime, isolated test boundary, and side-effect state;
- logic validation actually executed;
- target-runtime qualification actually observed;
- material changes and exact source/deployment identity where relevant;
- blocker status;
- `FOLLOW_UP` / `OPTIONAL` residuals;
- strategy resets or budget exhaustion;
- bounded limitations on confidence.
