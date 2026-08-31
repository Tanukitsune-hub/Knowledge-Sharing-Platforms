# Work 0025 — AI model/thinking policy and user selection

WORK_ID: `0025`
DISPATCH_ID: `0025-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `REVIEW_FIX -> QUALIFICATION`

Completion report:

`docs/handoffs/0025-CODEX-02-thinking-profile-qualification-gate-report.md`

Accepted CODEX-01 report:

`docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-report.md`

Canonical delivery order:

`docs/planning/work-registry.md`

Authoritative decision:

`docs/decisions/ai-model-policy-and-thinking-controls.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Completed outcome

The Settings-backed registry, administrator controls, normal-user selectors, raw model/thinking rejection, current OpenAI default migration and historical model support remain accepted.

CODEX-02 closes the qualification mismatch: every user-selectable thinking tuple is now individually qualified using the exact model, provider-default omission or raw thinking value, output ceiling and File Search request shape. Unqualified and failed thinking choices remain hidden and are rejected server-side.

The exact tested source is deployed on the same private Web App as version 60. The current `gpt-5.6-terra` + provider-default tuple and designated synthetic OpenAI Pitchbook/Meeting paths passed bounded live qualification.

## Closed scope

Work 0025 is complete. Provider discovery, per-user preference persistence, exhaustive model/latency benchmarking and cosmetic administrator refinements remain separate backlog items. Work 0021 may consume the completed effective-policy request contract. Work 0023, Gemini recovery and large-file recovery remain separate Works.

WORK_ID: `0025`
DISPATCH_ID: `0025-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
