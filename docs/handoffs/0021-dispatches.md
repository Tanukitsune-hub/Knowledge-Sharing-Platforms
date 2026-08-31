# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0021-CODEX-04 — READY / SIX-FORMAT MATRIX + FINAL WORK QUALIFICATION

Primary outcome:

- qualify `.pdf / .pptx / .xlsx / .docx / .txt / .eml` through the current OpenAI Pitchbook path;
- prove authoritative source identity and normalized citation per supported format;
- record any genuine provider limitation explicitly rather than silently weakening the product contract;
- preserve EML normalized-header/body and no-attachment-auto-index boundary;
- prove FULL_OUTPUT keeps every Pitchbook format reference-only and API-independent;
- return PR #34 ready for final ChatGPT merge if all Work 0021 gates pass.

Instruction:

`docs/handoffs/0021-CODEX-04-six-format-openai-capability-and-final-work-qualification-instruction.md`

Current runtime baseline:

```text
PRIVATE_WEB_APP_VERSION: 63
CODEX_03_LOGIC_VALIDATION: PASS — 368/368
CODEX_03_READBACK: PASS — 80/80
OPENAI_MULTI_ENTITY_RUNTIME: PASS
OPENAI_ADVANCED_EXACT_FILTER_RUNTIME: PASS
FULL_OUTPUT_MULTI_ENTITY_PARITY: PASS
GEMINI_API_CALLED: NO
OPENAI_PROVIDER_BASELINE: 16 completed documents
BLOCKER: NONE AT DISPATCH
```

Fixture inventory reviewed before dispatch:

- current Pitchbook rows are effectively TXT only;
- `DOC-000017` is a safe small TXT source;
- there is no current small PDF/PPTX/XLSX/DOCX/EML Pitchbook matrix;
- old Matrix-C 1–25 MiB TXT fixtures and `DOC-000018` are not test targets;
- CODEX-04 may register at most six very small non-confidential format fixtures through the normal Pitchbook flow when needed.

## Returned dispatches

### 0021-CODEX-03 — RETURNED / MULTI-ENTITY + ADVANCED FILTERS QUALIFIED

- explicit 2–5 Entity comparison: PASS;
- per-Entity citation/evidence attribution: PASS;
- Related GP / Meeting Type exact filtering: PASS;
- OpenAI runtime and FULL_OUTPUT parity: PASS;
- canonical `368/368`, Apps Script readback `80/80`, private Web App version `63`;
- no Gemini call, broad sync, provider mutation or new fixture.

Report:

`docs/handoffs/0021-CODEX-03-multi-entity-comparison-and-advanced-exact-filters-report.md`

### 0021-CODEX-02 — RETURNED / CORE RUNTIME QUALIFIED

- metadata-only provider drift repaired via exact in-place attribute reconciliation;
- compound filter, five modes and FULL_OUTPUT parity qualified at version `62`;
- canonical `360/360` PASS.

Report:

`docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-report.md`

### 0021-CODEX-01 — RETURNED / CORE IMPLEMENTED

- canonical core filters/shared UI/five-mode contracts implemented;
- initial runtime blocker was closed by CODEX-02.

Report:

`docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`

## Completion discipline

CODEX-04 is the last planned Work 0021 dispatch. After a passing six-format/final integrity matrix, stop and return PR #34 for final merge.

Do not call Gemini, retry/mutate old large fixtures, run broad sync, implement Work 0023, add unrelated hardening, benchmark formats repeatedly, or create CODEX-05 absent a real Work 0021 blocker.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-04`
BALL: `CODEX`
STATUS: `READY`
