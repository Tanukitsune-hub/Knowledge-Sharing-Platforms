# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
MODE: `REVIEW_FIX -> QUALIFICATION`

Active instruction:

`docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-instruction.md`

Accepted CODEX-01 report:

`docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`

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

## Accepted CODEX-01 implementation

The canonical core structured-filter model, shared OpenAI/FULL_OUTPUT contract, shared UI, five mode templates, Audit redaction, and deterministic validation are accepted. CODEX-01 passed `355/355`, exact `80/80` Apps Script readback, and updated the same private Web App once to version 61.

## CODEX-02 accepted outcome

Read-only reconciliation proved metadata-only drift: the one exact current `DOC-000017` provider file had current content but lacked authoritative `fund_strategy` and `counterparty_id`. The production Pitchbook sync source also omitted Fund Strategy. CODEX-02 added exact typed attribute comparison, in-place update/readback, fail-closed identity checks, and authoritative Pitchbook Fund Strategy derivation.

After exact attribute refresh, the existing string Date range compound filter passed with one grounded authoritative `DOC-000017` citation. Numeric Date was therefore not applicable. All five modes, one bounded FULL_OUTPUT preview, and the zero-effective-Gemini-choice no-transport/no-failover gate passed on version 62. Canonical validation passed `360/360` and Apps Script readback passed `80/80`.

CODEX-02 report:

`docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-report.md`

## Deferred after CODEX-02

- `0021-CODEX-03`: explicit 2–5 Entity comparison + advanced exact filters/citation attribution;
- `0021-CODEX-04`: bounded six-format matrix + provider-capability/parity evidence;
- Gemini live recovery: separate near-completion Work.

Follow the active detailed instruction's validation, bounded target-runtime, STOP, GitHub delivery, and final-return rules. Keep PR #34 Draft/Open/unmerged.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`
