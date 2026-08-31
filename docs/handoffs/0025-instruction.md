# Work 0025 — AI model/thinking policy and user selection

WORK_ID: `0025`
DISPATCH_ID: `0025-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
MODE: `REVIEW_FIX -> QUALIFICATION`

Active dispatch instruction:

`docs/handoffs/0025-CODEX-02-thinking-profile-qualification-gate-instruction.md`

Accepted CODEX-01 report:

`docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-report.md`

Canonical delivery order:

`docs/planning/work-registry.md`

Authoritative decision:

`docs/decisions/ai-model-policy-and-thinking-controls.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted CODEX-01 outcome

The Settings-backed registry, administrator controls, normal-user selectors, raw model/thinking rejection, current OpenAI default migration, OpenAI File Search/citation regression, and private Web App version-59 qualification remain accepted.

## Active residual

CODEX-01 qualifies a selected model with a model-only synthetic request, then exposes every enabled thinking profile under the qualified model. The qualification request does not prove the exact thinking raw value/provider-default omission or output ceiling for each user-selectable combination.

CODEX-02 must add the smallest per-thinking qualification state and exact tuple gate so only combinations actually qualified for model + thinking + output + File Search are selectable and executable.

This is a material completion gap because company/project thinking support is intentionally treated as unknown. It is not permission for another broad hardening campaign.

## Scope discipline

Preserve Work 0020 and all accepted CODEX-01 behavior. Do not call Gemini, broad-sync source data, retry large fixtures, implement Work 0021/0023, add model discovery, or run exhaustive model/thinking benchmarks.

After the exact gate and bounded non-regression qualification pass, stop and return PR #32 for final merge.

WORK_ID: `0025`
DISPATCH_ID: `0025-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
