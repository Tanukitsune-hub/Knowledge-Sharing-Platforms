# Work 0020 dispatch control

WORK_ID: `0020`
DISPATCH_ID: `0020-CODEX-06`
BALL: `CODEX`
STATUS: `READY`

## Active dispatch

### 0020-CODEX-06 — READY

- mode: `INVESTIGATION / BUILD / QUALIFICATION`;
- route: `C`;
- purpose: remove the Apps Script-specific upload-finalize transport blocker and complete bounded Gemini Meeting + Pitchbook qualification;
- active hypothesis: the explicit `Content-Length` header causes a local `UrlFetchApp` request-construction failure before a provider HTTP response; `UrlFetchApp` must derive transport length from the payload;
- recommended model: `Sol High`;
- branch: `agent/0020-ai-provider-core`;
- Draft PR: `#26` — Draft / Open / unmerged;
- instruction: `docs/handoffs/0020-CODEX-06-apps-script-content-length-finalize-repair-and-completion-instruction.md`;
- exact execution ref: supplied by ChatGPT after the activation documentation commits;
- OpenAI: deliberately deferred, disabled, and not to be live-called;
- FULL_OUTPUT: accepted PASS from CODEX-03; do not rerun absent contradiction;
- attempt boundary: one corrected source deployment and one Meeting finalize attempt before any query.

## Returned dispatch

### 0020-CODEX-05 — RETURNED / ACCEPTED EXCEPT BLOCKER

Accepted evidence:

- focused transport/provider validation `68/68 PASS`;
- repository validation `274/274 PASS`;
- temporal/public-surface/diff checks PASS;
- public facade `30`;
- exact `78`-file source readback PASS;
- immutable Apps Script version `45` and same private Web App updated in place;
- safe error staging/retry hardening and future OpenAI activation path preserved;
- first one-Meeting indexing gate reached `UPLOAD_FINALIZE` and stopped at `AI_UPLOAD_FINALIZE_FAILED`;
- no provider document identity or Indexed state was produced;
- no Meeting query, Pitchbook qualification, broad sync, OpenAI call, or FULL_OUTPUT rerun occurred;
- temporary batch-size setting was restored; Pitchbook data remained unchanged; triggers remained `0`.

CODEX-05 report:

`docs/handoffs/0020-CODEX-05-gemini-indexing-transport-repair-and-final-qualification-report.md`

Strategy Reset finding:

- current source manually sets `Content-Length` in the final `UrlFetchApp` request;
- the failure returned no provider response text/status;
- this is consistent with a local Apps Script restricted-header/request-construction failure;
- CODEX-06 must prove this with a safe request preflight and one bounded live upload.

### 0020-CODEX-04 — RETURNED / ACCEPTED EXCEPT GEMINI RUNTIME

Accepted evidence:

- focused `17/17 PASS`, repository `265/265 PASS`;
- public facade `30`;
- one isolated Gemini Store created;
- future zero-code OpenAI administrator activation implemented and deterministically validated;
- OpenAI remained disabled and uncalled.

### 0020-CODEX-03 — ACCEPTED / COMPLETE

Closed absent material contradiction:

- focused `52/52 PASS`, repository `256/256 PASS`;
- schema `6`, exactly five Backend sheets;
- FULL_OUTPUT runtime and canonical package parity PASS;
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
DISPATCH_ID: `0020-CODEX-06`
BALL: `CODEX`
STATUS: `READY`
