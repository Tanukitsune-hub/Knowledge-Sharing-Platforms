# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-03`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0021-CODEX-03 — READY / MULTI-ENTITY COMPARISON + ADVANCED EXACT FILTERS

Primary outcome:

- explicit 2–5 Entity comparison in the existing Knowledge Search product;
- per-Entity evidence and normalized citation attribution;
- exact Related GP filter using authoritative `Related_GP_IDs` token membership;
- exact Meeting Type filter using authoritative `Meeting_Type_Codes` token membership;
- identical selected-Entity/filter semantics in API-independent FULL_OUTPUT;
- bounded OpenAI target-runtime qualification using existing synthetic records only where sufficient.

Instruction:

`docs/handoffs/0021-CODEX-03-multi-entity-comparison-and-advanced-exact-filters-instruction.md`

Current runtime baseline:

```text
PRIVATE_WEB_APP_VERSION: 62
CODEX_02_LOGIC_VALIDATION: PASS — 360/360
CODEX_02_READBACK: PASS — 80/80
OPENAI_COMPOUND_FILTER_RUNTIME: PASS
FIVE_MODE_RUNTIME_CORE: PASS
FULL_OUTPUT_RUNTIME_PARITY: PASS
GEMINI_API_CALLED: NO
BLOCKER: NONE
```

Existing synthetic qualification targets include:

```text
Entity A: GP:GP-000031
  DOC-000017 / MTG-000005

Entity B: LP_ASSET_OWNER:OPT-CPLP-001
  MTG-000004
  Related GP: GP-000031
  Meeting Type: ANNUAL_REVIEW, OFFICE_VISIT
```

## Returned dispatches

### 0021-CODEX-02 — RETURNED / CORE RUNTIME QUALIFIED

- root cause was metadata-only provider drift plus Pitchbook Fund Strategy source omission;
- exact in-place attribute reconciliation passed without duplicate upload;
- string Business Date range passed after metadata repair;
- all five modes, FULL_OUTPUT preview parity, and Gemini no-transport/no-failover gate passed;
- canonical `360/360`, readback `80/80`, same private Web App version `62`.

Report:

`docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-report.md`

### 0021-CODEX-01 — RETURNED / CORE IMPLEMENTED

- canonical core filters/shared UI/five-mode contracts implemented;
- deterministic PASS;
- initial version-61 compound-filter blocker was closed by CODEX-02.

Report:

`docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`

## Remaining Work 0021 order

```text
0021-CODEX-03
  2–5 Entity comparison + advanced exact filters/citation attribution

0021-CODEX-04
  bounded six-format matrix + explicit provider capability/parity evidence
```

Gemini live recovery remains a separate near-completion Work.

## Safety / scope boundary

- no Gemini API call;
- no broad source sync or corpus reindex;
- no `DOC-000018` or large-fixture mutation;
- no confidential data;
- no new Vector Store/Web App/Library/public endpoint;
- no six-format campaign, Work 0023, historical migration, company rollout, or general hardening;
- no rebase, force-push, history rewrite, or PR merge.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-03`
BALL: `CODEX`
STATUS: `READY`
