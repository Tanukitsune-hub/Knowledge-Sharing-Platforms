# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-03`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `BUILD -> QUALIFICATION`

Active instruction:

`docs/handoffs/0021-CODEX-03-multi-entity-comparison-and-advanced-exact-filters-instruction.md`

Accepted prior reports:

- `docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`;
- `docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-report.md`.

Dispatch register:

`docs/handoffs/0021-dispatches.md`

Canonical delivery order:

`docs/planning/work-registry.md`

Detailed Work plan:

`docs/planning/work0021-knowledge-search-filters-multi-entity-comparison.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted dependencies

Work 0020 and Work 0025 are accepted and merged. Preserve OpenAI File Search/citation/lifecycle/recovery, FULL_OUTPUT source boundaries, model/thinking policy, exact tuple qualification, and no-failover behavior.

## Accepted Work 0021 core

CODEX-01 implemented the canonical core structured-filter model, shared OpenAI/FULL_OUTPUT UI/contract, five mode templates and Audit redaction.

CODEX-02 proved the first runtime blocker was metadata-only drift, added exact in-place provider attribute reconciliation, and qualified the formerly failing compound filter, all five runtime modes, FULL_OUTPUT preview parity and Gemini-disabled/no-failover behavior on the same private Web App version 62.

Accepted evidence includes `360/360` canonical validation and exact `80/80` Apps Script readback. Do not reopen this core absent contradictory evidence.

## Completed CODEX-03 outcome

Completed and qualified:

- explicit 2–5 Entity comparison;
- per-Entity citation/evidence attribution and evidence-gap handling;
- exact Related GP and Meeting Type filters via authoritative Meeting token membership and bounded exact source-ID resolution;
- the same selected-Entity/advanced-filter semantics in FULL_OUTPUT;
- bounded OpenAI and FULL_OUTPUT runtime qualification using existing synthetic data.

Do not call Gemini, perform broad sync, implement formats/installer work, retry large fixtures, or start a general hardening loop.

CODEX-03 passed canonical `368/368`, exact Apps Script `80/80` readback, private Web App version-63 OpenAI comparison/advanced-filter runtime gates, and FULL_OUTPUT multi-Entity parity. Work 0021 now proceeds only under a fresh CODEX-04 dispatch for the six-format/provider-capability qualification. Gemini live recovery remains a separate near-completion Work.

Keep PR #34 Draft/Open/unmerged and follow the detailed instruction's validation, runtime, STOP and reporting rules.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-03`
BALL: `CHATGPT`
STATUS: `RETURNED`
