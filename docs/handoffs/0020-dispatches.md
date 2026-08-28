# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-05`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-05 — READY

- mode: `INVESTIGATION / BUILD / QUALIFICATION`;
- route: `C`;
- purpose: repair Gemini indexing/transport and finish Meeting + Pitchbook File Search qualification;
- active hypothesis: upload/index failure and lost error detail are the primary blocker; search was attempted without accepted indexed sources, while direct REST also lacks bounded transient retry;
- recommended model: `Sol High`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-05-gemini-indexing-transport-repair-and-final-qualification-instruction.md`;
- exact execution ref: use the final branch head supplied in the ChatGPT dispatch prompt;
- OpenAI: deliberately deferred, disabled, and not to be live-called;
- FULL_OUTPUT: accepted PASS from CODEX-03; do not rerun absent contradiction.

## Returned dispatch

### 0020-CODEX-04 — RETURNED / BLOCKER

Accepted evidence:

- focused validation `17/17 PASS`;
- repository validation `265/265 PASS`;
- temporal/diff validation PASS;
- public facade `30`;
- exact source synchronization/readback and same private Web App update PASS;
- one isolated Gemini Store created;
- dormant future OpenAI activation path implemented and deterministically validated;
- OpenAI stayed disabled and was not called.

Authoritative correction after return:

- Audit readback contains two `AI_QUERY / Failure / AI_HTTP_500` rows 39 seconds apart, not one;
- both synthetic Meeting provider states are `Failed` with no Gemini document identity;
- multiple synthetic TXT Pitchbook provider states are also `Failed` with no Gemini document identity;
- no accepted evidence proves either source type was indexed before retrieval;
- therefore CODEX-05 must establish indexing before another search and must explain/prevent duplicate application-level Audit outcomes.

CODEX-04 report:

`docs/handoffs/0020-CODEX-04-gemini-only-provider-qualification-report.md`

## Accepted dispatch

### 0020-CODEX-03 — ACCEPTED / COMPLETE

Closed absent material contradiction:

- focused `52/52 PASS`, repository `256/256 PASS`;
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime PASS and canonical package parity PASS;
- disabled-provider safe errors/no-failover PASS;
- final integrity PASS;
- Apps Script version `42`, triggers `0`, same private Web App, no Library/permission mutation.

## Earlier dispatches

- `0020-CODEX-02`: implementation accepted; runtime stopped before schema alignment.
- `0020-CODEX-01`: superseded before qualification because Pitchbook body extraction was removed from FULL_OUTPUT.

## Closed source scopes

```text
Gemini File Search -> Meeting + Pitchbook/source materials
ChatGPT/OpenAI -> visible but deliberately disabled in personal DEV
全文出力 -> Meeting Google Docs full text + optional Pitchbook references/links
```

Only one active Codex dispatch may exist.

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-05`
BALL: `CODEX`
STATUS: `READY`
