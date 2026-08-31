# Work 0025 — AI model/thinking policy and user selection

WORK_ID: `0025`
DISPATCH_ID: `N/A`
BALL: `NONE`
STATUS: `ACCEPTED`
MODE: `BUILD -> QUALIFICATION -> MERGE`

Completion reports:

- `docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-report.md`;
- `docs/handoffs/0025-CODEX-02-thinking-profile-qualification-gate-report.md`.

Canonical delivery order:

`docs/planning/work-registry.md`

Authoritative decision:

`docs/decisions/ai-model-policy-and-thinking-controls.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted outcome

The application has a Settings-backed administrator-governed model/thinking registry, administrator controls, normal-user selectors, raw-value rejection, current OpenAI default migration, historical model support, and server-side effective-policy enforcement.

Every user-selectable thinking tuple is individually qualified using the exact provider, model, provider-default omission or raw thinking value, output ceiling and File Search request shape. Unqualified and failed choices are hidden and rejected server-side.

The exact tested source remains deployed on the same private Web App as version 60. The current `gpt-5.6-terra` + provider-default tuple and designated synthetic OpenAI Pitchbook/Meeting paths passed bounded live qualification.

## GitHub acceptance

PR #33 merged the final Work 0025 branch to `main` at `121f2a1c4655ece46c7e07163b0d12866600923e`. Draft PR #32 was closed unmerged only as a transport workaround; no implementation difference existed between the two PRs.

## Closed scope

Provider discovery, per-user preference persistence, exhaustive model/latency benchmarking and cosmetic administrator refinements remain optional backlog items. Work 0021 consumes the accepted effective-policy request contract. Work 0023, Gemini recovery and large-file recovery remain separately governed.

WORK_ID: `0025`
DISPATCH_ID: `N/A`
BALL: `NONE`
STATUS: `ACCEPTED`
