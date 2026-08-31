# Work 0025 dispatch control

WORK_ID: `0025`
ACTIVE_DISPATCH_ID: `0025-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0025-CODEX-02 — READY / THINKING QUALIFICATION GATE

Final review of CODEX-01 found one material mismatch in the primary Work 0025 outcome:

- model qualification currently tests `modelId` only;
- it does not send each configured thinking value/provider-default omission and output ceiling;
- a successful model-only test marks the whole model profile qualified;
- all enabled thinking profiles then become user-selectable even when the exact model/thinking tuple was never qualified.

Instruction:

`docs/handoffs/0025-CODEX-02-thinking-profile-qualification-gate-instruction.md`

Required outcome:

- per-thinking qualification state;
- exact model + thinking + output qualification request;
- only individually qualified thinking choices exposed;
- server-side rejection of unqualified/failed thinking choices;
- preserve current `gpt-5.6-terra` + provider-default behavior;
- bounded deterministic and version-60 target-runtime qualification;
- return PR #32 for final merge without another broad hardening loop.

## Returned dispatches

### 0025-CODEX-01 — RETURNED / MAJOR VERTICAL SLICE PASS, ONE CORE REVIEW GAP

Accepted evidence:

- Settings-backed model policy registry;
- administrator model/thinking controls;
- normal-user selectors;
- raw model/thinking rejection and server-side model-policy enforcement;
- current OpenAI default migration;
- focused 74/74 and canonical 341/341 PASS;
- exact 79/79 source readback;
- same private Web App version 59;
- designated OpenAI Meeting/Pitchbook query and citation PASS;
- no Gemini, broad sync, FULL_OUTPUT runtime call, or large-fixture mutation.

CODEX-01 report:

`docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-report.md`

## Current classification

```text
MODEL_POLICY_REGISTRY: PASS
ADMIN_MODEL_CONTROL: PASS
USER_MODEL_SELECTOR: PASS
RAW_MODEL/THINKING_BYPASS: BLOCKED
CURRENT_DEFAULT_OPENAI_PATH: PASS
THINKING_PROFILE_QUALIFICATION: INCOMPLETE
PR_32: Draft / Open / unmerged / mergeable before handoff commits
GITHUB_CI_ACTUALLY_RAN: NO
READY_FOR_FINAL_MERGE: NO
BLOCKER: THINKING_PROFILE_QUALIFICATION_NOT_EXACT
```

## Scope discipline

CODEX-02 fixes only the exact qualification mismatch. Do not call Gemini, broad-sync sources, retry large fixtures, implement Work 0021/0023, add discovery, benchmark the model catalog, or redesign the UI.

WORK_ID: `0025`
ACTIVE_DISPATCH_ID: `0025-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
