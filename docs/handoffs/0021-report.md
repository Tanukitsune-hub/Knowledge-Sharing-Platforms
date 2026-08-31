# Work 0021 report

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Executive conclusion

CODEX-01 completed the major core filter/five-mode implementation and passed deterministic validation, but its first version-61 compound-filter OpenAI runtime query returned a safe insufficient-evidence result with zero authoritative citations. The target-runtime gate therefore remains blocked.

ChatGPT read-only reconciliation narrowed the blocker:

- authoritative `DOC-000017` row matches the selected GP, Asset Class, Capital Type, Fund/Strategy, Pitchbook source scope and canonical 2026-08-30 Business Date;
- its OpenAI indexed timestamp is later than the row update timestamp;
- current source builders derive the expected stable metadata;
- exact provider attributes/types have not yet been read back directly;
- current code uses string `date_key` values with `gte/lte`, while current OpenAI retrieval documentation demonstrates numeric date attributes for range filtering.

CODEX-02 is authorized to read exact provider attributes first, verify the root cause, repair only the metadata/filter compatibility issue, and finish the bounded CODEX-01 OpenAI/FULL_OUTPUT runtime campaign.

## Accepted CODEX-01 evidence

```text
CANONICAL_FILTER_MODEL: PASS
SHARED_ROUTE_MODE_UI: PASS
FIVE_MODE_CONTRACTS: PASS LOGIC
FULL_OUTPUT_FILTER_MODE_PARITY: PASS LOGIC
AUDIT_REDACTION: PASS
WORK_0025_POLICY_REGRESSION: PASS
LOGIC_VALIDATION: PASS — focused 32/32; canonical 355/355
APPS_SCRIPT_READBACK: PASS — 80/80
PRIVATE_WEB_APP_VERSION: 61
GITHUB_CI_ACTUALLY_RAN: NO
```

CODEX-01 report:

`docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`

## Active blocker

```text
EXACT_PROVIDER_ATTRIBUTE_READBACK: PENDING
ROOT_CAUSE: PENDING EXACT RECONCILIATION
OPENAI_COMPOUND_FILTER_QUERY: BLOCKED
TARGET_RUNTIME_QUALIFICATION: BLOCKED
BLOCKER: OPENAI_COMPOUND_FILTER_EXISTING_INDEX_METADATA_MISMATCH_OR_EMPTY_RETRIEVAL
```

Active instruction:

`docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-instruction.md`

## Dispatch routing

- CODEX-02: current blocker repair + core runtime completion;
- CODEX-03: 2–5 Entity comparison + advanced exact filters/citation attribution;
- CODEX-04: six-format matrix + explicit provider-capability/parity evidence;
- Gemini live recovery: deferred separate near-completion Work.

## Scope discipline

Do not broaden this blocker into a corpus reindex, filter weakening, Gemini debugging, large-file campaign, multi-Entity work, format work, installer work, or general hardening loop.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
