# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-02`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0021-CODEX-02 — READY / OPENAI FILTER METADATA RECONCILIATION

Purpose:

- reconcile authoritative `DOC-000017` row metadata against the exact current OpenAI vector-store file attributes before mutation;
- verify the suspected Date range attribute-type issue rather than weakening compound filters;
- repair metadata-only reconciliation so provider attributes can stay current even when source content hash is unchanged;
- requalify the decisive compound-filter query and, only after PASS, complete the bounded remaining five-mode/FULL_OUTPUT runtime gates;
- preserve accepted Work 0020/0025 behavior and the CODEX-01 deterministic implementation.

Instruction:

`docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-instruction.md`

Current runtime baseline:

```text
PRIVATE_WEB_APP_VERSION: 61
CODEX_01_LOGIC_VALIDATION: PASS — 355/355
CODEX_01_READBACK: PASS — 80/80
OPENAI_COMPOUND_FILTER_RUNTIME: BLOCKED — zero retrieved authoritative source
GEMINI: DISABLED / DEFERRED
```

ChatGPT read-only reconciliation already confirmed the authoritative `DOC-000017` row matches the failed UI scope for GP, Asset Class, Capital Type, Fund/Strategy, Source Type and canonical Business Date. The OpenAI indexed timestamp is later than the row update timestamp. Provider attributes and their value types remain to be read directly.

## Returned dispatches

### 0021-CODEX-01 — RETURNED / CORE IMPLEMENTED, TARGET-RUNTIME BLOCKER

- canonical core filters and all five modes implemented;
- OpenAI/FULL_OUTPUT share one normalized filter/mode contract;
- focused `32/32` and canonical `355/355` PASS;
- exact Apps Script readback `80/80` PASS;
- same private Web App updated once to version `61`;
- first compound-filter query returned safe insufficient evidence and zero citations;
- STOP applied before any second query, FULL_OUTPUT runtime gate, Gemini observation, sync, or second deployment.

Report:

`docs/handoffs/0021-CODEX-01-structured-filters-five-modes-openai-full-output-report.md`

## Remaining Work 0021 dispatch order

```text
0021-CODEX-02
  provider-attribute/date-range reconciliation + core runtime completion

0021-CODEX-03
  2–5 Entity comparison + advanced exact filters/citation attribution

0021-CODEX-04
  bounded six-format matrix + explicit provider capability/parity evidence
```

Gemini live recovery remains deferred to a separate near-completion Work.

## Safety / scope boundary

- no Gemini API call;
- no broad source sync;
- no `DOC-000018` or large-fixture mutation;
- no confidential data;
- no new Vector Store/Web App/Library/public endpoint;
- no 2–5 Entity comparison, advanced Related GP/Meeting Type work, format campaign, Work 0023, historical migration, or company rollout;
- no rebase, force-push, history rewrite, or PR merge.

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-02`
BALL: `CODEX`
STATUS: `READY`
