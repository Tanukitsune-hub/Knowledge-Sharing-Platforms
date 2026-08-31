# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD -> QUALIFICATION`

Active instruction:

`docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-instruction.md`

Dispatch register:

`docs/handoffs/0021-dispatches.md`

Canonical delivery order:

`docs/planning/work-registry.md`

Detailed Work plan:

`docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

Authoritative decisions and architecture:

- `docs/decisions/ai-provider-selection-and-full-output.md`;
- `docs/decisions/ai-model-policy-and-thinking-controls.md`;
- `docs/ai/provider-neutral-file-search.md`.

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted dependencies

Work 0020 and Work 0025 are accepted and merged. Preserve their OpenAI File Search/citation/lifecycle behavior, FULL_OUTPUT source boundary, model/thinking selectors, exact tuple qualification and server-side policy enforcement.

The current private Web App baseline is version 60.

## CODEX-01 outcome

Implement the first bounded Work 0021 slice:

- one canonical core structured-filter model;
- one shared route/mode/filter UI;
- all five mode contracts;
- OpenAI grounded search/citations under the accepted model/thinking resolver;
- FULL_OUTPUT parity with the same filters/mode and no AI call;
- bounded deterministic and target-runtime qualification.

Explicit 2–5 Entity comparison, advanced exact filters, six-format qualification and Gemini recovery remain later dispatches.

## Scope discipline

This Work prioritizes broad product completion. Do not reopen accepted provider/model architecture or extend CODEX-01 for cosmetic UX, exhaustive edge cases, broad benchmarking, deferred features, or large-file work.

Follow the detailed instruction's completion and STOP rules. Open one Draft PR and return it for ChatGPT review; do not merge.

## CODEX-01 returned state

The canonical filter/mode implementation and all deterministic checks passed. Exact source readback passed and the same private Web App was updated once to version 61. The first new OpenAI compound-filter runtime query returned no retrieved source and no citation, so the STOP rule closed the dispatch before remaining live gates. Work 0021 remains blocked pending a fresh dispatch that reconciles the designated source's exact row metadata with current provider attributes without broad sync or weakened filtering.

Report:

`docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
