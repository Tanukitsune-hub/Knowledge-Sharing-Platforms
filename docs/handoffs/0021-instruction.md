# Work 0021 — Structured Knowledge Search

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
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

## Active blocker / CODEX-02 outcome

The first new version-61 compound-filter OpenAI query returned no retrieved authoritative source. ChatGPT read-only reconciliation confirms the authoritative `DOC-000017` row matches the selected GP / Asset Class / Capital Type / Fund-Strategy / Source Type and canonical Business Date, with provider indexing later than the row update. CODEX-02 must read the exact current provider attributes/types first, verify the actual root cause, repair only the metadata/filter compatibility defect, then complete the bounded core runtime gates.

A strong hypothesis is that Date range filtering currently applies `gte/lte` to string `date_key` values while current OpenAI retrieval examples use numeric date attributes. This is not yet considered proven until provider attribute readback/reconciliation.

Do not weaken exact filters or broad-sync the corpus to obtain a pass.

## Deferred after CODEX-02

- `0021-CODEX-03`: explicit 2–5 Entity comparison + advanced exact filters/citation attribution;
- `0021-CODEX-04`: bounded six-format matrix + provider-capability/parity evidence;
- Gemini live recovery: separate near-completion Work.

Follow the active detailed instruction's validation, bounded target-runtime, STOP, GitHub delivery, and final-return rules. Keep PR #34 Draft/Open/unmerged.

WORK_ID: `0021`
DISPATCH_ID: `0021-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
