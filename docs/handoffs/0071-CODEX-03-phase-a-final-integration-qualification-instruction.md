# Work 0071 CODEX-03 — Phase A final integration qualification

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-03
BALL: CODEX
STATUS: READY
MODE: QUALIFICATION
VALIDATION_TIER: TIER_2_STANDARD
USER_NATIVE_ACTION_BUDGET: 0
USER_PRESENCE_REQUIRED_BY_DEFAULT: NO

## Goal

Draft PR #104のPhase A candidateをlatest mainへreconcileし、canonical repository gateを通してPhase A integration readinessを確定する。

This Dispatch is qualification/reconciliation only.

- no new product feature
- no Phase B implementation
- no target-runtime mutation
- no user-native action
- no source patch unless latest-main merge exposes a material deterministic contradiction

## Read First

- nearest `AGENTS.md`
- `docs/decisions/target-runtime-first-development.md`
- `docs/agent-governance/work-control.md`
- `docs/planning/work0071-interaction-stability-ux.md`
- `docs/product/stable-interaction-layout.md`
- `docs/product/work0071-google-web-ux-adoption.md`
- `docs/handoffs/0071-CODEX-01-phase-a-interaction-stability-report.md`
- `docs/handoffs/0071-CODEX-02-phase-a-repair-file-marker-report.md`
- `docs/handoffs/0071-dispatches.md`

## ChatGPT Review — Accepted CODEX-02 Evidence

The following are accepted and must not be reopened without material contradictory evidence.

### Source / behavior

- standalone status repair is implemented:
  - no-file validation remains actionable
  - valid selection clears the obsolete primary no-file error in deterministic production-client testing
  - pending/success/error/retry primary and file-local statuses agree
- vermilion file identity marker:
  - 8px
  - fixed `#D94A2A`
  - decorative / aria-hidden
  - state-independent
  - original filename remains accessible
- Work0049 busy/focus/duplicate-submit behavior remains covered.
- Work0070 retry / unknown-outcome / server upload contracts were not changed.
- Phase B surface-specific changes were not introduced.

### Geometry / UX

Accepted evidence from CODEX-01/02:

- before geometry captured
- Phase A stable action/status shell
- 1440 / 390 changed-surface runtime geometry within <=1 CSS px
- local 320 / 200% zoom / reduced-motion PASS
- focused file marker states and long/multiple/max filename cases PASS
- material horizontal overflow 0 in covered states

### Release / distribution

- target release `0.2.1`
- schema `9`
- production-source freeze commit: `5519a8af66617196aff640a65b9a8168ad8a172f`
- canonical bundle file SHA-256: `681600c6b1494edc4e67616c25405edb59a46f9960a44f84e81d97d5e3158da5`
- canonical bundle payload SHA-256: `316b3348d96f86869aba0808efba59ef8b69725a053c418d7fe8966c5eb1f622`
- company multi-file package restored independent exact source/hash pins
- focused manifest tampering tests PASS
- 7-file concatenation = canonical bundle

Do not regenerate distribution merely because governance/docs commits are later than the production-source freeze commit.

## ChatGPT Decision — file chooser automation limitation

CODEX-02 reported:

- actual isolated Web App is serving exact candidate version 5
- owner-only/access boundary unchanged
- no-file runtime state and 1440/390 rendering were directly observed
- browser harness could not populate the actual file input
- valid-file transition on CODEX-02 exact candidate was therefore not directly observed in target runtime

This is classified as:

```text
AUTOMATION_LIMITATION: YES
APPLICATION_DEFECT: NO EVIDENCE
USER_ACTION_REQUIRED: NO
```

Do not ask the user to operate the OS picker.

For Phase A integration readiness, ChatGPT accepts the following composed evidence:

1. Work0070/CODEX-01 already established the native file-upload path in the same isolated Apps Script/Web App environment.
2. CODEX-02 did not change OS picker integration, upload transport, server upload semantics, Drive/Index persistence contract, or permissions.
3. CODEX-02 directly confirmed the exact candidate is saved/served by the isolated Web App.
4. The changed valid-selection/status/marker behavior is client-side and passes focused browser tests using production HTML/client code and the real `input[type=file]` change path.
5. No contradictory target-runtime evidence exists.

Important reporting rule:

- do NOT rewrite "valid-file exact-candidate target state NOT OBSERVED" as directly observed.
- preserve that limitation explicitly.
- it is not a BLOCKER under the revised unattended-first evidence contract.
- no further target deployment or native picker repetition is required for Phase A.

## Main-side governance blocker already repaired

CODEX-02 `npm run check` failed only because latest-main `AGENTS.md` exceeded the repository 12 KiB compact-context gate.

ChatGPT has repaired main by compacting repository-specific wording while preserving the durable rule in the canonical decision doc.

Expected latest-main state:

```text
AGENTS.md < 12,288 UTF-8 bytes
AGENTS.md < 180 lines
USER_NATIVE_ACTION_BUDGET rule preserved
detailed policy remains docs/decisions/target-runtime-first-development.md
```

Do not weaken or raise the validator limit.

## Required Action

### 1. Reconcile latest main

On existing branch:

`work/0071-interaction-stability`

- fetch latest `origin/main`
- normal merge once
- no rebase
- no force push
- preserve PR #104
- expected merge content is governance/docs only
- if any `src/**`, bundle source-order, release identity, or generated distribution conflict appears, STOP and return to ChatGPT before editing

### 2. Confirm production source identity is unchanged

After merge:

- verify `src/**` relevant to Work0071 remains identical to the accepted CODEX-02 source freeze
- verify target release remains `0.2.1`, schema9
- verify release manifest source commit/hash pins remain the accepted exact values
- verify company package independent pins remain exact
- governance/docs merge must not trigger bundle regeneration

If source identity changed, STOP.

### 3. Run the canonical check

Run exactly:

```text
python tools/validate_agent_foundation.py
npm run check
git diff --check
```

Do not edit tests/assertions to make them pass.

Expected:
- agent foundation PASS
- complete direct suite PASS
- bundle/package PASS
- diff hygiene PASS

If the only failure is a new latest-main governance contradiction, report it; do not patch unrelated product source.

### 4. Final relevant diff review

Confirm PR #104 contains only Work0071 Phase A implementation, release/distribution consequences, tests/reports, and merged governance docs.

Specifically confirm:
- root AGENTS.md equals latest main
- no Phase B source implementation
- no provider/schema/permission changes
- no secret/private target ID
- no company data
- no target-runtime mutation in CODEX-03

## No Runtime Mutation

CODEX-03 must not:

- sync Apps Script source
- create immutable version
- update deployment
- create target
- upload a file
- run Gmail/Gemini/provider actions
- change triggers
- touch company environment
- request user action

CODEX-02 version 5 runtime evidence is preserved.

## Phase A Decision Fields

If all required checks pass, report:

```text
PHASE_A_LOGIC_VALIDATION: PASS
CANONICAL_CHECK: PASS
TARGET_RUNTIME_CANDIDATE_IDENTITY: PASS
VALID_FILE_EXACT_CANDIDATE_DIRECT_RUNTIME_STATE: NOT_OBSERVED_AUTOMATION_LIMITATION
NATIVE_UPLOAD_PATH_ACCEPTED_EVIDENCE: REUSED
PHASE_A_INTEGRATION_READY: YES
BLOCKER: NONE
```

Do NOT mark Work0071 as ACCEPTED or apply Completion Latch.

Work0071 continues to Phase B after Phase A integration.

## Delivery

Continue Draft PR #104. Do not open another PR.

Create:

`docs/handoffs/0071-CODEX-03-phase-a-final-integration-qualification-report.md`

Update branch copy:

`docs/handoffs/0071-dispatches.md`

Return PR #104 to ChatGPT for merge decision.

## Mandatory final identity

```text
WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-03
BALL: CHATGPT
STATUS: RETURNED
```

WORK_ID: 0071
DISPATCH_ID: 0071-CODEX-03
BALL: CODEX
STATUS: READY
