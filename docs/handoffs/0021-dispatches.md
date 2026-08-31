# Work 0021 dispatch control

WORK_ID: `0021`
ACTIVE_DISPATCH_ID: `0021-CODEX-02`
BALL: `CHATGPT`
STATUS: `RETURNED`

## Returned dispatches

### 0021-CODEX-02 — RETURNED / CORE RUNTIME QUALIFIED

Purpose:

- exact read-only reconciliation proved current content with missing `fund_strategy` and `counterparty_id` provider attributes;
- exact in-place attribute refresh and typed readback passed without upload or duplicate;
- the existing string Date range passed after metadata repair, so numeric Date was not introduced;
- decisive compound filter, all five modes, FULL_OUTPUT preview parity, and Gemini no-transport/no-failover gate passed;
- canonical validation passed `360/360`; exact Apps Script readback passed `80/80`;
- the same private Web App was updated once to version `62`.

Report:

`docs/handoffs/0021-CODEX-02-openai-filter-metadata-reconciliation-and-core-runtime-qualification-report.md`

Current runtime baseline:

```text
PRIVATE_WEB_APP_VERSION: 62
CODEX_02_LOGIC_VALIDATION: PASS — 360/360
CODEX_02_READBACK: PASS — 80/80
OPENAI_COMPOUND_FILTER_RUNTIME: PASS — exactly one authoritative DOC-000017 source
FIVE_MODE_RUNTIME_CORE: PASS
FULL_OUTPUT_RUNTIME_PARITY: PASS
GEMINI_API_CALLED: NO
READY_FOR_CODEX_03: YES
```

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
BALL: `CHATGPT`
STATUS: `RETURNED`
