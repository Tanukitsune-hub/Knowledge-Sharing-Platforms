# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Active dispatch

### 0021-CODEX-01 — RETURNED / TARGET-RUNTIME BLOCKER

Primary outcome:

- implement one canonical core filter contract shared by OpenAI and FULL_OUTPUT;
- extend the existing single Knowledge Search conditions/mode UI;
- qualify all five mode contracts on bounded scope;
- preserve Work 0025 administrator-governed model/thinking resolution;
- preserve Work 0020 grounded citations and FULL_OUTPUT source boundary;
- use OpenAI + FULL_OUTPUT only; keep Gemini disabled/deferred with safe no-failover behavior;
- stop after the major core slice passes and route multi-Entity/advanced filters/formats to later Work 0021 dispatches.

Instruction:

`docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-instruction.md`

Planning source of truth:

`docs/planning/work-registry.md`

Runtime locator:

`docs/operations/runtime-artifact-locator.md`

## Accepted dependencies

```text
WORK_0020: ACCEPTED / MERGED
WORK_0025: ACCEPTED / MERGED
CURRENT_PRIVATE_WEB_APP_VERSION: 60
CURRENT_OPENAI_TUPLE: openai-current-default / gpt-5.6-terra / provider-default
GEMINI: DISABLED / DEFERRED
```

## Dispatch boundaries

Deferred to `0021-CODEX-02`:

- explicit 2–5 Entity comparison;
- per-Entity citation attribution;
- advanced exact Related GP / Meeting Type filters and any associated metadata strategy.

Deferred to `0021-CODEX-03`:

- six-format matrix;
- provider-parity evidence beyond currently enabled OpenAI;
- Gemini recovery/live qualification.

No broad sync, large-fixture retry/mutation, Work 0023 implementation, historical migration, company rollout, new Vector Store/Web App/Library/public endpoint, rebase, force-push, or PR merge is authorized.

## CODEX-01 result

- canonical core filters and all five modes: implemented;
- focused tests: `32/32` PASS;
- canonical repository checks: `355/355` PASS;
- exact Apps Script readback: `80/80` PASS;
- same private Web App: updated once to version `61`;
- first OpenAI compound-filter qualification: safe insufficient-evidence result with zero citations;
- STOP applied before any second query, FULL_OUTPUT runtime, Gemini attempt, source sync, or second deployment;
- blocker: `OPENAI_COMPOUND_FILTER_EXISTING_INDEX_METADATA_MISMATCH_OR_EMPTY_RETRIEVAL`;
- report: `docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`.

## Completion discipline

Extend this dispatch only for a material blocker to the core shared filters/modes, authoritative citations, Work 0025 policy enforcement, FULL_OUTPUT API independence/source boundary, data integrity, or required deterministic/native qualification.

Cosmetic UX, broad benchmarking, exhaustive edge cases and deferred features go to later dispatches or backlog.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-01`
BALL: `CHATGPT`
STATUS: `RETURNED`
