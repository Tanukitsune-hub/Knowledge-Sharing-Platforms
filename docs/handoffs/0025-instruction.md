# Work 0025 — AI model/thinking policy and user selection

WORK_ID: `0025`
DISPATCH_ID: `0025-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD -> QUALIFICATION`

Authoritative dispatch instruction:

`docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-instruction.md`

Canonical delivery order:

`docs/planning/work-registry.md`

Authoritative decision:

`docs/decisions/ai-model-policy-and-thinking-controls.md`

Detailed Work plan:

`docs/planning/work0025-ai-model-policy-and-user-selection.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted dependency

Work 0020 is ACCEPTED / MERGED. Preserve its qualified OpenAI File Search, exact-filter, citation/source-normalization, sync/lifecycle/recovery, and private Web App version-58 evidence. Do not reopen that Work absent material contradictory evidence.

## Outcome

Implement one coherent policy layer so administrators control model/thinking availability and normal users select only effective approved combinations. Existing requests without explicit selections must resolve to the current qualified OpenAI default without silently changing behavior.

Work 0025 also reconciles Work 0021 planning so the next search-feature Work consumes this effective-policy resolver instead of later rebuilding model/thinking request handling.

## Scope discipline

This is a broad-progress Work, not an exhaustive provider/model benchmark. The currently qualified OpenAI default is the only mandatory live profile. At most one additional already-accessible profile may be live-qualified only if genuinely necessary to prove switching.

Do not call Gemini, broad-sync source data, retry large fixtures, implement Work 0021/0023, or extend this Work for cosmetic/non-blocking refinements.

## Delivery

Create a fresh Work branch from the exact current `main` SHA supplied in the direct dispatch message. Suggested branch:

`agent/0025-model-thinking-policy`

Open one Draft PR against `main`. Do not merge it.

The detailed instruction owns implementation, tests, target-runtime qualification, safety boundaries, completion gates, reporting, and final-return format.

## Completion

CODEX-01 completed the model/thinking policy foundation and target-runtime qualification on the existing private Web App version 59. Focused 74/74 and canonical 341/341 checks passed. The current OpenAI default, hidden-profile policy, normal-user selectors, exact designated-source queries and normalized citations passed with no blocker.

Detailed report:

`docs/handoffs/0025-CODEX-01-model-policy-foundation-and-user-selection-report.md`

WORK_ID: `0025`
DISPATCH_ID: `0025-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
